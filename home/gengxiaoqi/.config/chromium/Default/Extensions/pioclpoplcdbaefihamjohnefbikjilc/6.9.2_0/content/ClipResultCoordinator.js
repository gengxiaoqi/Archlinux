/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
function ClipResultCoordinator(){function a(a){e&&e.parentNode&&(a?(e.addEventListener("webkitAnimationEnd",b,!1),e.className="evernoteClipperHide"):b())}function b(){e.parentNode.removeChild(e),e=null}function c(a,b,c){"number"==typeof a.height&&(a.height+="px"),e.style.setProperty("height",a.height,"important")}function d(b,c,d,f,g){a(!1),e=document.createElement("iframe"),e.id="evernoteClipperResult",/^frameset$/i.test(document.body.nodeName)?$("frameset").parent().prepend(e):$("body").prepend(e),e.addEventListener("load",function(){Browser.sendToExtension({name:"initializeClipResult",pendingNoteKey:b,recText:f,title:c,url:d}),g()}),e.src=Browser.extension.getURL("content/clip_result/clip_result.html"),window.focus()}var e;window.addEventListener("click",a),Browser.addMessageHandlers({hideClipResult:a,setClipResultHeight:c}),this.hideClipResult=a,this.showClipResult=d,Object.preventExtensions(this)}Object.preventExtensions(ClipResultCoordinator);