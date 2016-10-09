var EXPORTED_SYMBOLS = ["YouTubeHunter"];
Components.utils.import("resource://nvhlib/com/netvideohunter/downloader/data/MediaData.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/QueryString.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/HttpRequest.js");


var youtubeItags={
	43:{name:"360p (WebM)", id:1, contentType:"video/webm"},
	44:{name:"480p (WebM)", id:2, contentType:"video/webm"},
	45:{name:"720p HD (WebM)", id:3, contentType:"video/webm"},
	46:{name:"1080p HD (WebM)", id:4, contentType:"video/webm"},
	5:{name:"240p (FLV)", id:5, contentType:"video/flv"},
	6:{name:"270p (FLV)", id:6, contentType:"video/flv"},
	13:{name:"(3GP)", id:7, contentType:"video/3gpp"},
	17:{name:"144p (3GP)", id:8, contentType:"video/3gpp"},
	36:{name:"240p (3GP)", id:9, contentType:"video/3gpp"},
	34:{name:"360p (FLV)", id:10, contentType:"video/flv"},
	18:{name:"360p (MP4)", id:11, contentType:"video/mp4"},
	35:{name:"480p (FLV)", id:12, contentType:"video/flv"},
	22:{name:"720p HD (MP4)", id:13, contentType:"video/mp4"},
	37:{name:"1080p HD (MP4)", id:14, contentType:"video/mp4"},
	38:{name:"4K (MP4)", id:15, contentType:"video/mp4"}

}

var YouTubeHunter=function(){}
YouTubeHunter.sigCode=[]
YouTubeHunter.canHunt=function (response){
	return (YouTubeHunter.isVideoPlaybackUrl(response.url) || YouTubeHunter.isVideoInfoUrl(response.url) || YouTubeHunter.isNavigateUrl(response.url))
}  

YouTubeHunter.hunt=function(response,cb){		
	if(YouTubeHunter.isNavigateUrl(response.url)){
		var mediaData=YouTubeHunter.createMediaData(response)
		YouTubeHunter.huntFromNavigate(response,mediaData,YouTubeHunter.returnDataCb(cb))
	}else if(YouTubeHunter.isVideoPlaybackUrl(response.url)){
		var mediaData=YouTubeHunter.createMediaData(response)
		YouTubeHunter.huntFromDocument(response,mediaData,YouTubeHunter.returnDataCb(cb))
	}else if(YouTubeHunter.isVideoInfoUrl(response.url)){
		var mediaData=YouTubeHunter.createMediaData(response)
		YouTubeHunter.huntFromResponse(response,mediaData,YouTubeHunter.returnDataCb(cb))
	}else{		
		return cb()
	}
}

YouTubeHunter.createMediaData=function (response) {
	var mediaData=new MediaData(response)
	Logger.log(response.loadContext)
	mediaData.cacheKey=null // do not use cacheKey from response
	mediaData.id=YouTubeHunter.createIdFromResponse(response)
	return mediaData
}

YouTubeHunter.returnDataCb=function(cb){ // after data capture callback before data return
	return function(err,mediaData){
		if(err) return cb(err)
		if(!mediaData) return cb()
		mediaData.favicon="http://www.youtube.com/favicon.ico"
		cb(null,mediaData)
	}
}


YouTubeHunter.isVideoInfoUrl=function(url){
	return (url.match(/^https?:\/\/[^\/]+(?:youtube|googlevideo)\.com\/get_video_info/i)!==null)
}

YouTubeHunter.isVideoPlaybackUrl=function (url) {
	return (url.match(/^https?:\/\/[^\/]+(?:youtube|googlevideo)\.com\/videoplayback/i)!==null)
}

YouTubeHunter.isNavigateUrl=function (url) {
	return (url.match(/^https?:\/\/[^\/]+(?:youtube|googlevideo)\.com\/.+=navigate/i)!==null)
}
YouTubeHunter.createIdFromResponse=function(response){
	Logger.log('YouTubeHunter.createIdFromResponse')
	var r=new RegExp("(?:\\?v|&v|\\?video_id|&video_id|\\?id|&id)=([^\&]+)","i");
  	var m = r.exec(response.url);
  	var id=null
  	if (m !== null && m.length>=2) {
		id=m[1];
  	}
  	if(id===null && response.pageUrl) id=response.pageUrl
  	Logger.log('ID from respose: '+"__youtube__"+id)
  	return "__youtube__"+id
}

