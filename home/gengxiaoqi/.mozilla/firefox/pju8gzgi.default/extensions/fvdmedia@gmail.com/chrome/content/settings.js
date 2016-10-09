try{
  Components.utils.import("resource://fvd.sync.modules/properties.js");
  Components.utils.import("resource://fvd.sync.modules/sync.js");
  Components.utils.import("resource://fvd.sync.modules/misc.js");
  Components.utils.import("resource://fvd.sync.modules/settings.js");
  Components.utils.import("resource://fvd.sync.modules/newsletter.js");
}
catch( ex ){

}

Components.utils.import('resource://gre/modules/AddonManager.jsm');

// observer setup

var observerEvents = [
  "FVD.Toolbar-SD-Dial-Sync-State-Updated",
  "FVD.Sync.Bookmarks-Backup-Created",
  "FVD.Sync.SD-Backup-Created",
  "FVD.Sync.Bookmarks-Initialization-State-Changed",
  "FVD.Sync.In-Browser-Count-Items-Changed",
  "FVD.Sync.Event.logout",
  "FVD.Sync.Event.login"
];

var globalSettingsBranch = fvd_sync_Settings.branch("");

var observerListener = {

  observe: function( aSubject, aTopic, aData ){

    switch( aTopic ){

      case "FVD.Sync.Event.login":

        SyncSettings.loadAccountBrowser();

        setTimeout(function(){
          SyncSettings.refreshInitialSyncMessage();
        }, 1000);

      break;

      case "FVD.Sync.Event.logout":

        SyncSettings.loadAccountBrowser({
          refresh: true
        });

      break;

      case "FVD.Toolbar-SD-Dial-Sync-State-Updated":

        // need to refresh log out menu item state
        SyncSettings.refreshSyncNowState();
        SyncSettings.refreshUsage();
        SyncSettings.refreshInBrowserCount();

        if( fvd_sync_Sync.getState() == "none" ){
          SyncSettings.setMainSyncState( "not_setuped" );
          //SyncSettings.setRegistrationStep( "register" );
        }

      break;

      case "FVD.Sync.In-Browser-Count-Items-Changed":
        if( fvd_sync_Sync.getState() != "none" ){
          SyncSettings.refreshInBrowserCount( aData );
        }
      break;

      case "FVD.Sync.Bookmarks-Backup-Created":

        SyncSettings.Bookmarks.buildBackupsListing();

      break;

      case "FVD.Sync.SD-Backup-Created":

        SyncSettings.SpeedDial.buildBackupsListing();

      break;

      case "FVD.Sync.Bookmarks-Initialization-State-Changed":

        SyncSettings.Bookmarks.refreshSyncInitialization();

      break;

    }

  }

};

var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

observerEvents.forEach( function( event ){

  observer.addObserver( observerListener, event, false );

} );

window.addEventListener("unload", function(){

  observerEvents.forEach( function( event ){

    observer.removeObserver( observerListener, event );

  } );

}, false);

var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

FVDPopupImageHelper = {
  helperPopupId: "__popupImageHelper",


  assign: function( elem, imageName ){

    if( elem ){
      elem.addEventListener( "click", function(){
        var popup = document.getElementById(FVDPopupImageHelper.helperPopupId);
        var image = popup.getElementsByTagName( "image" )[0];
        image.setAttribute("src", "/skin/help_dialogs/" + imageName + ".png");

        popup.openPopup( elem );
      }, true );
    }

  },

  assignByClass: function(){
    var elements = document.getElementsByClassName("imageHelper");
    for( var i = 0; i != elements.length; i++ ){
      this.assign( elements[i], elements[i].getAttribute( "helperImage" ) );
    }
  }
};

