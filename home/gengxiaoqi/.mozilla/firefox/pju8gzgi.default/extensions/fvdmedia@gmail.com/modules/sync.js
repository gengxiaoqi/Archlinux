var EXPORTED_SYMBOLS = ["fvd_sync_Sync"];

Components.utils.import("resource://fvd.sync.modules/settings.js");
Components.utils.import("resource://fvd.sync.modules/misc.js");
Components.utils.import("resource://fvd.sync.modules/properties.js");
Components.utils.import("resource://fvd.sync.modules/config.js");

try {
    Components.utils.import("resource://fvd.speeddial.modules/storage.js");
}
catch (ex) {

}

Components.utils.import("resource://fvd.sync.modules/async.js");
Components.utils.import("resource://fvd.sync.modules/misc.js");

Errors = {
  ERROR_NOT_WELL_FORMED: -1,
  ERROR_ACTION_PARAM_IS_MISSED: -2,
  ERROR_UNRECOGNIZED_ACTION: -3,
  ERROR_USER_ALREADY_EXISTS: -4,
  ERROR_STORAGE_ENGINE_RETURNS_ERROR: -5,
  ERROR_AUTH_FAILED: -6,
  ERROR_USER_NOT_EXISTS: -7,
  ERROR_INTERNAL_DATA_JSON_MAILFORMED: -8,
  ERROR_WRONG_ARGUMENTS_COUNT: -9,
  ERROR_INTERNAL_SERVER_ERROR: -10,
  ERROR_INTERNAL_FILE_SYSTEM_ERROR: -11,
  ERROR_INTERNAL_SENDMAIL_ERROR: -12,
  ERROR_TOO_MUCH_REQUESTS: -13,
  ERROR_ACCESS_DENIED: -14,
  ERROR_MAX_EMAILS_LIMIT_REACHED: -15,
  ERROR_DATA_TOO_LARGE: -16,
  ERROR_ALREADY_LOCKED: -17,
  ERROR_COUNT_ITEMS_QUOTA_EXCEED: -20,

  ERROR_CONNECTION_ERROR: -1000,
  ERROR_SERVER_RESPONSE_MALFORMED: -1001,
  ERROR_SYNC_USER_ABORTED: -1002,



  ERROR_DRIVER_BUSY: -1100
};

const IS_LOCAL = false;
const IS_TESTING = false;
const AUTH_COOKIE_NAME = "auth";

// security token, that must be passed in EverHelper-Token header
var _currentSecurityTokenValue = "";
// key is session id
var tokensCache = {};


var SYNC_ADMIN_URL = fvd_sync_Config.SYNC_ADMIN_URL;

var ioService = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);


var authCheckURI = ioService.newURI(fvd_sync_Config.COOKIE_CHECK_URL, null, null);

var cookieSvc = Components.classes["@mozilla.org/cookieService;1"]
                  .getService(Components.interfaces.nsICookieService);


function SyncRequest(aData, aCallback, form){

  //const SERVER_IP = "localhost";
  //const SERVER_IP = "69.65.42.74" OLD SERVER;

  //const SERVER_IP = "75.126.107.120";

  const SERVER_PORT = 8124;

  function encodeRequest(requestData){
      return JSON.stringify(requestData);
  }

  function decodeResponse(responseData){
      return JSON.parse(responseData);
  }

  aData._client_software = "ff_addon";

  var data = encodeRequest(aData);

  var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

  var url = fvd_sync_Config.SYNC_URL;

  if( form && aData.action ){
    url += "/" + aData.action;
  }

  req.open( "POST", url );

  req.setRequestHeader( "EverHelper-Token", _currentSecurityTokenValue );

    req.onload = function(){
        //dump( "Request loaded: "+req.responseText+"\n" );

      try {
          var response = decodeResponse(req.responseText);
      }
      catch (ex) {
        try{

            if( req.responseText.length > 1000 ){
              dump("Malformed response: <Response Too Large>(" + ex + ")\n");
            }
            else{
              dump("Malformed response: " + req.responseText + "(" + ex + ")\n");
            }

        }
        catch( ex ){

        }

          aCallback(Errors.ERROR_SERVER_RESPONSE_MALFORMED);
          return;
      }


      aCallback(response.errorCode, response.body);
    };

    req.onerror = function(){
        dump("Request error\n");

        aCallback(Errors.ERROR_CONNECTION_ERROR);
    };

  if( form ){
    req.send( form );
  }
  else{
    req.send(data);
  }

}

