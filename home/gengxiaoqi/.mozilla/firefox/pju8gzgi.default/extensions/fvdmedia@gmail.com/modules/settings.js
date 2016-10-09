var EXPORTED_SYMBOLS = ["fvd_sync_Settings"];

var fvd_sync_Settings = {
	registry: null,
	_settingsBranch: null,
	_settingsBranchGet: null,
	branches: {},

	SETTINGS_KEY_BRANCH: 'extensions.fvd_sync.',

	getKeyBranch: function(){
		return this.SETTINGS_KEY_BRANCH;
	},

	branch: function( name ){
		if( !this.branches[name] ){
			this.branches[name] = this.registry.getBranch(name);
		}

		return this.branches[name];
	},

	_branch: function(){
		if( !this._settingsBranch ){
			this._settingsBranch = this.registry.getBranch(this.SETTINGS_KEY_BRANCH);
		}
		return this._settingsBranch;
	},

	_branchG: function(){
		if( !this._settingsBranchGet ){
			this._settingsBranchGet = this.registry.getBranch(this.SETTINGS_KEY_BRANCH);
		}
		return this._settingsBranchGet;
	},

	setStringVal: function( key, value ){
		try{
			return this._branch().setCharPref( key, value );
		}
		catch( ex ){
			dump( "Fail set char pref " + key + " = " + value + "( "+ex+" )\n" );
		}
	},

	getStringVal: function( key ){
		return this._branchG().getCharPref( key );
	},

	setBoolVal: function( key, value ){
		return this._branch().setBoolPref( key , value);
	},

	getBoolVal: function( key ){
		return this._branchG().getBoolPref( key );
	},

	setIntVal: function( key, value ){
		return this._branch().setIntPref( key , value);
	},

	getIntVal: function( key ){
		return this._branchG().getIntPref( key );
	},

	reset: function( key ){
		return this._branchG().clearUserPref( key );
	},

	init: function(){

		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
	},

	addObserver: function( observer, branchName ){
		if( !branchName ){
			this._branch().QueryInterface(Components.interfaces.nsIPrefBranch2).addObserver( "", observer, false );
		}
		else{
			this.branch(branchName).QueryInterface(Components.interfaces.nsIPrefBranch2).addObserver( "", observer, false );
		}
	},

	removeObserver: function( observer, branchName ){
		if(!branchName){
			this._branch().QueryInterface(Components.interfaces.nsIPrefBranch2).removeObserver( "", observer, false );
		}
		else{
			this.branch(branchName).QueryInterface(Components.interfaces.nsIPrefBranch2).removeObserver( "", observer, false );
		}

	},

	getWindow: function() {
	  var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
    try{
      var windows = ww.getWindowEnumerator();
      while( windows.hasMoreElements() ){
        var window = windows.getNext();
        window.QueryInterface( Components.interfaces.nsIDOMWindow );
        if( window.document.location == "chrome://fvd.sync/content/settings.xul" ){
          // already opened
          return window;
        }
      }
    }
    catch( ex ){

    }
    return null;
	},

	displayWindow: function( pane, subpane, evaluate, parent ){

		var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
		var window = this.getWindow();
		if(window) {
      if( pane ){
        window.document.getElementById("syncTabs").selectedItem = window.document.getElementById( "tab_" + pane );
      }
      window.focus();
      return;
		}

		parent = parent || ww.activeWindow;

        var settingsDialog = parent.openDialog('chrome://fvd.sync/content/settings.xul', 'sync_settings', 'chrome,titlebar,toolbar,centerscreen,dialog=yes', {"activeTab": pane, "subpane": subpane, evaluate: evaluate});



	},


	// specific settings functions

	sdIsHomepage: function(){
		var branch = this.branch( "browser." );
		var url = branch.getCharPref( "startup.homepage" );

		return url == this.sdHomePage && branch.getIntPref( "startup.page" ) == 1;
	},

	setSdAsHomePage: function( set ){
		var branch = this.branch( "browser." );
		if( set ){
			branch.setCharPref( "startup.homepage", this.sdHomePage );
			branch.setIntPref( "startup.page", 1 );
		}
		else{
			if( branch.getCharPref( "startup.homepage" ) == this.sdHomePage ){
				branch.setCharPref( "startup.homepage", "" );
			}
		}
	},

	importFromJSON: function( br, data ){
		var b = this.branch( this.SETTINGS_KEY_BRANCH + br );

		for( var key in data ){
			var value = data[key];
			try{
				var type = b.getPrefType( key );
				switch( type ){
					case b.PREF_STRING:
						value = b.setCharPref( key, value );
					break;
					case b.PREF_INT:
						value = b.setIntPref( key, value );
					break;
					case b.PREF_BOOL:
						value = b.setBoolPref( key, value );
					break;
				}
			}
			catch( ex ){

			}
		}
	},

	getAll: function( br ){

		var b = this.branch( this.SETTINGS_KEY_BRANCH + br );
		var obj = {};
		var subPrefs = b.getChildList("", obj);

		var result = {};

		for( var i = 0; i != subPrefs.length; i++ ){
			var value = null;
			var key = subPrefs[i];
			var type = b.getPrefType( key );

			try{

				switch( type ){
					case b.PREF_STRING:
						value = b.getCharPref( key );
					break;
					case b.PREF_INT:
						value = b.getIntPref( key );
					break;
					case b.PREF_BOOL:
						value = b.getBoolPref( key );
					break;
				}

			}
			catch( ex ){

			}

			if( value == null ){
				continue;
			}

			result[ key ] = value;
		}

		return result;

	},

	relativeName: function( name ){
		return name.replace( this.SETTINGS_KEY_BRANCH, "" );
	}


};

fvd_sync_Settings.init();
