var EXPORTED_SYMBOLS = ["fvd_sync_AutoSync"];

Components.utils.import("resource://fvd.sync.modules/config.js");
Components.utils.import("resource://fvd.sync.modules/sync.js");
Components.utils.import("resource://fvd.sync.modules/async.js");
Components.utils.import("resource://fvd.sync.modules/settings.js");

var async = fvd_sync_Async;

function DriversAutoUpdater( drivers ){
		
	var timer = null;
	
	function _startTimer(){

		timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(function(){
			
			async.arrayProcess( drivers, function( dInfo, apCallback ){
				
				var driver = dInfo.driver;
				var driverName = dInfo.name;
				
				var settingsKey = driverName.toLowerCase()+".sync.auto_sync_enabled";
				
				try{				
					if( !fvd_sync_Settings.getBoolVal( settingsKey ) ){
						return apCallback();
					}	
				}
				catch( ex ){
					dump("ERR " + ex + "\n");
				}
								
				dump( driverName + ": Start autosync\n" );
				
				driver.startAutoSync( null, function( error ){
					
					dump( driverName + ": Sync completed with: " + error + "\n" );
					
					apCallback();
									
				} );
				
			}, function(){
				
				_startTimer();
				
			} );

			
		}, fvd_sync_Config.AUTOSYNC_EVERY, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		
	}
	
	_startTimer();
	
}

 


var fvd_sync_AutoSync_Class = function (){
	
	var autoUpdater = null;
			
	this.init = function(){
		
		var drivers = [];
		
		for( var driverName in fvd_sync_Sync.Drivers ){
			
			if( !fvd_sync_Sync.Drivers[driverName].startAutoSync ){
				continue;
			}
			
			drivers.push({
				driver: fvd_sync_Sync.Drivers[ driverName ],
				name: driverName
			});

		}
		
		autoUpdater = new DriversAutoUpdater( drivers );
		
	};
	
};

var fvd_sync_AutoSync = new fvd_sync_AutoSync_Class();

 
