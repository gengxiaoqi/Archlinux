EXPORTED_SYMBOLS = ["fvd_sync_WebLink"];

Components.utils.import("resource://fvd.sync.modules/misc.js");
Components.utils.import("resource://fvd.sync.modules/sync.js");
Components.utils.import("resource://fvd.sync.modules/async.js");

var Cc = Components.classes;
var Ci = Components.interfaces;

var _fvd_sync_WebLink = function( element ){

	var self = this,
      frameScriptInjected = false;
  var globalMM = Cc["@mozilla.org/globalmessagemanager;1"]
      .getService(Ci.nsIMessageListenerManager);

	this.__exposedProps__ = {
		process: "r"
	};


	var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);


	this.process = function( data, callback ){

		if( !data.action ){
			return;
		}

		if( data.action.indexOf( "event:" ) === 0 ) {
			var topic = "FVD.Sync.Event." + data.action.replace("event:", "");

			var extra = null;
			if( data.data ){
				extra = JSON.stringify( data.data );
			}

			observerService.notifyObservers( null, topic, extra );

			return;
		}



		switch( data.action ){

			default:
			case "connect":

				callback( {} );

			break;

			case "_response":
				//ignore
			break;

			case "getCurrentUsage":

				var result = {};

				fvd_sync_Async.arrayProcess( fvd_sync_Sync.getDriversNames(), function( driverName, apCallback ){

					var driver = fvd_sync_Sync.Drivers[driverName];

					var can = true;

					if( driver.canWork && !driver.canWork() ){
						can = false;
					}

					if( can ){
						driver.totalItemsCount( function( count ){

							result[ driverName ] = count;
							apCallback();

						} );
					}
					else{
						result[ driverName ] = -1;
						apCallback();
					}

				}, function(){

					callback(result);

				} );


			break;
		}

	};

  this.loadFrameScript = function() {
    if(frameScriptInjected) {
      return;
    }
    frameScriptInjected = true;
    globalMM.loadFrameScript("chrome://fvd.sync/content/content-scripts/everhelper.js", true);

    // setup listeners
    globalMM.addMessageListener("fvd-sync:processor-message", function(message) {
      self.process(message.data.data, function(res) {
        message.target.messageManager.sendAsyncMessage("fvd-sync:processor-response", {
          id: message.data.id,
          response: res
        });
      });
    });
  };
};


var fvd_sync_WebLink = new _fvd_sync_WebLink();