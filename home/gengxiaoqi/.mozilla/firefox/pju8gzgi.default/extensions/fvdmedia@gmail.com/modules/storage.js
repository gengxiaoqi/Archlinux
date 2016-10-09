var EXPORTED_SYMBOLS = ["fvd_sync_Storage"];

var Cu = Components.utils;


try {
  // for old firefox versions need to import Promise
  Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js");
}
catch(ex) {

}

Components.utils.import("resource://fvd.sync.modules/misc.js");
var {fvd_sync_Config} = Components.utils.import("resource://fvd.sync.modules/config.js", {});
Components.utils.import("resource://fvd.sync.modules/log.js");

Components.utils.import("resource://gre/modules/Timer.jsm");
const {OS} = Components.utils.import("resource://gre/modules/osfile.jsm", {});
var {Task} = Cu.import("resource://gre/modules/Task.jsm", {});
var {Sqlite} = Components.utils.import("resource://gre/modules/Sqlite.jsm");

const DB_FILE = fvd_sync_Config.DB_FILE; // not used, only for migration older users to new JSON db
const DB_FILE_JSON = fvd_sync_Config.DB_FILE_JSON;
const STORAGE_FOLDER = fvd_sync_Config.STORAGE_FOLDER;

var dataIDtoGUID = {};
var dataGUIDtoID = {};

var DBSaver = function(filePath) {
  var needSave = false;
  function save() {
    dump("\nWhoaa, save JSON file " + filePath + "\n\n");
    var encoder = new TextEncoder();
    var data = encoder.encode(JSON.stringify(dataIDtoGUID));
    return OS.File.writeAtomic(filePath, data);
  }

  this.touch = function() {
    needSave = true;
  };

  this.save = function() {
    return save();
  };

  function _check() {
    setTimeout(function() {
      if(needSave) {
        needSave = false;
        save().then(_check)
          .catch(_check);
      }
      else {
        _check();
      }
    }, 1000);
  }
  _check();
};

function _fvd_sync_Storage(){
	var self = this;

	var observer = null; // for sending messages
  var saver;
  var initialized = false;

  var waitInitCallbacks = [];

	this.notifyObservers = function( message, aData ){
    observer.notifyObservers(null, message, aData);
	};

  this.isInitialized = function() {
    return initialized;
  };

  this.onInitialized = function(callback) {
    if(initialized) {
      return callback();
    }
    waitInitCallbacks.push(callback);
  };

	this._init = function() {
    observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

    var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
    file.append(STORAGE_FOLDER);

    if (!file.exists()) {
      file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
    }
    if (!file.exists() || !file.isDirectory()) {
      throw new Error("Fail to create EverSync folder in profile, it's critical issue\n");
    }
    var dbFile = file.clone();
    file.append(DB_FILE_JSON);
    saver = new DBSaver(file.path);

    dbFile.append(DB_FILE);
    if(dbFile.exists()) {
      // need to migrate old SQlite DB to JSON based database
      var storageService = Components.classes["@mozilla.org/storage/service;1"]
                                 .getService(Components.interfaces.mozIStorageService);
      return migrateOldDB(dbFile.path).then(function() {
        // need to rename old db file to not migrate again in future restarts
        dbFile.renameTo(null, DB_FILE + "_old");
      });
    }
    else {
      return loadBookmarksGuidsDb();
    }
	};

  function loadBookmarksGuidsDb() {
    var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
    file.append(STORAGE_FOLDER);
    file.append(DB_FILE_JSON);
    // read guids file
    if(!file.exists()) {
      // nothing to read
      return Promise.resolve();
    }
    return OS.File.read(file.path, {encoding: "utf-8"}).then(function(data) {
      // init data objects
      data = JSON.parse(data);
      dataIDtoGUID = data;
      for(var id in dataIDtoGUID) {
        var guid = dataIDtoGUID[id];
        dataGUIDtoID[guid] = id;
      }
    });
  }

  function migrateOldDB(filePath) {
    // consider using legacy generator function because older firefox versions don't support
    // declaration generators with asterix(I have made compatibility for PaleMoon especially)
    return Task.spawn(function() {
      let conn = yield Sqlite.openConnection({path: filePath});
      var query = "SELECT `id`, `guid` FROM `bookmarks_guids`";
      try {
        let result = yield conn.execute(query);
        for(let row of result) {
          let id = row.getResultByName("id");
          let guid = row.getResultByName("guid");
          dataIDtoGUID[id] = guid;
          dataGUIDtoID[guid] = id;
        }
        saver.touch();
      }
      finally {
        yield conn.close();
      }
    });
  }

	this.generateGUID = function() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 32;
		var randomstring = '';

		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}

		return randomstring;
	};

	/* Bookmarks guids */

	this.setBookmarkGUID = function(id, guid) {
	 	if(!guid) {
			guid = this.generateGUID();
		}
    if(dataIDtoGUID[id]) {
      // remove old guid to id mapping
      let oldGuid = dataIDtoGUID[id];
      if(dataGUIDtoID[oldGuid]) {
        delete dataGUIDtoID[oldGuid];
      }
    }
    if(dataGUIDtoID[guid] && dataGUIDtoID[guid] != id) {
      dump("Something strange happened, one GUID is mapped to many ids! Need to check guids database...\n");
      dump(guid + " => " + dataGUIDtoID[guid] + "(need " + id + ")\n");
    }

    dataIDtoGUID[id] = guid;
    dataGUIDtoID[guid] = id;
    saver.touch();
	};

	this.getBookmarkGuid = function(id) {
    return dataIDtoGUID[id];
	};

	this.getBookmarkGuidsAll = function() {
    var res = [];
    for(var id in dataIDtoGUID) {
      res.push({
        id: id,
        guid: dataIDtoGUID[id]
      });
    }
    return res;
	};

	this.getBookmarkIdByGuid = function( guid ){
    return dataGUIDtoID[guid];
	};

	this.removeBookmarkGuid = function(id) {
    if(dataIDtoGUID[id]) {
      var guid = dataIDtoGUID[id];
      delete dataIDtoGUID[id];
      delete dataGUIDtoID[guid];
      saver.touch();
    }
	};

	this.removeAllBookmarksGuids = function(){
		dataIDtoGUID = {};
    dataGUIDtoID = {};
    saver.touch();
	};

  this.reloadBookmarksGuidsDB = function() {
    // firstly dump db to disk, then load it
    return saver.save().then(function() {
      return loadBookmarksGuidsDb();
    });
  };

  var initPromise = this._init();
  initPromise.then(function() {
    initialized = true;
    self.notifyObservers("FVD.Sync.Initialized");
    waitInitCallbacks.forEach(function(callback) {
      callback();
    });
    waitInitCallbacks = [];
  });
  if(initPromise.catch) {
    initPromise.catch(function(err) {
      dump("Can't initialize FVD Synchronizer storage: " + err + "\n");
    });
  }
}

var fvd_sync_Storage = new _fvd_sync_Storage();
