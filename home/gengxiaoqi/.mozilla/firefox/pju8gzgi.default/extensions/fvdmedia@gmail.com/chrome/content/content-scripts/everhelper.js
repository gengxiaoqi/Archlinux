var EVERHELPER_HOST = /^((?:[a-z0-9-]+\.)?everhelper.me|everhelper.local|testadmin\.everhelper\.me|eh-test\.nimbusweb\.me)$/i;

addMessageListener("fvd-sync:processor-response", function(message) {
  var win = message.target.content;
  var responseData = {
    action: "_response"
  };
  for( var k in message.data.response ){
    responseData[k] = message.data.response[k];
  }
  //dump("Send response for " + message.data.id + ": " + JSON.stringify(responseData) + "\n");
  win.postMessage( {
    type: "EverHelperExtMessage",
    responseToId: message.data.id,
    data: responseData
  }, "*" );
});

addEventListener("DOMContentLoaded", function(event) {
  var doc = event.originalTarget;
  var win = doc.defaultView;
  var host = doc.location.host;
  if(EVERHELPER_HOST.test(host)) {
    win.addEventListener("message", function(event) {
      if (event.source != win){
        return;
      }
      if (event.data.data && event.data.type && (event.data.type == "EverHelperExtMessage")) {
        var data = event.data.data;
        if( !data.action ){
          return;
        }
        sendAsyncMessage("fvd-sync:processor-message", event.data);
      }
    }, false);
  }
});
