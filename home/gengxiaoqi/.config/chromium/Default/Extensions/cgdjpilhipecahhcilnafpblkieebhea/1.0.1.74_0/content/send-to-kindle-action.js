/*
 Copyright (c) 2012 Amazon.com, Inc. All rights reserved.         *
*/
(function(){window.addEventListener("keyup",function(a){null===a.target.tagName.match(/^input|textarea$/i)&&(a={control:a.ctrlKey,alt:a.altKey,shift:a.shiftKey,key:a.which},!0===((a.control||a.alt||a.shift)&&(47<a.key&&91>a.key||36<a.key&&41>a.key)||!(a.control||a.alt||a.shift)&&114<a.key&&122>a.key&&116!==a.key)&&chrome.extension.sendRequest({action:"shortcut",shortcut:a}))});chrome.extension.onRequest.addListener(function(a,c,b){"text-selected"===a.action&&(a=document.getSelection(),b({action:"text-selected",
isSelected:"Range"===a.type}))});null!==document.location.href.match(/ref_?=stk_(gch|mff|asf)_ft/)&&chrome.extension.sendRequest({action:"check-guid"})})();