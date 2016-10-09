var EXPORTED_SYMBOLS = ["fvd_sync_File"];

Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import("resource://fvd.sync.modules/misc.js");
Components.utils.import("resource://fvd.sync.modules/config.js");

fvd_sync_File = new function(){

    function folder(){
        var dir = fvd_sync_Misc.getDataFolder();
		
		dir.append( fvd_sync_Config.FILES_DIR_NAME );
		
        if (!dir.exists()){
			dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
		}
		
		return dir;            
    }
	
	this.filesFolder = function(){
		return folder();
	}
    
	this._write = function( file, data, callback ){
		
        var ostream = FileUtils.openSafeFileOutputStream(file)
        
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        var istream = converter.convertToInputStream(data);
        
        // The last argument (the callback) is optional.
        NetUtil.asyncCopy(istream, ostream, function(status){
            if (!Components.isSuccessCode(status)) {
                return callback(false);
            }
       		
			callback( true );                 
        });
		
	}
	
    this.write = function(name, data, callback){
    
        var dir = folder();
		
        dir.append(name);
        
		this._write( dir, data, callback );
        
    }
	
	this.writeSync = function( file, string ){
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
        				createInstance(Components.interfaces.nsIFileOutputStream);  
						
		foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
		
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
                		createInstance(Components.interfaces.nsIConverterOutputStream);  
		converter.init(foStream, "UTF-8", 0, 0);  
		converter.writeString(string);  
		converter.close(); // this closes foStream  
	}
    
	this._read = function( file, callback ){
		
        NetUtil.asyncFetch(file, function(dir, status){
            if (!Components.isSuccessCode(status)) {
                callback(false);
                return;
            }
            
            var data = NetUtil.readInputStreamToString(dir, dir.available(), {
				charset: "UTF-8"
			});
            
            callback(true, data);
        });
		
	}
	
    this.read = function(name, callback){
    
        var dir = folder();
        dir.append(name);
        
		this._read( dir, callback );
        
    }
    
}
