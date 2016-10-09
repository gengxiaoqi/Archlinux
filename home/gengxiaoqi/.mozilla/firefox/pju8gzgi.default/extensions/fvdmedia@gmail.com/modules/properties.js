var EXPORTED_SYMBOLS = ["fvd_sync_Properties"];

fvd_sync_Properties = {
	_bundles: {},

	_bundle: function( file ){
		if( !(file in this._bundles) ){
			try{
				this._bundles[file] = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.sync/locale/'+file+'.properties');
			}
			catch( ex ){
				return null;
			}
		}

		return this._bundles[ file ];
	},

	getString: function( file, string ){
		var bundle = this._bundle(file);

		if( !bundle ){
			return null;
		}
		var txt;

		try{
	        txt = bundle.GetStringFromName(string);
		}
		catch( ex ){
			//dump( "Fail get " + string + " from " + file + "("+ex+")\r\n" );
			txt = string;
		}


		return txt;
	},

	getIterator: function(file){
		var bundle = this._bundle(file);

		if( !bundle ){
			return null;
		}

		return bundle.getSimpleEnumeration();
	}
}
