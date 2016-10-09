Components.utils.import("resource://nvhlib/com/netvideohunter/net/HttpRequest.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");

var EXPORTED_SYMBOLS = ["MediaListWindow"];

var MediaListWindow = function (main, window) {
	this.main = main;
	this.document = window.document;
	var listBox = null;
	this.embedWindow = null;
	this.browser = null;

	var self = this;
	var homeLoaded = false;
	var firstUse = 1;

	var updateSelectButtons = function () {
		//var selButton=document.getElementById("removeSelectedButton");
		var downloadButton = self.document.getElementById("downloadSelectedButton");
		if (listBox.hasCheckedItem) {
			//selButton.setAttribute("disabled","false");
			downloadButton.setAttribute("disabled", "false");
		} else {
			//selButton.setAttribute("disabled","true");
			downloadButton.setAttribute("disabled", "true");
		}
	}

	var onMediaAdded = function (event) {
		self.updateTitle();
	}

	var onMediaUpdated = function (event) {
		self.updateTitle();
	}

	var onMediaRemoved = function (event) {
		self.updateTitle();
	}

	var onMediaListCleared = function (event) {
		self.updateTitle();
	}

	this.updateTitle = function () {
		var winElement = window.document.getElementById("netvideohunterMediaListWin");
		if (!winElement) {
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			winElement = wm.getMostRecentWindow("netvideohunter")
			if (winElement) winElement = winElement.document.getElementById("netvideohunterMediaListWin");
		}
		if (winElement) {
			winElement.setAttribute("title", "NetVideoHunter (" + self.main.mediaList.getLength() + ")");
		}

	}

	this.getPlayerSwfURI=function(){
		var path=__LOCATION__.parent.parent.parent.parent.parent
		path.append('bin')
		path.append('flowplayer-3.2.16.swf')
		var io = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var uri=io.newFileURI(path)

		return uri.asciiSpec
	}

	this.getPlayerHtmlURI=function(){
		var path=__LOCATION__.parent.parent.parent.parent.parent
		path.append('chrome')
		path.append('content')
		path.append('player.html')
		var io = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var uri=io.newFileURI(path)

		return uri.asciiSpec
	}

	this.onLoad = function (event) {
		this.playerSwfURI=this.getPlayerSwfURI()		

		this.document = window.document;
		listBox = this.document.getElementById("netvideohunterMediaList");
		if (this.main) {
			listBox.data = this.main.mediaList;
		}
		listBox.addEventListener("checked", this.itemChecked, false);
		updateSelectButtons();
		this.browser = this.document.getElementById("homeBrowser");

		var pref = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch)
		this.firstUse = (pref.getBoolPref("extensions.netvideohunter.firstUse")) ? 1 : 0;
		var infoIsOpen = (this.browser.boxObject.width > 0) ? 1 : 0;

		var main = this.main
		var self = this;
		var messageRequest = new HttpRequest()
		var nocache = new Date();
		nocache = Math.round(nocache.getTime() / (60 * 60))
		messageRequest.reqUrl = "http://www.netvideohunter.com/addon_message_id?nocache=" + nocache + "&infoisopen=" + infoIsOpen + "&firstuse=" + this.firstUse;
		messageRequest.onLoad = function (success, response) {
			if (success && response && response.length > 0) {
				var lastMessageId = pref.getIntPref("extensions.netvideohunter.lastMessageId");
				if (lastMessageId != response) {
					if (!infoIsOpen) {
						self.showHome();
					}
					pref.setIntPref("extensions.netvideohunter.lastMessageId", response);
				}
			}
		}
		messageRequest.send()
		pref.setBoolPref("extensions.netvideohunter.firstUse", false);
		if (infoIsOpen) {
			this.showHome();
		} else {
			this.document.getElementById("windowSplitter").addEventListener("click", this.onSplitterClick, false);
		}

		this.document.getElementById("netvideohunterWarning").setAttribute("hidden", this.main.enabled);
		this.main.addEventListener("enabledChanged", this.onEnabledChanged, this);
		this.main.mediaList.addEventListener("itemAdded", onMediaAdded, this);
		this.main.mediaList.addEventListener("itemUpdated", onMediaUpdated, this);
		this.main.mediaList.addEventListener("itemRemoved", onMediaRemoved, this);
		this.main.mediaList.addEventListener("cleared", onMediaListCleared, this);
		this.updateTitle();
		this.regLastWindowObserver();
	}

	this.onUnload = function (event) {
		this.document.getElementById("netvideohunterMediaList").removeEventListener("checked", this.itemChecked, false);
		this.document.getElementById("windowSplitter").removeEventListener("click", this.onSplitterClick, false);
		this.main.removeEventListener("enabledChanged", this.onEnabledChanged);
		this.main.mediaList.removeEventListener("itemAdded", onMediaAdded)
		this.main.mediaList.removeEventListener("itemUpdated", onMediaUpdated)
		this.main.mediaList.removeEventListener("itemRemoved", onMediaRemoved)
		this.main.mediaList.removeEventListener("cleared", onMediaListCleared)
		this.unregLastWindowObserver();
		var listBox = this.document.getElementById("netvideohunterMediaList");
		listBox.removeAllDataListener(); //to remove listBox from memory
	}

	this.regLastWindowObserver = function () {
		try {
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.addObserver(this.lastWindowObserver, "browser-lastwindow-close-granted", false);
		} catch (e) {
			Logger.log(e);
		}

	}

	this.unregLastWindowObserver = function () {
		try {
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.removeObserver(this.lastWindowObserver, "browser-lastwindow-close-granted");
		} catch (e) {
			Logger.log(e);
		}

	}

	this.lastWindowObserver = {
		observe: function (aSubject, aTopic, aData) {
			if (window && window.close) window.close();
		}
	}

	this.onEnabledChanged = function (event) {
		this.document.getElementById("netvideohunterWarning").setAttribute("hidden", this.main.enabled);
	}

	this.onSplitterClick = function () {
		if (!homeLoaded) {
			self.showHome();
		}
	}

	this.onBrowserClick = function () {

	}

	this.onOptionsClick = function () {
		this.showOptions();

	}

	this.onCloseOptionsClick = function () {
		this.showHome();
	}

	this.onClosePlayerClick = function () {
		this.showHome();
	}

	this.itemChecked = function (event) {
		updateSelectButtons();
	}

	this.onSelectAll = function (event) {
		listBox.checkAll();
		this.toggleAllNoneButtons()
	}

	this.onSelectNone = function (event) {
		listBox.checkNone();
		this.toggleAllNoneButtons()
	}

	this.toggleAllNoneButtons = function () {
		var selectAllIsHidden = (this.document.getElementById('selectAllButton').getAttribute('hidden') == 'true');
		this.document.getElementById('selectAllButton').setAttribute('hidden', !selectAllIsHidden);
		var selectNoneIsHidden = (this.document.getElementById('selectNoneButton').getAttribute('hidden') == 'true');
		this.document.getElementById('selectNoneButton').setAttribute('hidden', !selectNoneIsHidden);
	}

	this.performCommand = function (aCmd, aItem) {
		if (!aItem) {
			aItem = listBox.selectedItem;
		} else {
			while ((aItem.nodeName != "richlistitem") && aItem.parentNode) {
				aItem = aItem.parentNode;

			}
		}
		var id = aItem.getAttribute("id");

		if (aCmd == "onpopupshow") {
			var mediaId = aItem.getAttribute("id");
			var mediaItem = this.main.mediaList.getItemById(mediaId);
			if (mediaItem && mediaItem.qualityUrls && mediaItem.qualityUrls.length > 1) {
				var qualityUrls = mediaItem.qualityUrls;

				var popup = this.document.getElementById("itemMenu");
				var sep = this.document.createElement("menuseparator");
				sep.setAttribute("class", "itemMenu-qualityItem");
				popup.appendChild(sep);
				for (var i = 0; i < qualityUrls.length; i++) {
					var qualityItem = this.document.createElement("menuitem");
					var qualityName = qualityUrls[i].qualityName;
					qualityItem.setAttribute("label", "Download in " + qualityName + " quality");
					qualityItem.setAttribute("class", "itemMenu-qualityItem");
					qualityItem.addEventListener("click", function (id, qualityIdx) {
						return function (event) {
							window.com.netvideohunter.downloader.MediaListWindow_Instance.main.download(id, null, false, qualityIdx);
							window.com.netvideohunter.downloader.MediaListWindow_Instance.markDownloaded(id);
						}
					}(mediaId, i));

					popup.appendChild(qualityItem);
				}
			}
		}

		if (aCmd == "onpopuphide") {
			var qualityItems = this.document.getElementsByClassName("itemMenu-qualityItem");
			var popup = this.document.getElementById("itemMenu");
			while (popup.childNodes.length > 3) {
				popup.removeChild(popup.childNodes[popup.childNodes.length - 1]);
			}
		}

		if (aCmd == "download") {
			aItem.setAttribute("downloadStarted", true)
			this.main.download(id)
			aItem.selected = false
		}
		if (aCmd == "downloadcache") {
			aItem.setAttribute("downloadStarted", true)
			this.main.download(id, null, true)
			aItem.selected = false
		}
		if (aCmd == "openpage") {
			this.openPage(id)
		}
		if (aCmd == "play") {
			var mediaItem = this.main.mediaList.getItemById(id)
			this.showPlayer(mediaItem.url, mediaItem.contentType);
		}
		if (aCmd == "externalPlay") {
			this.main.playInExternal(this.main.mediaList.getItemById(id).url)
		}
		if (aCmd == "copy") {
			this.copyURL(id);
		}
		if (aCmd == "embed") {
			this.openEmbed(id);
		}

	}

	this.downloadSelected = function () {
		var ids = listBox.getCheckedIds()
		var titles = {};
		for (var i = 0; i < ids.length; i++) {
			var mediaTitle = main.mediaList.getItemById(ids[i]).title;

			while (typeof (titles[mediaTitle]) != 'undefined') {
				var r = /(\d+)$/;
				var m = r.exec(mediaTitle);
				if (m != null && typeof (m[1]) != 'undefined') {
					var newNum = Number(m[1]) + 1;
					mediaTitle = mediaTitle.replace(r, newNum);
				} else {
					mediaTitle = mediaTitle + " 1";
				}
			}
			main.mediaList.getItemById([ids[i]]).title = mediaTitle;
			this.markDownloaded(ids[i])
			this.main.download(ids[i], true);
			titles[mediaTitle] = true;
		}
	}

	this.markDownloaded = function (id) {
		this.document.getElementById(id).setAttribute("downloadStarted", true);
	}

	this.showPlayer = function (url, type) {

		this.openRightPane()
		this.browser.loadURI(this.getPlayerHtmlURI()+"?videoUrl=" + 
			encodeURIComponent(url) + "&type=" + encodeURIComponent(type)+"&swfURI="+encodeURIComponent(this.playerSwfURI))
		this.showRightPaneButton('closePlayerButton')
	}

	this.showHome = function () {
		this.openRightPane()
		this.browser.loadURI("http://netvideohunter.com/pages/addon-news-new?&version=" + this.main.version + "&firstuse=" + this.firstUse);
		this.homeLoaded = true;
		this.showRightPaneButton('optionsButton')
	}

	this.showOptions = function () {
		this.browser.loadURI("chrome://netvideohunter/content/options.xul");
		this.openRightPane()
		this.showRightPaneButton('closeOptionsButton');
	}

	this.openRightPane = function () {
		this.document.getElementById('windowSplitter').setAttribute('state', 'open');
	}

	// shows the button under the right pane and hides the others
	this.showRightPaneButton = function (buttonId) {
		var rightPaneButtonBar = this.document.getElementById("browserButtonBar")
		var buttons = rightPaneButtonBar.getElementsByTagName('button')
		for (var i = 0; i < buttons.length; i++) {
			var buttonEl = buttons[i]
			var id = buttonEl.getAttribute('id')
			if (id && id == buttonId) {
				buttonEl.setAttribute('hidden', 'false')
			} else {
				buttonEl.setAttribute('hidden', 'true')
			}
		}
	}

	this.addQueryParam = function (source, param, value) {
		if (source.indexOf("?") == -1) {
			source += "?";
		}
		urlsplit = source.split("?");
		urlsplit[1] += "&" + param + "=" + value;
		return urlsplit.join("?");
	}

	this.copyURL = function (id) {
		const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
		getService(Components.interfaces.nsIClipboardHelper);
		gClipboardHelper.copyString(this.main.mediaList.getItemById(id).url);

	}

	this.openPage = function (id) {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var w = wm.getMostRecentWindow("navigator:browser");
		var newTab = w.gBrowser.addTab(this.main.mediaList.getItemById(id).pageUrl);
		w.gBrowser.selectedTab = newTab;
	}

}