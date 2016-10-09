Components.utils.import("resource://fvd.sync.modules/sync.js");
Components.utils.import("resource://fvd.sync.modules/async.js");
Components.utils.import("resource://fvd.sync.modules/properties.js");
Components.utils.import("resource://fvd.sync.modules/settings.js");

var data = arguments[0];

var inProgress = true;

var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

var changeActiveCondCheckersCountCallback = null;

var eventObserver = {
  observe: function(subject, topic, data) {
    if (topic == "FVD.Toolbar-SD-Sync-Cond-Checkers-Count-Changed") {
      if( changeActiveCondCheckersCountCallback ){
        changeActiveCondCheckersCountCallback();
      }
    }
  }
};

var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

observer.addObserver(eventObserver, "FVD.Toolbar-SD-Sync-Cond-Checkers-Count-Changed", false);

function doneActive() {
  var items = document.querySelectorAll( "#syncStatuses > hbox" );
  for( var i = 0; i != items.length; i++ ){
    var item = items[i];

    if( item.hasAttribute( "status" ) && item.getAttribute( "status" ) == "active" ){
      item.setAttribute( "status", "done" );
    }
  }
}

function errorAll(){
  var items = document.querySelectorAll( "#syncStatuses > hbox" );

  for(var i = 0; i != items.length; i++) {
    var item = items[i];
    item.setAttribute( "status", "error" );
  }
}

function doneAll(){
  var items = document.querySelectorAll( "#syncStatuses > hbox" );

  for(var i = 0; i != items.length; i++) {
    var item = items[i];
    item.setAttribute( "status", "done" );
  }
}

function resetAll(){
  var items = document.querySelectorAll( "#syncStatuses > hbox" );

  for( var i = 0; i != items.length; i++ ){

    var item = items[i];

    item.removeAttribute( "status" );

  }
}


function changeCloseWhenFinishedState(){
  var state = document.getElementById("closeWhenFinished").checked;
  fvd_sync_Settings.setBoolVal( "sd.sync.close_after_sync_progress", state );
}

function closeWhenFinished(){
  return document.getElementById("closeWhenFinished").checked;
}

function endWork(){
  if( closeWhenFinished() || data.closeOnFinish  ){
    window.close();
  }
}

function abort(){
  if( !inProgress ){
    return;
  }

  fvd_speed_dial_Sync.abortCurrentSync();
  document.getElementById( "syncingBox" ).setAttribute( "hidden", true );
  document.getElementById( "abortingBox" ).removeAttribute( "hidden" );
}

function tryAgain(){
  document.getElementById( "syncingBox" ).removeAttribute( "hidden" );
  document.getElementById( "errorBox" ).setAttribute( "hidden", true );
  document.getElementById( "successBox" ).setAttribute( "hidden", true );

  sizeToContent();

  resetAll();
  init();
}

function init(){

  document.getElementsByTagName("dialog")[0].getButton("extra1").setAttribute( "hidden", true );

  document.getElementById("closeWhenFinished").checked =
    fvd_sync_Settings.getBoolVal( "sd.sync.close_after_sync_progress" );

  function stateProcess( state, stateData ){
    doneActive();

    switch( state ){
      case "syncGroups":
        document.getElementById("syncStatus_groups").setAttribute( "status", "active" );
      break;

      case "syncDials":
        document.getElementById("syncStatus_dials").setAttribute( "status", "active" );
      break;

      case "applyChanges":
        document.getElementById("syncStatus_applyChanges").setAttribute( "status", "active" );
      break;
    }

    if( stateData ){
      if( typeof stateData.groupsCount != "undefined" ){
      }
      if( typeof stateData.dialsCount != "undefined" ){
      }
    }

  }

  function finishCallback( error, _result ){
    inProgress = false;

    _result = _result || {};

    document.getElementById( "syncingBox" ).setAttribute( "hidden", true );
    document.getElementById( "abortingBox" ).setAttribute( "hidden", true );
    document.getElementById( "successBox" ).setAttribute( "hidden", true );

    if( error == 0 ){
      observer.notifyObservers( null, "FVD.Toolbar-SD-Dial-Sync-Completed", null );
      document.getElementById( "successBox" ).removeAttribute( "hidden" );
      doneAll();
    }
    else{
      errorAll();
      document.getElementById( "errorBox" ).removeAttribute( "hidden" );
      document.getElementsByTagName("dialog")[0].getButton("extra1").removeAttribute( "hidden" );

      if( error == fvd_sync_Sync.Errors.ERROR_ALREADY_LOCKED ){
        promptService.alert( window, fvd_sync_Properties.getString( "fvd.toolbar", "sd.alert.sync.lock_not_released_yet.title" ),
          fvd_sync_Properties.getString( "fvd.toolbar", "sd.alert.sync.lock_not_released_yet.text" ) );
      }
      else if( error == fvd_sync_Sync.Errors.ERROR_COUNT_ITEMS_QUOTA_EXCEED ){

        fvd_sync_Sync.quotaExceedMessageShow( {
          parent: window,
          count: _result.count,
          category: "dials_count"
        } );

      }
      else if( error == fvd_sync_Sync.Errors.ERROR_AUTH_FAILED ){
        fvd_sync_Sync.loginIncorrectMessageShow({
          parent: window
        });
        window.close();
      }
    }

    window.sizeToContent();

  }

  var message = fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.progress.message." + data.syncType );

  document.getElementById("progressMessage").value = message;

  switch( data.syncType ){

    case "mergeLocalAndServerData":

      fvd_sync_Sync.Drivers.SpeedDial.mergeLocalAndServerData( function( error, _result ){

        finishCallback( error, _result );
        endWork();

      }, stateProcess );

    break;

    case "overwriteServerData":

      fvd_sync_Sync.Drivers.SpeedDial.overwriteServerData( function( error, _result ){

        finishCallback( error, _result );
        endWork();

      }, stateProcess );

    break;

    case "overwriteLocalData":

      fvd_sync_Sync.Drivers.SpeedDial.overwriteLocalData( function( error, _result ){

        finishCallback( error, _result );
        endWork();

      }, stateProcess );

    break;

    case "uploadUpdatesAndCheckForUpdates":
      fvd_sync_Sync.Drivers.SpeedDial.startMainSync(function( error, _result ) {
        finishCallback( error, _result );
        endWork();
      }, stateProcess);
    break;


  }

}



window.addEventListener( "load", function _loadListener(){
  window.removeEventListener("load", _loadListener);

  init();
}, false );

window.addEventListener( "dialogcancel", function( event ){

  if( inProgress ){

    if( fvd_speed_dial_Sync.isCancellableSync( data.syncType ) ){
      var r = promptService.confirm(
        window, fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.progress.confirm.abort.title" ),
        fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.progress.confirm.abort.text" ) );
      if( r ){
        abort();
      }
    }
    else{
      promptService.alert( window, fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.progress.alert.cannot_abort.title" )
        , fvd_sync_Properties.getString( "fvd.toolbar", "sd.sync.progress.alert.cannot_abort.text" ) );
    }

    event.preventDefault();
  }



}, true );
