var EXPORTED_SYMBOLS = ["fvd_sync_NewsLetter"]; 

Components.utils.import("resource://fvd.sync.modules/settings.js");

var fvd_sync_NewsLetter = new function(){
	
	const LIST_NAME = "fvdsuite";
	
	var self = this;
	
	this.ERROR_FAIL_SUBSCRIBE = -1;
	
	this.displayDialog = function( parent, email ){
		var arguments = {
			email: email
		};		
		
		parent.openDialog('chrome://fvd.sync/content/dialogs/subscribe_newsletter.xul', '', 'chrome,titlebar,toolbar,centerscreen,modal', arguments);
	}
		
	
	this.subscribe = function( email, name, callback ){
		
		var alreadySubscribed = [];
		try{
			alreadySubscribed = JSON.parse( fvd_sync_Settings.getStringVal( "sd.subscribed_emails" ) );
		}
		catch( ex ){
			
		}
		
		if( alreadySubscribed.indexOf( email ) != -1 ){
			return;
		}
		
		alreadySubscribed.push( email );
		
		fvd_sync_Settings.setStringVal( "sd.subscribed_emails", JSON.stringify( alreadySubscribed ) );
				
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);  

		req.open("POST", "http://www.aweber.com/scripts/addlead.pl");  
		
		var sendData = {
			meta_web_form_id: 1361689956,
			meta_split_id: "",
			listname: LIST_NAME,
			redirect: "http://www.aweber.com/thankyou-coi.htm?m=text",
			meta_adtracking: "FVD_Media",
			meta_message: "1",
			meta_required: "name,email",
			meta_tooltip: "",
			name: name,
			email: email,
			submit: "Submit"
		};
		
		var sendParams = [];
		
		for( var k in sendData ){
			sendParams.push( k + "=" + encodeURIComponent( sendData[k] ) );
		}
		
		req.onload = function(){
			if( responseText.indexOf( "You're Almost Done" ) == -1 ){
				callback( self.ERROR_FAIL_SUBSCRIBE );
			}
			else{
				callback( 0 );
			}
		}
		
		req.onerror = function(){
			callback( self.ERROR_FAIL_SUBSCRIBE );
		}
		
		
		req.send( sendParams.join("&") );		
	}
	
}
