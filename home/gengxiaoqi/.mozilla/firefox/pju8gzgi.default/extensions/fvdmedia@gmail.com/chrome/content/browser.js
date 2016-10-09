//Components.utils.import("resource://fvd.sync.modules/welcome.js");

Components.utils.import("resource://fvd.sync.modules/sync.js");
Components.utils.import("resource://fvd.sync.modules/settings.js");
Components.utils.import('resource://gre/modules/AddonManager.jsm');
Components.utils.import("resource://fvd.sync.modules/properties.js");
Components.utils.import("resource://fvd.sync.modules/async.js");

Components.utils.import("resource://fvd.sync.modules/file.js");
Components.utils.import("resource://fvd.sync.modules/misc.js");
Components.utils.import("resource://fvd.sync.modules/autosync.js");

var fvd_Sync_Class = function(){

  const GAP_TO_SHOW_RATE_US = 3600 * 24 * 1; // 1 days

  const SELF_ID = "fvdmedia@gmail.com";
  const TOOLBAR_BUTTON_ID = "fvd_sync_MainButton";

  var addonWillBeUninstalled = false;
  var addonWillBeDisabled = false;

  var self = this;

  var observerEvents = [
    "FVD.Toolbar-SD-Sync-Data-Changes",
    "FVD.Toolbar-SD-Dial-Sync-To-Sync-Data-Updated",
    "FVD.Toolbar-SD-Dial-Sync-State-Updated",
    "FVD.Sync.Bookmarks-Initialization-State-Changed",
    "FVD.Toolbar-SD-Dial-Import-Success",
    "FVD.Sync.Event.login",
    "FVD.Sync.Event.logout",
    "FVD.Sync.Event.openURL"
  ];

  var observerListener = {

    observe: function( aSubject, aTopic, aData ){

      switch( aTopic ){

        case "FVD.Sync.Event.openURL":

          var extra = JSON.parse( aData );

          self.navigate_url( extra.url );

        break;

        case "FVD.Sync.Event.logout":
        case "FVD.Sync.Event.login":
          fvd_sync_Sync.authActionCompleted("login");
        break;

        case "FVD.Toolbar-SD-Dial-Sync-To-Sync-Data-Updated":
        case "FVD.Toolbar-SD-Sync-Data-Changes":

          refreshSyncDriversButtons();

        break;

        case "FVD.Toolbar-SD-Dial-Sync-State-Updated":

          // need to refresh log out menu item state

          var logoutItem = document.querySelector("#fvd_sync_MainContextMenu .loginOrLogout");

          if( fvd_sync_Sync.getState() == "normal" ){
            logoutItem.removeAttribute("disabled");
          }
          else{
            logoutItem.setAttribute("disabled", true);
          }

        break;

        case "FVD.Sync.Bookmarks-Initialization-State-Changed":

          refreshBookmarksInitialization();

        break;

      }

    }

  };

  var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

  observerEvents.forEach( function( event ){

    observer.addObserver( observerListener, event, false );

  } );

  var addonListener = {
    onUninstalling: function( addon ){
      if( addon.id == SELF_ID ){
        addonWillBeUninstalled = true;
      }
    },
    onDisabling: function( addon ){
      if( addon.id == SELF_ID ){
        addonWillBeDisabled = true;
      }
    },
    onOperationCancelled: function( addon ){
      if( addon.id == SELF_ID ){
        addonWillBeUninstalled = false;
        addonWillBeDisabled = false;
      }
    }
  };

  function refreshSyncDriversButtons(){

    for( var k in fvd_sync_Sync.Drivers ){

      if( fvd_sync_Sync.Drivers[k].hasChanges ){

        document.getElementById("fvd_sync_driverMenu_" + k).setAttribute( "sync", fvd_sync_Sync.Drivers[k].hasChanges() ? 1 : 0 );

      }

    }

  }

  function refreshBookmarksInitialization(){

    try{
      var menuitem = document.getElementById( "fvd_sync_driverMenu_Bookmarks" );

      if( fvd_sync_Sync.Drivers.Bookmarks.isInitialization() ){
        menuitem.setAttribute( "label", menuitem.getAttribute("initlabel") );
        menuitem.setAttribute( "disabled", true );
      }
      else{
        menuitem.setAttribute( "label", menuitem.getAttribute("activelabel") );
        menuitem.removeAttribute( "disabled" );
      }
    }
    catch( ex ){
      dump("Fail set label " + ex + "\n");
    }

  }

  function init(){

    window.addEventListener( "load", function() {
      // check show premium button
      fvd_sync_Sync.getUserInfo(function(err, info) {
        var show = true;
        if(!err) {
          show = !info.premium.active;
        }
        if(show) {
          var btn = document.getElementById("fvd_sync_getPremiumButton");
          btn.removeAttribute("hidden");
          btn.addEventListener("click", function() {
            fvd_Sync.navigate_url("https://everhelper.me/everhelperplans.php");
          }, false);
        }
      });

      refreshBookmarksInitialization();

      if( fvd_sync_Settings.getBoolVal( "is_first_start" ) ){
        insertButton();

        fvd_sync_Settings.setBoolVal( "is_first_start", false );
      }

      if( !fvd_sync_Sync.Drivers.SpeedDial.canWork() ){
        document.getElementById("fvd_sync_driverMenu_SpeedDial").setAttribute("hidden", true);
      }
      else{

      }

      refreshSyncDriversButtons();

    }, false );

    window.addEventListener( "unload", function(){

      if( addonWillBeUninstalled ){
        fvd_sync_Settings.reset( "is_first_start" );
      }

      if( addonWillBeDisabled || addonWillBeUninstalled ){

        // reset initial sync actions
        fvd_sync_Sync.authActionCompleted( "login" );

      }

    }, false );

    AddonManager.addAddonListener( addonListener );

    fvd_sync_AutoSync.init();

  }



  function openSettings( params ){
    params = params || {};

    fvd_sync_Settings.displayWindow( params.activeTab );
  }

  function insertButton(){

    if( document.getElementById(TOOLBAR_BUTTON_ID) ){
      return;
    }

    var toolbar = document.getElementById('nav-bar');

    var insertBefore = "search-container";

    if (toolbar && toolbar.currentSet.indexOf(TOOLBAR_BUTTON_ID) == -1)
    {

      var sci = toolbar.currentSet.split(',');
      var nsci = [];
      if (sci.indexOf(insertBefore) != -1)
      {
        var i = null;
        while ((i = sci.shift()) != undefined)
        {
          if ((i == insertBefore) && (nsci.indexOf(TOOLBAR_BUTTON_ID) == -1)) nsci.push(TOOLBAR_BUTTON_ID);
          nsci.push(i);
        }
      } else
      {
        nsci = sci;
        nsci.push(TOOLBAR_BUTTON_ID);
      }

      toolbar.currentSet = nsci.join(',');
      toolbar.setAttribute('currentset', nsci.join(','));

      var toolbox = document.getElementById('navigator-toolbox');
      if (toolbox)
      {
        toolbox.ownerDocument.persist(toolbar.id, 'currentset');
      }
    }

  }

  this.openOptions = function(){
    openSettings();
  };

  function canSyncMain(){
    return fvd_sync_Sync.getState() == "normal" && fvd_sync_Sync.isActive();
  }

  this.navigate_url = function(url, event)
  {
    var browser = window.getBrowser();
    var tab = browser.addTab(url);
    if (tab) browser.selectedTab = tab;
  };

  this.reportBug = function(){

    //var url = fvd_sync_Sync.getAdminUrl() + "/?l=/components/MainOptions/feedback";

    var url = "http://fvdmedia.userecho.com/list/21212-everhelper/?category=4908";

    //fvd_sync_Sync.loginInAdminPanel( function(){
      self.navigate_url( url );
    //} );

  };

  this.rateUs = function(){

    var url = "https://addons.mozilla.org/en-US/firefox/addon/fvd-synchronizer/?src=dp-dl-othersby";

    self.navigate_url( url );

  };

  this.goToEverhelper = function(){

//    var credentials = fvd_sync_Sync.getCredentials();

    var url = fvd_sync_Sync.getAdminUrl() + "/";//"?login=" + credentials.email;

    //fvd_sync_Sync.loginInAdminPanel( function(){
      self.navigate_url( url );
    //} );

  };

  this.SpeedDial = new function(){

    this.mainSync = function(){

      if (!fvd_sync_Sync.isSetuped()) {

        openSettings( {
          activeTab: "syncTabs_account"
        } );

      }
      else {

        fvd_sync_Sync.Drivers.SpeedDial.openSyncProgressDialog( window, "uploadUpdatesAndCheckForUpdates" );

      }

    };

  };

  this.Bookmarks = new function(){

    function canSync(){

      return canSyncMain();

    }

    this.mainSync = function(){

      function startSync(){

        if (fvd_sync_Sync.Drivers.Bookmarks.needInitialSyncAfter() == "login") {

          openSettings( {
            activeTab: "syncTabs_bookmarksTabs"
          } );

        }
        else {

          fvd_sync_Sync.openSimpleSyncProgressDialog( window, "bookmarks:startMainSync" );

        }

      }


      if( canSync() ){

        startSync();

      }
      else{

        openSettings({
          activeTab: "syncTabs_account"
        });

        if ( canSync() ) {
          startSync();
        }

      }

    };

  };

  this.loginOrLogout = function(){

    if( !fvd_sync_Sync.isSetuped() ){

      openSettings( {
        activeTab: "syncTabs_account"
      } );

    }
    else{
      var btn = document.getElementById("fvd_sync_MainButton");
      btn.setAttribute("disabled", true);
      fvd_sync_Sync.logout(function() {
        btn.removeAttribute("disabled");
      });

    }

  };

  this.showingMainMenu = function( event ){

    var loginLogout = document.getElementById("fvd_sync_MainContextMenu").querySelector( ".loginOrLogout" );
    var reportBugButton = document.getElementById("fvd_sync_reportBugButton");

    if( !fvd_sync_Sync.isSetuped() ){

      loginLogout.setAttribute( "label",
        fvd_sync_Properties.getString( "fvd.toolbar", "main_menu.login" ) );

      reportBugButton.setAttribute("hidden", true);

    }
    else{

      loginLogout.setAttribute( "label",
        fvd_sync_Properties.getString( "fvd.toolbar", "main_menu.logout" ) );

      reportBugButton.removeAttribute("hidden");

    }

    if( fvd_sync_Sync.isActive() ){
      loginLogout.removeAttribute("disabled");
    }
    else{
      loginLogout.setAttribute("disabled", true);
    }

    if( fvd_sync_Misc.getSecondsCountAfterInstall() > GAP_TO_SHOW_RATE_US ){
      document.getElementById( "fvd_sync_rateUsButton" ).removeAttribute( "hidden" );
    }

    for( var driverName in fvd_sync_Sync.Drivers ){
      var button = document.getElementById( "fvd_sync_driverMenu_" + driverName );

      if( fvd_sync_Sync.Drivers[driverName].getState && fvd_sync_Sync.Drivers[driverName].getState() == "syncing" ){
        button.setAttribute( "disabled", true );
        break;
      }
      else{
        button.removeAttribute( "disabled" );
      }
    }


  };

  init();

};

var fvd_Sync = new fvd_Sync_Class();
