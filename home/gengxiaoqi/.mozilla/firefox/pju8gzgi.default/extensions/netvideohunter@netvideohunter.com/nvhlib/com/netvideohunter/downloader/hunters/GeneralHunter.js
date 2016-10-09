var EXPORTED_SYMBOLS = ["GeneralHunter"];
Components.utils.import("resource://nvhlib/com/netvideohunter/downloader/data/MediaData.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/QueryString.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/HttpUtils.js");
var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

var GeneralHunter=function(){}
GeneralHunter.canHunt=function (response){
	return (
		response.url && 
		response.contentLength > 50000 &&
		response.url.indexOf("QualityLevels")==-1 && // ignore fragmented silverlight media
		response.url.indexOf("Fragments")==-1 
	)
}

GeneralHunter.captureSWF=false
GeneralHunter.hunt=function(response,cb){
	//Logger.log('GeneralHunter.hunt')
	var type=GeneralHunter.detectType(response)
	if(type==null) return cb() // if it didn't found a media type then return
	Logger.log("capture swf: "+GeneralHunter.captureSWF)
	if(type=="swf" && !GeneralHunter.captureSWF) return cb() // return if type is swf and swf capturing is turned off	
	var mediaData=new MediaData(response)
	mediaData.type=type
	mediaData.contentType=response.contentType
	mediaData.size=response.contentLength
	mediaData.url=GeneralHunter.filterUrl(response.url)
	mediaData.id=GeneralHunter.createIdFromResponse(response)
	var doc=response.document
	if(doc){
		mediaData.title=doc.title
		// grooveshark title
		if(response.pageHost && response.pageHost.indexOf("grooveshark.")!==-1){			
			var nowEl=doc.getElementById('now-playing-metadata')
			if(nowEl && nowEl.textContent.length>0) mediaData.title=nowEl.textContent
			// fix for slow changing title
			timer.initWithCallback({notify:function(){ mediaData.title=nowEl.textContent }},500, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		}
		mediaData.pageUrl=(doc.location) ? doc.location.href : null;
	}
	HttpUtils.forceCaching(response.httpChannel)
	cb(null,mediaData)
}

GeneralHunter.createIdFromResponse=function(response){	
	//Logger.log('GeneralHunter.createIdFromResponse')
	if(!response.url) return;
	var url=GeneralHunter.filterUrl(response.url)
	var id=url
	if(url.indexOf("dmcdn.net")!=-1 || url.indexOf("dailymotion.com")!=-1){
		r=new RegExp("\/([^\.]+)\.mp4","gi");
		m = r.exec(url);
		if (m != null && m.length>=2) {
			id="__dailymotion__"+m[1];
		}
	}else if(url.indexOf("trilulilu.ro")!=-1){
		r=new RegExp("hash=([^&]+)&username=","gi");
		m = r.exec(url);
		if (m != null && m.length>=2) {
			id="__trilulilu__"+m[1]+response.contentLength;
		}
	}else if(url.indexOf("grooveshark.")!=-1){
		id=url+(response.contentLength||"");
	}else if(url.indexOf("media2.foxnews.com/")!=-1){
		id='foxnews_'+url.replace(/(\:\/\/media2\.foxnews\.com\/)([^\/]+)(\/.+)/i,'$2')
	}else{
		id=id+"_"+(response.contentLength||"");
	}
	return id
}

GeneralHunter.filterUrl=function(url){
	var fUrl=url
	var r=new RegExp("(start|begin|&range|\-Frag\d+)=[0-9\-]+","gi");
	fUrl=fUrl.replace(r,"");
	r=new RegExp("(&ext=.flv){2,}","g");
	fUrl=fUrl.replace(r,"&ext=.flv");
	fUrl=fUrl.replace(r,"");
	// dailymotion fix
	if(fUrl.indexOf("dmcdn.net")!=-1 || fUrl.indexOf("dailymotion.com")!=-1){
  		fUrl=fUrl.replace(/sec\([^\)]+\)\/frag\([^\)]+\)\//i,"") // dailymotion
  		fUrl=fUrl.replace(/:\/\/([^\/]+\.(?:dmcdn\.net|dailymotion\.com))/i,"://vid2.ec.dmcdn.net")
  	// foxnews
  	}else if(fUrl.indexOf('/foxnews-f.akamaihd.net/')!=-1){
  		fUrl=fUrl.replace(/([^:]+):\/\/foxnews\-f\.akamaihd\.net\/[^\/]+\/([^\/]+)\/([^,]+)(.+)/i,'$1://media2.foxnews.com/$2/$3HD.mp4')
  	}
  	fUrl=fUrl.replace(/aktimeoffset=\d+/i,'aktimeoffset=0') // vimeo seek
  	return fUrl

}

GeneralHunter.detectType=function(response){
	var contentType=response.contentType
	var extension=response.extensionInUrl
	var t=null;
	if(!contentType) contentType=""
	if(!extension) extension=""
	if(
		contentType.indexOf("video/x-flv")!=-1 || contentType.indexOf("video/flv")!=-1 ||
	 	extension=="flv" ||
	 	(
	 		contentType.indexOf("application/octet-stream")!=-1 &&
	 		["zip","js","exe","jpg","png","gif","css","rar","json"].indexOf(extension)==-1
	 	) 
	){
	 	t="flv";
	}else if(contentType.indexOf("video/mp4")!=-1 || extension=="mp4"){
		t="mp4";
	}else if(contentType.indexOf("video/webm")!=-1 || extension=="webm"){
		t="webm";
	}else if(contentType.indexOf("video/3gpp")!=-1 || extension=="3gp"){
		t="3gp";
	}else if(contentType.indexOf("audio/mpeg")!=-1 || extension=="mp3"){
		t="mp3";
	}else if(contentType.indexOf("video")!=-1){
		if(extension && extension.length>0){
			t=extension;
		}else{
			t="mp4"; //assume it's mp4
		}
	}else if(contentType.indexOf("audio")!=-1 ){
		if(extension && extension.length>0){
			t=extension;
		}else{
			t="mp3"; //assume it's mp3
		}
	}else if(contentType.indexOf("application/x-shockwave-flash")!=-1 || extension=="swf"){
		t="swf";
	}
	if(t=="woff") return null;
	return t;
}