YouTubeHunter.huntFromResponse=function(response,mediaData,cb){
	Logger.log('YouTubeHunter.huntFromResponse')
	response.traceDataStream(function(data){
		try{
			if(!data) return cb()
			var data=QueryString.parse(data)
			if(!data.url_encoded_fmt_stream_map) return cb()
			Logger.log("RAW STREAM MAP: " +data.url_encoded_fmt_stream_map)
			var formatUrls=parseStreamMap(data.url_encoded_fmt_stream_map)
			Logger.log("FORMATS: " +formatUrls)				
			if(!formatUrls) return cb()
			mediaData.title=data.title
			mediaData.id="__youtube__"+data.video_id 
			var id=extractIdFromStreamUrl(formatUrls[0].url)
			if(id!==undefined) mediaData.id="__youtube__"+id
			mediaData.pageUrl=(response.document) ? response.document.location.href : "http://www.youtube.com/watch?v="+data.video_id
			if(formatUrls.needsDecode){
				Logger.log('NEEDS DECODE')
				YouTubeHunter.getDecoder(response.document.body.innerHTML,decodeUrls(mediaData,formatUrls,cb))
			}else{
				mediaData.qualityUrls=formatUrls
				cb(null,mediaData)		
			}
		}catch(e){
			Logger.log(e)
			cb(new Error('huntFromResponse failed'))
		}
	})

}

function decodeUrls(mediaData,formatUrls,cb){
	return function(err,decoder){

		if(err) return cb(err)
		if(!decoder) return cb(err)
		for (var i = formatUrls.length - 1; i >= 0; i--) {
			Logger.log("decodeUrls formatUrls:",formatUrls[i])
			if(!formatUrls[i].sig) continue;
			var urlData=formatUrls[i]
			var signature=decoder.decode(urlData.sig)
			formatUrls[i].url=urlData.url+"&signature="+signature
			
		}
		formatUrls.needsDecode=false
		mediaData.qualityUrls=formatUrls
		cb(null,mediaData)
	}
}

YouTubeHunter.huntFromDocument=function(response,mediaData,cb){
	Logger.log('YouTubeHunter.huntFromDocument')
	var doc=response.document
	if(!doc){
		Logger.log('No document in response')
		return cb()
	}
	mediaData.title=doc.title.replace(/(?: \- youtube|\u25B6 )/ig,"")
	mediaData.pageUrl=doc.location.href
	var streamMap=streamMapFromDoc(doc)
	Logger.log('StreamMap: '+streamMap)
	if(!streamMap) return cb()

	var formatUrls=parseStreamMap(streamMap)
	Logger.log(formatUrls)
	if(!formatUrls) return cb()		
	var id=extractIdFromStreamUrl(formatUrls[0].url)
	if(id!==undefined) mediaData.id="__youtube__"+id
	if(formatUrls.needsDecode){
		YouTubeHunter.getDecoder(response.document.body.innerHTML,decodeUrls(mediaData,formatUrls,cb))
	}else{
		mediaData.qualityUrls=formatUrls;
		cb(null,mediaData)
	}
	
}

