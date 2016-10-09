var EXPORTED_SYMBOLS = ["UrlUtils"]; 

var UrlUtils=new function(){
	
	this.siteFromUrl=function(url){
		var arr1=url.split("/");
		if(arr1.length<3) return null;
		var arr2=arr1[2].split(".");
		if(arr2.length>=2){
			return arr2[arr2.length-2];
		}else{
			if(arr2.length==1){
				return arr2[0];
			}
		}
	}

	this.hostFromUrl=function(url){
		var arr1=url.split("/");
		if(arr1.length<3) return null;
		var arr2=arr1[2].split(".");
		if(arr2.length>=2){
			return arr2[arr2.length-2]+"."+arr2[arr2.length-1];
		}else{
			if(arr2.length==1){
				return arr2[0];
			}
		}
	}

	this.extensionFromUrl=function (url){
		var m=url.match(/\/\/[^\/]+\/[^\.]+\.([a-z0-9]+)[^\?]*\?*.*$/i)
		if(m===null) return
		if(m.length<2) return
		return m[1]
	}
}