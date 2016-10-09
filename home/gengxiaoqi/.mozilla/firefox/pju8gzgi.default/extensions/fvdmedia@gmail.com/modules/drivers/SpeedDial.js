var EXPORTED_SYMBOLS = ["SpeedDial"];

Components.utils.import("resource://fvd.sync.modules/misc.js");
Components.utils.import("resource://fvd.sync.modules/file.js");
Components.utils.import("resource://fvd.sync.modules/async.js");
Components.utils.import("resource://fvd.sync.modules/settings.js");
Components.utils.import("resource://fvd.sync.modules/config.js");

try{
  Components.utils.import("resource://fvd.speeddial.modules/settings.js");
  Components.utils.import("resource://fvd.speeddial.modules/storage.js");
  Components.utils.import("resource://fvd.speeddial.modules/properties.js");
}
catch( ex ){

}


function SyncDataCondChecker( cond, successCallback, failCallback ){

  const TIMEOUT = 60000; // 60 secs

  var event = {
    notify: function(timer) {

      cond( function( success ){
        if( success ){
          successCallback();
        }
        else{
          var now = new Date().getTime();

          if( now - startTime < TIMEOUT ){
            startTimeout();
          }
          else{
            if( failCallback ){
              failCallback++;
            }
          }
        }
      } );

    }
  };

  var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);


  function startTimeout(){

    timer.initWithCallback(event, 100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

  }

  var startTime = new Date().getTime();
  startTimeout();

}

/** Short Manual **/

/*** Private to sync functions ***/

/**
 * array getToSyncData()
 * setToSyncData(array)
 * clearToSyncData()
 */

var _initCallbacks = [];

_initCallbacks.callIfNeed = function(){

  if( SpeedDial.syncInst ){
    _initCallbacks.forEach( function( c ){
      c();
    } );
  }

};