YouTubeHunter.huntFromNavigate=function(response,mediaData,cb){
	Logger.log('YouTubeHunter.huntFromNavigate')
	response.traceDataStream(function(data){
		if(!data) return cb()
		try{
			Logger.log("VIDEO INFO: ",data)
			r=new RegExp('"url_encoded_fmt_stream_map":"([^"]+)',"i");
			var m = r.exec(data)
			if (m === null || m.length<2) return cb()
			var streamData=JSON.parse('["'+m[1]+'"]')[0]
			if(!data) return cb()
			Logger.log("STREAM MAP: ", streamData)			

			var formatUrls=parseStreamMap(streamData)
			Logger.log("FORMATS: ",formatUrls)
			if(!formatUrls) return cb()
			//id
			var id=extractIdFromStreamUrl(formatUrls[0].url)
			if(id!==undefined) mediaData.id="__youtube__"+id
			//title
			r=new RegExp('"title":"([^"]+)',"i");
			m = r.exec(data)
			if (m !== null && m.length>=2){
				mediaData.title=JSON.parse('["'+m[1]+'"]')[0]
			}		
			mediaData.pageUrl=(response.document) ? response.document.href : "http://www.youtube.com/watch?v="+data.video_id
			if(formatUrls.needsDecode){
				YouTubeHunter.getDecoder(data,decodeUrls(mediaData,formatUrls,cb))
			}else{
				mediaData.qualityUrls=formatUrls
				return cb(null,mediaData)
			}
			
		}catch(e){
			Logger.log(e);
			cb(new Error('huntFromNavigate failed'))
		}
		cb(null,mediaData)
	})
}

function streamMapFromDoc(doc){
	if(!doc || !doc.body) return;
	var urls=[];
	var r,m
	r=new RegExp("fmt_stream_map=([^\&]+)","gi");
	m = r.exec(doc.body.innerHTML);
	var urlData=null
	if (m !== null) {
		urlData=decodeURIComponent(m[1])	
	}else{
		r=new RegExp("fmt_stream_map&amp;quot;: &amp;quot;([^\&]+)","i");
		m = r.exec(doc.body.innerHTML);
		if (m !== null){
			urlData=decodeURIComponent(m[1])
		}else{
			Logger.log('STREAM MAP EXTRACT REGEXP 2 FAIL')
			r=new RegExp("fmt_stream_map\":\s*\"([^\"]+)","i");
			m = r.exec(doc.body.innerHTML);

			if (m !== null){
				var jsonEncoded=m[1]
				try{	
					var o=JSON.parse('["'+jsonEncoded+'"]')[0]
					if(o.fmt){
						urlData=o.fmt
					}else{
						urlData=o
					}
				}catch(e){ Logger.log(e) }
			}else{
				Logger.log('STREAM MAP EXTRACT REGEXP 3 FAIL')
			}	
		}
	}
	return urlData
}

function extractIdFromStreamUrl(url){
	var r,m,id
	r=new RegExp("id=([^\&]+)","i");
	m = r.exec(url);
	if (m !== null && m.length>=2) {
		id=m[1];
  	}
  	return id
}

function parseStreamMap(streamMap){
	if(!streamMap) return
	var streams=streamMap.split(",")
	var urls=[]
	for(var i = 0; i< streams.length;i++){
		var q=QueryString.parse(streams[i])
		if(!q.url) continue;
		var results={}
		results.url=q.url
		if(!q.itag || !youtubeItags[q.itag]) continue;
		results.qualityName=youtubeItags[q.itag].name
		results.qualityId=youtubeItags[q.itag].id
		results.contentType=youtubeItags[q.itag].contentType
		results.type=typeFromContentType(results.contentType)
		Logger.log('PARSED STEAM MAP',results.qualityName,q)	
		if(results.url.indexOf('signature')==-1){

			if(q.sig){
				results.url=q.url+"&signature="+q.sig				
			}
			if(q.s){
				Logger.log('DECODE REQUIRED for '+results.qualityName)				
				urls.needsDecode=true
				results.sig=q.s
			}
		}else{
			Logger.log('URL HAS NO SIGNATURE')
		}
		urls.push(results);
	}
	urls.sort(urlSort);

	if(urls.length===0) return;
	return urls;
}
YouTubeHunter.getDecoder=function(html,cb){
	Logger.log("Page source length:",html.length)
	if(YouTubeHunter.decoder) return cb(null,YouTubeHunter.decoder)	// return stored decoder instance	
	if(YouTubeHunter.sigCode.length===0){	// no stored sig function string so get a new one
		Logger.log('UPDATING DECODER CODE...')
		YouTubeHunter.updateSigCode(html,function(err,results){
			if(err) return cb(err)			
			YouTubeHunter.decoder=new SandboxedDecoder(YouTubeHunter.sigCode)
			cb(YouTubeHunter.decoder)			
		})
	}else{ // has sig function but no decoder instance yet, so create instance from function string
		YouTubeHunter.decoder=new SandboxedDecoder(YouTubeHunter.sigCode)
		Logger.log('STORED DECODER CODE: ',YouTubeHunter.sigCode)
		cb(null,YouTubeHunter.decoder)
	}	
}