/** Short Manual **/

/*** Private to sync functions ***/

/**
 * array getToSyncData()
 * setToSyncData(array)
 * clearToSyncData()
 */
var fvd_sync_Sync_Class = function(){

    var self = this;

  // load drivers

  const useDrivers = [/*"Tabs", */"Bookmarks", "SpeedDial"];

  var Drivers = {};
  var _serverQuota = null;

  function loadDrivers(  ){

    // load drivers
    useDrivers.forEach( function( driverName ){

      //dump( "Load " + driverName + "\n" );

      try{
        Components.utils.import("resource://fvd.sync.modules/drivers/"+driverName+".js", Drivers);
        Drivers[driverName].syncInst = self;
        Drivers[driverName].Errors = Errors;

        if( Drivers[driverName].init ){
          Drivers[driverName].init();
        }

        //dump( "Loaded\n" );
      }
      catch( ex ){
        dump( "Fail load "+driverName+": " + ex + "\n" );
      }


    } );

    self.Drivers = Drivers;

  }

  // init some components

  var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                                               Components.interfaces.nsILoginInfo,
                                               "init");
  var loginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);


  const CREDENTIALS_URL = "chrome://fvd.sync";
  const CREDENTIALS_REALM = "Sync Auth Info";
  const TIMER_INTERVAL = 1000 * 5;
  const CHECK_FOR_UPDATES_EVERY = 1000 * 60 * 60 * 3; // 3 hours

  var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

  var mainTimer = null;

  var syncAborted = false; // sign of user cancel sync

  var prefListener = {
      observe: function(aSubject, aTopic, aData){
          switch (aTopic) {
              case 'nsPref:changed':

                  if (aData == "enabled") {

                      observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Sync-Turn", null);

                      if (self.isActive()) {
                          startMainTimer();
                      }
                      else {
                          stopMainTimer();
                      }

                  }

                  break;
          }
      }
  };

  var cookieListener = {
    observe: function(aSubject, aTopic, aData) {
      if(aTopic === "cookie-changed") {
        var cookie = aSubject.QueryInterface(Components.interfaces.nsICookie);
        if(aData === "deleted" && cookie.name === AUTH_COOKIE_NAME) {
          if(!fvd_sync_Sync.authCookieExists()) {
            // auth cookie was removed, emit logout event
            observer.notifyObservers(null, "FVD.Sync.Event.logout", null);
          }
        }
      }
    }
  };

  this.Errors = Errors;

  observer.addObserver(cookieListener, "cookie-changed", false);

  function startMainTimer(){

  }

  function stopMainTimer(){

  }

  function notifyDriversAuthActionCompleted( action ){

    for( var k in Drivers ){

      if( Drivers[k].syncAuthActionCompleted ){
        Drivers[k].syncAuthActionCompleted( action );
      }

    }

  }

    function addCreadentialsToMessage(message){
        //message.credentials = self.getCredentials();
    }

    /* raw data functions */

    function storeRawData(dataKey, dataString, callback){

        var request = {
            action: "store_raw_data",
            dataKey: dataKey,
            rawData: dataString
        };

        addCreadentialsToMessage(request);

        makeRequest(request, callback);

    }

    function readRawData(dataKey, callback){

        var request = {
            action: "get_raw_data",
            dataKey: dataKey
        };

        addCreadentialsToMessage(request);

        makeRequest(request, callback);

    }


    function checkSyncAbort(callback){
        if (syncAborted) {
            callback(Errors.ERROR_SYNC_USER_ABORTED);
            return true;
        }

        return false;
    }

    function init(){
        try {
            if (self.getState() == "syncing") {
                self.setState(fvd_sync_Settings.getStringVal("sd.sync.sync_prev_state"));
            }
        }
        catch (ex) {

        }


        if (self.isActive()) {
            startMainTimer();
        }

        // start prefs observer
        fvd_sync_Settings.addObserver(prefListener, fvd_sync_Settings.getKeyBranch() + "sd.sync.");

    loadDrivers();
    }


  function makeRequest(requestData, callback){

    new SyncRequest(requestData, function( error, data ){

      if( error == Errors.ERROR_AUTH_FAILED ){
        // log out from current account
        if( self.getState() != "none" ){
          self.setState( "none" );
        }
      }

      callback( error, data );

    });

  }

  /* Raw Request */

  this.authorizedRequest = function( message, callback ){
    addCreadentialsToMessage( message );

    makeRequest( message, callback );
  };

  this.logout = function(params, cb) {
    if(typeof params == "function") {
      cb = params;
    }
    cb = cb || function(){};
    new SyncRequest( {
      action: "user:logout"
    }, cb );
  };

  this.preUploadFile = function( params, callback ){

    const FormData = Components.classes["@mozilla.org/appshell/appShellService;1"]
                                     .getService(Components.interfaces.nsIAppShellService)
                                     .hiddenDOMWindow.FormData;

    var f = new FormData();

    if( params.blob ){
      f.append( "file", params.blob, params.name );
    }
    else if( params.file ){
      f.append( "file", params.file, params.name );
    }
    else{
      return callback( Errors.ERROR_WRONG_ARGUMENTS_COUNT );
    }

    new SyncRequest( {
      action: "files:preupload"
    }, callback, f );

  };

  this.getDriversNames = function(){

    var names = [];

    for( var name in self.Drivers ){
      names.push( name );
    }

    return names;

  };

    /* Only checks if user exists
     *  Doesn't make any authorization, only return true of false
     */
    this.userExists = function(email, password, callback){

        makeRequest({
            action: "user_exists",
            email: email,
            password: password
        }, callback);

    };

    /*
     * Register new user
     */
    this.registerUser = function(email, password, callback){
        makeRequest({
            action: "user_register",
            email: email,
            password: password
        }, callback);
    };

    this.removeUser = function(callback){
        var data = {
            action: "remove_user"
        };
        addCreadentialsToMessage(data);
        makeRequest(data, callback);
    };

    this.resendConfirmEmail = function(email, callback){
        makeRequest({
            action: "resend_confirm_email",
            email: email
        }, callback);
    };

    this.confirmRegistration = function(key, callback){
        makeRequest({
            action: "confirm_registration",
            key: key
        }, callback);
    };

    this.remindPassword = function(email, callback){
        makeRequest({
            action: "remind_password",
            email: email
        }, callback);
    };

  this.authActionCompleted = function( action ){
    notifyDriversAuthActionCompleted( action );
  };

  this.setCredentials = function( email, password ){

        //fvd_sync_Settings.setStringVal("sd.sync.login", email);
        //fvd_sync_Settings.setStringVal("sd.sync.password", password);

    var oldCredentials = this.getCredentialsAsLoginInfo();

    if( oldCredentials ){
      loginManager.removeLogin( oldCredentials );
    }

    var extLoginInfo = new nsLoginInfo( CREDENTIALS_URL,
                              null, CREDENTIALS_REALM,
                              email, password, "", "");

    loginManager.addLogin( extLoginInfo );

    self.logoutFromAdminPanel( function(){
      self.loginInAdminPanel();
    } );

  };

  this.getCredentialsAsLoginInfo = function(  ){

    var logins = loginManager.findLogins({}, CREDENTIALS_URL, null, CREDENTIALS_REALM);

    if( logins.length > 0 ){
      return logins[0];
    }
    else{
      return null;
    }

  };

    this.getCredentials = function(email, password){

    var loginInfo = this.getCredentialsAsLoginInfo();

    if( !loginInfo ){
      return {
        email: "",
        password: ""
      };
    }

        return {
            email: loginInfo.username,//fvd_sync_Settings.getStringVal("sd.sync.login"),
            password: loginInfo.password//fvd_sync_Settings.getStringVal("sd.sync.password")
        };

    };

  this.setState = function(newState) {

    var currentState = this.getState();
    if (currentState != "syncing" && currentState != "none") {
      fvd_sync_Settings.setStringVal("sd.sync.sync_prev_state", currentState);
    }

    fvd_sync_Settings.setStringVal("sd.sync.sync_state", newState);

    observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Sync-State-Updated", null);

    if( newState == "none" ){
      // need to logout from admin panel
      self.removeAuthCookies();
    }

  };

  this.authCookieExists = function(){
    var cookieString = cookieSvc.getCookieString( authCheckURI, null );
    return /\bauth=\b/.test( cookieString );
  };

  this.removeAuthCookies = function(){
    cookieSvc.setCookieString(authCheckURI, null, "auth=1;expires=Thu, 15 Jan 2009 15:24:55 GMT", null);
  };


  this.currentEverSessionId = function(){

    var cookieString = cookieSvc.getCookieString( authCheckURI, null );

    var m = cookieString.match( /\beversessionid=([a-z0-9]+)/i );

    if( !m || !m[1] ){
      return null;
    }

    return m[1];

  };


  this.getState = function(){

    var state = fvd_sync_Settings.getStringVal("sd.sync.sync_state");

    if( state != "syncing" ){

      state = self.authCookieExists() ? "normal" : "none";

    }

    return state;

  };

  this.isSetuped = function(){

    return this.getState() != "none";

  };

  this.isActive = function(){
      return fvd_sync_Settings.getBoolVal("sd.sync.enabled");
  };


  this.openSimpleSyncProgressDialog = function(parent, syncType, params){
    var arguments = {
        syncType: syncType
    };
    for( var k in params ){
      arguments[k] = params[k];
    }
    parent.openDialog('chrome://fvd.sync/content/dialogs/fvd_sd_sync_simple_progress.xul', '', 'chrome,titlebar,toolbar,centerscreen,modal', arguments);
  };

  /* Sync functions */

  this.skipLastUpdate = function(){

      var currentLastUpdateTimeDials = self.getDialsLastUpdateTime();
      var currentLastUpdateTimeGroups = self.getGroupsLastUpdateTime();

      var updateInfo = self.getLastUpdateInfo();

      currentLastUpdateTimeDials = Math.max(currentLastUpdateTimeDials, updateInfo.lastUpdateTimeDials);
      currentLastUpdateTimeGroups = Math.max(currentLastUpdateTimeGroups, updateInfo.lastUpdateTimeGroups);

      self.setDialsLastUpdateTime(currentLastUpdateTimeDials);
      self.setGroupsLastUpdateTime(currentLastUpdateTimeGroups);

      self.setState("normal");

  };

  this.abortCurrentSync = function(){
      syncAborted = true;
  };

  /* raw data publics */

  this.storeRawData = function(dataKey, dataString, callback){
    storeRawData( dataKey, dataString, callback );
  };

  this.readRawData = function(dataKey, callback){
    //dump( "Read raw data: " + dataKey + "\n" );
    readRawData( dataKey, callback );
  };

  this.driverSyncDataChanges = function( driver ){

     observer.notifyObservers(null, "FVD.Toolbar-SD-Sync-Data-Changes", null);

  };

    this.getToken = function( params, callback ){

      var sessionId = this.currentEverSessionId();

      if( tokensCache[ sessionId ] ){
        return callback( tokensCache[ sessionId ] );
      }

      this.getTokenForceFromServer( null, function( error, data ){

        if( error ){
          return callback("");
        }

        if( !data || !data.token ){
          return callback("");
        }

        tokensCache[ sessionId ] = data.token;

        callback( data.token );

      } );

    };

    this.getTokenForceFromServer = function( params, callback ){
    var message = {
      action: "user:getToken"
    };

    addCreadentialsToMessage( message );

    makeRequest( message, callback );
    };

  /* lock functiontions */
  this.acquireSyncLock = function( callback ){

    // temp
    //dump( "Acquire lock emulate\n" );
    //return callback(0);

    //dump( "++++\n" );

    this.getToken( null, function( token ){

      _currentSecurityTokenValue = token;

      var message = {
        action: "acquire_lock",
        name: "sync"
      };

      addCreadentialsToMessage( message );

      makeRequest( message, function( error, data ){

        if( error ){
          return callback( error );
        }

        callback( 0 );

      } );

    } );

  };

  this.releaseSyncLock = function( callback ){

    //dump( "----\n" );

    var message = {
      action: "release_lock",
      name: "sync"
    };

    addCreadentialsToMessage( message );

    makeRequest( message, function(){
      if( callback ){
        callback();
      }
    } );

  };

  this.getUserInfo = function(callback) {
    var message = {
      action: "user:info"
    };
    makeRequest(message, function( error, data ){
      if( error ){
        return callback( error );
      }
      return callback( 0, data );
    });
  };

  // not cached quota request
  this.getQuota = function( callback ){

    var message = {
      action: "get_quota"
    };

    addCreadentialsToMessage( message );

    makeRequest(message, function( error, data ){

      if( error ){
        return callback( error );
      }

      if( data && typeof data == "object" ){
        for( var category in data ){

          for( var type in data[category] ){
            if( !data[category][type] ){
              data[category][type] = 0;
            }
          }

        }
      }

      return callback( 0, data );

    });

  };


  // cached
  this.getQuotaByType = function( category, type, callback ){

    if( _serverQuota ){
      return callback( 0, _serverQuota[category][type] );
    }

    self.getQuota( function( error, data ){

      if( error ){
        return callback( error );
      }

      _serverQuota = data;

      callback( 0, _serverQuota[category][type] );

    } );

  };

  this.loginIncorrectMessageShow = function( params ){

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                              .getService(Components.interfaces.nsIPromptService);

    promptService.alert( params.window,
                 fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.incorrect_user_password.title"),
                 fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.incorrect_user_password.text") );

    fvd_sync_Settings.displayWindow( "syncTabs_account" );

  };

  this.openUrlWithLogin = function( url ){

    //self.loginInAdminPanel( function(){
      fvd_sync_Misc.getMainWindow(  ).fvd_Sync.navigate_url( SYNC_ADMIN_URL + url );
    //} );

  };

  this.openMainOptionsAdminWindow = function( action ){

    action = action || "";

    self.openUrlWithLogin( "/?l=/components/MainOptions/" + action );

  };

  this.quotaExceedMessageShow = function( params ){

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                              .getService(Components.interfaces.nsIPromptService);

    var flags = promptService.BUTTON_POS_0 * promptService.BUTTON_TITLE_IS_STRING +
                promptService.BUTTON_POS_1 * promptService.BUTTON_TITLE_IS_STRING;

    var check = {value: false};

    var text = fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.text");

    var quota = null;
    fvd_sync_Async.chain( [

      function( chainCallback ){

        self.getQuota( function( error, _data ){

          if( error ){
            //dump("Quota request failed\n");
            return;
          }

          quota = _data;

          chainCallback();
        } );

      },

      function( chainCallback ){

        if( params.count ){

          params.category = params.category || "bookmarks_count";

          text += "\n\n"+fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.current_upload")+": " + params.count + "\n";
          text += fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.already_in_db_items") + ": " + quota[params.category]["count_"] + "\n";
          text += fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.max_items") + ": " + quota[params.category][""] + "\n";
          text += fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.max_items_trashed") + ": " + quota[params.category]["trashed"] + "\n";

          chainCallback();

        }
        else{
          chainCallback();
        }

      },

      function(){
        var button = promptService.confirmEx(params.parent, fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.title"),
                         text,
                         flags, fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.fix_it"),
                         fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.sync_quota_exceed.close"), "", null, check);

        if( button == 0 ){

          self.openMainOptionsAdminWindow( "quota" );

        }

      }

    ] );



  };

  this.logoutFromAdminPanel = function( callback ){
    /*
    fvd_sync_Misc.get( SYNC_ADMIN_URL + "/common/logout", function( response ){
      if( callback ){
        callback();
      }
    } );
    */

  };

  this.isLogged = function( callback ){
    fvd_sync_Misc.get( SYNC_ADMIN_URL + "/common/i_am_logged", function( response ){

      if( !response ){
        return callback(false);
      }

      callback( response.data.logged );

    } );
  };

  this.loginInAdminPanel = function( callback ){

    callback = callback || function(){};

    if( !self.isSetuped() ){
      return callback( false );
    }

    var credentials = this.getCredentials();

    fvd_sync_Async.chain([

      function( chainCallback ){

        self.isLogged( function( logged ){

        } );

      },

      function(){

        fvd_sync_Misc.post( SYNC_ADMIN_URL + "/login", JSON.stringify({
          login: credentials.email,
          password: credentials.password
        }), function( response ){

          if( !response ){
            return callback(false);
          }

          if( !response.error ){
            return callback( true );
          }
          else{
            callback(false);
          }

        } );

      }

    ]);



  };

  this.getAdminUrl = function(){
    return SYNC_ADMIN_URL;
  };

  this.isLocal = function(){
    return IS_LOCAL;
  };

  this.isTesting = function(){
    return IS_TESTING;
  };

    init();

};

var fvd_sync_Sync = new fvd_sync_Sync_Class();
