var EXPORTED_SYMBOLS = ["Response"];
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/net/UrlUtils.js");

var Response=function Response(subject){	


	this.httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
	this.request = subject.QueryInterface(Components.interfaces.nsIRequest);
	this.channel = subject.QueryInterface(Components.interfaces.nsIChannel);
	

	Object.defineProperty(this, "subject", {
		get: function() { return subject }
	})

	Object.defineProperty(this, "url", {
		get: function() { return this.request.name }
	})

	var _host // store value when get
	Object.defineProperty(this, "host", {
		get: function() { 
			if(!this.url) return
			if(!_host)	_host=UrlUtils.hostFromUrl(this.url)
			return _host
		}
	})

	Object.defineProperty(this, "extensionInUrl", {
		get: function() { 
			if(!this.url) return
			return UrlUtils.extensionFromUrl(this.url) 
		}
	})

	

	Object.defineProperty(this, "contentType", {
		get: function() { return this.channel.contentType }
	})

	Object.defineProperty(this, "contentLength", {
		get: function() { return this.channel.contentLength }
	})

	Object.defineProperty(this, "status", {
		get: function() { return this.httpChannel.responseStatus }
	})

	Object.defineProperty(this, "referrer", {
		get: function() { return (this.httpChannel.referrer) ?this.httpChannel.referrer.spec : "" }
	})

	Object.defineProperty(this, "referrerPolicy", {
		get: function() { return this.httpChannel.referrerPolicy }
	})

	Object.defineProperty(this, "requestMethod", {
		get: function() { return this.httpChannel.requestMethod }
	})

	var _pageUrl
	Object.defineProperty(this, "pageUrl", {
		get: function() {
			if(!_pageUrl){
				var doc=this.document
				if(doc){
					if(!doc.location || !doc.location.href) return
					_pageUrl=doc.location.href
				}	
			}
			return _pageUrl
		}
	})

	var _pageHost
	Object.defineProperty(this, "pageHost", {
		get: function() {
			if(!_pageHost) {
				if(!this.pageUrl) return
				var url=UrlUtils.hostFromUrl(this.pageUrl)
				if(!url) return
				_pageHost=url
			}
			return _pageHost
		}
	})

	var _favicon;
	Object.defineProperty(this, "favicon", {
		get: function() {
			if(_favicon) return _favicon
			var doc=this.document
			if(!doc) return
			var linkTags=doc.getElementsByTagName("link")
			var iconUrl=null;
			for(var i=0;i<linkTags.length;i++){
				var item=linkTags[i];
				if(item.hasAttribute("rel")	&& item.getAttribute("rel").indexOf("icon")!=-1	&& item.hasAttribute("href")){
					iconUrl=item.getAttribute("href");
				}
			}

			if(iconUrl){
				var urlStart=iconUrl.indexOf("//");
				if(urlStart!==-1){
					if(urlStart>1){
						_favicon=iconUrl;
					}else{
						var path=iconUrl.substr(urlStart+2);
						_favicon="http://"+path;
					}
				}else{
					if(iconUrl.substr(0,1)!="/") iconUrl="/"+iconUrl;
					_favicon="http://"+doc.location.host+iconUrl;
				}
			}else{
				_favicon="http://"+doc.location.host+"/favicon.ico";
			}
			return _favicon
		},
		set:function(value){
			_favicon=value
		}
	})

	Object.defineProperty(this, "window", {
		get: function() { 
			if (this.request instanceof Components.interfaces.nsIRequest){
			    try{
			      if (this.request.notificationCallbacks){
			        return this.request.notificationCallbacks
			                      .getInterface(Components.interfaces.nsILoadContext)
			                      .associatedWindow;
			      }
			    } catch(e) {
			    	Logger.log('window getter Exception',e)	
			    }

			    try{
			      if (this.request.loadGroup && this.request.loadGroup.notificationCallbacks) {
			        return this.request.loadGroup.notificationCallbacks
			                      .getInterface(Components.interfaces.nsILoadContext)
			                      .associatedWindow;
			      }
			    } catch(e) {
			   		Logger.log('window getter Exception',e)	
			    }
		  	}			

			try {
				var interfaceRequestor = this.httpChannel.notificationCallbacks.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				return interfaceRequestor.getInterface(Components.interfaces.nsIDOMWindow);
			} catch (e) { 
				Logger.log('window getter Exception',e)	
			}

		}
	})

	Object.defineProperty(this, "document", {
		get: function() { 
			if(!this.window) return
			return this.window.document
		}
	})

	Object.defineProperty(this, "uploadStream", {
		get: function() { 
			try {
				var uploadChannel=this.httpChannel.QueryInterface(Components.interfaces.nsIUploadChannel);
				if (uploadChannel.uploadStream) {
					return uploadChannel.uploadStream;
				} 
			} catch (e) {}
		}
	})

	Object.defineProperty(this, "cacheKey", {
		get: function() { 
			if (!(this.channel instanceof Components.interfaces.nsICachingChannel)) null
			var cachingChannel = subject.QueryInterface(Components.interfaces.nsICachingChannel);
			return cachingChannel.cacheKey		

		}
	})

	Object.defineProperty(this, "fromPrivateBrowsing", {
		get:function(){
			if(!this.window) return 
			try{				
				return this.window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsILoadContext)
				.usePrivateBrowsing;
			}catch(err){ Logger.log(err) }
		}
	})

	this.traceDataStream=function traceDataStream (cb) {
		var tracingListener = new TracingListener();	
		try{
	   		var TraceableChannel=subject.QueryInterface(Components.interfaces.nsITraceableChannel);
		}catch(e){ 
			Logger.log(e); 
			return;
		}
		tracingListener.callback=cb
		tracingListener.originalListener = TraceableChannel.setNewListener(tracingListener);
	}

	/*this.loadContext = this.window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsILoadContext)*/

}


function TracingListener() {
	this.receivedData=[]
    this.originalListener = null;
    this.callback=null
}

TracingListener.prototype ={
    onDataAvailable: function(request, context, inputStream, offset, count) {
    	var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
    		.createInstance(Components.interfaces.nsIBinaryInputStream);   
        var storageStream = Components.classes["@mozilla.org/storagestream;1"]
        	.createInstance(Components.interfaces.nsIStorageStream);
        var binaryOutputStream = Components.classes["@mozilla.org/binaryoutputstream;1"]
        	.createInstance(Components.interfaces.nsIBinaryOutputStream);       

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));        
        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);
        
        this.receivedData.push(data);

        binaryOutputStream.writeBytes(data, count);

        this.originalListener.onDataAvailable(request, context,
            storageStream.newInputStream(0), offset, count);
    },

    onStartRequest: function(request, context) {
    	this.receivedData=[]
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode) {
    	var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"]
    		.getService(Components.interfaces.nsIUTF8ConverterService);
    	var data = this.receivedData.join();
    	data = utf8Converter.convertURISpecToUTF8 (data, "UTF-8"); 
    	this.callback(data)
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
}
