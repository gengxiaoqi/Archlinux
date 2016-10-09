Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");
var EXPORTED_SYMBOLS = ["HttpUtils"]; 

var HttpUtils=new function(){

	this.forceCaching=function(httpChannel){
		var today = new Date();
            //Pragma:
        try {
            var value=httpChannel.getResponseHeader("Pragma");
            console.log("Pragma: "+value)
            value=value.replace(/no\-cache/g, "");
            httpChannel.setResponseHeader("Pragma", value, false);
            
        } catch (e) { Logger.log(e);
        }

        //Last-Modified:
        try {
            httpChannel.setResponseHeader("Last-Modified", new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toGMTString(), false);            
        } catch (e) { Logger.log(e); 
        }

        //Expires:
        try {
            httpChannel.setResponseHeader("Expires", new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toGMTString(), false);            
        } catch (e) { Logger.log(e); 
        }

        //Date:
        try {
            httpChannel.setResponseHeader("Date", new Date(today.getTime()).toGMTString(), false);           
        } catch (e) { Logger.log(e); 
        }

        //Cache-Control:
        try {
            httpChannel.setResponseHeader("Cache-Control", "", false);
        } catch (e) { Logger.log(e); 
        }

	}

}
