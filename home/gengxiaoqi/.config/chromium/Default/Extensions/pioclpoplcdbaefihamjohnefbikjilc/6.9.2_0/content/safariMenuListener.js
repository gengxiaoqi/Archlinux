/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
document.addEventListener("contextmenu",function(a){var b=!1;if(window.getSelection().rangeCount){var c=window.getSelection().getRangeAt(0);c.collapsed||(b=!0)}var d=!1;document.querySelector("embed[type='application/pdf']")&&(d=!0),safari.self.tab.setContextMenuEventUserInfo(a,{node:a.target.nodeName,selection:b,srcUrl:a.target.src,url:document.location.href,pdf:d})},!1);