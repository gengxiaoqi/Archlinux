var EXPORTED_SYMBOLS = ["MultiHunter"];
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/downloader/hunters/YouTubeHunter.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/downloader/hunters/GeneralHunter.js");

var MultiHunter=new (function MultiHunter(){ //singleton
	this.hunterList=[YouTubeHunter,GeneralHunter]

	this.createIdFromResponse=function createIdFromResponse (response) {
		for(var i=0;i<this.hunterList.length;i++){
			var hunter=this.hunterList[i]
			if(hunter.canHunt(response) && hunter.createIdFromResponse){
				var id=hunter.createIdFromResponse(response)
				if(id===null) continue
				return id
			}
		}
	}

	// run async hunts in series, break and return at first data
	this.hunt=function(response,cb){
		var listLength=this.hunterList.length
		if(listLength==0) return cb()
		var i=0
		var self=this
		var nextCb = function (err,data){
			if(err) return cb(err)
			if(data) return cb(null, data)
			i++
			if(i==listLength) return cb()
			runNext(i)
		}
		var runNext=function (i) {
			var hunter=self.hunterList[i]
			if(hunter.canHunt(response)) {
				hunter.hunt(response,cb)
			}else{
				nextCb()
			}
		}
		runNext(i)
	}
})

