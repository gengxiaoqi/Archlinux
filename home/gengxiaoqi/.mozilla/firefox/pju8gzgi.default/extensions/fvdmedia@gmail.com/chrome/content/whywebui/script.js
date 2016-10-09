Components.utils.import("resource://fvd.sync.modules/misc.js");

function openLink( event ){	
	fvd_sync_Misc.navigate_url( event.target.getAttribute("href") );
	
	event.stopPropagation();
	event.preventDefault();
	
	return false;
}

window.addEventListener( "load", function(){
	
	var links = document.getElementById("frame").contentDocument.getElementsByTagName("a");
	
	for( var i = 0; i != links.length; i++ ){
		
		links[i].addEventListener( "click", openLink, false );
						
	}
	
}, false );
