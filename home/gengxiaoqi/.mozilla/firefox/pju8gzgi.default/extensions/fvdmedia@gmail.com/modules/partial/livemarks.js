var EXPORTED_SYMBOLS = ["Livermarks"];

var Livermarks = new function(){

	var _livemarkService = null;

	// two ways of livermarks

	if( Components.interfaces.mozIAsyncLivemarks ){
		_livemarkService = Components.classes["@mozilla.org/browser/livemark-service;2"].getService(Components.interfaces.mozIAsyncLivemarks);

		this.isLivemark = function( id, callback ) {
      var _returned = false;
      function _end(val) {
        if(_returned) {
          return;
        }
        _returned = true;
        callback(val);
      }
      // old firefox versions require the second callback argument
      var p = _livemarkService.getLivemark( {id: id}, function(err, livermark) {
        if(livermark) {
          _end(true);
        }
        else {
          _end(false);
        }
      } );
      // newer firefox versions return promise
      if(p) {
        p.then(function() {
          _end(true);
        }, function() {
          _end(false);
        });
      }
		};
	}
	else if( Components.interfaces.nsILivemarkService ){
		// deprecated in 21
		_livemarkService = Components.classes["@mozilla.org/browser/livemark-service;2"].getService(Components.interfaces.nsILivemarkService);

		this.isLivemark = function( id, callback ){

			callback( _livemarkService.isLivemark( id ) );

		};

	}

}();
