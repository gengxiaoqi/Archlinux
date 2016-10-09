Components.utils.import("resource://fvd.sync.modules/sync.js");
Components.utils.import("resource://fvd.sync.modules/properties.js");
Components.utils.import("resource://fvd.sync.modules/settings.js");
Components.utils.import("resource://fvd.sync.modules/misc.js");

var action = arguments[0].syncType;
var dialog = null;

function finishCallback( error, _result ){
  
  _result = _result || {};
  
  if( error != 0 ){

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                              .getService(Components.interfaces.nsIPromptService);
    
    var checkState = {
      value: false
    };
    
    if( error == fvd_sync_Sync.Errors.ERROR_COUNT_ITEMS_QUOTA_EXCEED ){
      fvd_sync_Sync.quotaExceedMessageShow({
        parent: window.opener,
        count: _result.count,
        category: "bookmarks_count"
      });     
    }
    else if( error == fvd_sync_Sync.Errors.ERROR_AUTH_FAILED ) {
      fvd_sync_Sync.loginIncorrectMessageShow( {
        parent: window.opener
      } );             
    }
    else{
      promptService.alert( window, 
                   fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.simple_sync_error.title"),
                   fvd_sync_Properties.getString( "fvd.toolbar",  "sd.sync.alert.simple_sync_error.text") );
    }
              



  }
  
  document.getElementById("syncingBox").setAttribute("hidden", true);
  
  //dialog.getButton( "accept" ).removeAttribute("hidden");
  
  if( error == 0 ){
    document.getElementById("successBox").removeAttribute("hidden");
  }
  else{
    document.getElementById("errorBox").removeAttribute("hidden");    
  }
  
  window.close();
  
  //sizeToContent();
    
}

function _getMainWindow(){
  var mainWindow = opener.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);
  
    return mainWindow;
}

function checkBookmarksBackup(){
  
  if( !fvd_sync_Settings.getBoolVal( "bookmarks.backuped" ) ){
    fvd_sync_Sync.openSimpleSyncProgressDialog( _getMainWindow(), "bookmarks:backup" );
    fvd_sync_Settings.setBoolVal( "bookmarks.backuped", true );
  }
  
}

function processAction(){
  
  dialog.getButton( "accept" ).setAttribute("hidden", true);      

  
  switch( action ){
    
    case "tabs:load":
      
      try{
        fvd_sync_Sync.Drivers.Tabs.loadFromServer( finishCallback );        
      }
      catch( ex ){
        dump( ex + "\n" );      
      }

      
    break;
    case "tabs:save":

      fvd_sync_Sync.Drivers.Tabs.saveToServer( finishCallback );
    
    break;  
    
    case "sd:restore":
    
      document.getElementById("progressMessage").setAttribute("hidden", true);
      document.getElementById("progressMessageRestore").removeAttribute("hidden", true);
      
      document.getElementById("detailedProgress").removeAttribute("hidden");
      
      var _checkProgressInterval = setInterval(function(){
        
        var p = fvd_sync_Sync.Drivers.SpeedDial.Backup.getRestoreProgress();
        document.querySelector("#detailedProgress .value").setAttribute("value", p.current + "/" + p.max);
        
      }, 500);
      
      setTimeout(function(){
        
        fvd_sync_Sync.Drivers.SpeedDial.Backup.restore( window.arguments[0].folder, function( success ){    
          clearInterval( _checkProgressInterval );    
          finishCallback( success ? 0 : -1000 );        
        } );        
        
      }, 0);
    
    break;  
    
    case "sd:backup":
    
      document.getElementById("progressMessage").setAttribute("hidden", true);
      document.getElementById("progressMessageBackup").removeAttribute("hidden", true);     
      
      fvd_sync_Sync.Drivers.SpeedDial.Backup.make( function( success ){       
        finishCallback( success ? 0 : -1000 );        
      } );  
    
    break;  
    
    case "bookmarks:createGuids":
    
      document.getElementById("progressMessage").setAttribute("hidden", true);
      document.getElementById("progressMessageInitialization").removeAttribute("hidden", true); 
      
      fvd_sync_Sync.Drivers.Bookmarks.Backup.make( function( success ){       
        finishCallback( 0 );        
      } );      
    
    break;
    
    case "bookmarks:backup":
            
      document.getElementById("progressMessage").setAttribute("hidden", true);
      document.getElementById("progressMessageBackup").removeAttribute("hidden", true);     
      
      fvd_sync_Sync.Drivers.Bookmarks.Backup.make( function( success ){       
        finishCallback( success ? 0 : -1000 );        
      } );
    
    break;
    
    case "bookmarks:restore":
    
      document.getElementById("progressMessage").setAttribute("hidden", true);
      document.getElementById("progressMessageRestore").removeAttribute("hidden", true);
    
      document.getElementById("detailedProgress").removeAttribute("hidden");
      
      var _checkProgressInterval = setInterval(function(){
        
        var p = fvd_sync_Sync.Drivers.Bookmarks.Backup.getRestoreProgress();
        document.querySelector("#detailedProgress .value").setAttribute("value", p.current + "/" + p.max);
        
      }, 500);
    
      document.getElementById("detailedProgress")
    
      fvd_sync_Sync.Drivers.Bookmarks.Backup.restore( window.arguments[0].folder, function( success ){  
        clearInterval( _checkProgressInterval );      
        finishCallback( success ? 0 : -1000 );        
      } );
    
    break;    
    
    case "bookmarks:mergeLocalAndServerData":
    
      checkBookmarksBackup();
    
      fvd_sync_Sync.Drivers.Bookmarks.mergeLocalAndServerData( finishCallback );
    
    break;
    
    case "bookmarks:overwriteLocalData":
    
      checkBookmarksBackup();
    
      fvd_sync_Sync.Drivers.Bookmarks.overwriteLocalData( finishCallback );     
    
    break;
    
    case "bookmarks:overwriteServerData":
    
      checkBookmarksBackup();
    
      fvd_sync_Sync.Drivers.Bookmarks.overwriteServerData( finishCallback );
    
    break;
    
    case "bookmarks:startMainSync":
      
      checkBookmarksBackup();
        
      fvd_sync_Sync.Drivers.Bookmarks.startMainSync( finishCallback );
    
    break;
  } 
}


window.addEventListener( "load", function(){
  dialog = document.getElementsByTagName("dialog")[0];
  processAction();
  document.querySelector("#unsorted-warning .text-link").addEventListener("click", function() {
    var mainWin = fvd_sync_Misc.getMainWindow();
    var b = fvd_sync_Settings.branch("general.useragent.");
    var locale = b.getCharPref("locale");
    mainWin.gBrowser.selectedTab = mainWin.gBrowser.addTab("https://everhelper.me/info/sync-unsorted.php?locale="+encodeURIComponent(locale));
  }, false);
}, false );
