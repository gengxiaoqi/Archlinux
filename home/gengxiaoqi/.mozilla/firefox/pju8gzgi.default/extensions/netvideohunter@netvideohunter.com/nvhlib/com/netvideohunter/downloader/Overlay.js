Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/UrlUtils.js");
var EXPORTED_SYMBOLS = ["Overlay"];

var Overlay = function (main, window, document) {
	var self = this
	var onMediaAdded = function (event) {
		this.updateCounter()
		this.iconAnim.start()
	}

	var onMediaRemoved = function (event) {
		this.updateCounter()
	}

	var onMediaListCleared = function (event) {
		this.updateCounter()
	}

	var onEnabledChanged = function (event) {
		if (event.value == false) {
			window.document.getElementById("netvideohunter-button").setAttribute("disabled", true);
			window.document.getElementById("netvideohunter-toolbarbutton").setAttribute("disabled", true);
		} else {
			window.document.getElementById("netvideohunter-button").removeAttribute("disabled");
			window.document.getElementById("netvideohunter-toolbarbutton").removeAttribute("disabled")
		}
	}

	this.updateCounter = function () {
		var counter = window.document.getElementById("netvideohunter-mediacounter");
		counter.setAttribute("value", self.main.mediaList.getLength());
	}

	this.iconAnim = new function () {
		var interval = 0;
		var counter = 0;
		var statusbarButton = null;
		var toolbarButton = null;
		var that = this;

		this.start = function () {

			this.stop();
			counter = 0;
			statusbarButton = window.document.getElementById("netvideohunter-button");
			toolbarButton = window.document.getElementById("netvideohunter-toolbarbutton");
			interval = window.setInterval(function () {
				if (counter >= 10) {
					that.stop()
				} else {
					self.mediaListTab = self.getTabByUrl("chrome://netvideohunter/content/mediaList.xul");
					if (counter % 2 == 0) {
						if (statusbarButton) statusbarButton.style.opacity = 0.4
						if (toolbarButton) toolbarButton.style.opacity = 0.4
						if (self.mediaListTab) self.mediaListTab.setAttribute("bold", "1");
					} else {
						if (statusbarButton) statusbarButton.style.opacity = 1
						if (toolbarButton) toolbarButton.style.opacity = 1
						if (self.mediaListTab) self.mediaListTab.setAttribute("bold", "0");
					}
					counter++
				}
			}, 300);

		}

		this.stop = function () {
			window.clearInterval(interval);
			if (statusbarButton) statusbarButton.style.opacity = 1
			if (toolbarButton) toolbarButton.style.opacity = 1
			statusbarButton = null
			toolbarButton = null
		}

	}

	this.openMediaListWindow = function () {
		if (!main.pref.getBoolPref("extensions.netvideohunter.openInTab")) {
			this.mediaListWin = this.window.openDialog("chrome://netvideohunter/content/mediaList.xul", "netvideohunterMediaListWin",
				"dialog=no,centerscreen", this.main, this.window);
			this.mediaListWin.focus();
			main.mediaListWindow = this.mediaListWin;

		} else {
			var tab = this.openTabOnce("chrome://netvideohunter/content/mediaList.xul", true);
			this.mediaListTab = tab;
			this.mediaListTab.addEventListener("unload", this.onMediaListTabUnload, true);

		}
	}

	this.onMediaListTabUnload = function (event) {
		self.mediaListTab = null;
	}

	this.iconClicked = function (event) {
		if (event.button == 0) {
			self.openMediaListWindow();
		} else if (event.button == 1) {
			main.downloadMostRecent();
		}
	}

	this.updateIconsAppearance = function () {
		self.toolbarButton.addOnce();
		var statusbarpanel = this.window.document.getElementById("netvideohunter-statusbar");
		try {
			if (main.pref.getBoolPref("extensions.netvideohunter.icon.statusbar")) {
				statusbarpanel.setAttribute("hidden", "false");
			} else {
				statusbarpanel.setAttribute("hidden", "true");
			}
		} catch (e) {
			main.pref.setBoolPref("extensions.netvideohunter.icon.statusbar", false);
			statusbarpanel.setAttribute("hidden", "true");
		}
		var contextMenuItem = this.window.document.getElementById("netvideohunter-menuitem");
		try {
			if (this.main.pref.getBoolPref("extensions.netvideohunter.icon.context")) {
				contextMenuItem.setAttribute("hidden", "false");
			} else {
				contextMenuItem.setAttribute("hidden", "true");
			}
		} catch (e) {
			main.pref.setBoolPref("extensions.netvideohunter.icon.context", false);
			contextMenuItem.setAttribute("hidden", "false");
		}
	}

	this.onLoad = function (e) {
		Components.utils.import("resource://nvhlib/com/netvideohunter/utils/ToolbarButton.js");
		self.toolbarButton = new ToolbarButton("netvideohunter-toolbarbutton", "extensions.netvideohunter.icon.toolbarItemInstalled");
		self.updateIconsAppearance();

		self.main.addEventListener("enabledChanged", onEnabledChanged, self);
		self.main.mediaList.addEventListener("itemAdded", onMediaAdded, self);
		//self.main.mediaList.addEventListener("itemUpdated",onMediaUpdated,self);
		self.main.mediaList.addEventListener("itemRemoved", onMediaRemoved, self);
		self.main.mediaList.addEventListener("cleared", onMediaListCleared, self);
		var statusbarButton = window.document.getElementById("netvideohunter-button")
		var toolbarButton=window.document.getElementById("netvideohunter-toolbarbutton")
		if (main.enabled == false) {
			if(statusbarButton) statusbarButton.setAttribute("disabled", true);				
			if(toolbarButton) toolbarButton.setAttribute("disabled", true);
		} else {
			if(statusbarButton) statusbarButton.removeAttribute("disabled");
			if(toolbarButton) toolbarButton.removeAttribute("disabled");
		}

		self.updateCounter();
		self.regPrefObserver();

		Logger.log("Overlay onLoad");
	}

	this.onUnload = function (e) {

		self.main.removeEventListener("enabledChanged", onEnabledChanged)
		//self.main.mediaList.removeEventListener("itemUpdated",onMediaUpdated)
		self.main.mediaList.removeEventListener("itemAdded", onMediaAdded)
		self.main.mediaList.removeEventListener("itemRemoved", onMediaRemoved)
		self.main.mediaList.removeEventListener("cleared", onMediaListCleared)
		self.unregPrefObserver();

	}

	var prefBranch;

	this.prefObserver = {
		observe: function (subject, topic, data) {
			self.updateIconsAppearance();
		}
	}

	this.regPrefObserver = function () {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
			Components.interfaces.nsIPrefService);
		prefBranch = prefs.getBranch("extensions.netvideohunter.icon.");
		prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);
		prefBranch.addObserver("", this.prefObserver, false);
	}

	this.unregPrefObserver = function () {
		try {
			prefBranch.removeObserver("", this.prefObserver);
		} catch (err) {

		}
	}

	this.main = main;
	this.mediaListWin = null;
	this.mediaListTab = null;
	this.window = window;
	this.toolbarButton = null;
	this.window.addEventListener("load", this.onLoad, false);

	this.window.addEventListener("unload", this.onUnload, false);

	this.openTabOnce = function (url, selectTab) {
		var tabbrowser = this.getTabBrowser();
		if(!tabbrowser) return
		var tab = this.getTabByUrl(url);
		if (tab) {
			if (selectTab) {
				tabbrowser.selectedTab = tab;
				tabbrowser.ownerDocument.defaultView.focus();
			}
			return tab;
		}
		tab = tabbrowser.addTab(url);
		if (selectTab) {
			tabbrowser.selectedTab = tab;
			tabbrowser.ownerDocument.defaultView.focus();
		}
		return tab;
	}

	this.getTabByUrl = function (url) {
		var tabbrowser = this.getTabBrowser();
		if(!tabbrowser || !tabbrowser.browsers) return
		// Check each tab of this browser instance
		var numTabs = tabbrowser.browsers.length;
		for (var index = 0; index < numTabs; index++) {
			var currentBrowser = tabbrowser.getBrowserAtIndex(index);
			if (url == currentBrowser.currentURI.spec) {
				return tabbrowser.tabContainer.childNodes[index];
			}

		}
		return null;
	}

	this.getTabBrowser = function () {
		var tabbrowser = window.gBrowser;
		if (!tabbrowser) {
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var tabbrowser = wm.getMostRecentWindow("navigator:browser");
		}
		return tabbrowser;
	}

	this.onDisableClick = function (event) {
		main.enabled = !main.enabled;

	}

	this.onIgnoreClick = function (event) {
		var currentSite = this.getCurrentSite();
		if (currentSite) {
			if (main.ignoreSites.getItemById(currentSite) === null) {
				main.ignoreSites.addItem({
					id: currentSite
				});
			} else {
				main.ignoreSites.removeItem(currentSite);
			}
		}
	}

	this.getCurrentSite = function () {
		var url = null;
		try {
			var url = window.gBrowser.currentURI.spec;
		} catch (e) {}
		if (!url) return null;

		return UrlUtils.hostFromUrl(url);
	}

	this.onIconPopupShow = function (event) {
		var strbundle = window.document.getElementById("netvideohunter-strings");

		// disable item:
		var disableItem = window.document.getElementById("netvideohunter-disablemenuitem");
		var label = (main.enabled) ? strbundle.getFormattedString("disableAll", []) : strbundle.getFormattedString("enableAll", []);
		disableItem.setAttribute("label", label);

		// ignore item:
		var ignoreItem = window.document.getElementById("netvideohunter-ignoremenuitem");

		var currentSite = this.getCurrentSite();
		var label;
		if (currentSite) {
			if (main.ignoreSites.getItemById(currentSite) === null) {
				label = strbundle.getFormattedString("disableOnThisSite", [currentSite]);
			} else {
				label = strbundle.getFormattedString("enableOnThisSite", [currentSite]);
			}
			ignoreItem.setAttribute("label", label);
			ignoreItem.setAttribute("hidden", false);

		} else {
			ignoreItem.setAttribute("hidden", true);
		}

	}

	this.onIconPopupHide = function (event) {
		var popup = window.document.getElementById("netvideohunter-iconpopup");
	}

}