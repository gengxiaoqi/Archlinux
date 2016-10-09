var EXPORTED_SYMBOLS = ["fvd_sync_Async"];

var maxInlineActions = 20;

fvd_sync_Async = {
	chain: function( callbacksChain ){

		var dataObject = {};

		var f = function(){
			if( callbacksChain.length > 0 ){
				var nextCallback = callbacksChain.shift();
				nextCallback( f, dataObject );
			}
		};

		f();

	},

	// simulteneusely process
	sArrayProcess: function( dataArray, callback, finishCallback ){

		var countProcessed = 0;

		if( dataArray.length == 0 ){
			return finishCallback();
		}

		dataArray.forEach(function( item ){

			callback( item, function(){

				countProcessed++;

				if( countProcessed == dataArray.length ){
					finishCallback();
				}

			} );

		});

	},

	arrayProcess: function( dataArray, callback, finishCallback, _inline ){
		_inline = _inline || 0;
		var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

		var f = function( i ){

			if( i >= dataArray.length ){
				finishCallback();
			}
			else{
				if(_inline > maxInlineActions) {
          _inline = 0;
          timer.initWithCallback(function(){
            callback( dataArray[i], function(){
              f(i + 1);
            } );
          }, 0, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
				}
				else {
          _inline++;
          callback( dataArray[i], function(){
            f(i + 1);
          } );
				}
			}

		};

		f(0);

	},

	cc: function( stateFunction ){
    var rf = function( result ){
      if( result == "break" ){
        return;
      }
      stateFunction( rf );
    };
    stateFunction( rf );
  }
};
