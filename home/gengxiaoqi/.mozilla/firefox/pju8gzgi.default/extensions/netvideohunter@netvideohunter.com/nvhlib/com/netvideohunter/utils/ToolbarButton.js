Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
var EXPORTED_SYMBOLS = ["ToolbarButton"]; 

 
var ToolbarButton = function(toolbarItemId,prefTBItemInstalled){
	this.beforeId="urlbar-container";

	var self=this;

	this.addOnce=function(){
		var tbItemInstalled = null;
		try{
		  tbItemInstalled = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBoolPref(prefTBItemInstalled);
		}catch(e){Logger.log(e)}
		if (!tbItemInstalled ){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var window = wm.getMostRecentWindow("navigator:browser");
			window.setTimeout(this.addToolbarItem, 0);
		}

	}
 
	this.addToolbarItem=function(){	  
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
		var enumerator = wm.getEnumerator("navigator:browser");
		while(enumerator.hasMoreElements()) {
			var window = enumerator.getNext();
			var navBar  = window.document.getElementById("nav-bar");
			var curSet  = navBar.currentSet.split(",");
			if (curSet.indexOf(toolbarItemId) == -1) {
				curSet.push(toolbarItemId)
				navBar.setAttribute("currentset",curSet.join(","));
				navBar.currentSet = curSet.join(",");
				window.document.persist(navBar.id, "currentset");
				try {
				  window.BrowserToolboxCustomizeDone(true);
				}
				catch (e) {}
			}
		}
		try{
			Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).setBoolPref(prefTBItemInstalled, true);
		}catch(e){Logger.log(e)}
	}

	this.removeToolbarItem=function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
		var enumerator = wm.getEnumerator("navigator:browser");
		while(enumerator.hasMoreElements()) {
			var window = enumerator.getNext();
			var navBar  = window.document.getElementById("nav-bar");
			var curSet  = navBar.currentSet.split(",");
			if (curSet.indexOf(toolbarItemId) !== -1) {
				var pos = curSet.indexOf(toolbarItemId);
				curSet.splice(pos,1);

				navBar.setAttribute("currentset", curSet.join(","));
				navBar.currentSet = curSet.join(",");
				window.document.persist(navBar.id, "currentset");
				try {
				  window.BrowserToolboxCustomizeDone(true);
				}catch (e) {}			
		    }
		}
	}

	this.hasToolbarItem=function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
		var navBar  = window.document.getElementById("nav-bar");
		var curSet  = navBar.currentSet.split(",");
		return (curSet.indexOf(toolbarItemId) !== -1);

	}

	
}
 
