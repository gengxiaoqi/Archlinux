Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/UrlUtils.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/HttpUtils.js");



var EXPORTED_SYMBOLS = ["MediaData"];

// === MediaData ===

var MediaData=function(response){
	this.id=null;
	this.extension=response.extensionInUrl;
	this.downloadStarted=false;
	this.referrer=response.referrer;
	this.referrerPolicy=response.referrerPolicy;
	//this.loadContext=response.loadContext;
	this.uploadStream=response.uploadStream;
	this.cacheKey=response.cacheKey;
	this.fromPrivateBrowsing=response.fromPrivateBrowsing;
	this.title="No title"
	this.url=null
	this.size=null;
	this.favicon=response.favicon;
	this.host=response.host;
	this.pageUrl=response.pageUrl;
	var self=this
	var _contentType=null
	var _qualityUrls=[]		

	Object.defineProperty(this, "contentType", {
	    set: function(value) { 
	    	_contentType=value;
	    	if(_contentType=="video/flv") _contentType="video/x-flv";
	    	if(_contentType=="video/f4f") _contentType="video/mp4";
			Logger.log(value)
	    },
	    get: function() { return _contentType }
	})	

	Object.defineProperty(this, "qualityUrls", {
	    set: function(urls) { 
	    	_qualityUrls=urls || [];
	    	self.changeUrlToQuality("default")
	    },
	    get: function() { return _qualityUrls }
	})

	this.changeUrlToQuality=function(q){
		if(!_qualityUrls || _qualityUrls.length==0) return 
		var urlData
		if(q=="best"){
			urlData=this.qualityUrls[0]
		}else if(q=="default"){
			urlData=this.findQualityUrlById(11)	// 360p MP4 default		
		}else{
			Logger.log("Selected quality: "+q)
			urlData=this.qualityUrls[q]
		}
		if(!urlData && _qualityUrls.length>0) urlData=_qualityUrls[0]
		Logger.log(urlData)
		this.url=urlData.url
	    this.contentType=urlData.contentType
	    this.type=urlData.type
	}

	this.findQualityUrlById=function (id) {
		for(var i=0;i<_qualityUrls.length;i++){
			if(_qualityUrls[i].qualityId===id) return _qualityUrls[i]
		}
	}

	Object.defineProperty(this, "filename", {
		get: function() { 
			if(!this.title) return "video."+this.type;
			var s=this.title;
			s=s.substr(0,255);
			r=new RegExp('[\\\/\:\*\?\"\<\>\|\.]',"gi");
			s=s.replace(r,"");
			s=s.replace(/^\s*/, "").replace(/\s*$/, "");
			return s+"."+this.type;
		}
	})


}
