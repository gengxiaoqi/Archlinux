var EXPORTED_SYMBOLS = ["Bookmarks"];

var {fvd_sync_Misc} = Components.utils.import("resource://fvd.sync.modules/misc.js", {});
var {fvd_sync_Async} = Components.utils.import("resource://fvd.sync.modules/async.js", {});
Components.utils.import("resource://fvd.sync.modules/storage.js");
var {fvd_sync_Settings} = Components.utils.import("resource://fvd.sync.modules/settings.js", {});
Components.utils.import("resource://fvd.sync.modules/properties.js");
var {fvd_sync_File} = Components.utils.import("resource://fvd.sync.modules/file.js", {});
var {fvd_sync_Config} = Components.utils.import("resource://fvd.sync.modules/config.js", {});

var {bmkService} = Components.utils.import("resource://fvd.sync.modules/partial/bmkservice.js", {});
Components.utils.import("resource://fvd.sync.modules/partial/livemarks.js");
Components.utils.import("resource://fvd.sync.modules/log.js");

Components.utils.import("resource://gre/modules/AddonManager.jsm");

var Cc = Components.classes;
var Ci = Components.interfaces;

var observerService = Components.classes["@mozilla.org/observer-service;1"]
                   .getService(Components.interfaces.nsIObserverService);

function _dbg(message) {
  //dump("Bookmarks.js: " + message + "\n");
}

/*
 *
 * One bookmark item contents:
 *
 * id
 * date
 * global_id
 * title
 * url
 * index
 * type [folder or bookmark]
 * description
 * parent_id
 *
 */

/*
 *
 * Special global ids:
 * menu - bookmark menu
 * toolbar - bookmark toolabr
 * unsorted - unsorted bookmarks
 *
 */




