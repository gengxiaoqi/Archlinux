Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/ToolbarButton.js");

var EXPORTED_SYMBOLS = ["Options"];

// === Options ===

var Options=function (window){
	
	var getDefaultDownloadsFolder=function (){
		var dir;
		var dnldMgr = Components.classes["@mozilla.org/download-manager;1"]
									.getService(Components.interfaces.nsIDownloadManager);
		dir=dnldMgr.defaultDownloadsDirectory;
		if(!dir || !dir.exists()){
			var fileLoc = Components.classes["@mozilla.org/file/directory_service;1"]
										.getService(Components.interfaces.nsIProperties);
			dir=fileLoc.get("Desk", Components.interfaces.nsILocalFile);
		}
		return dir;
	}
	
	this.onLoad=function(event){		
		// hide the close button if opened inside the medialist window
		if(!window.opener){
			window.document.documentElement.getButton("cancel").setAttribute('hidden','true');
			window.document.documentElement.getButton("cancel").setAttribute('disabled','true');
			window.document.documentElement.getButton("accept").setAttribute('hidden','true');
			window.document.documentElement.getButton("accept").setAttribute('disabled','true');
			window.document.documentElement.setAttribute("dlgbuttons","");
		};
		var ignoreListBox = window.document.getElementById("netvideohunterIgnoreList");
		ignoreListBox.data=window.com.netvideohunter.downloader.Main.ignoreSites;
		window.document.getElementById("netvideohunterOptions").instantApply=true;
		window.document.getElementById("newIgnoreItem").addEventListener('keypress', this.newIgnoreItemKeyPress, true);
	}

	this.onUnload=function(event){
		
	}

	this.hasToolbarItem=function(){
		if(!this.toolbarButton) this.toolbarButton=new ToolbarButton("netvideohunter-toolbarbutton","extensions.netvideohunter.icon.toolbarItemInstalled");
		return this.toolbarButton.hasToolbarItem();
	}

	this.toolbarItemCheckboxChange=function(){
	
		var checked=window.document.getElementById("toolbarItemCheckbox").checked;
		if(!self.toolbarButton) self.toolbarButton=new ToolbarButton("netvideohunter-toolbarbutton","extensions.netvideohunter.icon.toolbarItemInstalled");
		if(checked){
			self.toolbarButton.addToolbarItem();
			window.focus();
			return true;
		}else{
			self.toolbarButton.removeToolbarItem();
			window.focus();
			return false;
		}
		
	}

	this.focusWin=function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("netvideohunter");
		window.alert("focus");
		window.focus();
	}
	
	this.chooseFolder=function (){
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		const nsILocalFile = Components.interfaces.nsILocalFile;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
						   .createInstance(nsIFilePicker);

		fp.init(window, "Select download folder", nsIFilePicker.modeGetFolder);
		fp.appendFilters(nsIFilePicker.filterAll);

		var customDirPref = window.document.getElementById("extensions.netvideohunter.download.customDir");	
		var customDir=customDirPref.value;
		// First try to open what's currently configured
		if (customDir && customDir.exists()) {
			fp.displayDirectory = customDir;
		}
		// Try the system's download dir
		else {
			fp.displayDirectory = getDefaultDownloadsFolder();
		}

		if (fp.show() == nsIFilePicker.returnOK) {
			var file = fp.file.QueryInterface(nsILocalFile);
			customDirPref.value = file;
			window.document.getElementById("saveWhere").value=3;
		}
	}

	this.updateDownloadFilePicker=function(){
		var downloadFolder = window.document.getElementById("downloadFolder");
		var currentDir = window.document.getElementById("extensions.netvideohunter.download.customDir").valueFromPreferences;
		if(!currentDir){
			currentDir=getDefaultDownloadsFolder();
			window.document.getElementById("extensions.netvideohunter.download.customDir").valueFromPreferences=currentDir;
		}
		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var fph = ios.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
		downloadFolder.label = currentDir ? currentDir.path : ""; 
		var iconUrlSpec = fph.getURLSpecFromFile(currentDir);
		downloadFolder.image = "moz-icon://" + iconUrlSpec + "?size=16";
		return downloadFolder.label;
	}

	this.choosePlayer=function (){
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		const nsILocalFile = Components.interfaces.nsILocalFile;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
						   .createInstance(nsIFilePicker);

		fp.init(window, "Select player", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterApps);

		var playerPref = window.document.getElementById("extensions.netvideohunter.externalPlayerPath");	
		var playerPath=playerPref.value;

		if (playerPath && playerPath.exists()) {
			fp.displayDirectory = playerPath;
		}else {
			var fileLoc = Components.classes["@mozilla.org/file/directory_service;1"]
										.getService(Components.interfaces.nsIProperties);
			fp.displayDirectory =fileLoc.get("Desk", Components.interfaces.nsILocalFile);
		}

		if (fp.show() == nsIFilePicker.returnOK) {
			var file = fp.file.QueryInterface(nsILocalFile);
			playerPref.value = file;
			
		}
	}

	this.updatePlayerFilePicker=function(){
		var externalPlayer = window.document.getElementById("externalPlayer");
		var current = window.document.getElementById("extensions.netvideohunter.externalPlayerPath").value;
		if(!current) return false;
		//if(!current) current=window.document.getElementById("extensions.netvideohunter.exteralPlayerPath").value=getDefaultPlayer();
		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var fph = ios.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
		externalPlayer.label = current ? current.path : ""; 
		var iconUrlSpec = fph.getURLSpecFromFile(current);
		externalPlayer.image = "moz-icon://" + iconUrlSpec + "?size=16";
		return undefined;
	}

	this.addIgnoreItem=function(){
		var newItem=window.document.getElementById("newIgnoreItem").value;
		if(newItem.length=="") return false;
		window.com.netvideohunter.downloader.Main.ignoreSites.addItem({id:newItem});
		window.document.getElementById("newIgnoreItem").value="";
	}
	var self=this;
	this.newIgnoreItemKeyPress=function(event){
		if (event.keyCode == window.KeyEvent.DOM_VK_RETURN) {
			self.addIgnoreItem();
		}
	}
	
	var window=window;
}
    