YouTubeHunter.updateSigCode=function(html,cb){
	var url=YouTubeHunter.findHTML5url(html)
	Logger.log("HTML5 url: "+url)
	if(!url) return
	var req=new HttpRequest()
	req.onLoad=function(success,res){
		Logger.log("html5 url response: "+success)
		if(!success) return cb(false)
		if(res){
			var code=YouTubeHunter.parseHTML5Code(res)
			if(code===false) return cb(false)
			YouTubeHunter.sigCode=code
			Logger.log(code)
			cb(null)
		}
	}
	req.onError=function(err){
		Logger.log('Cannot get HTML5 Player: ',err)
		cb(err)
	}
	req.send(null,url)
}

YouTubeHunter.findHTML5url=function(html){
	var escapedUrl=html.match(/\"([^\"]+html5player[^\"]+\.js)/i)
	if(!escapedUrl || escapedUrl.length<2){ 
		
		url=html.match(/\/\/.+\/jsbin\/player.+\/base\.js/ig)
		if(!url || url.length<1){ 
			Logger.log('HTML5 PLAYER URL NOT FOUND')
			return false 
		}
		return 'http:'+url[0]
	}
	escapedUrl=escapedUrl[1].replace(/\\\//g,'/')
	
	return "https:"+escapedUrl
}

function findFns(s){
	var fnIdx = s.indexOf("function(a){a.reverse()}")
	var endIdx = s.indexOf(";var",fnIdx)
	var startIdx = s.lastIndexOf(";var",fnIdx)+1
	return s.substring(endIdx,startIdx)
}

function findDecode(s){
	var fnIdx = s.indexOf("a=a.split(\"\");")
	var endIdx = s.indexOf(";var",fnIdx)
	var startIdx = s.lastIndexOf("var",fnIdx)
	return s.substring(endIdx,startIdx)
}

YouTubeHunter.parseHTML5Code=function(s){
	var fnStr=findFns(s)+";"
	var decodeFnStr=findDecode(s)
	fnStr+=decodeFnStr
	var fnName=decodeFnStr.substring(4,decodeFnStr.indexOf("="))
    fnStr+=";result=null;try{result="+fnName+"(s);}catch(e){result=false;error=e;}"
    return fnStr
}

function SandboxedDecoder(fnStr) {
    this.fnStr=fnStr
    var nullPrincipal = Components.classes['@mozilla.org/nullprincipal;1'].getService(Components.interfaces.nsIPrincipal);
    try {
        this.sandbox = Components.utils.Sandbox(nullPrincipal, {
            sandboxName: 'netvideohunter_youtube_sandbox',
            wantComponents: false,
            wantXrays:true,
            /*sandboxPrototype: {
                s: null,
                result:null,
                error:null
            }*/
        });
        
    } catch (e) {
         Logger.log(e)
         return false
       
    }
    this.decode=function(sig){
    	Logger.log('sandbox: ',this.sandbox)
    	Logger.log('fnStr', this.fnStr)
    	this.sandbox.s=sig
    	this.sandbox.result=null
    	this.sandbox.error=null
  
        try{
           Components.utils.evalInSandbox(this.fnStr, this.sandbox);
        }catch(e){
        	Logger.log(e)
        	return false
        }

        return this.sandbox.result
    }
    this.destroy=function(){
        if (typeof Components.utils.nukeSandbox === "function") {
          Components.utils.nukeSandbox(this.sandbox);
        }
        this.sandbox = null;
    }
}


function typeFromContentType(contentType){
	if(!contentType) return 
	var ct=contentType.split(";")
	var t=ct[0].split('/')
	if(t.length<2) return
	return t[1]
}

function urlSort(a,b){
	return b.qualityId-a.qualityId;
}