var SyncSettings = new function(){

  var self = this;


  function setMainSyncState( state, stateSource ){



    if( state == "setuped" ){

    }
    else if( state == "not_setuped" ){

    }



  }

  function setFieldError( fieldId ){
    document.getElementById( fieldId ).className = "error";
  }

  function removeFieldError( fieldId ){
    document.getElementById( fieldId ).className = document.getElementById( fieldId ).className.replace( /\berror\b/, "" );
  }



  function refreshBookmarksBackupState(){

    document.getElementById( "backupBookmarksBlock" ).removeAttribute("hidden");

    /*

    //if( fvd_sync_Sync.Drivers.Bookmarks.Backup.hasBackup() ){
      document.getElementById( "backupBookmarksBlock" ).removeAttribute("hidden");

      fvd_sync_Sync.Drivers.Bookmarks.Backup.countBackuped( function( result, count ){

        //if( result ){
          document.getElementById( "totalBackupedBookmarks" ).setAttribute("value", count);

        //}

      } );
    //}
    //else{
    //  document.getElementById( "backupBookmarksBlock" ).setAttribute("hidden", true);
    //}

    */

    window.sizeToContent();
    setTimeout(function(){
      window.sizeToContent();
    }, 0);

  }


  this.loadAccountBrowser = function( params ){

    params = params || {};

    function _loadListener(){

      b.removeEventListener( "load", _loadListener );
      stack.removeAttribute( "loading" );

    }

    var stack = document.getElementById("accountBrowserStack");
    stack.setAttribute( "loading", 1 );
    var b = document.getElementById( "accountBrowser" );

    b.addEventListener( "DOMContentLoaded", _loadListener, false );

    var url = fvd_sync_Sync.getAdminUrl() + "/stats?addon=ff_sync";

    //b.setAttribute( "src", url );
    b.loadURI( url, null, null );

    if( params.refresh ){
      b.reload();
    }

  };


  this.refreshUsage = function( callback ){

    SyncSettings.loadAccountBrowser();

  };

  this.refreshSyncNowState = function(){

    // need to disable buttons if syncing is active

    var query = [];

    for( var driverName in fvd_sync_Sync.Drivers ){
       query.push( ".syncButtons_" + driverName + " button" );
    }

    var buttons = document.querySelectorAll( query.join(", ") );

    if( fvd_sync_Sync.getState() == "normal" ){

      for( var i = 0; i != buttons.length; i++ ){
        buttons[i].removeAttribute("disabled");
      }

      document.getElementById("accountBrowserStack").setAttribute( "syncing", 0 );

    }
    else if( fvd_sync_Sync.getState() == "syncing" ){

      for( var i = 0; i != buttons.length; i++ ){
        buttons[i].setAttribute("disabled", true);
      }

      document.getElementById("accountBrowserStack").setAttribute( "syncing", 1 );

    }

  };


  this.doIncreaseLimits = function(){
    fvd_sync_Sync.openMainOptionsAdminWindow( "quota" );
  };

  this.openAdminPanel = function(){
    fvd_sync_Sync.openMainOptionsAdminWindow( "backups" );
  };

  this.Bookmarks = new function(){

    var selfBookmarks = this;

    var initializationProgressCheckInterval = null;

    this.refreshSyncInitialization = function(){

      var decks = document.querySelectorAll( ".bookmarksSyncDeck" );

      if( initializationProgressCheckInterval ){
        clearInterval( initializationProgressCheckInterval );
        initializationProgressCheckInterval = null;
      }

      if( fvd_sync_Sync.Drivers.Bookmarks.isInitialization() ){

        for( var i = 0; i != decks.length; i++ ){
          decks[i].selectedIndex = 1;
        }

        initializationProgressCheckInterval = setInterval(function(){

          var current = document.querySelectorAll( ".bookmarksInitialization .current" );
          var max = document.querySelectorAll( ".bookmarksInitialization .max" );

          var progress = fvd_sync_Sync.Drivers.Bookmarks.getInitializationProgress();

          for( var i = 0; i != current.length; i++ ){
            current[i].setAttribute( "value", progress.current > progress.max ? progress.max : progress.current );
          }
          for( var i = 0; i != max.length; i++ ){
            max[i].setAttribute( "value", progress.max );
          }


        }, 500);
      }
      else{

        for( var i = 0; i != decks.length; i++ ){
          decks[i].selectedIndex = 0;
        }

      }

    };

    this.buildBackupsListing = function(){

      var container = document.getElementById("bookmarksBackupListing");
      while( container.lastChild.className != "head" ){
        container.removeChild( container.lastChild );
      }

      fvd_sync_Sync.Drivers.Bookmarks.Backup.backupsListing(function( backups ){

        backups.sort(function( a, b ){
          return b.time - a.time;
        });

        backups.forEach(function( info, index ){

          var elem = document.createElement("row");

          var labelDate = document.createElement("label");
          var labelCount = document.createElement("label");
          var buttonRestore = document.createElement("button");

          labelDate.setAttribute( "value", (index + 1) + ") " + new Date( parseInt( info.time )  ).toLocaleString() );
          labelCount.setAttribute( "value", info.count );
          buttonRestore.setAttribute( "label", fvd_sync_Properties.getString( "fvd.toolbar", "settings.backup_history.restore_button" ) );

          buttonRestore.addEventListener( "command", function(){

            if( promptService.confirm(
                window,
                fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.bookmarks.restore_backup_warning.title" ),
                fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.bookmarks.restore_backup_warning.text" )
              ) ){

              if( fvd_sync_Settings.getBoolVal( "show_bookmarks_restore_freeze_message" ) ){

                var check = {value: false};
                promptService.alertCheck( window, fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.freeze_bookmarks_restore.title" ),
                  fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.freeze_bookmarks_restore.text" ),
                  fvd_sync_Properties.getString( "fvd.toolbar", "checkbox.dont_show_again" ), check );

                if( check.value ){
                  fvd_sync_Settings.setBoolVal( "show_bookmarks_restore_freeze_message", false )
                }
              }

              fvd_sync_Sync.openSimpleSyncProgressDialog( window, "bookmarks:restore", {
                folder: info.folder
              } );

              refreshInitialSyncMessage();

            }


          }, false );

          elem.appendChild( labelDate );
          elem.appendChild( labelCount );
          elem.appendChild( buttonRestore );

          container.appendChild( elem );

        });

      });

    };

    this.mergeLocalAndServerData = function(){

      if( fvd_sync_Sync.Drivers.Bookmarks.needInitialSyncAfter() != "none" ){
        document.getElementById("bookmarksInitialSyncMessage").setAttribute("hidden", true);
      }


      fvd_sync_Sync.openSimpleSyncProgressDialog( window, "bookmarks:mergeLocalAndServerData" );

      refreshBookmarksBackupState();
      refreshInitialSyncMessage();

    };

    this.overwriteLocalData = function(){

      if( fvd_sync_Sync.Drivers.Bookmarks.needInitialSyncAfter() != "none" ){
        document.getElementById("bookmarksInitialSyncMessage").setAttribute("hidden", true);
      }

      fvd_sync_Sync.openSimpleSyncProgressDialog( window, "bookmarks:overwriteLocalData" );

      refreshBookmarksBackupState();
      refreshInitialSyncMessage();

    };

    this.overwriteServerData = function(){

      if( promptService.confirm(
          window,
          fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.bookmarks.ovewrite_server_data.title" ),
          fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.bookmarks.ovewrite_server_data.text" )
        ) ){

        if( fvd_sync_Sync.Drivers.Bookmarks.needInitialSyncAfter() != "none" ){
          document.getElementById("bookmarksInitialSyncMessage").setAttribute("hidden", true);
        }

        fvd_sync_Sync.openSimpleSyncProgressDialog( window, "bookmarks:overwriteServerData" );

        refreshBookmarksBackupState();
        refreshInitialSyncMessage();

      }

    };

    this.restoreBackup = function( folder ){

      document.getElementById("syncTabs").selectedItem = document.getElementById("tab_syncTabs_backupHistory");
      document.getElementById("backupHistoryTabs").selectedItem = document.getElementById("tab_backuphistoryBookmarks");

    };

    this.makeBackup = function(){

      fvd_sync_Sync.openSimpleSyncProgressDialog( window, "bookmarks:backup" );

      refreshBookmarksBackupState();

    };

  };

  this.SpeedDial = new function(){

    this.overwriteServerData = function(){

      if( promptService.confirm(
          window,
          fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.sd.ovewrite_server_data.title" ),
          fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.sd.ovewrite_server_data.text" )
        ) ){

        fvd_sync_Sync.Drivers.SpeedDial.openSyncProgressDialog( window, "overwriteServerData" );

        refreshInitialSyncMessage();

      }

    };

    this.restoreBackup = function( folder ){

      document.getElementById("syncTabs").selectedItem = document.getElementById("tab_syncTabs_backupHistory");
      document.getElementById("backupHistoryTabs").selectedItem = document.getElementById("tab_backuphistorySpeedDial");

    };

    this.makeBackup = function(){

      fvd_sync_Sync.openSimpleSyncProgressDialog( window, "sd:backup" );

      refreshBookmarksBackupState();

    };



    this.overwriteLocalData = function(){
      fvd_sync_Sync.Drivers.SpeedDial.openSyncProgressDialog( window, "overwriteLocalData" );

      refreshInitialSyncMessage();
    };

    this.mergeLocalAndServerData = function(){
      fvd_sync_Sync.Drivers.SpeedDial.openSyncProgressDialog( window, "mergeLocalAndServerData" );

      refreshInitialSyncMessage();
    };

    this.buildBackupsListing = function(){

      if( !fvd_sync_Sync.Drivers.SpeedDial.canWork() ){
        return;
      }

      var container = document.getElementById("sdBackupListing");
      while( container.lastChild.className != "head" ){
        container.removeChild( container.lastChild );
      }

      fvd_sync_Sync.Drivers.SpeedDial.Backup.backupsListing(function( backups ){

        backups.sort(function( a, b ){
          return b.time - a.time;
        });

        backups.forEach(function( info, index ){

          var elem = document.createElement("row");

          var labelDate = document.createElement("label");
          var labelGCount = document.createElement("label");
          var labelDCount = document.createElement("label");
          var buttonRestore = document.createElement("button");

          labelDate.setAttribute( "value", (index + 1) + ") " + new Date( parseInt( info.time )  ).toLocaleString() );
          labelGCount.setAttribute( "value", info.countGroups );
          labelDCount.setAttribute( "value", info.countDials );
          buttonRestore.setAttribute( "label", "Restore" );

          buttonRestore.addEventListener( "command", function(){

            if( promptService.confirm(
                window,
                fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.sd.restore_backup_warning.title" ),
                fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.sd.restore_backup_warning.text" )
              ) ){


              fvd_sync_Sync.openSimpleSyncProgressDialog( window, "sd:restore", {
                folder: info.folder
              } );

              refreshInitialSyncMessage();

            }


          }, false );

          elem.appendChild( labelDate );
          elem.appendChild( labelGCount );
          elem.appendChild( labelDCount );
          elem.appendChild( buttonRestore );

          container.appendChild( elem );

        });

      });

    };

  };

  this.refreshManualSyncButtons = function( event ){


    var enabled = false;

    if( fvd_sync_Sync.isActive() && fvd_sync_Sync.getState() != "none" && fvd_sync_Sync.getState() == "normal" ){
      enabled = true;
    }

    var buttons = [
      "manualSyncButtonMerge",
      "manualSyncButtonOverwriteServer",
      "manualSyncButtonOverwriteLocal"
    ];

    buttons.forEach( function( button ){
      button = document.getElementsByClassName( button );

      if( enabled ){

        for( var i = 0; i != button.length; i++ ){
          b = button[i];
          b.removeAttribute( "disabled" );
        }
      }
      else{

        for( var i = 0; i != button.length; i++ ){
          b = button[i];
          b.setAttribute( "disabled", true );
        }

      }
    } );

  };

  this.refreshSyncState = function( newState ){

    fvd_sync_Settings.setBoolVal( "sd.sync.enabled", newState );

    self.refreshManualSyncButtons();

  };

  function setErrorText( text, elemId ){

    elemId = elemId || "registerErrorText";

    var container = document.getElementById( elemId );
    var label = container.getElementsByTagName("label")[0];

    if( text ){
      container.setAttribute( "appeared", "1" );
      label.setAttribute( "value", text );
    }
    else{
      container.setAttribute( "appeared", "0" );
    }

  }

  function setSuccessText( text, elemId ){
    setErrorText( text, elemId );
  }

  function setRegisterNotConfirmedData( email, password ){
    fvd_sync_Settings.setStringVal( "sd.sync.unconfirmed_registration_data", JSON.stringify( {email: email, password: password} ) );
  }

  function getRegisterNotConfirmedData(){
    try{
      return JSON.parse( fvd_sync_Settings.getStringVal( "sd.sync.unconfirmed_registration_data" ) );
    }
    catch( ex ){
      return null;
    }
  }

  function clearRegisterNotConfirmedData(){
    fvd_sync_Settings.setStringVal( "sd.sync.unconfirmed_registration_data", "" );
  }


  this.setOption = function( option ){

    var buttons = document.querySelectorAll( "#syncOptionsButtons button" );
    for( var i = 0; i != buttons.length; i++ ){
      buttons[i].setAttribute( "active", 0 );
    }

    var options = document.getElementsByClassName("syncOptionContent");
    for( var i = 0; i != options.length; i++ ){
      options[i].setAttribute( "hidden", "true" );
    }

    var buttonId = "syncButtonOption" + option;
    var optionId = "syncOption" + option;

    document.getElementById( optionId ).removeAttribute( "hidden" );
    document.getElementById( buttonId ).setAttribute( "active", 1 );

    if( option == "Login" ){
      document.getElementById( "loginButton" ).focus();
    }
    else if( option == "Register" ){
      var notConfirmedData = getRegisterNotConfirmedData();
      if( notConfirmedData ){
        document.getElementById( "new_email" ).value = notConfirmedData.email;
        document.getElementById( "new_password" ).value = notConfirmedData.password;
        self.setRegistrationStep( "confirm" );
      }
    }

  };



  this.resetSync = function(){
    fvd_sync_Sync.setState( "none" );
    setMainSyncState( "not_setuped" );
    this.setRegistrationStep( "register" );
  };

  this.remindPassword = function(){
    removeFieldError( "remind_email" );

    setErrorText( "", "remindErrorText" );
    setSuccessText( "", "remindSuccessText" );

    var email = document.getElementById("remind_email").value.trim();

    var haveErrors = false;

    if( !email ){
      haveErrors = true;
      setFieldError( "remind_email" );
    }

    if( haveErrors ){
      return;
    }

    if( !fvd_sync_Misc.validateText( "email", email ) ){
      setFieldError( "remind_email" );
      setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.email_wrong_format" ), "remindErrorText" );
      return;
    }

    var loadingRemind = document.getElementById( "loadingRemind" );
    var remindButton = document.getElementById("remindButton");

    loadingRemind.removeAttribute("hidden");
    remindButton.setAttribute( "disabled", true );

    fvd_sync_Sync.remindPassword( email, function( error ){

      loadingRemind.setAttribute("hidden", true);
      remindButton.removeAttribute( "disabled" );

      if( error == 0 ){
        setSuccessText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.password_sent" ), "remindSuccessText" );
      }
      else{
        if( error == fvd_sync_Sync.Errors.ERROR_USER_NOT_EXISTS ){
          setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.user_doesnt_exists" ), "remindErrorText" );
        }
        else{
          setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.server_error" ), "remindErrorText" );
        }
      }

    });
  };

  this.setRegistrationStep = function( step ){

    document.getElementById( "syncOptionRegister_register" ).setAttribute( "hidden", true );
    document.getElementById( "syncOptionRegister_confirm" ).setAttribute( "hidden", true );

    document.getElementById( "syncOptionRegister_" + step ).removeAttribute( "hidden" );

  };

  this.confirmRegister = function(){

    removeFieldError( "confirm_code" );

    setErrorText( "" );

    var code = document.getElementById("confirm_code").value.trim();
    var email = document.getElementById("new_email").value.trim();
    var password = document.getElementById("new_password").value.trim();

    if( !code ){
      setFieldError( "confirm_code" );
      return;
    }

    var loadingConfirm = document.getElementById( "loadingConfirm" );
    var confirmButton = document.getElementById("confirmRegisterButton");

    loadingConfirm.removeAttribute("hidden");
    confirmButton.setAttribute( "disabled", true );

    fvd_sync_Sync.confirmRegistration( code, function( error ){
      loadingConfirm.setAttribute("hidden", true);
      confirmButton.removeAttribute( "disabled" );

      if( error == 0 ){

        clearRegisterNotConfirmedData();

        if( document.getElementById("syncRegisterSubscribeOnNewsletter").checked ){
          fvd_sync_NewsLetter.subscribe( email, email.split("@")[0] );
        }

        fvd_sync_Sync.setState( "normal" );
        fvd_sync_Sync.setCredentials( email, password );

        setMainSyncState( "setuped", "register" );

        //fvd_sync_Sync.openSyncProgressDialog( window, "overwriteServerData" );

        document.getElementById("confirm_code").value = "";
        document.getElementById("new_email").value = "";
        document.getElementById("new_password").value = "";

        refreshInitialSyncMessage();
      }
      else{
        if( error == fvd_sync_Sync.Errors.ERROR_USER_NOT_EXISTS ){
          setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.confirm_is_wrong" ) );
        }
        else{
          setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.undefined" ).replace("%code%", error) );
        }
      }
    } );

  };

  this.resendConfirmEmail = function(){

    var email = document.getElementById("new_email").value.trim();

    var loadingConfirm = document.getElementById( "loadingConfirm" );
    var confirmButton = document.getElementById("confirmRegisterButton");
    var resendConfirmButton = document.getElementById("resendConfirmButton");

    loadingConfirm.removeAttribute("hidden");
    resendConfirmButton.setAttribute( "disabled", true );
    confirmButton.setAttribute( "disabled", true );

    fvd_sync_Sync.resendConfirmEmail( email, function(){

    loadingConfirm.setAttribute("hidden", true);
    resendConfirmButton.removeAttribute( "disabled" );
    confirmButton.removeAttribute( "disabled" );

    } );

  };

  this.cancelConfirm = function(){
    self.setRegistrationStep( "register" );
    setErrorText( "" );
    removeFieldError( "confirm_code" );

    clearRegisterNotConfirmedData();
  };

  this.registerUser = function(){

    removeFieldError( "new_email" );
    removeFieldError( "new_password" );

    setErrorText( "" );

    var email = document.getElementById("new_email").value.trim();
    var password = document.getElementById("new_password").value.trim();

    var haveErrors = false;

    if( !email ){
      haveErrors = true;
      setFieldError( "new_email" );
    }

    if( !password ){
      haveErrors = true;
      setFieldError( "new_password" );
    }

    if( haveErrors ){
      return;
    }

    if( password.length < 8 ){
      setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.password_too_short" ) );
      setFieldError( "new_password" );
      return;
    }

    if( !fvd_sync_Misc.validateText( "email", email ) ){
      setFieldError( "new_email" );
      setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.email_wrong_format" ) );
      return;
    }

    var loadingRegister = document.getElementById( "loadingRegister" );
    var registerButton = document.getElementById("registerButton");

    loadingRegister.removeAttribute("hidden");
    registerButton.setAttribute( "disabled", true );

    fvd_sync_Sync.registerUser( email, password, function( error, additional ){

      loadingRegister.setAttribute("hidden", true);
      registerButton.removeAttribute( "disabled" );


      if( error == 0 ){

        fvd_sync_Sync.setState( "normal" );
        fvd_sync_Sync.setCredentials( email, password );

        setMainSyncState( "setuped", "register" );

        document.getElementById("confirm_code").value = "";
        document.getElementById("new_email").value = "";
        document.getElementById("new_password").value = "";

        refreshInitialSyncMessage();

      }
      else{

        if( additional && additional.existsButNotConfirmed ){

          setRegisterNotConfirmedData( email, password );
          self.setRegistrationStep( "confirm" );

        }
        else{
          if( error == fvd_sync_Sync.Errors.ERROR_USER_ALREADY_EXISTS ){
            setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.already_registered" ) );
          }
          else{
            setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.undefined" ).replace("%code%", error) );
          }
        }

      }

    } );

  };

  this.tryLogin = function(){

    removeFieldError( "exists_email" );
    removeFieldError( "exists_password" );

    setErrorText( "", "loginErrorText" );

    var email = document.getElementById("exists_email").value.trim();
    var password = document.getElementById("exists_password").value.trim();

    var haveErrors = false;

    if( !email ){
      haveErrors = true;
      setFieldError( "exists_email" );
    }

    if( !password ){
      haveErrors = true;
      setFieldError( "exists_password" );
    }

    if( !fvd_sync_Misc.validateText( "email", email ) ){
      haveErrors = true;
      setFieldError( "exists_email" );
    }

    if( haveErrors ){
      return;
    }

    var loginButton = document.getElementById("loginButton");
    var loadingLogin = document.getElementById("loadingLogin");

    loginButton.setAttribute( "disabled", true );
    loadingLogin.removeAttribute( "hidden" );

    fvd_sync_Sync.userExists( email, password, function( error, result ){

      if( error == 0 ){

        fvd_sync_Sync.setCredentials( email, password );

        setMainSyncState( "setuped", fvd_sync_Settings.getStringVal("settings.last_used_account") != email ? "login" : null );

        fvd_sync_Settings.setStringVal("settings.last_used_account", email);

        fvd_sync_Sync.setState( "normal" );

        refreshInitialSyncMessage();


        /*

        // request sync type
        try{
          var syncType = fvd_sync_Sync.openSyncTypeDialog( window, [
            "overwriteServerData",
            "overwriteLocalData",
            "mergeLocalAndServerData"
          ], fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.after_login_sync_type_title" ) );

          if( syncType ){
            fvd_speed_dial_Sync.openSyncProgressDialog( window, syncType );
          }
          else{
            SyncSettings.resetSync();
          }
        }
        catch( ex ){

        }

        */

      }
      else{

        if( result && result.existsButNotConfirmed ){
          self.setRegistrationStep( "confirm" );

          document.getElementById("new_email").value = email;
          document.getElementById("new_password").value = password;

          self.setOption('Register');
        }
        else{
          setErrorText( fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.error.login_failed" ), "loginErrorText" );
        }
      }

      loadingLogin.setAttribute( "hidden", true );
      loginButton.removeAttribute( "disabled" );


    } );

  };

  this.overwriteServerData = function(){
    fvd_sync_Sync.openSyncProgressDialog( window, "overwriteServerData" );
  };

  this.overwriteLocalData = function(){
    fvd_sync_Sync.openSyncProgressDialog( window, "overwriteLocalData" );
  };

  this.mergeLocalAndServerData = function(){
    fvd_sync_Sync.openSyncProgressDialog( window, "mergeLocalAndServerData" );
  };

  this.removeAccount = function(){
    if( promptService.confirm( window, fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.remove_account.title" ), fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.confirm.remove_account.text" ) ) ){
      fvd_sync_Sync.removeUser( function(){
        self.resetSync();
      } );
    }

  };

  this.showWhyUseWebInterface = function( event ){
    document.getElementById( "whyUseWebInterface" ).openPopup( event.target, "after_start", 0, 0, false, false, null );
  };

  this.refreshInBrowserCount = function( aDriver ){

    SyncSettings.loadAccountBrowser();


  };

  this.setMainSyncState = function( state ){
    setMainSyncState( state );
  };

  this.refreshInitialSyncMessage = function(){
    refreshInitialSyncMessage();
  };

  function refreshInitialSyncMessage(){

    if( fvd_sync_Sync.Drivers.Bookmarks.needInitialSyncAfter() != "login" &&
      fvd_sync_Sync.Drivers.Bookmarks.needInitialSyncAfter() != "register" ){
      document.getElementById("bookmarksInitialSyncMessage").setAttribute("hidden", true);
      document.getElementById( "tab_syncTabs_bookmarksTabs" ).setAttribute("class", "");
    }
    else{
      document.getElementById("bookmarksInitialSyncMessage").removeAttribute("hidden");
      document.getElementById( "tab_syncTabs_bookmarksTabs" ).setAttribute("class", "alert");
    }

    if( fvd_sync_Sync.Drivers.SpeedDial.needInitialSyncAfter() != "login" &&
      fvd_sync_Sync.Drivers.SpeedDial.needInitialSyncAfter()  != "register" ){
      document.getElementById("speedDialInitialSyncMessage").setAttribute("hidden", true);
      document.getElementById( "tab_syncTabs_speeddial" ).setAttribute("class", "");
    }
    else{
      document.getElementById("speedDialInitialSyncMessage").removeAttribute("hidden");
      document.getElementById( "tab_syncTabs_speeddial" ).setAttribute("class", "alert");
    }


  }

  function init(){

    self.Bookmarks.buildBackupsListing();
    self.SpeedDial.buildBackupsListing();

    self.Bookmarks.refreshSyncInitialization();

    self.refreshSyncNowState();

    document.getElementById("syncTabs").addEventListener("select", function( event ){

      fvd_sync_Settings.setIntVal( "settings.last_selected_tab", event.target.selectedIndex );

    });

    var tabIndex = fvd_sync_Settings.getIntVal( "settings.last_selected_tab" );
    document.getElementById("syncTabs").selectedIndex = tabIndex;

    refreshBookmarksBackupState();

    if( fvd_sync_Sync.isSetuped() ){
      setMainSyncState( "setuped" );
    }
    else{
      setMainSyncState( "not_setuped" );
    }


    document.getElementById("syncEnableCheckbox").checked = fvd_sync_Settings.getBoolVal( "sd.sync.enabled" );



    refreshInitialSyncMessage();

    /*
    var Ci = Components.interfaces;
    var xulWin = window.QueryInterface(Ci.nsIInterfaceRequestor)
       .getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem)
       .treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
       .getInterface(Ci.nsIXULWindow);
    xulWin.zLevel = xulWin.raisedZ;
    */

    var containers = document.querySelectorAll( "[displayhelpto]" );

    for( var i = 0; i != containers.length; i++ ){

      (function( container ){

        var helpContainer = document.getElementById( container.getAttribute( "displayhelpto" ) );
        var items = container.querySelectorAll( "[helpmessage]" );

        helpContainer.setAttribute( "value", helpContainer.getAttribute("defaultmessage") );

        for( var j = 0; j != items.length; j++ ){

          (function( item ){

            item.addEventListener( "mouseover", function(){

              helpContainer.setAttribute( "value", item.getAttribute( "helpmessage" ) );

            } );

            item.addEventListener( "mouseout", function(){

              helpContainer.setAttribute( "value", helpContainer.getAttribute("defaultmessage") );

            } );

          })( items[j] );

        }

      })( containers[i] );

    }

    self.loadAccountBrowser();

  }

  window.addEventListener( "load", function(){

    init();

  }, true );

  window.addEventListener( "unload", function(){
  }, false );

};


