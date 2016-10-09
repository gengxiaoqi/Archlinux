Components.utils.import("resource://nvhlib/com/netvideohunter/net/HttpRequest.js");
var EXPORTED_SYMBOLS = ["Logger"];


var Logger=new function(){
	var messages=[];
	this.window=null;
	this.collect=false;

	this.log=function(message){
		return false;
		var args = Array.prototype.slice.call(arguments)

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        if(window.console){
        	window.console.log.apply(window.console,args)
        }else if(window.Firebug && window.Firebug.Console){ 
        	window.Firebug.Console.log.apply(window.Firebug.Console,args)
        }
		if(this.collect) messages.push(args)
	}

	this.send=function(){
		var window=this.window;
		if(messages.length<=0){
			window.alert("There is no error to send.");
			return false;
		}

		var req=new HttpRequest()
		req.reqUrl="http://www.netvideohunter.com/support/errorlog.php";
		req.onLoad=function(success,response){
		  if(success && response && response.length>0){
				window.alert(response);
		  }else{
				window.alert("Sending failed");
		  }
		};
		var p="messages="+messages.join("\n\n");
		req.send(p);

	}


}
