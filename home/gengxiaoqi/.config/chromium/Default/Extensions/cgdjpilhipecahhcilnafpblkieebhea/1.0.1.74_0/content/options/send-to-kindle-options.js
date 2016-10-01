/*
 Copyright (c) 2012 Amazon.com, Inc. All rights reserved.         *
*/
jQuery(function(d){var e=window.$SendToKindle={spinner:d(".s2k-setup-spinner"),bootstrap:function(){e.localize();e.registerEvents();chrome.storage.sync.get("s2k-send-shortcut",function(a){e.updateShortcut(a["s2k-send-shortcut"]||null,d("#s2k-send"))});chrome.storage.sync.get("s2k-preview-shortcut",function(a){e.updateShortcut(a["s2k-preview-shortcut"]||null,d("#s2k-preview"))})},registerEvents:function(){d(".s2k-shortcut").on("keypress",e.onSuppressEvent);d(".s2k-shortcut").on("keydown",e.onSuppressEvent);
d(".s2k-shortcut").on("keyup",e.onShortcut);d(".s2k-shortcut-remove").on("click",e.onRemoveShortcut)},localize:function(){d.each(d("[s2k-string]"),function(){var a=d(this);a.text(chrome.i18n.getMessage(a.attr("s2k-string")))});d.each(d("[s2k-link]"),function(){var a=d(this);a.attr("href",chrome.i18n.getMessage(a.attr("s2k-link")))})},updateShortcut:function(a,b){var c="";if(null!==a)if(a.control&&(c+=chrome.i18n.getMessage("kbsCtrl")+" + "),a.shift&&(c+=chrome.i18n.getMessage("kbsShift")+" + "),a.alt&&
(c+=chrome.i18n.getMessage("kbsAlt")+" + "),47<a.key&&91>a.key)c+=String.fromCharCode(a.key);else if(36<a.key&&41>a.key)switch(a.key){case 37:c+=chrome.i18n.getMessage("kbsArrowLeft");break;case 38:c+=chrome.i18n.getMessage("kbsArrowUp");break;case 39:c+=chrome.i18n.getMessage("kbsArrowRight");break;case 40:c+=chrome.i18n.getMessage("kbsArrowDown")}else c+="F"+(a.key-111);b.val(c)},isShortcutEqual:function(a,b){return null!==a&&null!==b&&a.control===b.control&&a.alt===b.alt&&a.shift===b.shift&&a.key===
b.key},onSuppressEvent:function(a){a.preventDefault();a.stopPropagation()},onShortcut:function(a){a.preventDefault();a.stopPropagation();var b={control:a.ctrlKey,shift:a.shiftKey,alt:a.altKey,key:a.keyCode};if((b.control||b.alt||b.shift)&&(47<b.key&&91>b.key||36<b.key&&41>b.key)||!(b.control||b.alt||b.shift)&&114<b.key&&122>b.key&&116!==b.key){var c=d(a.target).attr("id");"s2k-send"===c?chrome.storage.sync.get("s2k-preview-shortcut",function(c){e.isShortcutEqual(b,c["s2k-preview-shortcut"]||null)||
(chrome.storage.sync.set({"s2k-send-shortcut":b}),e.updateShortcut(b,d(a.target)))}):"s2k-preview"===c&&chrome.storage.sync.get("s2k-send-shortcut",function(c){e.isShortcutEqual(b,c["s2k-send-shortcut"]||null)||(chrome.storage.sync.set({"s2k-preview-shortcut":b}),e.updateShortcut(b,d(a.target)))})}},onRemoveShortcut:function(a){a=d(a.target).attr("id");"s2k-send-remove"===a?(chrome.storage.sync.remove("s2k-send-shortcut"),e.updateShortcut(null,d("#s2k-send"))):"s2k-preview-remove"===a&&(chrome.storage.sync.remove("s2k-preview-shortcut"),
e.updateShortcut(null,d("#s2k-preview")))}};e.bootstrap()});