var SpeedDial_Class = function(){

  var self = this;

  this.quotaExceedMessageShow = function( parent ){
    return self.syncInst.quotaExceedMessageShow( parent );
  };

  this.loginIncorrectMessageShow = function( params ){
    return self.syncInst.loginIncorrectMessageShow( params );
  };

  this.canWork = function(){

    if( typeof fvd_speed_dial_Storage != "undefined" ){
      return true;
    }

    return false;

  };

  this.needInitialSyncAfter = function() {
    return fvd_sync_Settings.getStringVal( "speeddial.after_auth_state" );
  };

  this.syncAuthActionCompleted = function( action ){

    if( action == "login" || action == "register" ){

      fvd_sync_Settings.setStringVal( "speeddial.after_auth_state", action );

    }

  };

  if( !self.canWork() ){
    return;
  }

  this.syncInst = null;

  const TIMER_INTERVAL = 1000 * 5;
  const CHECK_FOR_UPDATES_EVERY = 1000 * 60 * 60 * 3; // 3 hours
  const PREVIEW_CONTENT_TYPE = "image/png";
  const PREVIEW_FILE_NAME = "preview.png";

  var activeCondCheckersCount = 0;

  function initialSyncMaked(){

    fvd_sync_Settings.setStringVal( "speeddial.after_auth_state", "none" );

  }

  function changeActiveCondCheckersCount( add ){

    try{
      activeCondCheckersCount += add;

      if( activeCondCheckersCount < 0 ){
        activeCondCheckersCount = 0;
      }

      observer.notifyObservers( null, "FVD.Toolbar-SD-Sync-Cond-Checkers-Count-Changed", null );
    }
    catch( ex ){
      dump( ex + "\n" );
    }

  }

  var eventObserver = {

    observe: function( subject, topic, data ){

      if( topic == "FVD.Toolbar-SD-Group-Sync-State-Changed" ){

        var groupData = fvd_speed_dial_Storage.getGroupById( data );

        if( groupData.sync == 1 ){

          // add sync data

          fvd_speed_dial_Storage.getGroupsList().forEach(function( group ){
            if( group.sync == 1 ){
              fvd_speed_dial_Sync.syncData( ["groups", "newGroups"], group.global_id, {toSyncAnyWay: true} );
            }
          });

          fvd_speed_dial_Sync.syncData( ["specialActions"], "merge_group:" + data + ":" + groupData.global_id );

          // remove sync data
          self.removeSyncData( ["deleteGroups"], fvd_speed_dial_Storage.groupGlobalId( data ) );

          var dialsGlobalId = fvd_speed_dial_Storage.getDialsGlobalIdsByGroup( data );

          dialsGlobalId.forEach(function( dialGlobalId ){
            fvd_speed_dial_Sync.removeSyncData( ["deleteDials"], dialGlobalId );
          });

        }
        else if( groupData.sync == 0 ){

          // remove sync data
          fvd_speed_dial_Sync.removeSyncData( ["specialActions"], "merge_group:" + data + ":" + groupData.global_id );
          fvd_speed_dial_Sync.removeSyncData( ["groups", "newGroups"], fvd_speed_dial_Storage.groupGlobalId( data ) );

          // add sync data

          fvd_speed_dial_Sync.syncData( ["deleteGroups"], fvd_speed_dial_Storage.groupGlobalId( data ),{
            toSyncAnyWay: true
          } );

          var dialsGlobalId = fvd_speed_dial_Storage.getDialsGlobalIdsByGroup( data );

          dialsGlobalId.forEach(function( dialGlobalId ){
            fvd_speed_dial_Sync.syncData( ["deleteDials"], dialGlobalId, {
              toSyncAnyWay: true
            } );
          });

        }

      }
      else if( topic == "FVD.Toolbar-SD-Dial-Moved" ){

        try{
          var dial = fvd_speed_dial_Storage.getDialById( data );
          var groupId = dial.group_id;
          var group = fvd_speed_dial_Storage.getGroupById(groupId);

          var dialGlobalId = fvd_speed_dial_Storage.dialGlobalId( dial.id );

          if( group.sync == 0 ){
            // remove sync data if dial modified before
            fvd_speed_dial_Sync.removeSyncData( ["dials", "newDials"], dialGlobalId, {
              toSyncAnyWay: true
            } );

            // remove dial form server
            fvd_speed_dial_Sync.syncData( "deleteDials", dialGlobalId, {
              toSyncAnyWay: true
            } );
          }
          else if( group.sync == 1 ){

            // remove sync data if already moved to nosync group
            fvd_speed_dial_Sync.removeSyncData( "deleteDials", dialGlobalId, {
              toSyncAnyWay: true
            } );

          }

        }
        catch(ex){
          dump( "EX " + ex + "\n" );
        }

      }
      else if( topic == "FVD.Toolbar-SD-Dial-Import-Success" ){

        self.syncAuthActionCompleted( "login" );
        self.Backup.setChangesMaked();

      }

    }

  };

  const observeFor = [
    "FVD.Toolbar-SD-Group-Sync-State-Changed",
    "FVD.Toolbar-SD-Dial-Moved",
    "FVD.Toolbar-SD-Dial-Import-Success"
  ];

  var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

  observeFor.forEach( function( topic ){

    observer.addObserver( eventObserver, topic, false );

  } );

  var mainTimer = null;

  // this is empty list to sync data
  var _initToSyncData = {
    dials: [],
    groups: [],
    newDials: [], // here only just created dials
    newGroups: [], // here only just created groups
    deleteDials: [],
    deleteGroups: [],
    specialActions: []  // such as merge_group
  };

  var syncAborted = false; // sign of user cancel sync


  var prefListener = {
        observe: function(aSubject, aTopic, aData){
            switch (aTopic) {
                case 'nsPref:changed':

                    if (aData == "enabled") {

            observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Sync-Turn", null);

                      if( self.isActive() ){
              startMainTimer();
            }
            else{
              stopMainTimer();
            }

                    }

                    break;
            }
        }
    };

  var lastCheckForUpdatesTime = new Date().getTime();



  function startMainTimer(){


  }

  function stopMainTimer(){

  }


  /* to sync data functions */

  function getToSyncData(){

    var result = null;

    try{

      result = JSON.parse( fvd_speed_dial_gFVDSSDSettings.getStringVal( "sd.sync.data_to_sync" ) );

    }
    catch( ex ){

    }

    if( !result ){
      result = JSON.parse( JSON.stringify( _initToSyncData ) );
    }
    else{
      for( var k in _initToSyncData ){
        if( !result[k] ){
          result[k] = _initToSyncData[k];
        }
      }
    }

    return result;

  }

  function setToSyncData( toSyncData ){
    //dump("SET TO SYNC: " + JSON.stringify(toSyncData) + "\n");

    fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.sync.data_to_sync", JSON.stringify( toSyncData ) );

    observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Sync-To-Sync-Data-Updated", null);
  }

  function clearToSyncData(){
    setToSyncData( _initToSyncData );
  }

  /*
   *
   * Check updates on server
   *
   */

  function hasUpdates(callback) {

    var request = {
      action: "found_changes",
      lastUpdateTimeDials: self.getDialsLastUpdateTime(),
      lastUpdateTimeGroups: self.getGroupsLastUpdateTime()
    };
    makeRequest( request, function( error, response ){
      if( error == 0 ) {
        callback( error, response.foundChanges, {
          lastUpdateTimeDials: response.lastUpdateTimeDials,
          lastUpdateTimeGroups: response.lastUpdateTimeGroups,
          localLastUpdateTimeDials : self.getDialsLastUpdateTime(),
          localLastUpdateTimeGroups : self.getGroupsLastUpdateTime()
        } );
      }
      else{
        callback( error );
      }

    } );

  }

  /*
   *
   * Upload updated dials and groups data to server
   *
   */

  function uploadUpdates( callback, stateCallback ){

    var toSyncData = getToSyncData();
    clearToSyncData();

    //dump( JSON.stringify(toSyncData) + "\n" );

    var groupsUploadedCount = 0;
    var dialsUploadedCount = 0;

    function changeState( state, countObjectsSynced ){
      if( stateCallback ){
        stateCallback( state, countObjectsSynced );
      }
    }

    fvd_sync_Async.chain([

      function( chainCallback ){

        // check need remove groups from server

        if( toSyncData.deleteGroups.length > 0 ){

          groupsUploadedCount += toSyncData.deleteGroups.length;

          removeGroupsFromServer( toSyncData.deleteGroups, function(){
            toSyncData.deleteGroups = [];
            chainCallback();
          } );
        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        // check need remove dials from server

        if( toSyncData.deleteDials.length > 0 ){

          dialsUploadedCount += toSyncData.deleteDials.length;

          removeDialsFromServer( toSyncData.deleteDials, function(){
            toSyncData.deleteDials = [];
            chainCallback();
          } );
        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        changeState( "syncGroups" );

        // check need sync groups with server

        if( toSyncData.groups.length > 0 ){

          fvd_speed_dial_Storage.asyncListGroupsForSync( "`global_id` IN ('"+toSyncData.groups.join("','")+"')", function( groups ){

            groupsUploadedCount += groups.length;

            toSyncData.groups = [];

            putGroupsListOnserver( groups, function( error, data ){
              if( error ){
                return callback( error, {
                  count: groups.length
                } );
              }

              chainCallback();
            } );

          } );

        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        changeState( "syncDials", {
          groupsCount: groupsUploadedCount
        } );

        // check need sync dials with server

        if( toSyncData.dials.length > 0 ){

          fvd_speed_dial_Storage.asyncListDialsForSync( "`dials`.`global_id` IN ('"+toSyncData.dials.join("','")+"')", function( dials ){
            dialsUploadedCount += dials.length;

            toSyncData.dials = [];

            putDialsListOnserver( dials, function( error, data ){

              if( error ){
                return callback( error,{
                  count: dials.length
                } );
              }

              chainCallback();
            } );

          } );

        }
        else{
          chainCallback();
        }

      },

      function(){

        changeState( "applyChanges", {
          dialsCount: dialsUploadedCount
        } );

        callback( 0 );
      }


    ]);

  }

  /*
   *
   * Download changed data from server and saves it locally
   *
   * */

  function applyServerUpdates(callback, stateCallback, groupsLastUpdateTime, dialsLastUpdateTime) {

    // get data from server

    var anyChangesMaked = false; // sign of new data updated/created
    var toSyncData = getToSyncData();

    function changeState( state, data ) {
      if( stateCallback ){
        stateCallback(state, data);
      }
    }

    var needFixGroupsPositions = false; // if have groups updates need fix positions
    var needFixDialsPositionsGroupsIds = []; // if have dials updates need fix it's positions

    var groupsDownloadCount = 0;
    var dialsDownloadCount = 0;

    fvd_sync_Async.chain([

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        changeState( "syncGroups" );

        // get groups and save if new found

        //dump( "Start update groups\n" );

        var currentLastUpdateTime = groupsLastUpdateTime || self.getGroupsLastUpdateTime();
        dump("Get groups from server\n");
        getGroupsFromServer( currentLastUpdateTime, function( error, result ) {

          //dump( "Groups from server get...\n" );

          if(error != 0) {
            callback( error );
          }
          else{
            var groups, lastUpdateTime;
            try{
              groups = result.groups;
              lastUpdateTime = result.lastUpdateTime;
            }
            catch( ex ){
              callback( self.syncInst.Errors.ERROR_SERVER_RESPONSE_MALFORMED );
              return;
            }

            //dump( "Found new groups: "+groups.length+"\n" );

            groupsDownloadCount += groups.length;

            if( groups.length > 0 ){
              anyChangesMaked = true;
              needFixGroupsPositions = true;
            }

            fvd_sync_Async.chain([

              function(chainCallback2) {
                fvd_sync_Async.arrayProcess( groups, function( group, arrayProcessCallback ){
                  fvd_speed_dial_Storage.asyncSaveGroupForSync( group, function() {
                    arrayProcessCallback();
                  });
                }, function() {
                  if( currentLastUpdateTime != lastUpdateTime ){
                    self.setGroupsLastUpdateTime( lastUpdateTime );
                  }
                  chainCallback2();
                } );
              },

              function(chainCallback2) {
                if(toSyncData.groups && toSyncData.groups.length && groups.length) {
                  var positionsServer = {};
                  groups.forEach(function(group) {
                    positionsServer[group.position] = group.global_id;
                  });

                  fvd_speed_dial_Storage.asyncListGroupsForSync(
                    "`global_id` IN ('"+toSyncData.groups.join("','")+"')", function(clientGroups) {
                    clientGroups.forEach(function(clientGroup) {
                      var conflictServerGlobalId = positionsServer[clientGroup.position];
                      if(conflictServerGlobalId) {
                        self.syncData("groups", conflictServerGlobalId);
                      }
                      chainCallback2();
                    });
                  } );
                }
                else {
                  chainCallback2();
                }
              },

              function( chainCallback2 ) {
                if(result.groupIds && Array.isArray(result.groupIds)) {
                  // remove groups which are not in list
                  anyChangesMaked = true;
                  var serverGroupsGlobalIds = result.groupIds.slice();
                  if(toSyncData.newGroups && Array.isArray(toSyncData.newGroups)) {
                    // add new groups to list, because they are not on server yet
                    // and should not be removed
                    serverGroupsGlobalIds = serverGroupsGlobalIds.concat(toSyncData.newGroups);
                  }
                  fvd_speed_dial_Storage.asyncRemoveGroupsNotInListForSync(serverGroupsGlobalIds,
                    function(countRemovedGroups) {
                    if(countRemovedGroups > 0) {
                      groupsDownloadCount += countRemovedGroups;
                      needFixGroupsPositions = true;
                    }
                    // do not need to send to server groups removed remotely and updated locally
                    if(toSyncData.groups && toSyncData.groups.length) {
                      toSyncData.groups.forEach(function(global_id) {
                        if(serverGroupsGlobalIds.indexOf(global_id) == -1) {
                          self.removeSyncData(["groups"], global_id);
                        }
                      });
                    }
                    chainCallback2();
                  });
                }
                else{
                  chainCallback2();
                }
              },
              function(){
                chainCallback();
              }

            ]);



          }

        } );

      },


      function( chainCallback ){

        // get dials and save if new found

        if( checkSyncAbort( callback ) ){
          return;
        }

        changeState( "syncDials", {
          groupsCount: groupsDownloadCount
        } );

        //dump( "Start update dials\n" );

        var currentLastUpdateTime = dialsLastUpdateTime || self.getDialsLastUpdateTime();

        getDialsFromServer({
            lastUpdateTime: currentLastUpdateTime
          }, function(error, result) {
          if( error != 0 ) {
            callback( error );
          }
          else{
            var dials, lastUpdateTime;
            try{
              dials = result.dials;
              lastUpdateTime = result.lastUpdateTime;
            }
            catch( ex ){
              callback( self.syncInst.Errors.ERROR_SERVER_RESPONSE_MALFORMED );
              return;
            }

            //dump( "Found new dials: " + dials.length + "\n" );

            dialsDownloadCount += dials.length;

            if(dials.length > 0) {
              anyChangesMaked = true;
            }

            fvd_sync_Async.chain([
              function( chainCallback2 ){

                fvd_sync_Async.arrayProcess( dials, function( dial, arrayProcessCallback ){

                  fvd_speed_dial_Storage.asyncSaveDialForSync( dial, function( saveInfo ){

                    if( !saveInfo ){
                      arrayProcessCallback();
                      return;
                    }

                    if( saveInfo.move ){
                      needFixDialsPositionsGroupsIds.push( saveInfo.move.from );
                      needFixDialsPositionsGroupsIds.push( saveInfo.move.to );
                    }
                    else{
                      needFixDialsPositionsGroupsIds.push( saveInfo.group_id );
                    }

                    arrayProcessCallback();
                  } );

                }, function(){
                  if( currentLastUpdateTime != lastUpdateTime ){
                    self.setDialsLastUpdateTime( lastUpdateTime );
                  }

                  chainCallback2();
                } );

              },
              function(chainCallback2){

                if( result.dialIds){

                  //result.dialIds = result.dialIds.concat( noRemoveDials );

                  anyChangesMaked = true;

                  // remove dials which is not in list
                  fvd_speed_dial_Storage.asyncRemoveDialsNotInListForSync( result.dialIds, function( removeInfo ){

                    if( removeInfo.count > 0 ){
                      dialsDownloadCount += removeInfo.count;
                      needFixDialsPositionsGroupsIds = needFixDialsPositionsGroupsIds.concat( removeInfo.removedFromGroups );
                    }

                    chainCallback2();

                  } );
                }
                else{
                  chainCallback2();
                }
              },
              function(){
                chainCallback();
              }
            ]);



          }
        } );

      },

      function( chainCallback ){

        changeState( "applyChanges", {
          dialsCount: dialsDownloadCount
        } );

        // fix groups positions if need

        if( needFixGroupsPositions ){

          fvd_speed_dial_Storage.asyncFixGroupsPositions( function(){
            chainCallback();
          } );

        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        // fix dials position

        if( needFixDialsPositionsGroupsIds.length > 0 ){
          needFixDialsPositionsGroupsIds = fvd_sync_Misc.arrayUnique( needFixDialsPositionsGroupsIds );

          fvd_sync_Async.arrayProcess( needFixDialsPositionsGroupsIds, function( groupId, arrayProcessCallback ){

            fvd_speed_dial_Storage.asyncFixDialsPositions( groupId, function(){
              arrayProcessCallback();
            } );

          }, function(){
            chainCallback();
          } );

        }
        else{
          chainCallback();
        }

      },

      function(){
        // check if data udpate/added or groups or dials are removed
        if( anyChangesMaked || needFixGroupsPositions || needFixDialsPositionsGroupsIds.length ){
          self.Backup.setChangesMaked();
        }

        callback( 0, anyChangesMaked );
      }


    ]);

  }


  function removeDialsFromServer( dialIds, callback ){

    var request = {
      action: "remove_dials",
      dialIds: dialIds
    };

    makeRequest( request, function( error, data ){

      if( error == 0 ){
        self.setDialsLastUpdateTime( data.lastUpdateTime );
      }
      callback( error );

    } );

  }

  function removeGroupsFromServer( groupIds, callback ){

    var request = {
      action: "remove_groups",
      groupIds: groupIds
    };

    makeRequest( request, function( error, data ){

      if( error == 0 ){
        self.setGroupsLastUpdateTime( data.lastUpdateTime );
      }
      callback( error );

    } );

  }

  function checkSyncAbort( callback ){
    if( syncAborted ){
      callback( self.syncInst.Errors.ERROR_SYNC_USER_ABORTED );
      return true;
    }

    return false;
  }

  function startMainSync(callback, stateProcess) {
    var toSyncData = self.getSyncData();

    if(self.activeCondCheckersCount() != 0) {
      return callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
    }

    // state process is fake, because it doesn't show the real progress
    // it's only for the progress displaying
    stateProcess = stateProcess || function() {};

    var anyChangesMakedLocally = false;

    var lastUpdateTimeGroups = self.getGroupsLastUpdateTime();
    var lastUpdateTimeDials = self.getDialsLastUpdateTime();

    fvd_sync_Async.chain([

      function() {

        self.hasUpdates(function(error, has, updateInfo) {
          fvd_sync_Async.chain([

            function( chainCallback ) {
              stateProcess("syncGroups");
              if(!has) {
                return chainCallback();
              }
              applyServerUpdates(function(error, anyChangesMaked) {
                if(error) {
                  return callback( error );
                }
                anyChangesMakedLocally = anyChangesMaked;
                chainCallback();
              }, function() {

              }, lastUpdateTimeGroups, lastUpdateTimeDials );
            },

            function( chainCallback ){
              // process special actions
              stateProcess("syncDials");
              fvd_sync_Async.arrayProcess(toSyncData.specialActions, function(specialAction, arrayProcessCallback) {
                if(specialAction.indexOf( "merge_group" ) == 0) {
                  var tmp = specialAction.split( ":" );

                  var groupId = tmp[1];
                  var groupGlobalId = tmp[2];

                  self.mergeLocalAndServerDataGroup( {
                    groupGlobalId: groupGlobalId,
                    groupId: groupId
                  }, function(){
                    arrayProcessCallback();
                  }, stateProcess );
                }
                else{
                  arrayProcessCallback();
                }
              }, function() {
                chainCallback();
              });
            },

            function( chainCallback ){
              stateProcess("applyChanges");
              self.uploadUpdates( function( error, _result ){

                if( error ){
                  return callback( error );
                }

                chainCallback();

              }, function(){} );

            },
            function() {
              callback(0, {
                anyChangesMakedLocally: anyChangesMakedLocally
              });
            }

          ]);


        } );

      }

    ]);

  };

  /**
   *
   * This function is called when user wants to merge local and server dials and groups data
   * Sync compare local and server data and if it find new it sync it to server or to local computer
   *
   * this function is private and uses for function of Sync object fvd_speed_dial_Sync.mergeLocalAndServerData
   *
   */

  function mergeLocalAndServerData( params, callback, stateCallback ){

    // try to get groups list for update, and groups to save on server
    var newGroups = [];
    var toServerGroups = [];
    var collisedGroups = [];
    var collisedGroupsTranslateGlobalIds = {}; // key is old global_id, value is new global_id

    var newDials = [];
    var toServerDials = [];
    var collisedDials = []; // dials collised by urls, client dials will be replaced with server dials with such urls and such groups
    var dialsToReplaceIds = []; // list of client dials to replace with server dials
    var dialsToOverrideIds = []; // list of server dials to override collisions

    var clientGroups = [];
    var serverGroups = [];
    var clientDials = [];
    var serverDials = [];

    var lastUpdateGroups = null;
    var lastUpdateDials = null;

    //dump( "\n----------------\n\n" );

    var syncedDialsCount = 0;
    var syncedGroupsCount = 0;

    // sign for any changes affected local database
    var anyDataLocallyStored = false;



    function changeState( newState, data ){
      if( stateCallback ){
        stateCallback( newState, data );
      }
    }

    if( params.groupGlobalId ){
      collisedGroupsTranslateGlobalIds[params.groupGlobalId] = params.groupGlobalId;
    }

    fvd_sync_Async.chain([

      function( chainCallback ){

        changeState( "syncGroups" );

        if( params.groupId ){

          // ignore step, merge only one group dials
          chainCallback();

        }
        else{

          fvd_speed_dial_Storage.asyncListGroupsForSync( "`global_id` IS NOT NULL", function( list ){

            clientGroups = list;
            chainCallback();

          } );

        }


        //dump( "Get list client groups\n" );

      },

      function( chainCallback ){

        //dump( "Get list server groups\n" );

        if (params.groupId) {

          // ignore step, merge only one group dials
          chainCallback();

        }
        else {

          getGroupsFromServer( null, function( error, serverResponse ){

            //dump( "Getted groups from server("+error+")" + "\n" );

            if( error != 0 ){
              callback( error );
            }
            else{
              //serverGroups = list;

              try{
                serverGroups = serverResponse.groups;
                lastUpdateGroups = serverResponse.lastUpdateTime;
              }
              catch( ex ){
                dump( "EX: " + ex + "\n" );
                callback( self.syncInst.Errors.ERROR_SERVER_RESPONSE_MALFORMED );
                return;
              }

              chainCallback();
            }

          } );

        }

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        // compare server groups with client groups

        function isGroupInList( groupName, list ){
          for( var i = 0; i != list.length; i++ ){
            if( list[i].name == groupName ){
              return list[i];
            }
          }

          return null;
        }

        // toServerGroups filling
        clientGroups.forEach( function( clientGroup ){

          var collisedGroup = isGroupInList( clientGroup.name, serverGroups );

          if( !collisedGroup ){
            toServerGroups.push( clientGroup );
          }
          else{
            collisedGroupsTranslateGlobalIds[ clientGroup.global_id ] = collisedGroup.global_id;

            collisedGroups.push( {
              clientGroup: clientGroup,
              serverGroup: collisedGroup
            } );
          }

        } );

        // newGroups filling
        serverGroups.forEach( function( serverGroup ){

          if( !isGroupInList( serverGroup.name, clientGroups ) ){
            newGroups.push( serverGroup );
          }

        } );

        chainCallback();

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        //dump( "Count server groups: " + serverGroups.length + "\n" );
        //dump( "Count client groups: " + clientGroups.length + "\n" );
        //dump( "Count groups to add: " + newGroups.length + "\n" );
        //dump( "Count groups to server: " + toServerGroups.length + "\n" );
        //dump( "Count collised groups: " + collisedGroups.length + "\n" );

        syncedGroupsCount = newGroups.length + toServerGroups.length;

        // get client dials list
        //dump( "getting client dials list\n" );

        var where = "`dials`.`global_id` IS NOT NULL";

        if( params.groupId ){
          where += " AND `dials`.`group_id` = " + params.groupId;
        }

        fvd_speed_dial_Storage.asyncListDialsForSync( where, function( list ){

          //dump( "List dials obtained\n" );

          clientDials = list;

          chainCallback();

        }, null, true );

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        changeState( "syncDials",{
          groupsCount: syncedGroupsCount
        } );

        //dump( "getting list dials from server\n" );

        var getDialsParams = {};

        if( params.groupGlobalId ){
          getDialsParams.groupId = params.groupGlobalId;
        }

        getDialsFromServer( getDialsParams, function( error, serverResponse ){
          if( error != 0 ){
            callback( error );
          }
          else{
            try{
              serverDials = serverResponse.dials;
              lastUpdateDials = serverResponse.lastUpdateTime;
            }
            catch( ex ){
              //dump( "EX " + ex + "\n" );
              callback( self.syncInst.Errors.ERROR_SERVER_RESPONSE_MALFORMED );
              return;
            }

            chainCallback();
          }
        } );

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        function clientDialInList( dial, list ){

          for( var i = 0; i != list.length; i++ ){

            if(  fvd_sync_Misc.isUrlsEqual(list[i].url, dial.url) ){

              var groupGlobalId = collisedGroupsTranslateGlobalIds[ dial.group_global_id ];
              if( groupGlobalId == list[i].group_global_id && dialsToOverrideIds.indexOf( list[i].global_id ) == -1 ){

                dialsToOverrideIds.push( list[i].global_id );

                return list[i];

              }
            }

          }

          return null;

        }

        clientDials.forEach( function( clientDial ){

          var collisedDial = clientDialInList( clientDial, serverDials );

          if( collisedDial ){
            if( dialsToReplaceIds.indexOf( clientDial.global_id ) == -1 ){

              dialsToReplaceIds.push( clientDial.global_id );
              collisedDials.push({
                clientDial: clientDial,
                serverDial: collisedDial
              });

            }
            else{
              collisedDial = null;
            }
          }

          if( !collisedDial ){
            toServerDials.push( clientDial );
          }

        } );

        serverDials.forEach( function( serverDial ){

          if( dialsToOverrideIds.indexOf( serverDial.global_id ) == -1 ){
            newDials.push( serverDial );
          }

        } );

        chainCallback();

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        syncedDialsCount = newDials.length + toServerDials.length;

        changeState( "applyChanges",{
          dialsCount: syncedDialsCount
        } );

        //dump( "Server dials: " + serverDials.length + "\n" );
        //dump( "Client dials: " + clientDials.length + "\n" );
        //dump( "New dials: " + newDials.length + "\n" );
        //dump( "To Server dials: " + toServerDials.length + "\n" );
        //dump( "Collised dials: " + collisedDials.length + "\n" );



        // update collised groups

        fvd_sync_Async.arrayProcess( collisedGroups, function( collision, arrayProcessCallback ){

          fvd_speed_dial_Storage.asyncUpdateGroupForSync( collision.clientGroup, collision.serverGroup, function(){
            arrayProcessCallback();
          } );

        }, function(){
          chainCallback();
        } );

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        // create new groups

        fvd_sync_Async.arrayProcess( newGroups, function( newGroup, arrayProcessCallback ){

          fvd_speed_dial_Storage.asyncSaveGroupForSync( newGroup, function(){
            arrayProcessCallback();
          } );

        }, function(){
          chainCallback();
        } );

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        // save groups to server
        if( toServerGroups.length > 0 ){
          putGroupsListOnserver( toServerGroups, function( error ){

            if( error ){
              return callback( error, {
                count: toServerGroups.length
              } );
            }
            else{
              chainCallback();
            }

          } );
        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        // update collised dials

        fvd_sync_Async.arrayProcess( collisedDials, function( collision, arrayProcessCallback ){

          fvd_speed_dial_Storage.asyncUpdateDialForSync( collision.clientDial, collision.serverDial, function(){
            arrayProcessCallback();
          } );

        }, function(){
          chainCallback();
        } );

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        // add new dials
        fvd_sync_Async.arrayProcess( newDials, function( newDial, arrayProcessCallback ){

          fvd_speed_dial_Storage.asyncSaveDialForSync( newDial, function(){
            arrayProcessCallback();
          } );

        }, function(){
          chainCallback();
        } );

      },

      function( chainCallback ){

        if( checkSyncAbort( callback ) ){
          return;
        }

        // before putting dials to server need to update collised groups ids
        for( var i = 0; i != toServerDials.length; i++ ){
          var d = toServerDials[i];
          var groupGlobalId = d.group_global_id;

          //dump( "Group " + groupGlobalId + "!\n" );

          if( collisedGroupsTranslateGlobalIds[groupGlobalId] ){
             d.group_global_id = collisedGroupsTranslateGlobalIds[groupGlobalId];
          }
        }


        // put dials on server

        if( toServerDials.length > 0 ){
          putDialsListOnserver( toServerDials, function( error ){
            if( error != 0 ){
              callback( error,{
                count: toServerDials.length
              } );
            }
            else{
              chainCallback();
            }
          } );
        }
        else{
          chainCallback();
        }



      },

      function(){

        if( checkSyncAbort( callback ) ){
          return;
        }

        anyDataLocallyStored = newGroups.length || collisedGroups.length || collisedDials.length || newDials.length;

        // save update times

        //dump( "Update lastupdate times\n" );

        if( lastUpdateDials ){
          self.setDialsLastUpdateTime( lastUpdateDials );
        }

        if( lastUpdateGroups ){
          self.setGroupsLastUpdateTime( lastUpdateGroups );
        }


        // all done
        if( anyDataLocallyStored ){
          self.Backup.setChangesMaked();
        }

        callback( 0 );
      }

    ]);





  }

  function putDialsListOnserver( dials, callback ){

    // prepare dial data and remove not needed fields

    dials.forEach(function( dial ){
      delete dial.rowid;
      delete dial.deny;
      delete dial.group_id;
      delete dial.clicks;
      delete dial.status;
      delete dial.restore_previous_thumb;
      delete dial.ignore_restore_previous_thumb;
      delete dial.thumb_update_date;
      delete dial.thumb_src;
      //delete dial.position;

      if( dial.thumb_source_type == "url" ){
        // reset manual crop
        dial.local_file_type = "custom";
      }
    });

    var resultError = null;
    var dialsGlobalIdsWhichFilesUploaded = [];

    fvd_sync_Async.chain( [

      function( chainCallback ){

        // uploading files
        fvd_sync_Async.arrayProcess( dials, function( dial, apCallback ){

          if( dial._previewContent ){

            var blob = fvd_sync_Misc.base64toblob( dial._previewContent, PREVIEW_CONTENT_TYPE );
            self.syncInst.preUploadFile( {
              blob: blob,
              name: PREVIEW_FILE_NAME
            }, function( error, result ){

              if( error ){
                return callback( error );
              }

              if( !result || !result.files || !result.files.file ){
                return callback( self.syncInst.Errors.ERROR_STORAGE_ENGINE_RETURNS_ERROR );
              }

              dial._tempfilename = result.files.file;
              delete dial._previewContent;

              dialsGlobalIdsWhichFilesUploaded.push( dial.global_id );

              apCallback();

            } );


          }
          else{
            apCallback();
          }

        }, function(){
          chainCallback();
        } );

      },

      function( chainCallback ){

        var sendData = {
          action: "put_dials",
          dials: dials
        };

        makeRequest(sendData, function( error, result ){
          if( error == 0 ){
            self.setDialsLastUpdateTime( result.lastUpdateTime );
          }

          resultError = error;
          chainCallback();
        });

      },

      function( chainCallback ){

        if( dialsGlobalIdsWhichFilesUploaded.length > 0 ){
          fvd_speed_dial_Storage.asyncMassUpdate( dialsGlobalIdsWhichFilesUploaded,{
            need_sync_screen: 0
          }, function(){
            chainCallback();
          } );
        }
        else{
          chainCallback();
        }

      },

      function(){
        callback( resultError );
      }

    ] );

  }

  function putGroupsListOnserver( groups, callback ){

    groups.forEach(function( group ){
      delete group.rowid;
    });

    var sendData = {
      action: "put_groups",
      groups: groups
    };


    makeRequest(sendData, function( error, result ){
      if( error == 0 ){
        self.setGroupsLastUpdateTime( result.lastUpdateTime );
      }

      callback( error );
    });

  }

  /*
   * Remove all data from server
   */

  function clearServerData( callback ){

    var sendData = {
      action: "remove_all"
    };

    //dump( "Start remove all\n" );

    makeRequest(sendData, function( error ){
      //dump( "End remove all("+error+")\n" );
      callback( error );
    });

  }

  function putAllDataOnServer( callback, stateCallback, params ){

    //dump( "Put all data on server\n" );

    params = params || {};

    function changeState( newState, data ){
      if( stateCallback ){
        stateCallback( newState, data );
      }
    }

    var uploadedDialsCount = 0;
    var uploadedGroupsCount = 0;

    var dials = [];
    var groups = [];

    fvd_sync_Async.chain([
      function( chainCallback ){
        changeState( "syncGroups" );

        //dump("GROUPS\n");

        fvd_speed_dial_Storage.asyncListGroupsForSync( "`global_id` IS NOT NULL", function( _groups ){

          groups = _groups;

          chainCallback();

        });
      },
      function( chainCallback ){
        // put dials

        //dump("DIALS\n");

        changeState( "syncDials", {
          groupsCount: uploadedGroupsCount
        } );

        //dump( "Try to get dials list\n" );

        fvd_speed_dial_Storage.asyncListDialsForSync( "`dials`.`global_id` IS NOT NULL", function( _dials ){

          dials = _dials;

          chainCallback();

        }, null, true );
      },

      function( chainCallback ){

        if( params.overwrite ){

          self.syncInst.getQuotaByType( "dials_count", "", function( error, max ){

            if( error ){
              return callback( error );
            }
            // if max is 0 it's means NO limit
            if( max && (groups.length + dials.length > max) ){
              //dump("Upload quota exceed: trying to upload "+(groups.length + dials.length)+" objects, while allowed "+max+"\n");
              return callback( self.syncInst.Errors.ERROR_COUNT_ITEMS_QUOTA_EXCEED, {
                count: groups.length + dials.length
              } );
            }

            clearServerData(function(){

              chainCallback();

            });


          } );

        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        putGroupsListOnserver( groups, function( error ){
          //dump( "PUTTED GROUPS " + groups.length + "("+error+")\n" );

          uploadedGroupsCount = groups.length;

          if( error != 0 ){
            callback( error, {
              count: groups.length
            } );
          }
          else{
            chainCallback();
          }
        } );

      },

      function( chainCallback ){

        //dump("List obtained...\n");

        putDialsListOnserver( dials, function( error ){

          //dump( "PUTTED " + dials.length + "("+error+")\n" );

          uploadedDialsCount = dials.length;

          if( error != 0 ){
            callback( error, {
              count: dials.length
            } );
          }
          else{
            chainCallback();
          }
        } );

      },


      function(){
        changeState( "applyChanges", {
          dialsCount: uploadedDialsCount
        } );

        callback( 0 );
      }
    ]);

  }

  function getGroupsFromServer( params, callback ){

    var lastUpdateTime = null;

    if( typeof params == "object" && params ){
      lastUpdateTime = params.lastUpdateTime;
    }
    else{
      lastUpdateTime = params;
      params = {};
    }

    var request = {
      action: "list_groups"
    };

    if( lastUpdateTime ){
      request.lastUpdateTime = lastUpdateTime;
    }

    for( var k in params ){
      request[k] = params[k];
    }

    //dump( "Start getting groups...\n" );

    makeRequest( request, callback );

    //dump( "End getting groups...\n" );

  }

  function getDialsFromServer( params, callback ){

    params = params || {};

    var request = {
      action: "list_dials"
    };

    for( var k in params ){
      request[k] = params[k];
    }


    makeRequest( request, callback );

  }



  function init(){
    try{
      if( self.getState() == "syncing" ){
        self.setState(  fvd_speed_dial_gFVDSSDSettings.getStringVal( "sd.sync.sync_prev_state" ) );
      }
    }
    catch( ex ){

    }


    if( self.isActive() ){
      startMainTimer();
    }

    // start prefs observer
    fvd_speed_dial_gFVDSSDSettings.addObserver(prefListener, fvd_speed_dial_gFVDSSDSettings.getKeyBranch() + "sd.sync.");

  }


  function makeRequest( requestData, callback ){

    self.syncInst.authorizedRequest( requestData, callback );

  }


  this.setState = function( newState ){

    self.syncInst.setState( newState );

  };

  this.getState = function(){

    return self.syncInst.getState();

  };

  this.isSetuped = function(){

    return self.syncInst.getState() != "none";

  };

  this.isActive = function(){

    return self.syncInst.isActive();

  };



  this.setDialsLastUpdateTime = function( time ){
    fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.sync.last_dials_update", time );
  };

  this.getDialsLastUpdateTime = function(){
    return fvd_speed_dial_gFVDSSDSettings.getStringVal( "sd.sync.last_dials_update" );
  };

  this.setGroupsLastUpdateTime = function( time ){
    fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.sync.last_groups_update", time );
  };

  this.getGroupsLastUpdateTime = function( time ){
    return fvd_speed_dial_gFVDSSDSettings.getStringVal( "sd.sync.last_groups_update" );
  };

  this.getSyncData = function(){
    return getToSyncData();
  };

  this.removeSyncData = function(category, data) {

    if( typeof category == "string" ){
      category = [category];
    }

    if( !data ){
      return;
    }

    var toSyncData = getToSyncData();

    category.forEach(function( cat ){
      if( !toSyncData[cat] ){
        toSyncData[cat] = [];
      }

      var index = toSyncData[cat].indexOf( data );

      if( index != -1 ){
        toSyncData[cat].splice( index, 1 );
      }
    });

    setToSyncData( toSyncData );

  };

  this.syncData = function( category, data, params ) {

    params = params || {};

    if( typeof category == "string" ){
      category = [category];
    }

    if( !data ){
      return;
    }

    if( !params.toSyncAnyWay ){

      if( category.indexOf( "dials" ) != -1 || category.indexOf( "deleteDials" ) != -1 ){

        if( !fvd_speed_dial_Storage.canSyncDial( data ) ){
          return;
        }

      }
      else if( category.indexOf( "groups" ) != -1 || category.indexOf( "deleteGroups" ) != -1 ){

        if( !fvd_speed_dial_Storage.canSyncGroup( data ) ){
          return;
        }

      }

    }

    var toSyncData = getToSyncData();

    category.forEach(function( cat ){
      if( !toSyncData[cat] ){
        toSyncData[cat] = [];
      }

      if( toSyncData[cat].indexOf( data ) == -1 ){
        toSyncData[cat].push(data);
      }
    });

    setToSyncData( toSyncData );

    observer.notifyObservers( null, "FVD.Sync.In-Browser-Count-Items-Changed", "SpeedDial"  );

    self.Backup.setChangesMaked();

  };

  this.syncDataCond = function( category, data, cond ){

    changeActiveCondCheckersCount( 1 );

    new SyncDataCondChecker( cond, function(){
      self.syncData( category, data );
      changeActiveCondCheckersCount(-1);
    }, function(){
      changeActiveCondCheckersCount( -1 );
    } );

  };

  this.openSyncTypeDialog = function( parent, syncTypes, message ){

    var arguments = {
      selectedType: null,
      allowTypes: syncTypes,
      message: message
    };



    parent.openDialog('chrome://fvd.speeddial/content/dialogs/fvd_sd_sync_type.xul', '', 'chrome,titlebar,toolbar,centerscreen,modal', arguments);

    return arguments.selectedType;

  };


  // get conflicts between client updated data and server updated data
  // function exists only for backward compatibility

  this.getUpdatesConflicts = function(updateInfo, callback) {

    function getGroupByGlobalId( globalId, callback, ignoreNoSync ){

      fvd_speed_dial_Storage.asyncListGroupsForSync( "`global_id` = '"+globalId+"'", function( groups ){

        if( groups.length > 0 ){
          callback( groups[0] );
        }
        else{

          var serverGroup = null;

          for( var i = 0; i != serverGroups.groups.length; i++ ){
            if( serverGroups.groups[i].global_id == globalId ){
              serverGroup = serverGroups.groups[i];
              break;
            }
          }

          callback( serverGroup );
        }

      }, true);

    }


    function getDialByGlobalId( globalId, callback, ignoreNoSync ){

      fvd_speed_dial_Storage.asyncListDialsForSync( "`dials`.`global_id` = '"+globalId+"'", function( dials ){

        if( dials.length > 0 ){

          getGroupByGlobalId( dials[0].group_global_id, function( group ){
            dials[0].group = group;
            callback( dials[0] );
          }, true );

        }
        else{
          callback( null );
        }

      }, ignoreNoSync );

    }


    /*
     * conflicts is array with each conflict info, conflict info template:
     * {
     *  type: <type>, // dial, group
     *  dataClient: <data>, // object of group or dial data or 'removed' string if object is removed on client
     *  dataServer: <data>, // object of group or dial data or 'removed' string if object is removed on server
     *  conflictFields: <array of string> // array of conflict attributes dials: [title,url,group_global_id] groups: [name] if removed - is empty
     * }
     */

    var conflicts = [];

    var toSyncData = getToSyncData();
    var serverGroups = [];
    var serverDials = [];

    var groupsRemovedBy = {};
    var dialsRemovedBy = {};

    var groupsWhereChangedDials = []; // list of groups which dials have been changed

    //console.log( "TO SYNC:", toSyncData );

    fvd_sync_Async.chain([

      function( chainCallback ){

        if( toSyncData.dials.length > 0 ){

          fvd_speed_dial_Storage.asyncListDialsForSync( "`dials`.`global_id` IN ('" + toSyncData.dials.join( "','" ) + "')", function( dials ){

            dials.forEach(function( dial ){

              groupsWhereChangedDials.push( dial.group_global_id );

            });

            chainCallback();

          } );

        }
        else{
          chainCallback();
        }

      },

      function( chainCallback ){

        // check group removed on client and updated on server, or updated on server and client

        getGroupsFromServer( {
          lastUpdateTime: updateInfo.localLastUpdateTimeGroups,
          fillRemovedBy: toSyncData.groups
        }, function( error, groups ){

          serverGroups = groups;
          groupsRemovedBy = groups.removedBy;

          fvd_sync_Async.arrayProcess( groups.groups, function( serverGroup, arrayProcessCallback ){

            // check group updated on client and server
            if( toSyncData.groups.indexOf( serverGroup.global_id ) != -1 ){

                        getGroupByGlobalId(serverGroup.global_id, function( clientGroup ){

                if( clientGroup ){

                  var conflictFields = fvd_sync_Misc.objectsDiffFields( clientGroup, serverGroup, ["name"] );

                  if( conflictFields.length > 0 ){

                    var conflict = {
                      id: clientGroup.global_id,
                      type: "group",
                      dataClient: clientGroup,
                      dataServer: serverGroup,
                      conflictFields: conflictFields
                    };

                    if( serverGroup.last_change_by == "admin" ){
                      conflict.solve = "server";
                    }

                    conflicts.push( conflict );

                  }

                }

                arrayProcessCallback();

                        });

            }
            // check group removed on client and updated on server
            else if( toSyncData.deleteGroups.indexOf( serverGroup.global_id ) != -1 ){

              getGroupByGlobalId( serverGroup.global_id, function( clientGroup ){

                //dump( "CLIENT GROUP("+serverGroup.global_id+"): " + JSON.stringify( clientGroup ) + "\n" );

                if( clientGroup ){

                  // set as nosync
                  var conflict = {
                    id: serverGroup.global_id,
                    type: "group",
                    dataClient: "removed",
                    dataServer: serverGroup,
                    conflictFields: []
                  };

                }
                else{

                  var conflict = {
                    id: serverGroup.global_id,
                    type: "group",
                    dataClient: "removed",
                    dataServer: serverGroup,
                    conflictFields: []
                  };

                }

                if( serverGroup.last_change_by == "admin" ){
                  conflict.solve = "server";
                }

                conflicts.push( conflict );

                arrayProcessCallback();

              } );

            }
            // no conflicts
            else{
              arrayProcessCallback();
            }

          }, function(){

            chainCallback();

          } );

        } );

      },

      function( chainCallback ){

        // check group removed from server and updated on client

        fvd_sync_Async.arrayProcess( toSyncData.groups, function( groupId, arrayProcessCallback ){

          if( serverGroups.groupIds && serverGroups.groupIds.indexOf( groupId ) == -1 && toSyncData.newGroups.indexOf( groupId ) == -1 ){
            // removed from server
            getGroupByGlobalId( groupId, function( clientGroup ){

              if( clientGroup ){

                var conflict = {
                  id: clientGroup.global_id,
                  type: "group",
                  dataClient: clientGroup,
                  dataServer: "removed",
                  conflictFields: []
                };

                if( groupsRemovedBy[ clientGroup.global_id ] == "admin" ){
                  conflict.solve = "server";
                }

                conflicts.push( conflict );

              }

              arrayProcessCallback();

            } );
          }
          else{
            arrayProcessCallback();
          }

        }, function(){

          chainCallback();

        } );


      },

      function( chainCallback ){

        // check group removed from server and dials in their groups changed on client

        fvd_sync_Async.arrayProcess( groupsWhereChangedDials, function( groupId, arrayProcessCallback ){

          if( serverGroups.groupIds && serverGroups.groupIds.indexOf( groupId ) == -1 && toSyncData.newGroups.indexOf( groupId ) == -1 ){
            // removed from server
            getGroupByGlobalId( groupId, function( clientGroup ){

              if( clientGroup ){

                var conflict = {
                  id: clientGroup.global_id,
                  type: "group",
                  dataClient: clientGroup,
                  dataServer: "removed",
                  conflictFields: [],
                  solve: "local" // pre solved conflict
                };

                if( groupsRemovedBy[ clientGroup.global_id ] == "admin" ){
                  conflict.solve = "server";
                }

                conflicts.push( conflict );

              }

              arrayProcessCallback();

            } );
          }
          else{
            arrayProcessCallback();
          }

        }, function(){

          chainCallback();

        } );

      },

      function( chainCallback ){

        getDialsFromServer( {
          lastUpdateTime: updateInfo.localLastUpdateTimeDials,
          fillRemovedBy: toSyncData.dials
        }, function( error, dials ){

          // check dial updated on server and client or dial removed on client and updated on server

          serverDials = dials;

          dialsRemovedBy = dials.removedBy;

          fvd_sync_Async.arrayProcess( serverDials.dials, function( serverDial, arrayProcessCallback ){

            if( toSyncData.dials.indexOf( serverDial.global_id ) != -1 ){

              getDialByGlobalId( serverDial.global_id, function( clientDial ){

                getGroupByGlobalId( serverDial.group_global_id, function( group ){

                  serverDial.group = group;

                  if( clientDial ){

                    if( clientDial.hand_changed == 0 ){
                      clientDial.title = "";
                    }
                    if( serverDial.hand_changed == 0 ){
                      serverDial.title = "";
                    }

                    var conflictFields = fvd_sync_Misc.objectsDiffFields( clientDial, serverDial, [ "url", "title", "group_global_id", "update_interval" ] );

                    // special check conflict of local_file_type
                    if( serverDial.thumb_source_type == "url" && clientDial.thumb_source_type == "url" &&
                      serverDial.local_file_type == "manual_crop" ){

                      conflictFields.push( "local_file_type" );

                    }

                    if( conflictFields.length > 0 ){

                      var conflict = {
                        id: clientDial.global_id,
                        type: "dial",
                        dataClient: clientDial,
                        dataServer: serverDial,
                        conflictFields: conflictFields
                      };

                      if( serverDial.last_change_by == "admin" ){
                        // admin is always right
                        conflict.solve = "server";
                      }

                      if( conflictFields.length == 1 && conflictFields[0] == "local_file_type" ){

                        conflict.solve = "server";

                      }

                      conflicts.push( conflict );

                    }

                  }

                  arrayProcessCallback();

                } );

              } );

            }
            // check removed on client
            else if( toSyncData.deleteDials.indexOf( serverDial.global_id ) != -1 ){

              getGroupByGlobalId( serverDial.group_global_id, function( group ){

                serverDial.group = group;

                getDialByGlobalId( serverDial.global_id, function( clientDial ){

                  if( clientDial ){

                    if( clientDial.group_global_id != serverDial.group_global_id ){

                      // moved to nosync group
                      var conflict = {
                        id: serverDial.global_id,
                        type: "dial",
                        dataClient: clientDial,
                        dataServer: serverDial,
                        conflictFields: [ "group_global_id" ],
                        inNoSyncGroupOnLocal: true // special sign
                      };

                      if( serverDial.last_change_by == "admin" ){
                        // admin is always right
                        conflict.solve = "server";
                      }

                      conflicts.push( conflict );

                    }

                  }
                  else{

                    var conflict = {
                      id: serverDial.global_id,
                      type: "dial",
                      dataClient: "removed",
                      dataServer: serverDial,
                      conflictFields: []
                    };

                    if( serverDial.last_change_by == "admin" ){
                      // admin is always right
                      conflict.solve = "server";
                    }

                    conflicts.push( conflict );

                  }

                  arrayProcessCallback();

                }, true);

              });



            }

            else{

              fvd_speed_dial_Storage.canSyncDial( serverDial.global_id, function( can ){

                if( can ){
                  arrayProcessCallback();
                }
                else{

                  getDialByGlobalId( serverDial.global_id, function( clientDial ){

                    if( clientDial ){

                      if( clientDial.group_global_id != serverDial.group_global_id ){

                        getGroupByGlobalId( serverDial.group_global_id, function( serverGroup ){

                          serverDial.group = serverGroup;

                          var conflict = {
                            id: clientDial.global_id,
                            type: "dial",
                            dataClient: clientDial,
                            dataServer: serverDial,
                            conflictFields: ["group_global_id"],
                            inNoSyncGroupOnLocal: true
                          };

                          if( serverDial.last_change_by == "admin" ){
                            // admin is always right
                            conflict.solve = "server";
                          }

                          conflicts.push( conflict );

                          arrayProcessCallback();

                        } );

                      }
                      else{

                        arrayProcessCallback();

                      }


                    }
                    else{
                      arrayProcessCallback();
                    }


                  }, true );

                }

              } );


            }

          }, function(){

            chainCallback();

          } );

        } );

      },

      function( chainCallback ){

        // check dial removed from server and updated on client

        fvd_sync_Async.arrayProcess( toSyncData.dials, function( dialId, arrayProcessCallback ){

          if( serverDials.dialIds && serverDials.dialIds.indexOf( dialId ) == -1  && toSyncData.newDials.indexOf( dialId ) == -1 ){
            // removed from server

            getDialByGlobalId( dialId, function( clientDial ){

              if( clientDial ){

                var conflict = {
                  id: clientDial.global_id,
                  type: "dial",
                  dataClient: clientDial,
                  dataServer: "removed",
                  conflictFields: []
                };

                if( dialsRemovedBy[ clientDial.global_id ] == "admin" ){
                  conflict.solve = "server";
                }

                conflicts.push( conflict );

              }

              arrayProcessCallback();

            } );
          }
          else{
            arrayProcessCallback();
          }

        }, function(){

          chainCallback();

        } );


      },

      function(){
        if(conflicts && conflicts.length) {
          conflicts.forEach(function(c) {
            c.solve = "server";
          });
        }
        callback( conflicts );

      }

    ]);



  };

  this.openSyncProgressDialog = function( parent, syncType, closeOnFinish ){
    var arguments = {
      selectedType: null,
      syncType: syncType,
      closeOnFinish: closeOnFinish
    };

    if( syncType == "uploadUpdatesAndCheckForUpdates" ){
      var authAction = self.needInitialSyncAfter();

      if(authAction != "none") {
        var actions = null;
        var message = "";

        this.openSettings("syncTabs_speeddial");

        return;
      }
    }

    parent.openDialog('chrome://fvd.sync/content/dialogs/fvd_sd_sync_progress.xul', '', 'chrome,titlebar,toolbar,centerscreen,modal', arguments);
  };

  /* Sync functions */

  this.skipLastUpdate = function(){

    var currentLastUpdateTimeDials = self.getDialsLastUpdateTime();
    var currentLastUpdateTimeGroups = self.getGroupsLastUpdateTime();

    var updateInfo = self.getLastUpdateInfo();

    currentLastUpdateTimeDials = Math.max( currentLastUpdateTimeDials, updateInfo.lastUpdateTimeDials );
    currentLastUpdateTimeGroups = Math.max( currentLastUpdateTimeGroups, updateInfo.lastUpdateTimeGroups );

    self.setDialsLastUpdateTime( currentLastUpdateTimeDials );
    self.setGroupsLastUpdateTime( currentLastUpdateTimeGroups );

    self.setState( "normal" );

  };


  this.getLastUpdateInfo = function(){
    try{
      return JSON.parse( fvd_speed_dial_gFVDSSDSettings.getStringVal( "sd.sync.last_update_info" ) );
    }
    catch( ex ){
      return null;
    }
  };

  this.setLastUpdateInfo = function( info ){
    fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.sync.last_update_info", JSON.stringify( info ) );
  };


  this.abortCurrentSync = function(){
    syncAborted = true;
  };

  this.isCancellableSync = function( syncType ){

    var cancellable = [
      "mergeLocalAndServerData",
      "overwriteLocalData",
      "applyServerUpdates"
    ];

    return cancellable.indexOf( syncType ) != -1;

  };

  this.applyServerUpdates = function( callback, stateCallback, lastUpdateTimeGroups, lastUpdateTimeDials ){

    syncAborted = false;

    self.setState( "syncing" );

    // start transaction
    fvd_speed_dial_Storage.beginTransaction();

    applyServerUpdates( function( error ){

      if( error == 0 ){
        fvd_speed_dial_Storage.commitTransaction();

        fvd_speed_dial_Storage.flushCache();
        observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null);
      }
      else{
        fvd_speed_dial_Storage.rollbackTransaction();
      }

      self.setState( "normal" );

      callback( error );


    }, stateCallback, lastUpdateTimeGroups, lastUpdateTimeDials );

  };

  this.mergeLocalAndServerData = function( callback, stateCallback ){

    fvd_sync_Async.chain( [
      function( chainCallback ){
        self.acquireSyncLock(function( error ){

          if( error == 0 ){
            chainCallback();
          }
          else{
            callback( error );
          }

        });
      },
      function(){

        clearToSyncData();

        syncAborted = false;

        self.setState( "syncing" );

        // start transaction
        fvd_speed_dial_Storage.beginTransaction();

        mergeLocalAndServerData( {}, function( error, _result ){

          if( error == 0 ){
            fvd_speed_dial_Storage.commitTransaction();

            fvd_speed_dial_Storage.flushCache();
            observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null);

            initialSyncMaked();
          }
          else{
            fvd_speed_dial_Storage.rollbackTransaction();
          }

          self.setState( "normal" );

          self.releaseSyncLock(function(){
            callback( error, _result );
          });

        }, stateCallback );

      }
    ]);


  };

  this.startMainSync = function(callback, stateCallback) {
    self.acquireSyncLock( function( error ){
      if( error != 0 ) {
        return callback( error );
      }
      else{
        self.setState("syncing");
        startMainSync(function(error, result) {
          self.releaseSyncLock(function() {
            self.setState("normal");
            if(result.anyChangesMakedLocally) {
              observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null);
            }
            callback(error);
          });

        }, stateCallback);
      }
    } );
  };

  this.startAutoSync = function( params, callback ){
    dump("this.startMainSync\n");
    if( this.getState() != "normal" ){
      //dump("Autosync aborted, sync state is: " + this.getState() + "\n");

      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }

    if( self.needInitialSyncAfter() != "" && self.needInitialSyncAfter() != "none" ){
      //dump( "Need initial sync after: " + self.needInitialSyncAfter() + "\n" );

      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }

    self.acquireSyncLock( function( error ){

      if( error != 0 ){
        dump("Fail acquire lock\n");

        return callback( error );
      }
      else{

        self.setState( "syncing" );

        startMainSync( function( error, result ){

          //dump("End sync\n");

          self.releaseSyncLock( function(  ){

            self.setState( "normal" );

            if( result.anyChangesMakedLocally ){
              observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null);
            }

            callback( error );

          });

        }, function( action, conflicts, progressCallback ){

          if( action == "resolveConflicts" ){

            // resolve conflicts to server

            conflicts.forEach(function( conflict ){
              conflict.solve = "server";
            });

            progressCallback( conflicts );

          }

        } );

      }

    } );

  };



  // merge only one group dials
  this.mergeLocalAndServerDataGroup = function( params, callback, stateCallback ){

    syncAborted = false;

    self.setState( "syncing" );

    // start transaction
    fvd_speed_dial_Storage.beginTransaction();

    mergeLocalAndServerData( params, function( error ){

      if( error == 0 ){
        fvd_speed_dial_Storage.commitTransaction();

        fvd_speed_dial_Storage.flushCache();
        observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null);
      }
      else{
        fvd_speed_dial_Storage.rollbackTransaction();
      }

      self.setState( "normal" );

      callback( error );


    }, stateCallback );


  };

  this.overwriteServerData = function( endCallback, stateCallback ){

    fvd_sync_Async.chain( [
      function( chainCallback ){
        self.acquireSyncLock(function( error ){
          //dump("ACQUIRE "  + error  + "\n");
          if( error == 0 ){
            chainCallback();
          }
          else{
            endCallback( error );
          }

        });
      },
      function(){

        clearToSyncData();

        self.setState( "syncing" );

        function callback( error, _result ){
          self.setState( "normal" );
          endCallback( error, _result );
        }

        var _result = null;
        var _e = null;

        fvd_sync_Async.chain( [

          function( chainCallback ){

            //dump( "Put data to server...\n" );

            putAllDataOnServer( function( error, _r ){
              _e = error;
              _result = _r;

              chainCallback();

            }, stateCallback, {
              overwrite: true
            } );
          },

          function(){

            //dump( "Release lock...\n" );

            self.releaseSyncLock(function(){

              //dump( "OK!\n" );

              if( !_e ){
                initialSyncMaked();
              }

              callback( _e, _result );
            });
          }
        ] );

      }
    ]);

  };

  this.overwriteLocalData = function( callback, stateCallback ){

    fvd_sync_Async.chain( [
      function( chainCallback ){
        self.acquireSyncLock(function( error ){

          if( error == 0 ){
            chainCallback();
          }
          else{
            callback( error );
          }

        });
      },
      function(){

        clearToSyncData();

        self.setState( "syncing" );

        fvd_speed_dial_Storage.beginTransaction();

        fvd_speed_dial_Storage.truncateTable( "dials", "(SELECT `dials_groups`.`sync` FROM `dials_groups` WHERE `dials_groups`.`rowid` = `dials`.`group_id`) = 1" );
        fvd_speed_dial_Storage.truncateTable( "dials_groups", "`sync` = 1" );


        mergeLocalAndServerData( {}, function( error ){

          if( error == 0 ){
            fvd_speed_dial_Storage.commitTransaction();

            fvd_speed_dial_Storage.flushCache();
            observer.notifyObservers(null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null);

            initialSyncMaked();

            self.Backup.setChangesMaked();
          }
          else{
            fvd_speed_dial_Storage.rollbackTransaction();
          }

          self.setState( "normal" );

          self.releaseSyncLock(function(){
            callback( error );
          });

        }, stateCallback );

      }
    ]);



  };

  this.uploadUpdates = function( callback, stateCallback ){


    self.setState( "syncing" );

    uploadUpdates( function( error ){

      self.setState( "normal" );

      callback( error );


    }, stateCallback );


  };

  this.hasUpdates = function( callback ) {
    hasUpdates( callback );
  };

  this.activeCondCheckersCount = function( callback ){

    return activeCondCheckersCount;

  };

  this.hasChanges = function(){
    return this.hasToSyncData();
  };

  this.hasToSyncData = function(){

    var toSyncData = getToSyncData();

    var has = false;

    Object.keys(toSyncData).forEach(function( key ){

      if( toSyncData[key].length > 0 ){
        has = true;
      }

    });

    return has;

  };


  this.setInitCallback = function( callback ){
    _initCallbacks.push( callback );

    if( self.syncInst ){
      callback();
    }
  };

  this.init = function(){
    _initCallbacks.callIfNeed();
    init();
  };

  this.acquireSyncLock = function( callback ){
    self.syncInst.acquireSyncLock( callback );
  };

  this.releaseSyncLock = function( callback ){
    self.syncInst.releaseSyncLock( callback );
  };

  this.openSettings = function( pane, subpane, evaluate, parent ){

    fvd_sync_Settings.displayWindow( pane, subpane, evaluate, parent );

  };

  this.totalItemsCount = function( callback ){

    var count = fvd_speed_dial_Storage.groupsCount() + fvd_speed_dial_Storage.count( null, {} );

    //dump( "Count dials " + fvd_speed_dial_Storage.count( null, {} ) + ", groups: " + fvd_speed_dial_Storage.groupsCount() + "\n" );

    if( callback ){
      callback( count );
    }

    return count;

  };

  this.Backup = new function(){

    var selfBackup = this;

    const PR_RDONLY = 0x01;
    const PR_WRONLY = 0x02;
    const PR_RDWR = 0x04;
    const PR_CREATE_FILE = 0x08;
    const PR_APPEND = 0x10;
    const PR_TRUNCATE = 0x20;
    const PR_SYNC = 0x40;
    const PR_EXCL = 0x80;

    var _ignoreAutoCheck = false;

    var restoreProgress = {
      current: 0,
      max: 0
    };

    var checkBackupTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

    var event = {
      notify: function(timer) {

        if( !_ignoreAutoCheck && enabled() && self.syncInst.getState() != "syncing" ){
          checkNeedBackup();
        }

        _startTimer();

      }
    };

    function _startTimer(){
      checkBackupTimer.initWithCallback(event, 10000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    }

    _startTimer();

    function enabled(){
      return fvd_sync_Settings.getBoolVal("enable_autobackup");
    }

    function checkNeedBackup(){

      var lastCheckTime = 0;
      var now = new Date().getTime();

      try{
        lastCheckTime = parseInt( fvd_sync_Settings.getStringVal( "sd.last_check_backup.time" ) );
      }
      catch( ex ){

      }


      if( now - lastCheckTime >= fvd_sync_Config.CHECK_BACKUP_INTERVAL ){

        var changesMaked = true;
        try{
          changesMaked = fvd_sync_Settings.getBoolVal( "sd.last_check_backup.changes" );
        }
        catch( ex ){

        }

        if( !lastCheckTime && changesMaked || lastCheckTime ){
          fvd_sync_Settings.setStringVal( "sd.last_check_backup.time", now );
        }

        //dump( "Changes maked? SD" + changesMaked + "\n" );

        if( changesMaked ){
          try{
            fvd_sync_Settings.setBoolVal( "sd.last_check_backup.changes", false );

            selfBackup.make(function(){

            });
          }
          catch( ex ){
            dump( "ERROR: " + ex + "\n" );
          }
        }

      }

    }

    this.getRestoreProgress = function(){
      return restoreProgress;
    };

    this.setChangesMaked = function(){
      fvd_sync_Settings.setBoolVal( "sd.last_check_backup.changes", true );
    };

    this.setChangesNotMaked = function(){
      fvd_sync_Settings.setBoolVal( "sd.last_check_backup.changes", false );
    };

    this.getBackupsFolder = function(){
      var file = fvd_sync_File.filesFolder();
      file.append( fvd_sync_Config.BACKUP_FOLDER );
      if( !file.exists() ){
        file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
      }
      file.append( "speeddial" );
      if( !file.exists() ){
        file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
      }

      return file;
    };

    this.backupsListing = function( callback ){

      var backupFolder = this.getBackupsFolder();

      var entries = backupFolder.directoryEntries;
      var backupFolders = [];
      while(entries.hasMoreElements()){
        var entry = entries.getNext();
        entry.QueryInterface(Components.interfaces.nsIFile);
        backupFolders.push(entry);
      }

      var result = [];

      fvd_sync_Async.arrayProcess( backupFolders, function( infoFile, apc ){

        var folderName = infoFile.leafName;

        infoFile.append( "info.json" );

        if( !infoFile.exists() ){
          return apc();
        }

        fvd_sync_File._read( infoFile, function( r, data ){

          if( !r ){
            dump( "Fail read file: " + infoFile.nativePath + "\n" );
            return apc();
          }

          try{
            var info = JSON.parse(data);
            info.folder = folderName;
            result.push( info );
          }
          catch( ex ){
            dump("Fail read "+ex+"\n");
          }
          finally{
            apc();
          }

        } );

      }, function(){

        callback( result );

      } );

    };

    this._make = function( callback ){
      var zipFile = fvd_sync_Misc.tmpFile();
      var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
      var zipW = new zipWriter();
      zipW.open(zipFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);

      var data = fvd_speed_dial_Storage.dumpAll();
      var json = JSON.stringify( data );
      var dbFile = fvd_sync_Misc.tmpFile();
      fvd_sync_File.writeSync( dbFile, json );

      zipW.addEntryFile("db.json", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, dbFile, false);

      var thumbsDir = fvd_speed_dial_Storage.dialsPreviewDir();

      var enumerator = thumbsDir.directoryEntries;

      while( enumerator.hasMoreElements() ){
        var thumbFile = enumerator.getNext();
        thumbFile.QueryInterface( Components.interfaces.nsIFile );
        zipW.addEntryFile("sd"+"/"+thumbFile.leafName, Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, thumbFile, false);
      }

      zipW.close();

      var date = new Date();
      var dateFile = date.getFullYear() + "" + date.getMonth() + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds();
      var file = this.getBackupsFolder();

      file.append( dateFile );
      if( !file.exists() ){
        file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
      }

      var fileInfo = file.clone();

      zipFile.copyTo(file, "data.zip");

      try{
        // remove files
        zipFile.remove( false );
        dbFile.remove( false );
      }
      catch( ex ){

      }

      fileInfo.append( "info.json" );

      var info = {
        time: date.getTime(),
        countDials: data["dials"].length,
        countGroups: data["dials_groups"].length
      };

      fvd_sync_File._write( fileInfo, JSON.stringify( info ), function( r ){
        if( !r ){
          return callback(r);
        }

        selfBackup.removeOldBackups(function(){
          observer.notifyObservers( null, "FVD.Sync.SD-Backup-Created", null  );

          callback( true );
        });

      } );
    };

    this.make = function( callback ){

      try{
        this._make( callback );
      }
      catch( ex ){

      }

    };

    this._restore = function( folder, callback ){

      restoreProgress.current = 0;

      var file = this.getBackupsFolder();
      file.append( folder );
      file.append( "data.zip" );

      var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"].createInstance(Components.interfaces.nsIZipReader);
      zipReader.open(file);

      var data = fvd_sync_Misc.readZipEntryContent( zipReader, "db.json" );

      var dbData = JSON.parse( data );

      // restore db
      restoreProgress.max = 0;

      for( var table in dbData ){
        restoreProgress.max += dbData[table].length;
      }

      var tables = [];
      for (var table in dbData) {
        tables.push( table );
      }

      fvd_sync_Async.chain([

        function( chainCallback ){

          if( fvd_speed_dial_Storage.isImportFromJSONAsync ){
            // new version of speed dial

            fvd_sync_Async.arrayProcess( tables, function( table, apCallback ){

              fvd_speed_dial_Storage.truncateTable( table );
              fvd_speed_dial_Storage.importFromJSON( table, dbData[table], function( current, max ){
                restoreProgress.current++;
              }, function(){
                apCallback();
              } );

            }, function(){
              chainCallback();
            } );
          }
          else{

            // old version of speed dial

            for( var table in dbData ){
              //dump("Restore " + table + "\n");

              fvd_speed_dial_Storage.truncateTable( table );
              fvd_speed_dial_Storage.importFromJSON( table, dbData[table], function( current, max ){
                restoreProgress.current++;
              } );
            }

            chainCallback();

          }

        },

        function(){

          // copy thumbs
          var entries = zipReader.findEntries( "sd/*" );
          while( entries.hasMore() ){
            try{
              var entry = entries.getNext();
              var tmp = entry.split("/");
              var thumbName = tmp[1];

              var thumbFile = fvd_speed_dial_Storage.dialsPreviewDir();
              thumbFile.append( thumbName );

              if( thumbFile.exists() ){
                thumbFile.remove(false);
              }

              zipReader.extract( entry, thumbFile );
            }
            catch( ex ){

            }
          }

          // rebuild speed dial
          observer.notifyObservers( null, "FVD.Toolbar-SD-Dial-Shedule-Rebuild", null );

          // user cant make simple sync, he must make upload/download dials
          self.syncAuthActionCompleted( "login" );

          callback( true );

        }

      ]);


    };

    this.restore = function( folder, callback ){

      _ignoreAutoCheck = true;

      self.setState( "syncing" );

      try{

        this._restore( folder, function( r ){

          selfBackup.setChangesNotMaked();
          _ignoreAutoCheck = false;

          self.setState( "normal" );

          callback( r );
        } );

      }
      catch( ex ){
        dump( "ERROR while restore sd: " + ex + "\n" );
        self.setState( "normal" );
        callback( false );
      }

    };

    this.removeOldBackups = function( callback ){

      this.backupsListing( function( backups ){

        backups.sort( function( a, b ){

          return a.time - b.time;

        } );

        while( backups.length > fvd_sync_Config.MAX_BACKUP_ARCHIVES ){
          var backup = backups.shift();

          var folder = selfBackup.getBackupsFolder();
          folder.append( backup.folder );

          folder.remove( true );
        }

        if( callback ){
          callback();
        }

      } );

    };




  };

};

var SpeedDial = new SpeedDial_Class();
