/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
function runEnContentScripts(){for(var a in enContentScripts)enContentScripts[a].regexp.test(document.location.href)&&enContentScripts[a].func()}function notifyWeb(){var a=document.createElement("div");SAFARI?a.setAttribute("id","__en_safari_extension"):a.setAttribute("id","__en_chrome_extension"),a.style.display="none",document.body.appendChild(a)}function notifyInstalled(){var a=document.createElement("meta");if(a.name="evernote-webclipper-extension",a.content="installed",document.head.appendChild(a),document.body){var b=document.body.className?document.body.className:"";b=b.replace(/(^|\s+)evernote-webclipper-extension($|\s+)/," ");var c=b.trim().split(/\s+/);c.push("evernote-webclipper-extension"),document.body.className=c.join(" ")}}var enContentScripts={notifyWeb:{regexp:/^https?:\/\/(www|stage|stage-china|app)\.(evernote|yinxiang)\.com\/Home\.action/,func:notifyWeb},notifyInstalled:{regexp:/^https?:\/\/([A-Za-z0-9-]+\.)*(evernote|yinxiang)\.com\//,func:notifyInstalled}};window===window.parent&&window.addEventListener("DOMContentLoaded",runEnContentScripts);