var EXPORTED_SYMBOLS = ["bmkService"];

var Cc = Components.classes;
var Ci = Components.interfaces;

var {fvd_sync_Async} = Components.utils.import("resource://fvd.sync.modules/async.js");
Components.utils.import("resource://fvd.sync.modules/misc.js");
Components.utils.import("resource://fvd.sync.modules/partial/livemarks.js");
var {fvd_sync_Storage} = Components.utils.import("resource://fvd.sync.modules/storage.js", {});
Components.utils.import("resource://fvd.sync.modules/log.js");

try {
  Components.utils.import("resource://gre/modules/Timer.jsm");
}
catch(ex) {

}

function _dbg(msg) {
  //dump("bmkservice.js: " + msg + "\n");
}

var bmkServiceClass = function(){

  var self = this;

  var Bookmarks = null;

  var _navBookmarksService = null;
  var _annotationService = null;

  var _switchOffListeners = false;
  var _prevListenersState = [];

  var _ignoreToSyncIds = [];
  var _rootIds = []; // ids of bookmark menu, bookmark toolbar and unsorted bookmarks

  function _turnOffListeners() {
    //dump("Listeners state: off\n");
    _prevListenersState.push(_switchOffListeners);
    _switchOffListeners = true;
  }
  function _returnListeners() {
    _switchOffListeners = _prevListenersState.pop();
    //dump("Listeners state: "+(_switchOffListeners?"off":"on")+"\n");
  }
  function _turnOnListeners() {
    _prevListenersState.push(_switchOffListeners);
    _switchOffListeners = false;
  }
  function _withoutListeners(cb) {
    var _neetReturnListeners = false;
    if(!_switchOffListeners) {
      _turnOffListeners();
      _neetReturnListeners = true;
    }
    cb();
    if(_neetReturnListeners) {
      _returnListeners();
    }
  }

  this.createGuidsProgress = {
    current: 0,
    max: 0
  };

  this.doAfterBatchActionInitialization = function(actions, callback) {
    var svc = self.serviceInst();
    self.createGuidsProgress.current = 0;
    self.createGuidsProgress.max = actions.length;
    Bookmarks.startInitialization();
    for(let action of actions) {
      self.createGuidsProgress.current++;
      var itemId = action.id;
      if (action.itemType != svc.TYPE_BOOKMARK && action.itemType != svc.TYPE_FOLDER) {
        continue;
      }
      if(action.actionType === "remove") {
        // if bookmark removed check its parent in root folder
        // and check that parent is root folder
        if(!checkRootIsFolderParentForBookmark(action.parentId) && !isRootId(action.parentId)) {
          _dbg("Item " + action.parentId + " is not in root folder, so it can't be added for sync(checked by parent)");
          continue;
        }
      }
      else {
        if(!checkRootIsFolderParentForBookmark(itemId)) {
          _dbg("Item " + itemId + " is not in root folder, so it can't be added for sync");
          continue;
        }
      }
      switch(action.type) {
        case "new":
          createGUID(itemId);
          Bookmarks.addChanges(["changedIds", "newIds"], getGlobalId(itemId));
        break;
        case "change":
          Bookmarks.addChanges(["changedIds"], getGlobalId(itemId));
        break;
        case "remove":
          Bookmarks.addChanges(["removedIds"], getGlobalId(itemId));
          fvd_sync_Storage.removeBookmarkGuid(itemId);
        break;
      }
    }
    Bookmarks.endInitialization();
    callback();
  };

  var observer = new function(){

    function delayedRun( callback ){
      var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
      timer.initWithCallback(callback, 0, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    }

    var updateBatchStarted = false;
    var actionsStore = []; // store actions in batch processing
    var actionsStoreStored = []; // stored items to prevent duplicates

    this.onBeginUpdateBatch = function(){
      if( _switchOffListeners ){
        return;
      }
      _dbg("onBeginUpdateBatch");
      updateBatchStarted = true;
      actionsStore = [];
    };

    this.onEndUpdateBatch = function(){
      if( _switchOffListeners ){
        return;
      }

      _dbg("onEndUpdateBatch");

      updateBatchStarted = false;

      // remove, change, new actions types in batch actions store
      var actionsStoreClone = fvd_sync_Misc.clone( actionsStore );
      actionsStore = [];
      actionsStoreStored = [];

      self.doAfterBatchActionInitialization(actionsStoreClone, function() {
        actionsStore = [];
        Bookmarks.Backup.setChangesMaked();
      });
    };


    this.onItemAdded = function( itemId, parentId, index, itemType ){
      if( updateBatchStarted ) {
        if( actionsStoreStored.indexOf( "new_" + itemId ) == -1 ){
          actionsStore.push({
            type: "new",
            id: itemId,
            parentId: parentId,
            index: index,
            itemType: itemType,
            actionType: "add"
          });

          actionsStoreStored.push( "new_" + itemId );
        }
        return;
      }
      Bookmarks.Backup.setChangesMaked();

      if( _switchOffListeners ){
        return;
      }

      var svc = self.serviceInst();
      if( itemType != svc.TYPE_BOOKMARK && itemType != svc.TYPE_FOLDER ) {
        return; // ignore changes of not bookmark and not folder
      }
      _dbg("new item added " + itemId + " for parent " + parentId + ", item type " + itemType);
      if( isIgnoredId( parentId ) ) {
        _dbg("Ignore adding " + parentId + " it's one of places root");
        return; // ignore adding items to places root
      }
      if(!checkRootIsFolderParentForBookmark(itemId)) {
        _dbg("Item " + itemId + " not in root folder, so it can't be added for sync");
        return;
      }
      if(itemType == svc.TYPE_BOOKMARK){
        var uri = svc.getBookmarkURI(itemId).spec;
        if(!isURIAllowed(uri)) {
          return;
        }
      }

      delayedRun(function() {
        createGUID(itemId);
        var bookmarkGlobalId = getGlobalId(itemId);
        Bookmarks.addChanges( ["changedIds", "newIds"], bookmarkGlobalId);
      });

    };

    this.onItemChanged = function( itemId, propertyName, isAnnotation, newValue, lastModified, itemType, parentId ){

      if( updateBatchStarted ){
        if( propertyName ){

          if( actionsStoreStored.indexOf( "new_" + itemId ) == -1 && actionsStoreStored.indexOf( "change_" + itemId ) == -1 ){

            actionsStore.push({
              type: "change",
              id: itemId,
              itemType: itemType,
              parentId: parentId,
              actionType: "change"
            });

            actionsStoreStored.push( "change_" + itemId );
          }

        }

        return;
      }

      Bookmarks.Backup.setChangesMaked();

      if( _switchOffListeners ){
        return;
      }

      var svc = self.serviceInst();

      if( itemType != svc.TYPE_BOOKMARK && itemType != svc.TYPE_FOLDER ){
        return; // ignore changes of not bookmark and not folder
      }

      if( isIgnoredId( parentId ) || isIgnoredId( itemId ) ){
        return; // ignore changing items in places root
      }

      if(!checkRootIsFolderParentForBookmark(itemId)) {
        _dbg("Item " + itemId + " not in root folder, so it can't be added for sync");
        return;
      }

      if(itemType == svc.TYPE_BOOKMARK){
        var uri = svc.getBookmarkURI(itemId).spec;
        if(!isURIAllowed(uri)){
          return;
        }
      }

      //dump( "Changed item: " + itemId + ": " + propertyName + " = " + newValue + ", type = " + itemType + ", parent = " + parentId + "\n" );

      if( propertyName ){
        // update
        delayedRun(function(){
          Bookmarks.addChanges( ["changedIds"], getGlobalId(itemId) );
        });
      }

    };

    this.onItemMoved = function( itemId, oldParentId, oldIndex, newParentId, newIndex, itemType ){
      if( updateBatchStarted ){
        actionsStore.push({
          type: "change",
          id: itemId,
          itemType: itemType,
          parentId: newParentId,
          actionType: "move"
        });
        return;
      }

      Bookmarks.Backup.setChangesMaked();

      if( _switchOffListeners ){
        return;
      }

      var svc = self.serviceInst();

      if (itemType != svc.TYPE_BOOKMARK && itemType != svc.TYPE_FOLDER) {
        return; // ignore changes of not bookmark and not folder
      }

      if( isIgnoredId( newParentId ) || isIgnoredId( oldParentId ) || isIgnoredId( itemId ) ){
        return; // ignore moving items to places root or from
      }

      if(!checkRootIsFolderParentForBookmark(itemId)) {
        _dbg("Item " + itemId + " not in root folder, so it can't be added for sync");
        return;
      }

      if(itemType == svc.TYPE_BOOKMARK){
        var uri = svc.getBookmarkURI(itemId).spec;
        if(!isURIAllowed(uri)){
          return;
        }
      }

      delayedRun(function() {
        Bookmarks.addChanges( ["reorderInside"], newParentId );
        if(oldParentId != newParentId) {
          Bookmarks.addChanges( ["reorderInside"], oldParentId );
          Bookmarks.addChanges( ["changedIds"], getGlobalId(itemId) );
        }
      });
    };

    this.onItemRemoved = function( itemId, parentId, index, itemType ){

      if( updateBatchStarted ){
        actionsStore.push({
          type: "remove",
          id: itemId,
          itemType: itemType,
          parentId: parentId,
          actionType: "remove"
        });
        return;
      }

      Bookmarks.Backup.setChangesMaked();

      if( _switchOffListeners ){
        return;
      }

      var svc = self.serviceInst();

      if (itemType != svc.TYPE_BOOKMARK && itemType != svc.TYPE_FOLDER) {
        return; // ignore changes of not bookmark and not folder
      }

      if( isIgnoredId( parentId ) || isIgnoredId( itemId ) ){
        return; // ignore changing items in places root
      }

      delayedRun(function(){
        var globalId = getGlobalId(itemId);
        if(globalId){
          Bookmarks.addChanges( ["removedIds"], globalId );
        }
        fvd_sync_Storage.removeBookmarkGuid( itemId );
      });
    };

    this.onBeforeItemRemoved = function(){

    };

  };

  function init() {
    var svc = self.serviceInst();
    _rootIds.push( svc.bookmarksMenuFolder );
    _rootIds.push( svc.toolbarFolder );
    _rootIds.push( svc.unfiledBookmarksFolder );
    refreshIgnoreIds();
  }

  function isIgnoredId(id) {
    return _ignoreToSyncIds.indexOf( id ) != -1;
  }
  function isRootId(id) {
    return _rootIds.indexOf(id) != -1;
  }


  function refreshIgnoreIds() {

    var svc = self.serviceInst();

    var result = [];

    function processId( id, callback ){

      getFolderContents( id, {
        includeSub: false
      }, function( children ){

        fvd_sync_Async.arrayProcess( children, function( item, arrayProcessCallback ){

          if( _rootIds.indexOf( item.id ) == -1 ){
            result.push( item.id );

            if( item.type == "folder" ){
              return processId( item.id, arrayProcessCallback );
            }

          }

          arrayProcessCallback();


        }, function(){

          callback();

        } );


      } );


    }

    processId( svc.placesRoot, function(){

      result.push( svc.placesRoot );

      _ignoreToSyncIds = result;

    } );

  }

  function createGUID(itemId){
    fvd_sync_Storage.setBookmarkGUID(itemId);
  }

  function annoService(){
    if( !_annotationService ){
      _annotationService = Components.classes["@mozilla.org/browser/annotation-service;1"].getService(Ci.nsIAnnotationService);
    }
    return _annotationService;
  }

  function normalizeGuidsStorage(cb) {
    var svc = self.serviceInst();

    var guidIdsMap = {};
    var allGuidsData = fvd_sync_Storage.getBookmarkGuidsAll();
    for(let guidData of allGuidsData) {
      if(guidData.guid && guidData.id) {
        if(!guidIdsMap[guidData.guid]) {
          guidIdsMap[guidData.guid] = [];
        }
        guidIdsMap[guidData.guid].push(guidData.id);
      }
    }

    // find more than ids per guid
    let guidsMoreThanOne = {};
    for(let guid in guidIdsMap) {
      let ids = guidIdsMap[guid];
      if(ids.length > 1) {
        guidsMoreThanOne[guid] = ids;
      }
    }

    _turnOffListeners();
    var anyChangesMade = false;
    try {
      for(let guid in guidsMoreThanOne) {
        let ids = guidsMoreThanOne[guid];
        dump("Found unnormalized guid " + guid + " - " + ids.length + " ids\n");
        let existsBookmarks = [];
        for(let id of ids) {
          if(bookmarkExists(id)) {
            existsBookmarks.push(id);
          }
        }
        let keepId = 0;
        if(existsBookmarks.length) {
          // keep the first bookmark from the list
          keepId = existsBookmarks[0];
        }
        for(let id of ids) {
          if(id === keepId) {
            continue;
          }
          remove(id);
          fvd_sync_Storage.removeBookmarkGuid(id);
          anyChangesMade = true;
          dump("remove " + id + "\n");
        }
      }
    }
    catch(ex) {
      dump("Fail to normalize bookmarks list: " + ex + "\n");
    }
    _turnOnListeners();

    fvd_sync_Async.chain([
      function(next) {
        if(!anyChangesMade) {
          return next();
        }
        dump("Changes was made, dump to disk!\n");
        // need to reload ids DB
        fvd_sync_Storage.reloadBookmarksGuidsDB()
          .then(next)
          .catch(next);
      },
      cb
    ]);
  }

  function createGUIDS(callback) {
    var bookmarks = null;
    var needCreateGuidsFor = [];
    fvd_sync_Async.chain( [
      function( chainCallback ){
        self.getAllBookmarks( {
          onlyIds: true
        }, function( _bookmarks ){
          bookmarks = _bookmarks;
          chainCallback();
        } );
      },
      function() {
        for(let bookmark of bookmarks) {
          let guid = fvd_sync_Storage.getBookmarkGuid(bookmark.id);
          if(!guid) {
            needCreateGuidsFor.push(bookmark.id);
          }
        }
        self.createGuidsProgress.max = needCreateGuidsFor.length;
        self.createGuidsProgress.current = 0;
        for(let id of needCreateGuidsFor) {
          createGUID(id);
        }
        // remove guids for not exists bookmarks
        var guidsData = fvd_sync_Storage.getBookmarkGuidsAll();
        for(let guidData of guidsData) {
          if(!bookmarkExists(guidData.id)) {
            fvd_sync_Storage.removeBookmarkGuid(guidData.id);
          }
        }
        callback();
      }

    ] );

  }

  function getDescription( id ){
    try{
      return annoService().getItemAnnotation( id, "bookmarkProperties/description" );
    }
    catch( ex ){
      return "";
    }
  }

  function setDescription( id, description ){
    try{
      annoService().setItemAnnotation( id, "bookmarkProperties/description", description, 0, annoService().EXPIRE_NEVER );
    }
    catch( ex ){
    }
  }

  function getIndex( id ){

    var svc = self.serviceInst();

    return svc.getItemIndex( id );

  }

  function getGlobalId(id) {
    var s = self.serviceInst();
    if(s.bookmarksMenuFolder == id) {
      return "menu";
    }
    if(s.toolbarFolder == id) {
      return "toolbar";
    }
    if(s.unfiledBookmarksFolder == id) {
      return "unsorted";
    }
    return fvd_sync_Storage.getBookmarkGuid(id);
  }

  function getId(globalId) {
    var s = self.serviceInst();
    if( globalId == "menu" ){
      return s.bookmarksMenuFolder;
    }
    if( globalId == "toolbar" ){
      return s.toolbarFolder;
    }
    if( globalId == "unsorted" ){
      return s.unfiledBookmarksFolder;
    }
    return fvd_sync_Storage.getBookmarkIdByGuid(globalId);
  }

  function bookmarkExists( id ){

    try{
      self.serviceInst().getItemTitle( id );
      return true;
    }
    catch( ex ){
      return false;
    }

  }

  function isURIAllowed(uri){
    if(!uri){
      return true;
    }
    if(uri.indexOf("place:") === 0){
      return false;
    }
    return true;
  }

  function isFeed( id, callback ){

    return Livermarks.isLivemark( id, callback );

  }

  function _nodesListToArray( folderNode ){

    folderNode.containerOpen = true;

    var result = [];

    for (var i = 0; i < folderNode.childCount; ++i) {
      result.push( folderNode.getChild(i) );
    }

    return result;

  }

  function getFolderContents(folderId, params, callback) {
    params = params || {};
    if(typeof params.includeSub == "undefined") {
      params.includeSub = true;
    }
    var s = self.serviceInst();
    var history = Cc["@mozilla.org/browser/nav-history-service;1"]
       .getService(Ci.nsINavHistoryService);
    var query = history.getNewQuery();
    query.setFolders([folderId], 1);
    var result = history.executeQuery(query, history.getNewQueryOptions());
    var folderNode = result.root;
    var items = [];
    var nodesArray = _nodesListToArray( folderNode );

    fvd_sync_Async.arrayProcess(nodesArray, function( childNode, arrayProcessCallback) {
      if(childNode.type != Ci.nsINavHistoryResultNode.RESULT_TYPE_URI &&
        childNode.type != Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {
        return arrayProcessCallback();
      }

      if(childNode.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI && childNode.uri) {
        try{
          if(childNode.uri.indexOf( "place:" ) == 0){
            return arrayProcessCallback();
          }
        }
        catch( ex ){
          dump("Fail check url\n");
        }
      }

      var parentId = null;

      if(childNode.parent) {
        parentId = childNode.parent.itemId;
      }

      isFeed(childNode.itemId, function(feed) {
        if(feed) {
          return arrayProcessCallback();
        }
        if(params.onlyIds) {
          var item = {
            id: childNode.itemId,
          };
        }
        else {
          var item = {
            id: childNode.itemId,
            date: childNode.dateAdded ? Math.round(childNode.dateAdded/1000) : 0,
            global_id: getGlobalId(childNode.itemId),
            title: childNode.title,
            index: getIndex( childNode.itemId ),
            type: childNode.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI ? "bookmark" : "folder",
            description: getDescription( childNode.itemId ),
            parent_id: getGlobalId(parentId)
          };
          if(item.type == "bookmark") {
            item.url = childNode.uri;
          }
        }

        if(childNode.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {
          items.push(item);
          if(params.includeSub) {
            getFolderContents(item.id, params, function( subItems ){
              items = items.concat( subItems );
              arrayProcessCallback();
            });
          }
          else{
            arrayProcessCallback();
          }
        }
        else{
          items.push( item );
          arrayProcessCallback();
        }

      } );

    }, function(){

      callback( items );

    } );


  }

  function nativeUrl( url ){
    var iOService = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);

    return iOService.newURI( url, null, null );
  }

  function checkRootIsFolderParentForBookmark(bookmarkId) {
    var currentId = bookmarkId;
    var svc = self.serviceInst();
    for(var i = 0; i != 10000; i++) {
      try {
        currentId = svc.getFolderIdForItem(currentId);
        if(!currentId) {
          break;
        }
        if(isRootId(currentId)) {
          return true;
        }
      }
      catch(ex) {
        _dbg("Fail to get parentId " + ex);
        break;
      }
    }
    return false;
  }

  function remove( id ){
    EverSyncLogs["syncLog"].profile.start("removebookmarks:remove");

    EverSyncLogs["syncLog"].profile.start("removebookmarks:remove:checkexists");
    if( !bookmarkExists(id) ){
      EverSyncLogs["syncLog"].profile.end("removebookmarks:remove:checkexists");
      return false;
    }
    EverSyncLogs["syncLog"].profile.end("removebookmarks:remove:checkexists");

    var s = self.serviceInst();
    _dbg("Remove: " + id + " (" + self.serviceInst().getItemTitle(id) + ") (parent - " +
      self.serviceInst().getFolderIdForItem(id) + ")");
    if( id == s.bookmarksMenuFolder || id == s.toolbarFolder || id == s.unfiledBookmarksFolder ) {
      _dbg("Can't remove " + id + " because it root folder");
      return false; // cant remove root folder
    }

    var result = true;

    try{
      EverSyncLogs["syncLog"].profile.start("removebookmarks:remove:removeItem");
      self.serviceInst().removeItem( id );
      EverSyncLogs["syncLog"].profile.end("removebookmarks:remove:removeItem");
    }
    catch( ex ){
      dump("error while remove: " + ex + "\n");
      result = false;
    }

    EverSyncLogs["syncLog"].profile.end("removebookmarks:remove");

    return result;

  }

  function getDateAdded( id ){

    var s = self.serviceInst();

    try{
      return Math.round( s.getItemDateAdded( id ) / 1000 );
    }
    catch( ex ){
      return null;
    }
  }

  this.getParentId = function( globalId ){

    try{
      var id = getId( globalId );

      var parentId = this.serviceInst().getFolderIdForItem( id );

      return getGlobalId( parentId );
    }
    catch( ex ){

      return null;

    }

  };

  this.getGlobalId = function(id) {
    return getGlobalId(id);
  };

  this.getAllParents = function( globalId ){

    var parents = [];

    var id = globalId;

    while( !this.isRootFolder( globalId ) ){

      var parentId = this.getParentId( globalId );

      if( !parentId ){
        break;
      }

      parents.push( parentId );

      globalId = parentId;

    }

    return parents;

  };


  this.isRootFolder = function( globalId ){

    if( globalId == "menu" || globalId == "toolbar" || globalId == "unsorted" ){
      return true;
    }

    return false;

  };

  this.getAllGuids = function(){

    var guidsData = fvd_sync_Storage.getBookmarkGuidsAll();

    var guids = [];

    guidsData.forEach( function( guidData ){
      guids.push( guidData.guid );
    } );

    return guids;

  };

  this.remove = function( globalId ) {
    _withoutListeners(function() {
      var id = getId( globalId );

      if( id ) {
        remove( id );
        fvd_sync_Storage.removeBookmarkGuid( id );
      }
      else {
        _dbg("Can't remove " + globalId + " because not found");
      }
    });
  };

  this.removeAllBookmarks = function( params, callback ) {
    _dbg("Remove all bookmarks");
    params = params || {};
    params.maxDeleteInline = params.maxDeleteInline || 1000;
    EverSyncLogs["syncLog"].profile.start("removebookmarks:getallbookmarks");
    this.getAllBookmarks( null, function( bookmarks ){
      EverSyncLogs["syncLog"].profile.end("removebookmarks:getallbookmarks");
      _turnOffListeners();
      // remove bookmarks with timeouts
      var bi = 0;
      fvd_sync_Async.cc(function(next) {
        var countRemoved = 0,
            bookmark = null;
        self.serviceInst().runInBatchMode({
          runBatched: function() {
            for(; countRemoved != params.maxDeleteInline; bi++, countRemoved++) {
              bookmark = bookmarks[bi];
              if(!bookmark) {
                // end list of bookmarks
                _returnListeners();
                fvd_sync_Storage.removeAllBookmarksGuids();
                if(callback) {
                  callback();
                }
                return;
              }
              remove( bookmark.id );
            }

            if(typeof setTimeout != "undefined") {
              setTimeout(function() {
                next();
              }, 500);
            }
            else {
              next();
            }
          }
        }, null);
      });
    });
  };

  this.changeGlobalId = function(oldGlobalId, newGlobalId) {
    _dbg("Change globalId " + oldGlobalId + " to " + newGlobalId);
    var id = getId(oldGlobalId);
    if(id) {
      // remove old bookmark guid
      fvd_sync_Storage.removeBookmarkGuid(id);
      // set new bookmark guid
      fvd_sync_Storage.setBookmarkGUID(id, newGlobalId);
    }
  };

  this.saveList = function( bookmarks, params, callback, oneItemSaveCallback ){
    _dbg("Save bookmarks list of " + bookmarks.length + " items");
    var params = params || {};
    params.maxSaveInline = params.maxSaveInline || 1000;
    if(params.async) {
      //dump("save list of bookmarks in async way\n");
    }
    else {
      //dump("save list of bookmarks in sync way\n");
    }
    // extract folders first

    var folders = {};
    var removeIndexes = [];

    function _getDepth(b, curr) {
      curr = curr || 0;
      if(curr > 100) {
        return 0;
      }
      if(folders[b.parent_id]) {
        var d = _getDepth(folders[b.parent_id], curr + 1);
        return 1 + d;
      }
      return 0;
    }
    bookmarks.forEach( function( bookmark, index ){
      if( bookmark.type == "folder" ){
        folders[bookmark.global_id] = bookmark;
      }
    } );
    bookmarks.forEach( function( bookmark, index ){
      bookmark._depth = _getDepth(bookmark);
    } );
    bookmarks.sort(function(b1, b2) {
      var a = b1._depth, b = b2._depth;
      if(b1._depth == b2._depth) {
        a = b1.index;
        b = b2.index;
      }
      return a-b;
    });

    function getParent( bookmark ){
      if( bookmark.parent_id == null ){
        return null;
      }
      if(folders[bookmark.parent_id]) {
        return folders[bookmark.parent_id];
      }
      return null;
    }

    function save( bookmark, callListener ){
      if(typeof callListener == "undefined") {
        callListener = true;
      }
      EverSyncLogs["syncLog"].profile.start("removebookmarks:savelist:getParent");
      var parent = getParent( bookmark );
      EverSyncLogs["syncLog"].profile.end("removebookmarks:savelist:getParent");
      if( parent ){
        save( parent );
      }
      EverSyncLogs["syncLog"].profile.start("savelist:save");
      if( self.save( bookmark ) ){
      }
      else{
        dump( "Fail save: " + bookmark.global_id + "\n" );
      }
      if(folders[bookmark.global_id]) {
        delete folders[bookmark.global_id];
      }
      if( oneItemSaveCallback && callListener ){
        oneItemSaveCallback();
      }
      EverSyncLogs["syncLog"].profile.end("savelist:save");
    }

    // only sync way for now, to speed up bookmarks saving by batch actions
    _turnOffListeners();
    var bi = 0;
    fvd_sync_Async.cc(function(next) {
      var countSaved = 0,
          bookmark = null;
      self.serviceInst().runInBatchMode({
        runBatched: function() {
          _dbg("Start save batched " + bi + " - " + (bi + params.maxSaveInline) + "/" + bookmarks.length);
          // save bookmarks
          for(; countSaved != params.maxSaveInline; bi++, countSaved++) {
            bookmark = bookmarks[bi];
            if(!bookmark) {
              _dbg("Batch save complete");
              // end list of bookmarks
              _returnListeners();
              if(callback) {
                callback();
              }
              return;
            }
            EverSyncLogs["syncLog"].profile.start("removebookmarks:savelist:save_bookmark");
            save( bookmark );
            EverSyncLogs["syncLog"].profile.end("removebookmarks:savelist:save_bookmark");
          }
          // go to next bookmarks portion
          if(typeof setTimeout != "undefined") {
            setTimeout(function() {
              next();
            }, 1000);
          }
          else {
            next();
          }
        }
      }, null);
    });
  };

  this.save = function(bookmark) {
    var result = null;
    _withoutListeners(function() {
      result = self._save(bookmark);
    });
    return result;
  };

  this._save = function(bookmark) {
    EverSyncLogs["syncLog"].profile.start("removebookmarks:savelist:save_bookmark:getIdParent");
    var parentId = getId(bookmark.parent_id);
    EverSyncLogs["syncLog"].profile.end("removebookmarks:savelist:save_bookmark:getIdParent");

    if(!parentId) {
      dump("Fail get parent id for " + bookmark.global_id + "\n");
    }
    EverSyncLogs["syncLog"].profile.start("removebookmarks:savelist:save_bookmark:getId");
    var id = getId(bookmark.global_id);
    EverSyncLogs["syncLog"].profile.end("removebookmarks:savelist:save_bookmark:getId");
    if(isIgnoredId(id) || isRootId(id)) {
      // ignored and root ids not exists for user, hide it
      return false;
    }

    var result = true;

    if(bookmark.type == "folder") {
      if(id && bookmarkExists(id)) {
        // already exists folder, only update title and position
        this.serviceInst().setItemTitle( id, bookmark.title );
        try {
          this.serviceInst().moveItem( id, parentId, bookmark.index );
        }
        catch(ex) {
          dump( ex + " (Fail move item "+id+" to "+parentId+")\n" );
        }
      }
      else {
        dump("Create new folder: " + bookmark.global_id + ", " + bookmark.title + "\n");
        // create new folder
        id = this.serviceInst().createFolder(parentId, bookmark.title, bookmark.index);
        if( id ){
          fvd_sync_Storage.setBookmarkGUID(id, bookmark.global_id);
        }
        else{
          result = false;
        }
      }

    }
    else if(bookmark.type == "bookmark") {
      if(!isURIAllowed(bookmark.url)){
        return false;
      }
      if(id && bookmarkExists(id)) {
        // already exists bookmark, update params
        this.serviceInst().setItemTitle( id, bookmark.title );
        this.serviceInst().changeBookmarkURI( id, nativeUrl( bookmark.url ) );
        try{
          this.serviceInst().moveItem( id, parentId, bookmark.index );
        }
        catch( ex ){
          dump( ex + " (Fail move item "+id+" to "+parentId+")\n" );
        }
      }
      else{
        // create new bookmark
        try{
          EverSyncLogs["syncLog"].profile.start("removebookmarks:savelist:save_bookmark:insertBookmark");
          id = this.serviceInst().insertBookmark( parentId, nativeUrl( bookmark.url ), bookmark.index, bookmark.title );
          EverSyncLogs["syncLog"].profile.end("removebookmarks:savelist:save_bookmark:insertBookmark");
          if( id ){
            try{
              EverSyncLogs["syncLog"].profile.start("removebookmarks:savelist:save_bookmark:setGUID");
              fvd_sync_Storage.setBookmarkGUID( id, bookmark.global_id );
              EverSyncLogs["syncLog"].profile.end("removebookmarks:savelist:save_bookmark:setGUID");
            }
            catch( ex ){
              dump( ex + "\n" );
              throw ex;
            }
          }
          else{
            result = false;
          }
        }
        catch( ex ){
          return false;
        }

      }

    }

    if( typeof bookmark.description != "undefined" ){

      if( id ){

        // destiptions only allowed for bookmarks now
        if( bookmark.type == "bookmark" ){
          setDescription( id, bookmark.description );
        }

      }

    }

    //dump("Saved!\n");

    return result;

  };

  this.serviceInst = function(){

    if( !_navBookmarksService ){
      _navBookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
    }

    return _navBookmarksService;

  };


  this.getAllBookmarks = function( params, callback ){
    var dirsToGet = [
      this.serviceInst().bookmarksMenuFolder,
      this.serviceInst().toolbarFolder,
      this.serviceInst().unfiledBookmarksFolder
    ];

    var bookmarks = [];

    fvd_sync_Async.arrayProcess(dirsToGet, function(rootDir, arrayProcessCallback) {
      getFolderContents(rootDir, params, function(_bookmarks) {
        if(_bookmarks) {
          bookmarks = bookmarks.concat(_bookmarks);
        }
        arrayProcessCallback();
      });
    }, function() {
      callback(bookmarks);
    });
  };

  this.getFolderContents = function( globalId, params, callback ){
    if(typeof params == "function") {
      callback = params;
      params = {};
    }
    var id = 0;
    if(typeof globalId == "number") {
      id = globalId;
    }
    else {
      id = getId( globalId );
    }
    if( !id ){
      return callback( [] );
    }
    getFolderContents( id, params, callback );
  };

  this.getBookmarkById = function( globalId, callback ){

    var id = null;

    fvd_sync_Async.chain([

      function( chainCallback ){

        id =  getId( globalId );

        if( !id ){
          return callback( null );
        }
        if(isIgnoredId(id) || isRootId(id)) {
          // ignored and root ids not exists for user, hide it
          return callback(null);
        }

        chainCallback();

      },

      function( chainCallback ){

        if( !bookmarkExists( id ) ){
          return callback( null );
        }

        chainCallback();

      },

      function( chainCallback ){

        isFeed( id, function( aIsFeed ){

          if( aIsFeed ){
            return callback( null );
          }

          chainCallback();

        } );

      },

      function(){

        var svc = self.serviceInst();

        var parentId = svc.getFolderIdForItem( id );

        try{
          var item = {
            id: id,
            date: getDateAdded( id ),
            global_id: getGlobalId ( id ),
            title: svc.getItemTitle( id ),
            index: getIndex( id ),
            type: svc.getItemType( id ) == svc.TYPE_BOOKMARK ? "bookmark" : "folder",
            description: getDescription( id ),
            parent_id: getGlobalId( parentId )
          };

          if( item.type == "bookmark" ){
            item.url = svc.getBookmarkURI( id ).spec;
            if(!isURIAllowed(item.url)){
              // bookmark has not allowed url
              return callback(null);
            }
          }
          else{

          }

        }
        catch( ex ){

          dump( "FAIL get info for " + svc.getItemTitle( id ) + "("+id+"), " + ex + "\n" );

        }

        callback( item );

      }

    ]);

  };

  this.aCreateGUIDS = function(callback) {
    fvd_sync_Async.chain([
      createGUIDS,
      normalizeGuidsStorage,
      callback
    ]);
  };

  this.serviceInst().addObserver( observer, false );

  this.init = function( aBoomarks ){
    Bookmarks = aBoomarks;
    init();
  };

  this.onInitialized = function() {
    fvd_sync_Storage.onInitialized.apply(fvd_sync_Storage, arguments);
  };
};

var bmkService = new bmkServiceClass();