var Bookmarks_Class = function(){

  var self = this;

  this.syncInst = null;

  var _emptyChanges = {
    removedIds: [],
    newIds: [],
    changedIds: []
  };

  var addonListener = new function(){

    this.onUninstalling = function( addon ){

      if( addon.id == fvd_sync_Misc.SELF_ID ){
        //dump( "Reindex globalids after restart\n" );
        fvd_sync_Settings.reset( "bookmarks.need_create_guids");
      }

    };

    this.onDisabling = function( addon ){

      if( addon.id == fvd_sync_Misc.SELF_ID ){
        //dump( "Reindex globalids after restart\n" );
        fvd_sync_Settings.reset( "bookmarks.need_create_guids");
      }

    };


  };

  var processCreateGuids = false;
  var currentProcessAborted = false;

  function _startSync(){
    self.syncInst.setState( "syncing" );
  }

  function _endSync(){
    self.syncInst.setState( "normal" );
  }


  /* abort current process */

  function checkCurrentProcessAborted( callback ){

    if( currentProcessAborted ){
      callback( self.syncInst.Errors.ERROR_SYNC_USER_ABORTED );
      return true;
    }

    return false;

  }

  /* requests */

  /* lock quieries */

  function acquireLock( callback ){

    self.syncInst.acquireSyncLock( callback );

  }

  function releaseLock( callback ){

    self.syncInst.releaseSyncLock( callback );

  }

  function getBookmarksList( params, callback ){

    var message = params;
    message.action = "list_bookmarks";

    self.syncInst.authorizedRequest( message, callback );

  }

  function putBookmarksList( bookmarks, callback, additional ){

    var message = {
      action: "put_bookmarks",
      bookmarks: bookmarks
    };

    additional = additional || {};

    for( var k in additional ){
      message[k] = additional[k];
    }

    self.syncInst.authorizedRequest( message, callback );

  }

  function removeAllServerData( callback ){

    var message = {
      action: "remove_all_bookmarks"
    };

    self.syncInst.authorizedRequest( message, callback );

  }

  function removeBookmarksFromServer( ids, callback ){

    var message = {
      action: "remove_bookmarks",
      bookmarkIds: ids
    };

    self.syncInst.authorizedRequest( message, callback );

  }

  /**
   * download and store updates from server
   * @return {Array} savedGuids - array of global_ids of saved bookmarks
   */
  function applyServerUpdates( params, callback ){

    getBookmarksList( params,
      function( error, data ){

        if( error !== 0 ){
          callback( error );
        }
        else{
          var savedGuids = [];
          data.bookmarkIds = data.bookmarkIds || [];
          data.bookmarks = data.bookmarks || [];
          var changeData = self.getChanges(),
          // if folder deleted on client and updated on server
          // server overwrites client changes and client should request the full bookmark tree of folder
          // to restore it, here stored folders guids which match this case
            needFetchTree = [];
          fvd_sync_Async.chain( [

            function( chainCallback ){

              // remove bookmarks
              var allGuids = bmkService.getAllGuids();
              var toRemove = [];
              allGuids.forEach( function( clientGuid ){
                if( data.bookmarkIds.indexOf( clientGuid ) == -1 ){
                  if( changeData.newIds.indexOf( clientGuid ) == -1 ){
                    toRemove.push( clientGuid );
                  }
                }
              } );
              _dbg("Bookmarks on server: " + data.bookmarkIds.length + ", on client: " + allGuids.length +
                ", to remove: " + toRemove.length);
              toRemove.forEach( function( clientId ){
                bmkService.remove( clientId );
              } );
              chainCallback();
            },

            function(chainCallback) {
              // because server is always right we need to remove record from "removedIds" list if it was changed on server
              if(!changeData.removedIds || !changeData.removedIds.length) {
                // nothing removed on client
                return chainCallback();
              }
              data.bookmarks.forEach(function(b) {
                if(changeData.removedIds.indexOf(b.global_id) !== -1) {
                  self.removeChanges(["removedIds"], b.global_id);
                  if(b.type == "folder") {
                    needFetchTree.push(b.global_id);
                  }
                }
              });
              if(!needFetchTree.length) {
                return chainCallback();
              }
              fvd_sync_Async.arrayProcess(needFetchTree, function(parent_id, next) {
                getBookmarksList({
                  parent_id: parent_id
                }, function(error, res) {
                  if(error) {
                    return callback(error);
                  }
                  if(!res.bookmarks || !res.bookmarks.length) {
                    return next();
                  }
                  for(var i = 0; i != res.bookmarks.length; i++) {
                    if(res.bookmarks[i].global_id == parent_id) {
                      // ignore, because this folder already in data.bookmarks
                      continue;
                    }
                    data.bookmarks.push(res.bookmarks[i]);
                  }
                  next();
                });
              }, function() {
                chainCallback();
              });
            },
            function( chainCallback ){
              bmkService.saveList( data.bookmarks );
              setLastUpdateTime( data.lastUpdateTime );
              chainCallback();
            },
            function( chainCallback ){
              for(var i = 0; i != data.bookmarks.length; i++) {
                savedGuids.push(data.bookmarks[i].global_id);
              }
              callback( 0, {
                savedGuids: savedGuids
              } );
            }

          ] );

        }

      }
    );

  }

  /**
   * upload changed bookmarks/folders to server
   * @param  {Array} [exclude] - array of global ids to exclude from upload
   */
  function uploadChangesToServer( params, callback ){
    if(typeof params == "function") {
      callback = params;
    }
    params = params || {};
    params.exclude = params.exclude || {};
    var changeData = self.getChanges();
    var toServerList = [];

    if(params.exclude && params.exclude.length) {
      // removed excluded data form changes
      if(params.exclude && params.exclude.length) {
        params.exclude.forEach(function(guid) {
          for(var k in changeData) {
            var d = changeData[k],
                index = d.indexOf(guid);
            if(index >= 0) {
              d.splice(index, 1);
            }
          }
        });
      }
    }

    fvd_sync_Async.chain( [

      function( chainCallback ){
        // first remove data
        if( changeData.removedIds.length > 0 ){

          removeBookmarksFromServer( changeData.removedIds, function( error, data ){

            if( error != 0 ){
              callback( error );
            }
            else{
              setLastUpdateTime( data.lastUpdateTime );

              chainCallback();
            }

          } );

        }
        else{

          chainCallback();

        }

      },

      function( chainCallback ){
        // store here which type of data we need upload to server
        // such as "full" or "position", key is bookmark global_id
        var uploadChanges = {};
        changeData.changedIds.forEach(function(globalId) {
          uploadChanges[globalId] = "full";
        });
        fvd_sync_Async.chain([
          function(next) {
            if(changeData.reorderInside && changeData.reorderInside.length) {
              // need to get index info about bookmarks in folders which ids in reorderInside
              // array
              fvd_sync_Async.arrayProcess(changeData.reorderInside, function(id, apc) {
                bmkService.getFolderContents(id, {
                  includeSub: false,
                  onlyIds: true
                }, function(items) {
                  items.forEach(function(item) {
                    var global_id = bmkService.getGlobalId(item.id);
                    // check bookmark is ignored
                    if(params.exclude.indexOf(global_id) == -1) {
                      if(!uploadChanges[global_id]) {
                        uploadChanges[global_id] = "index";
                      }
                    }
                  });
                  apc();
                });
              }, function() {
                next();
              });
            }
            else {
              next();
            }
          },
          function() {
            fvd_sync_Async.arrayProcess( Object.keys(uploadChanges), function( globalId, apCallback ){
              var infoType = uploadChanges[globalId];
              bmkService.getBookmarkById( globalId, function( bookmark ){
                if( bookmark ){
                  if(infoType == "full") {
                    // check bookmark should have parent_id and global_id
                    if(bookmark.parent_id && bookmark.global_id) {
                      toServerList.push( bookmark );
                    }
                  }
                  else if(infoType == "index") {
                    toServerList.push({
                      global_id: globalId,
                      index: bookmark.index
                    });
                  }
                }
                apCallback();
              } );
            }, function(){
              chainCallback();
            } );
          }
        ]);

      },

      function( chainCallback ){

        //upload data

        //dump( "C2. Upload updates\n" );
        if( toServerList.length > 0 ){

          putBookmarksList( toServerList, function( error, data ){

            if( error != 0 ){
              callback( error, {
                count: toServerList.length
              } );
            }
            else{
              setLastUpdateTime( data.lastUpdateTime );
              chainCallback();
            }

          } );

        }
        else{
          chainCallback();
        }

      },

      function(){

        callback( 0 );

      }

    ] );

  }

  function hasUpdates( callback ){

    var lastUpdateTime = getLastUpdateTime();

    var message = {
      action: "found_bookmarks",
      lastUpdateTime: lastUpdateTime
    };



    self.syncInst.authorizedRequest( message, function( error, data ){

      if( error != 0 ){
        callback( error );
      }
      else{
        callback( 0, {
          found: data.found,
          lastUpdateTime: lastUpdateTime
        } );
      }

    } );

  }

  function overwriteServerData( callback ){

    fvd_sync_Async.chain( [

      function( chainCallback ){

        bmkService.getAllBookmarks( null, function( clientBookmarks ){

          putBookmarksList( clientBookmarks, function( error, data ){

            if( error != 0 ){
              callback( error, {
                count: clientBookmarks.length
              } );
            }
            else{

              setLastUpdateTime( data.lastUpdateTime );

              chainCallback();
            }

          },{
            overwrite: true
          } );

        } );

      },

      function(){
        callback( 0 );
      }

    ] );

  }

  function overwriteLocalData( callback ){

    fvd_sync_Async.chain( [

      function( chainCallback ){
        EverSyncLogs["syncLog"].profile.start("removebookmarks");
        bmkService.removeAllBookmarks({
          async: true
        }, function(){
          EverSyncLogs["syncLog"].profile.end("removebookmarks");
          chainCallback();
        });

      },

      function( chainCallback ){
        EverSyncLogs["syncLog"].profile.start("get bookmarks from server");
        getBookmarksList( {}, function( error, data ){
          EverSyncLogs["syncLog"].profile.end("get bookmarks from server");
          if( error != 0 ){
            callback( error );
          }
          else{
            EverSyncLogs["syncLog"].profile.start("savelist");
            bmkService.saveList( data.bookmarks, {
              async: true
            }, function(){
              EverSyncLogs["syncLog"].profile.end("savelist");
              try{
                setLastUpdateTime( data.lastUpdateTime );
              }
              catch( ex ){

              }

              chainCallback();

            } );

          }

        } );

      },

      function(){
        callback( 0 );
      }

    ] );

  }

  function mergeLocalAndServerData( callback ){

    _dbg( "\n\n------\n\n\Start merge\n" );

    currentProcessAborted = false;

    var serverBookmarks = [];
    var translateGlobalIds = {}; // if global ids changes here will be translation [clientGLobalId] => [serverGlobalId]

    var clientBookmarks = [];
    var toServerBookmarks = [];
    var toClientBookmarks = [];

    var toClientBookmarksIdsAssoc = {};
    var toServerBookmarksIdsAssoc = {};
    var foundCollisionsForAssocClient = {};
    var foundCollisionsForAssocServer = {};

    var serverLastUpdateTime = null;

    var collisions = [];

    function getItemIn( globalId, list ){

      var index = -1;
      for( var i = 0; i != list.length; i++ ){

        if( list[i].global_id == globalId ){
          index = i;
          break;
        }

      }

      return index;

    }

    fvd_sync_Async.chain( [
      function( chainCallback ){
        if( checkCurrentProcessAborted(callback) ){
          return;
        }
        // get server bookmarks
        getBookmarksList({}, function(error, data) {
          if(error == 0) {
            serverBookmarks = data;
            serverLastUpdateTime = serverBookmarks.lastUpdateTime;
            serverBookmarks = serverBookmarks.bookmarks;
            _dbg("Server bookmarks count: " + serverBookmarks.length);
            chainCallback();
          }
          else{
            callback( error );
          }
        });
      },
      function(chainCallback) {
        if(checkCurrentProcessAborted(callback)) {
          return;
        }
        // get client bookmarks
        bmkService.getAllBookmarks(null, function(_clientBookmarks) {
          clientBookmarks = _clientBookmarks;
          _dbg("CLIENT Bookmarks count: " + clientBookmarks.length);
          chainCallback();
        });
      },
      function(chainCallback) {
        if( checkCurrentProcessAborted(callback) ){
          return;
        }
        _dbg("Check collisions");
        // collision search
        function getItemsWithParent(data, parentIds) {
          var result = [];
          data.forEach(function(item) {
            if(parentIds.indexOf(item.parent_id) != -1) {
              result.push(item);
            }
          });
          return result;
        }

        function processItems(parentIds) {
          var clientItems = getItemsWithParent(clientBookmarks, parentIds);
          var serverItems = getItemsWithParent(serverBookmarks, parentIds);

          var serverItemsByGuid = {};
          for(let serverItem of serverItems) {
            serverItemsByGuid[serverItem.global_id] = serverItem;
          }
          var collisionsByClientGuid = {};

          function getCollisedServerItem(clientItem) {
            // collision for folder is equal title params
            // collision for bookmark is equal url params
            // collision for both types if they have similiar global_id
            var collisedServerItem = null;
            for(var i = 0; i != serverItems.length; i++) {
              var serverItem = serverItems[i];
              if(foundCollisionsForAssocServer[serverItem.global_id]) {
                continue;
              }

              if(clientItem.type == serverItem.type) {
                if(clientItem.type == "folder") {
                  if(clientItem.title == serverItem.title) {
                    collisedServerItem = serverItem;
                    break;
                  }
                }
                else if(clientItem.type == "bookmark") {
                  if(fvd_sync_Misc.isUrlsEqual(clientItem.url, serverItem.url)) {
                    collisedServerItem = serverItem;
                    break;
                  }
                }
              }
            }
            return collisedServerItem;
          }

          function addCollision(clientItem, collisedServerItem) {
            var collision = {
              clientItem: clientItem,
              serverItem: collisedServerItem
            };
            collisions.push(collision);
            foundCollisionsForAssocClient[clientItem.global_id] = true;
            foundCollisionsForAssocServer[collisedServerItem.global_id] = true;
            collisionsByClientGuid[clientItem.global_id] = collision;
          }

          // first of all get collisions by global id
          for(let clientItem of clientItems) {
            if(serverItemsByGuid[clientItem.global_id]) {
              let serverItem = serverItemsByGuid[clientItem.global_id];
              // check type(probably unecessary)
              if(serverItem.type === clientItem.type) {
                // found collision by global id
                addCollision(clientItem, serverItem);
              }
            }
          }

          // then check for title/url collisions
          clientItems.forEach(function(clientItem) {
            // check if client item already collised(by global_id)
            if(!(clientItem.global_id in foundCollisionsForAssocClient)) {
              var collisedServerItem = getCollisedServerItem(clientItem);
              if(collisedServerItem &&
                !(collisedServerItem.global_id in foundCollisionsForAssocServer))
              {
                _dbg("Found title url collision(" + clientItem.title + "/" + clientItem.url + ")");
                addCollision(clientItem, collisedServerItem);
              }
            }
            if(collisionsByClientGuid[clientItem.global_id]) {
              if(clientItem.type == "folder") {
                _dbg("Found collised folder " + clientItem.title);
                // if client folder is collised by server folder, look into their content for other collisions
                processItems([
                  clientItem.global_id, collisionsByClientGuid[clientItem.global_id].serverItem.global_id
                ]);
              }
            }
          });

        }

        processItems(["menu"]);
        processItems(["unsorted"]);
        processItems(["toolbar"]);

        chainCallback();
      },

      function(chainCallback) {
        _dbg("Resolve collisions(Client count: " + clientBookmarks.length + ")");
        _dbg("Count collisions " + collisions.length);

        // clone clientBookmarks before cleaning
        //var clientItemsBeforeClearing = clientBookmarks.slice();

        // all collision will be resolved to server bookmark data
        collisions.forEach(function(collision) {
          // remove data from client bookmarks
          var index = getItemIn(collision.clientItem.global_id, clientBookmarks);
          if(index != -1) {
            // we should not upload client version of the conflicted bookmark on server
            // so just ignore it think it is doesn't exist on the client
            clientBookmarks.splice(index, 1);
          }
          // remove data from server bookmarks
          /*
          index = getItemIn(collision.serverItem.global_id, serverBookmarks);
          if(index != -1) {
            serverBookmarks.splice( index, 1 );
          }*/
        });

        _dbg("Count client after clearing: " + clientBookmarks.length);

        // fill to server bookmarks
        // bookmarks which are on the client but not on the server
        clientBookmarks.forEach(function(clientBookmark) {
          if(getItemIn(clientBookmark.global_id, serverBookmarks) == -1) {
            toServerBookmarks.push(clientBookmark);
            toServerBookmarksIdsAssoc[clientBookmark.global_id] = true;
          }
        });

        // fill to client bookmarks
        // bookmarks which are on the server but not on the client
        serverBookmarks.forEach(function(serverBookmark) {
          if(getItemIn(serverBookmark.global_id, clientBookmarks) == -1) {
            toClientBookmarks.push(serverBookmark);
            toClientBookmarksIdsAssoc[ serverBookmark.global_id ] = true;
          }
        });
        chainCallback();
      },

      function( chainCallback ){

        _dbg( "SAVE CLIENT\n" );

        if( checkCurrentProcessAborted(callback) ){
          return;
        }

        // apply changes on local

        // save collisions firstly
        try {
          collisions.forEach( function(collision) {
            if(collision.serverItem.global_id != collision.clientItem.global_id) {
              // change global id to server global id
              try {
                _dbg("Change GUID " + collision.clientItem.global_id + " => " + collision.serverItem.global_id);
                bmkService.changeGlobalId(collision.clientItem.global_id, collision.serverItem.global_id);
                translateGlobalIds[collision.clientItem.global_id] = collision.serverItem.global_id;
              }
              catch(ex) {
              }
            }
            // save server item, e.g. server priority
            if(!(collision.serverItem.global_id in toClientBookmarksIdsAssoc)) {
              toClientBookmarks.push( collision.serverItem );
            }
          });
        }
        catch(ex) {
          dump( ex + "\n" );
          throw ex;
        }

        _dbg( "Collisions processed\n" );

        // save new bookmarks

        _dbg("To client: " + toClientBookmarks.length);
        bmkService.saveList(toClientBookmarks, {
          async: true
        }, function() {
          _dbg("Saved");
          chainCallback();
        });
      },

      function(chainCallback) {
        // before save to server need to translate old parent ids to new parent ids obtained from server,
        // if changed
        for(var i = 0; i != toServerBookmarks.length; i++) {
          var toServerBookmark = toServerBookmarks[i];
          // parents guid translate
          if( translateGlobalIds[ toServerBookmark.parent_id ] ){
            toServerBookmark.parent_id = translateGlobalIds[ toServerBookmark.parent_id ];
          }
          // self bookmark guid translate
          if( translateGlobalIds[ toServerBookmark.global_id ] ){
            toServerBookmark.global_id = translateGlobalIds[ toServerBookmark.global_id ];
          }
        }
        chainCallback();
      },

      function(chainCallback) {
        _dbg("SAVE SERVER");
        _dbg("To server: " + toServerBookmarks.length);

        var toServerGuids = toServerBookmarks.map(function(b) {
          return b.global_id;
        });
        //dump("\n\n" + JSON.stringify(toServerGuids) + "\n\n");

        if( checkCurrentProcessAborted(callback) ){
          return;
        }

        if(toServerBookmarks.length > 0) {
          var tmp = [];

          putBookmarksList(toServerBookmarks, function(error, data) {
            _dbg("PUT TO SERVER RESPONSE: " + error + "\n");
            if(error != 0) {
              callback(error, {
                count: toServerBookmarks.length
              });
            }
            else {
              serverLastUpdateTime = data.lastUpdateTime;
              chainCallback();
            }
          });
        }
        else{
          chainCallback();
        }
      },

      function() {
        try {
          _dbg("Sync success, set last update time: " + serverLastUpdateTime);
          if(serverLastUpdateTime) {
            setLastUpdateTime( serverLastUpdateTime );
          }
        }
        catch(ex) {
        }
        callback( 0 );
      }
    ]);
  }

  /* init function */

  function init() {
    AddonManager.addAddonListener(addonListener);
    bmkService.onInitialized(function() {
      _dbg("Start preparing guids");
      self.createGuids(function() {
        _dbg("Guids prepared");
      });
    });
    bmkService.init(self);
  }

  this.createGuids = function( callback ){

    self.startInitialization();

    //dump( "Start crate GUIDS\n" );

    bmkService.aCreateGUIDS( function(){

      //dump( "Created\n" );

      self.endInitialization();

      if( callback ){
        callback();
      }

    } );

  };

  this.openCreateGuidsDialog = function(){

    self.syncInst.openSimpleSyncProgressDialog( window, "bookmarks:createGuids" );

  };

  function canSync(){
    if( processCreateGuids ){
      return false;
    }

    return true;
  }


  function setLastUpdateTime( time ){

    fvd_sync_Settings.setStringVal( "bookmarks.last_update_time", time );

  }

  function getLastUpdateTime(){
    try{

      return parseInt( fvd_sync_Settings.getStringVal( "bookmarks.last_update_time" ) );

    }
    catch( ex ){

      return 0;

    }

  }

  function initialSyncMaked(){

    fvd_sync_Settings.setStringVal( "bookmarks.after_auth_state", "none" );

  }

  function startMainSync( callback ){

    var updateInfo = null,
    // array of bookmarks ids
        savedBookmarksFromServer = [];

    //dump( "\nStart main sync process\n-----------\n" );

    fvd_sync_Async.chain([

      function( chainCallback ){

        //dump( "1. Check For Updates\n" );

        hasUpdates( function( error, data ){
          if( error != 0 ){
            callback( error );
          }
          else{
            updateInfo = data;
            chainCallback();
          }
        } );

      },
      function( chainCallback ){

        if( updateInfo.found ){
          applyServerUpdates( {
            lastUpdateTime: updateInfo.lastUpdateTime
          }, function( error, res ){

            if( error != 0 ){
              callback( error );
            }
            else{
              if(res && res.savedGuids) {
                savedBookmarksFromServer = res.savedGuids;
              }
              chainCallback();
            }

          } );
        }
        else{
          chainCallback();
        }

      },
      function( chainCallback ){

        //dump( "2. Upload changes to server\n" );

        uploadChangesToServer( {
          exclude: savedBookmarksFromServer
        }, function( error ){

          if( error != 0 ){
            callback( error );
          }
          else{
            chainCallback();
          }

        } );

      },

      function(){

        //dump( "-----------\nSUCCESS!\n\n" );

        // clear changes

        self.clearChanges();

        callback( 0 );
      }

    ]);

  }

  this.startInitialization = function(){
    processCreateGuids = true;
    observerService.notifyObservers( null, "FVD.Sync.Bookmarks-Initialization-State-Changed", null  );
  };

  this.endInitialization = function(){
    processCreateGuids = false;
    observerService.notifyObservers( null, "FVD.Sync.Bookmarks-Initialization-State-Changed", null  );
  };

  this.hasUpdates = function( callback ){

    hasUpdates( callback );

  };

  this.startAutoSync = function( params, callback ){

    if( !canSync() ){
      //dump("Cannot sync now\n");

      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }

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

    acquireLock( function( error ){

      if( error != 0 ){
        return callback( error );
      }
      else{

        _startSync();

        startMainSync( function( error ){

          releaseLock( function(  ){

            _endSync();

            callback( error );

          });

        });

      }

    } );

  };

  this.startMainSync = function( callback, progressCallback ){

    if( !canSync() ){
      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }

    if( self.needInitialSyncAfter() == "register" ){

      this.mergeLocalAndServerData( callback );

      return;
    }

    acquireLock( function( error ){

      if( error != 0 ){
        callback( error );
      }
      else{

        _startSync();

        startMainSync( function( error, _result ){

          releaseLock( function(  ){

            callback( error, _result );

            _endSync();

          } );

        }, progressCallback );
      }

    } );

  };

  this.applyServerUpdates = function( callback ){

    if( !canSync() ){
      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }

    applyServerUpdates( callback );

  };

  this.mergeLocalAndServerData = function( callback ){

    if( !canSync() ){
      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }


    acquireLock( function( error ){

      if( error != 0 ){
        callback( error );
      }
      else{

        _startSync();

        mergeLocalAndServerData( function( error, _result ){

          if( error == 0 ){
            initialSyncMaked();
            self.clearChanges();
          }

          releaseLock( function(){

            _endSync();

            callback( error, _result );
          } );

        } );

      }

    } );



  };

  this.overwriteServerData = function( callback ){

    if( !canSync() ){
      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }


    acquireLock( function( error ){

      if( error != 0 ){
        callback( error );
      }
      else{

        _startSync();

        overwriteServerData( function( error, _result ){

          if( error == 0 ){
            initialSyncMaked();
            self.clearChanges();
          }

          releaseLock( function(){

            _endSync();

            callback( error, _result );

          } );

        } );

      }

    } );



  };

  this.overwriteLocalData = function( callback ){
    EverSyncLogs["syncLog"] = new EverSyncLog();
    if(!canSync()) {
      callback( self.syncInst.Errors.ERROR_DRIVER_BUSY );
      return;
    }
    EverSyncLogs["syncLog"].profile.start("acquire_lock");
    acquireLock( function( error ){
      EverSyncLogs["syncLog"].profile.end("acquire_lock");
      if( error != 0 ){
        callback( error );
      }
      else{
        _startSync();
        overwriteLocalData( function( error ){
          if( error == 0 ){
            initialSyncMaked();
            self.clearChanges();
          }

          releaseLock( function(){

            _endSync();
            //dump("\n\n"+EverSyncLogs["syncLog"].toString()+"\n\n");
            callback( error );

          } );

        } );
      }
    } );

  };

  /*
   * add changes for items in specified groups
   * @param {array of String} groups - groups names, such as reorderInside, hangedIds, etc..
   * @param {Mixed} globalId - globalId or id(in case of reorderInside) of item
   */
  this.addChanges = function( groups, globalId ){
    if(!globalId) {
      dump("Cant't set changed, globalId is empty\n");
      return;
    }
    var changes = this.getChanges();
    groups.forEach( function( group ){
      if( bmkService.isRootFolder( globalId ) ){
        return;
      }
      if(!changes[group]) {
        changes[group] = [];
      }
      if( changes[group].indexOf(globalId) == -1 ){
        changes[group].push( globalId );
      }
    } );
    observerService.notifyObservers( null, "FVD.Sync.In-Browser-Count-Items-Changed", "Bookmarks"  );
    self.setChanges( changes );
  };

  this.getChanges = function(){

    var v = fvd_sync_Settings.getStringVal( "bookmarks.changes" );

    if( v == "" ){
      return JSON.parse( JSON.stringify( _emptyChanges ) );
    }

    return JSON.parse( v );

  };

  this.removeChanges = function( groups, globalId ){

    var changes = this.getChanges();

    groups.forEach( function( group ){
      var index = changes[group].indexOf(globalId);
      if( index != -1 ){
        changes[group].splice( index, 1 );
      }
    } );

    self.setChanges( changes );

  };

  this.setChanges = function( changes ){
    var changesStr = JSON.stringify(changes);
    fvd_sync_Settings.setStringVal( "bookmarks.changes", changesStr);
    this.syncInst.driverSyncDataChanges( "Bookmarks" );
  };

  this.clearChanges = function(){

    this.setChanges( _emptyChanges );

  };

  this.hasChanges = function(){

    var changes = this.getChanges();

    var has = false;

    for( var group in changes ){
      if( changes[group].length > 0 ){
        has = true;
        break;
      }
    }

    return has;

  };

  this.needInitialSyncAfter = function(){

    return fvd_sync_Settings.getStringVal( "bookmarks.after_auth_state" );

  };

  this.syncAuthActionCompleted = function( action ){

    if( action == "login" || action == "register" ){

      fvd_sync_Settings.setStringVal( "bookmarks.after_auth_state", action );

    }

  };

  this.init = function(){
    init();
  };

  this.isInitialization = function(){
    return processCreateGuids;
  };

  this.getInitializationProgress = function(){

    return bmkService.createGuidsProgress;

  };

  this.totalItemsCount = function( callback ){

    bmkService.getAllBookmarks( {
      onlyIds: true
    }, function( bookmarks ){

      if( callback ){
        callback( bookmarks.length );
      }

    } );

  };

  this.getState = function(){

    return self.syncInst.getState();

  };

  this.Backup = new function(){

    var selfBackup = this;

    var checkBackupTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

    var _ignoreAutoCheck = false;

    var restoreProgress = {
      current: 0,
      max: 0
    };

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
        lastCheckTime = parseInt( fvd_sync_Settings.getStringVal( "bookmarks.last_check_backup.time" ) );
      }
      catch( ex ){

      }

      if( now - lastCheckTime >= fvd_sync_Config.CHECK_BACKUP_INTERVAL ){

        var changesMaked = true;
        try{
          changesMaked = fvd_sync_Settings.getBoolVal( "bookmarks.last_check_backup.changes" );
        }
        catch( ex ){

        }

        if( !lastCheckTime && changesMaked || lastCheckTime ){
          fvd_sync_Settings.setStringVal( "bookmarks.last_check_backup.time", now );
        }

        //dump( "Changes maked? " + changesMaked + "\n" );

        if( changesMaked ){
          try{
            fvd_sync_Settings.setBoolVal( "bookmarks.last_check_backup.changes", false );

            //dump("Start backup\n");

            selfBackup.make(function(){

            });
          }
          catch( ex ){
            //dump( "ERROR: " + ex + "\n" );
          }
        }

      }


    }

    this.getRestoreProgress = function(){
      return restoreProgress;
    };

    this.setChangesMaked = function(){
      fvd_sync_Settings.setBoolVal( "bookmarks.last_check_backup.changes", true );
    };

    this.setChangesNotMaked = function(){
      fvd_sync_Settings.setBoolVal( "bookmarks.last_check_backup.changes", false );
    };

    this.hasBackup = function(){
      var file = this.getBackupsFolder();
      return file.directoryEntries.hasMoreElements();
    };

    this.getBackupsFolder = function(){
      var file = fvd_sync_File.filesFolder();
      file.append( fvd_sync_Config.BACKUP_FOLDER );
      if( !file.exists() ){
        file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
      }
      file.append( "bookmarks" );
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

    this.make = function( callback ){

      var bookmarks = null;

      var date = new Date();

      var dateFile = date.getFullYear() + "" + date.getMonth() + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds();

      var file = this.getBackupsFolder();

      file.append( dateFile );
      if( !file.exists() ){
        file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
      }

      var fileInfo = file.clone();

      file.append( "data.json" );

      fileInfo.append( "info.json" );

      var info = {
        time: new Date().getTime()
      };

      fvd_sync_Async.chain( [

        function( chainCallback ){

          bmkService.getAllBookmarks( null, function( _bookmarks ){
            bookmarks = _bookmarks;

            info.count = bookmarks.length;

            chainCallback();
          } );

        },

        function( chainCallback ){
          fvd_sync_File._write( file, JSON.stringify( bookmarks ), function( r ){
            if( !r ){
              return callback(r);
            }

            chainCallback();
          } );
        },

        function( chainCallback ){
          fvd_sync_File._write( fileInfo, JSON.stringify( info ), function( r ){
            if( !r ){
              return callback(r);
            }

            chainCallback();
          } );
        },

        function(){

          selfBackup.removeOldBackups(function(){
            observerService.notifyObservers( null, "FVD.Sync.Bookmarks-Backup-Created", null  );
            callback( true );
          });

        }

      ] );

    };

    this.restore = function( folder, callback ){
      //dump("Start restore from " + folder + "\n");
      _ignoreAutoCheck = true;

      _startSync();

      this._restore( folder, function( r ){

        _endSync();

        selfBackup.setChangesNotMaked();
        _ignoreAutoCheck = false;
        callback( r );

      } );

    };

    this._restore = function( folder, callback ){

      var file = this.getBackupsFolder();
      file.append( folder );
      file.append( "data.json" );

      restoreProgress.current = 0;

      fvd_sync_File._read( file, function( result, content ){

        if( !result ){
          dump("Fail read backup file\n");
          return callback( false );
        }

        try{
          var bookmarks = JSON.parse( content );

          restoreProgress.max = bookmarks.length;
          bmkService.removeAllBookmarks({async: true}, function(){
            /*
             * set changes manually to speed up
            bookmarks.forEach(function( bookmark ){
              Bookmarks.addChanges( ["changedIds", "newIds"], bookmark.global_id );
            });
            */
            var changes = self.getChanges();
            changes["changedIds"] = [];
            changes["newIds"] = [];
            bookmarks.forEach(function( bookmark ){
              changes["changedIds"].push(bookmark.global_id);
              changes["newIds"].push(bookmark.global_id);
            });
            self.setChanges( changes );
            observerService.notifyObservers( null, "FVD.Sync.In-Browser-Count-Items-Changed", "Bookmarks"  );

            bmkService.saveList( bookmarks, {async: true}, function(){

              // user cant make simple sync, he must make upload/download bookmarks
              self.syncAuthActionCompleted( "login" );

              callback( true );

            }, function(){
              restoreProgress.current++;
            } );

          });

        }
        catch( ex ){
          dump("Exception whie restore bookmarks: " + ex + "\n");
          callback( false );
        }

      } );

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

var Bookmarks = new Bookmarks_Class();
