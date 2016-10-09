var EXPORTED_SYMBOLS = ["fvd_sync_Misc"];

// appears in 35 firefox, a Blob constructor becomes undefined
// in firefox sources, they call Components.utils.importGlobalProperties(["Blob"]) to use Blob in js modules
try {
  Components.utils.importGlobalProperties(["Blob"]);
}
catch(ex) {

}

Components.utils.import("resource://fvd.sync.modules/config.js");
Components.utils.import("resource://fvd.sync.modules/settings.js");

fvd_sync_Misc = {

  SELF_ID: "fvdmedia@gmail.com",

  base64toblob: function( data, contentType ){
    contentType = contentType || "text/plain";
    var binary = atob( data );
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: contentType});
  },

  navigate_url: function(url, event)
  {
    var browser = this.getMainWindow().getBrowser();
    var tab = browser.addTab(url);
    if (tab) {
      browser.selectedTab = tab;
    }
  },

  clone: function( obj ){

    return JSON.parse( JSON.stringify(obj) );

  },

  getSecondsCountAfterInstall: function(){

    var installTime = fvd_sync_Settings.getStringVal( "install.time" );
    if( !installTime ){
      fvd_sync_Settings.setStringVal( "install.time", new Date().getTime() );
      return 0;
    }
    else{
      try{
        installTime = parseInt( installTime );
      }
      catch( ex ) {

      }
      return (new Date().getTime() - installTime)/1000;
    }

  },

  getDataFolder: function(){

    var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
        file.append( fvd_sync_Config.STORAGE_FOLDER );

        if (!file.exists())
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);

    return file;

  },

  objectsDiffFields: function( o1, o2, checkFields ){

    var fields = [];

    checkFields.forEach( function( field ){

      if( o1[field] && o1[field].trim ){
        o1[field] = o1[field].trim();
      }

      if( o2[field] && o2[field].trim ){
        o2[field] = o2[field].trim();
      }

      if( o1[field] != o2[field] ){
        fields.push( field );
      }

    } );

    return fields;

  },

  getUrlContents: function (aUrl) {
      var ioService = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
      var scriptableStream = Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

      var channel = ioService.newChannel(aUrl, null, null);
      var input = channel.open();
      scriptableStream.init(input);
      var str = scriptableStream.read(input.available());
      scriptableStream.close();
      input.close();

      return str;
  },

  compareHostAppVersionWith: function( compareVersion ){

    var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);

    var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);

    return  versionComparator.compare( info.version, compareVersion );

  },

  md5: function( str ){

    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    converter.charset = "UTF-8";
    var result = {};

    var data = converter.convertToByteArray(str, result);
    var ch = Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash);
    ch.init(ch.MD5);
    ch.update(data, data.length);
    var hash = ch.finish(false);

    var tmp = [];
    for (i in hash) {
      tmp.push(this.toHexString(hash.charCodeAt(i)));
    }

    // convert the binary hash data to a hex string.
    var s = tmp.join("");

    return s;

  },

  browserLocaleIs: function(compareLocale) {
    var browserLocale = this.browserLocale().toLowerCase();
    return new RegExp("\\b" + compareLocale + "\\b", "i").test(browserLocale);
  },

  browserLocale: function() {
    var registry =
      Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
    var b = registry.getBranch("general.useragent.");
    return b.getCharPref("locale");
  },

  toHexString: function (charCode){
    return ("0" + charCode.toString(16)).slice(-2);
  },

  fileToNativeUri: function(localFile){
    var ios = Components.classes["@mozilla.org/network/io-service;1"].
                       getService(Components.interfaces.nsIIOService);
    return ios.newFileURI(localFile);
  },

  fileToURI: function( localFile ){
    var url = this.fileToNativeUri( localFile );
    url = url.spec;

    return url;
  },

  filePathToURI: function( path ){
    try{
      var localFile = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);
      localFile.initWithPath( path );

      return  this.fileToURI(localFile);
    }
    catch( ex ){
      return null;
    }
  },

  fileURIToPath: function( url ){
    var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var fileUrl = iOService.newURI( url, null, null );
    var file = fileUrl.QueryInterface(Components.interfaces.nsIFileURL).file;
    return file.path;
  },

  fileExists: function( path ){
    try{
      var localFile = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);
      localFile.initWithPath( path );

      return localFile.exists();
    }
    catch( ex ){
      return false;
    }
  },

  loadCSS: function( url ){
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI( url, null, null );
    if(!sss.sheetRegistered(uri, sss.USER_SHEET)){
      sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
    }

  },

  validateText: function( type, text ){
    switch( type ){
      case "email":

          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test( text );

      break;
    }
  },

  prepareUrlToCompare: function( url ){
    url = url.toLowerCase();
    // remove http from sign
    url = url.replace("http://", "");
    url = url.replace("https://", "");
    // remove www from sign
    url = url.replace( "www.", "" );
    // remove and "/"
    if( url.charAt( url.length - 1 ) == "/" ){
      url = url.substring( 0, url.length - 1 );
    }

    return url;
  },

  isUrlsEqual: function( url1, url2 ){
    return this.prepareUrlToCompare( url1 ) == this.prepareUrlToCompare( url2 );
  },

  arrayUnique: function( a ){

    var result = [];

    for( var i = 0; i != a.length; i++ ){
      var v = a[i];
      if( result.indexOf( v ) == -1 ){
        result.push( v );
      }
    }

    return result;

  },

  getMainWindow: function(){
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser");

    return mainWindow;
  },

  parseHotKey: function( text ){
    var parts = text.split("+");

    var modifiers = [];
    var key = "";

    if( parts.length > 0 ){
      parts.slice( 0, parts.length - 1 ).forEach(function( part ){
        switch( part.trim() ){
          case "CTRL":
            modifiers.push( "accel" );
          break;
          case "ALT":
            modifiers.push( "alt" );
          break;
          case "SHIFT":
            modifiers.push( "shift" );
          break;
        }
      });
      key = parts[ parts.length - 1 ].trim();
    }

    modifiers = modifiers.join( " " );

    return {
      modifiers: modifiers,
      key: key
    };
  },

  getActiveHotKeys: function( modifiers, key ){
    var mainWindow = this.getMainWindow();

    var keys = [];

    key  = key.toLowerCase();

    var elements = mainWindow.document.getElementsByTagName( "key" );
    for( var i = 0; i != elements.length; i++ ){
      var element = elements[i];
      if( element.getAttribute( "modifiers" ) == modifiers && element.getAttribute( "key" ).toLowerCase() == key ){
        keys.push( element );
      }
    }

    return keys;
  },

  request: function( url, method, data, callback ){

    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

    req.open( method, url );

    req.onload = function(){
      var r = null;
      try{
        r = JSON.parse( req.responseText );
      }
      catch( ex ){

      }
      callback( r );
    }

    req.onerror = function(){
      callback( null );
    }

    req.send( data );

  },

  get: function( url, callback ){
    return this.request( url, "GET", null, callback );
  },

  post: function( url, dataString, callback ){
    return this.request( url, "POST", dataString, callback );
  },

  tmpFile: function(){
    var file = Components.classes["@mozilla.org/file/directory_service;1"].
          getService(Components.interfaces.nsIProperties).
          get("TmpD", Components.interfaces.nsIFile);


    file.append("fvd_sync_"+this._getRandomInt() + "_" + this._getRandomInt() + "_");

    return file;
  },

  readZipEntryContent: function( zipReader, entry ){
    var _iStream = zipReader.getInputStream( entry );
    var iStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    iStream.init( _iStream );
    var result = iStream.read( _iStream.available() );
    iStream.close();
    _iStream.close();

    var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
    var result = utf8Converter.convertURISpecToUTF8 (result, "UTF-8");

    return result;
  },

  _getRandomInt: function(min, max){
    min = min || 0;
    max = max || 999999999999;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

}