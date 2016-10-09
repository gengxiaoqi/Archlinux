var EXPORTED_SYMBOLS = ["HttpRequest"]; 

// === HttpRequest ===

var HttpRequest=function(){	
	var t=this
    this.enabled=true;
	this.reqUrl="";
    var req = Components.
              classes["@mozilla.org/xmlextras/xmlhttprequest;1"].
              createInstance();
 
    req.QueryInterface(Components.interfaces.nsIDOMEventTarget);
    req.addEventListener("load", function(){ 			
		if (req.readyState == 4) {
		 if (req.status == 200) {  		 		
			 t.onLoad(true,req.responseText)  			
		 } else {
			 t.onLoad(false)
		 }
	  }
	}, false);
    req.addEventListener("error", t.onError, false);    

    req.QueryInterface(Components.interfaces.nsIXMLHttpRequest);
	if(!req) return false;
	
	this.onLoad=function(success,response){};
	this.onError=function(error){}
	
	this.send=function(params,url){        
		if(!url) url=this.reqUrl
		params=this.encodeParams(params);
		req.abort()
		if(params){            
            req.open('POST', url, true);
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            req.setRequestHeader("Content-length", params.length);
        }else{
            req.open('GET', url, true);
        }
		req.setRequestHeader('X-Requested-With','XMLHttpRequest');
		req.setRequestHeader("Connection", "close");		
		req.send(params);		
	}
	
	this.encodeParams=function(params){
		if(!params) return '';
		var pairs=params.split("&");
		var key
		var value
		
		for(i in pairs){
			if(!pairs[i].indexOf) continue;
			key=pairs[i].substr(0,pairs[i].indexOf("=")) 
			key=encodeURIComponent(key);
			value=pairs[i].substr(pairs[i].indexOf("=")+1) 
			value=encodeURIComponent(value);	
			pairs[i]=key+"="+value;
		}		
		return pairs.join("&");
	}
}