function FVD_Settings()
{

  var self = this;

  function refreshCookieState(){

    var displayWarning = globalSettingsBranch.getIntPref("network.cookie.cookieBehavior") != 0;

    if( fvd_sync_Settings.getBoolVal("hide_cookie_warning") ){
      displayWarning = false;
    }

    var elem = document.getElementById("cookiesWarning");

    if( displayWarning ){
      elem.removeAttribute("hidden");
    }
    else{
      elem.setAttribute("hidden", true);
    }

  }

  this.init = function()
  {

    FVDPopupImageHelper.assignByClass();

    SyncSettings.refreshManualSyncButtons();

    if( window.arguments && window.arguments[0] ){

      if( window.arguments[0].activeTab ){

        document.getElementById("syncTabs").selectedItem = document.getElementById( "tab_" + window.arguments[0].activeTab );

      }

    }

    if( !fvd_sync_Sync.Drivers.SpeedDial.canWork() ){
      document.getElementById("tab_syncTabs_speeddial").setAttribute("hidden", true);
      if( document.getElementById("syncTabs").selectedItem == document.getElementById("tab_syncTabs_speeddial") ){
        document.getElementById("syncTabs").selectedIndex = 0;
      }

      document.getElementById( "tab_backuphistorySpeedDial" ).setAttribute("hidden", true);
    }

    document.getElementById("accountBrowser").addEventListener( "keypress", function( event ){

      if( event.keyCode == 13 ){
        event.stopPropagation();
        event.preventDefault();
      }

    }, false );

    refreshCookieState();

    document.querySelector("#cookiesWarning .close").addEventListener( "click", function(){
      fvd_sync_Settings.setBoolVal("hide_cookie_warning", true);

      refreshCookieState();
    }, false );

    // check need show become pro button
    fvd_sync_Sync.getUserInfo(function(err, info) {
      var show = true;
      if(!err) {
        show = !info.premium.active;
      }
      if(show) {
        var btn = document.getElementById("becomePremiumButton");
        btn.removeAttribute("hidden");
        setTimeout(function() {
          btn.style.opacity = 1;
        }, 0);
        btn.addEventListener("click", function() {
          fvd_sync_Misc.getMainWindow(  ).fvd_Sync.navigate_url("https://everhelper.me/everhelperplans.php");
          window.close();
        }, false);
      }
    });

    document.getElementById("openHelp").addEventListener("click", function() {
      var url = "https://everhelper.desk.com/customer/en/portal/topics/526842-eversync/articles";
      if(fvd_sync_Misc.browserLocaleIs("ru")) {
        url = "https://everhelper.desk.com/customer/en/portal/topics/873013-eversync---%D0%92%D0%BE%D0%BF%D1%80%D0%BE%D1%81%D1%8B-%D0%B8-%D0%9E%D1%82%D0%B2%D0%B5%D1%82%D1%8B/articles";
      }
      fvd_sync_Misc.navigate_url(url);
    }, false);
  };


  this.ok = function(event, accept)
  {

  };

  window.addEventListener('load', function () {self.init.call(self)}, false);
};

function sdEnableClick(){
  var fields = {
    "enable_top_sites": "top_sites",
    "enable_most_visited": "most_visited",
    "enable_recently_closed": "recently_closed"
  };

  var selectedCount = 0;
  var block = false;

  for( var k in fields ){
    if( document.getElementById(k).checked ){
      selectedCount++;
      document.getElementById( "sd_default_"+fields[k] ).setAttribute("disabled", false);
    }
    else{
      document.getElementById( "sd_default_"+fields[k] ).setAttribute("disabled", true);
      if( document.getElementById( "sd_default_mode" ).value == fields[k] ){
        document.getElementById( "sd_default_mode" ).selectedIndex = 3;
      }
    }
  }

  if( selectedCount == 1 ){
    for( var k in fields ){
      if( !document.getElementById(k).checked ){
        continue;
      }
      document.getElementById(k).setAttribute( "disabled", true );
    }
  }
  else{
    // enable all
    for( var k in fields ){
      document.getElementById(k).setAttribute( "disabled", false );
    }
  }

}

var fvds = new FVD_Settings();

