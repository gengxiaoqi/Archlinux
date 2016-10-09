Components.utils.import("resource://nvhlib/com/netvideohunter/data/List.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/data/HashList.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/HttpRequest.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/EventDispatcher.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/Response.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/downloader/hunters/MultiHunter.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/downloader/hunters/GeneralHunter.js");
Components.utils.import("resource://gre/modules/Downloads.jsm");

var EXPORTED_SYMBOLS = ["Main"];

// === Main ===
var lastAddedUrl=null
var Main = new function () { // SINGLETON CLASS
		EventDispatcher.call(this);
		var self=this
		this.version = "1.20";
		this.ignoreDownloaded=[]

		var uniqueFile = function (aLocalFile) {

			while (!createFile(aLocalFile)) {
				var r = /(\d+)?(\.[^.]+)?$/;
				var m = r.exec(aLocalFile.leafName);
				if (m != null && typeof (m[1]) != 'undefined') {
					var newNum = Number(m[1]) + 1;
					aLocalFile.leafName = aLocalFile.leafName.replace(r, String(newNum) + m[2]);
				} else {
					aLocalFile.leafName = aLocalFile.leafName.replace(/(.)?(\.[^.]+)?$/, "$1 1$2");
				}
			}
			return aLocalFile;
		}

		var createFile = function (file) {
			try {
				file.create(0, 0777)
				return true;
			} catch (e) {
				if (e.name == "NS_ERROR_FILE_ALREADY_EXISTS") {
					return false;
				}
				return true;
			}
		}

		var getDefaultDownloadDir = function () {

			var dir;
			var downloadPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("browser.download.");

			// 1. try last used download directory
			try {
				dir = downloadPrefs.getComplexValue("lastDir", Components.interfaces.nsILocalFile);
			} catch (e) {
				Logger.log(e);
			}
			var dirExists = dir && dir.exists();

			if (!dirExists) {
				// 2. try download manager default directory:
				try {
					var dlMgr = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);
					dir = dlMgr.userDownloadsDirectory;

				} catch (e) {
					Logger.log(e);
				}

				dirExists = dir && dir.exists();
				if (!dirExists) {
					// 3. use desktop directory:
					var fileLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
					dir = fileLocator.get("Desk", Components.interfaces.nsILocalFile);
				}
			}

			return dir;
		}

		// PUBLIC METHODS:

		this.observe = function (aSubject, aTopic, aData) {			
			try{ 
				var response=new Response(aSubject)
			}catch(e){
				Logger.log(e)
				return
			}
			if(response.status < 200 || response.status >= 300) return;	
			if(response.pageUrl && response.pageUrl.indexOf('chrome://netvideohunter/') === 0) {				
				return; // ignore media played in the built-in player
			}

			if(this.ignoreSites.getItemById(response.pageHost)!==null) return // ignored sites
			var id=MultiHunter.createIdFromResponse(response)
			//Logger.log('id: ',id)
			if(id===null) return
			if(self.mediaList.getItemById(id)!==null) return // ignore if we already captured this item
			if(self.ignoreDownloaded[id]) return; // ignore if already downloaded

			MultiHunter.hunt(response,function(err,mediaData){
				if(err) return err
				if(!mediaData) return				
				Logger.log('Adding media data:',mediaData)
				if(lastAddedUrl===mediaData.url) return
				self.mediaList.addItem(mediaData);
				lastAddedUrl=mediaData.url
			})
	
		}

		this.regListener = function () {
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.addObserver(this, "http-on-examine-response", false);
			observerService.addObserver(this, "http-on-examine-cached-response", false);
			observerService.addObserver(this, "http-on-examine-merged-response", false);
			//observerService.addObserver(this, "http-on-modify-request", false);
		}

		this.unregListener = function () {
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.removeObserver(this, "http-on-examine-response");
			observerService.removeObserver(this, "http-on-examine-cached-response");
			observerService.removeObserver(this, "http-on-examine-merged-response");
			//observerService.removeObserver(this, "http-on-modify-request");
		}

		var prefBranch;

		this.regPrefObserver = function () {
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
				Components.interfaces.nsIPrefService);
			prefBranch = prefs.getBranch("extensions.netvideohunter.");
			prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);
			prefBranch.addObserver("", self.prefObserver, false);
		}

		this.prefObserver = {
			observe: function (subject, topic, data) {
				if (data == "captureSwf") {
					GeneralHunter.captureSWF = subject.getBoolPref(data);
				}
				if (data == "disabled") {

				}
			}
		}

		this.unregPrefOBserver = function () {
			try {
				prefBranch.removeObserver("", this.prefObserver);
			} catch (err) {

			}
		}

		this.downloadMostRecent = function () {
			var lastId = this.mediaList.getLastId();
			if (typeof lastId !== 'undefined' && lastId !== null) this.download(lastId);
		}

		this.download = function (id, skipPrompt, forceUseCache, quality) {
			try {
				var mediaItem = this.mediaList.getItemById(id);	
						
				if (typeof (quality) != "undefined" && quality != null) {
					mediaItem.changeUrlToQuality(quality)
				}else{
					if(this.useBestQuality){
						mediaItem.changeUrlToQuality("best")
					}else{ 
						mediaItem.changeUrlToQuality("default")
					}
				}
				//start saving:
				this.saveUrl(mediaItem, skipPrompt, forceUseCache);
				mediaItem.downloadStarted = true;
				if (this.pref.getBoolPref("extensions.netvideohunter.list.removeAfterDownload")) {
					this.mediaList.removeItem(id);
					this.ignoreDownloaded[id]=true
				}
			} catch (e) {
				Logger.log(e);
			}
		}

		this.saveUrl = function (mediaItem, aSkipPrompt, forceUseCache) {
			var targetFileURI = this.getTargetFile(mediaItem.filename, aSkipPrompt);
			Logger.log(mediaItem)
			if (targetFileURI === false) return false;

			// make persist:
			var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);

			// Calculate persist flags.
			const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
			const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
			persist.persistFlags = flags;

			Logger.log("Cache key: " + mediaItem.cacheKey);
			var cacheKey = null;

			persist.persistFlags |= nsIWBP.PERSIST_FLAGS_FROM_CACHE;
			cacheKey = mediaItem.cacheKey;

			persist.persistFlags |= nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
			persist.persistFlags |= nsIWBP.PERSIST_FLAGS_DONT_CHANGE_FILENAMES

			var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService)

			var sourceURI = ioService.newURI(mediaItem.url, "UTF-8", null);
			var tr = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);
			Logger.log("is Private: " + mediaItem.fromPrivateBrowsing)
			tr.init(sourceURI, targetFileURI, "", null, null, null, persist, mediaItem.fromPrivateBrowsing);
			persist.progressListener = {
				onProgressChange: function (aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
					var percentComplete = (aCurTotalProgress / aMaxTotalProgress) * 100;
					//Logger.log(percentComplete +"%");
					tr.onProgressChange(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress);
				},
				onStateChange: function (aWebProgress, aRequest, aStateFlags, aStatus) {
					//Logger.log("status: "+aStatus);
					tr.onStateChange(aWebProgress, aRequest, aStateFlags, aStatus);
				},
				onDownloadStateChange: function (aState, aDownload) {
					//Logger.log("state:"+aState);
					tr.onDownloadStateChange(aState, aDownload);
				},
				onSecurityChange: function (prog, req, state, dl) {
					tr.onSecurityChange(prog, req, state, dl);
				}
			}
			var referrerURI = null;
			if (mediaItem.referrer) {
				try {
					referrerURI = ioService.newURI(mediaItem.referrer, "UTF-8", null)
				} catch (e) {
					Logger.log(e);
				}
			}
			try{
				// for Firefox version 36 and up
				persist.saveURI(sourceURI, cacheKey, referrerURI, mediaItem.referrerPolicy, mediaItem.uploadStream, null, targetFileURI, null);
			}catch(e){
				// for old Firefox
				persist.saveURI(sourceURI, cacheKey, referrerURI, mediaItem.uploadStream, null, targetFileURI, null);
			}

		}

		this.getTargetFile = function (fileName, aSkipPrompt) {

			var prefDirType = this.pref.getIntPref("extensions.netvideohunter.download.dirType");
			if (typeof (aSkipPrompt) == "undefined") {
				aSkipPrompt = (prefDirType != 1);
			}
			var askDownloadDir = (prefDirType == 1 && !aSkipPrompt);

			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var window = wm.getMostRecentWindow("navigator:browser");

			var inPrivateBrowsing = false;
			try {
				// Firefox 20 per-window private browsing
				Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
				inPrivateBrowsing = PrivateBrowsingUtils.isWindowPrivate(window)

			} catch (e) {
				// before Firefox 20
				try {
					var pbs = Components.classes["@mozilla.org/privatebrowsing;1"].getService(Components.interfaces.nsIPrivateBrowsingService);
					inPrivateBrowsing = pbs.privateBrowsingEnabled;
				} catch (e) {
					Logger.log(e);
				}
			}

			var downloadDir = getDefaultDownloadDir();

			if (!askDownloadDir) {
				if (prefDirType == 3) {
					try {
						var userDownloadDir = this.pref.getComplexValue("extensions.netvideohunter.download.customDir", Components.interfaces.nsILocalFile);
						if (userDownloadDir && userDownloadDir.exists()) {
							downloadDir = userDownloadDir;
						}
					} catch (e) {}

				}

				downloadDir.append(fileName);
				var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				return ioService.newFileURI(uniqueFile(downloadDir));
			}

			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
			fp.init(window, "NetVideoHunter Save", Components.interfaces.nsIFilePicker.modeSave);
			fp.displayDirectory = downloadDir;
			fp.defaultExtension = fileName.substr(fileName.lastIndexOf(".") + 1);
			fp.defaultString = fileName;

			if (fp.show() == Components.interfaces.nsIFilePicker.returnCancel || !fp.file)
				return false;

			// store the last save directory as a pref except in private browsing
			if (!inPrivateBrowsing) {
				var lastDownloadDir = fp.file.parent.QueryInterface(Components.interfaces.nsILocalFile);
				var downloadPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("browser.download.");
				downloadPrefs.setComplexValue("lastDir", Components.interfaces.nsILocalFile, lastDownloadDir);
			}

			return fp.fileURL;
		}

		this.__defineSetter__("enabled", function (value) {
			if (_enabled) {
				this.unregListener();
				this.pref.setBoolPref("extensions.netvideohunter.disabled", true);
			} else {
				this.regListener();
				this.pref.setBoolPref("extensions.netvideohunter.disabled", false);
			}
			_enabled = !_enabled
			this.dispatchEvent({
				type: 'enabledChanged',
				value: _enabled
			});
		});

		this.__defineGetter__("enabled", function () {
			return _enabled;
		});

		this.message = function (message) {
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var window = wm.getMostRecentWindow("navigator:browser");
			window.alert(message);

		}

		// CONSTRUCTOR:
		this.ignoreSites = new HashList('id', "extensions.netvideohunter.ignoreSites");
		this.ignoreSites.saveEachChange = true;
		this.mediaList = new HashList('id'); // list of com.netvideohunter.downloader.MediaData objects
		this.mediaList.limit=1000 // limit number of items to make sure the memory isn't filled with them 
		//this.mediaList.addEventListener("itemAdded",this.onMediaAdded,this);
		//this.mediaList.addEventListener("itemRemoved",this.onMediaRemoved,this);
		//this.mediaList.addEventListener("cleared",this.onMediaListClear,this);
		this.pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var _enabled = !this.pref.getBoolPref("extensions.netvideohunter.disabled");

		GeneralHunter.captureSWF = this.pref.getBoolPref("extensions.netvideohunter.captureSwf") || false;
		this.useBestQuality = this.pref.getBoolPref("extensions.netvideohunter.download.bestQuality") || false
		if (_enabled) {
			this.regListener();
		}

		this.regPrefObserver();

	}