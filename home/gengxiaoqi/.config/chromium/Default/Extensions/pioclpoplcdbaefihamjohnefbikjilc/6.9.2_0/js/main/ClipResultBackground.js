/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
function ClipResultBackground(){"use strict";function a(a,b,c){var d=document.getElementById("copier");d.value=a.text,d.select(),Browser.sendToTab(b.tab,{name:"sh_urlCopied",copied:document.execCommand("copy",!1,null)})}function b(a,b,c){function d(){g=new JsonRpc(null,["NoteStore.emailNote","NoteStoreExtra.emailNotesSharedWorkaround"],extension.getBaseUrl()),g.initWithAuthToken(a.token,e)}function e(){a.shared?g.client.NoteStoreExtra.emailNotesSharedWorkaround(f,a.token,auth.getUserInfo().authenticationToken,{javaClass:"java.util.ArrayList",list:a.recipients},{javaClass:"java.util.ArrayList",list:[a.noteGuid]},a.message):g.client.NoteStore.emailNote(f,a.token,{guid:a.noteGuid,toAddresses:{javaClass:"java.util.ArrayList",list:a.recipients},message:a.message})}function f(a,b){b&&log.error(b)}var g;d()}function c(a,b,c){function d(c){for(var d=[],e=0;e<c.length;e++)c[e].type===ContactType.EMAIL&&d.push({name:c[e].name,email:c[e].id});Browser.sendToTab(b.tab,{name:"sh_receiveContacts",contacts:d,count:a.count})}function e(a){log.error(a)}auth.isAuthenticated(function(b){b?extension.createNoteStoreClient().findContacts(b.authenticationToken,new ContactsQuery({maxEntries:5,prefix:a.prefix}),d,e):log.error("not logged in while finding contacts")})}function d(a,b,c){function e(a){Browser.sendToTab(b.tab,{name:"cr_receiveRelatedNotes",relatedNotes:a})}var f=extension.getPendingNote(a.pendingNoteKey);if(f&&f.relatedNotes){var g=null;auth.getUserInfo().bizAuthenticationToken&&(g=/S=([^:]+)/.exec(auth.getUserInfo().bizAuthenticationToken)[1]),e(extension.combineRelatedNotes(f.relatedNotes.pers,auth.getUserInfo().shardId,f.relatedNotes.biz,g,f.relatedNotes.containingNotebooks))}else a.recText?sidebarBackground.getSmartFilingInfo({notesOnly:!0,pendingNoteKey:a.pendingNoteKey,recText:a.recText,url:a.url,callback:function(a,b){d({pendingNoteKey:a},b)}},b):e([])}function e(a,b,c){function d(a,c){a.name="cr_receiveSameSiteNotes",Browser.sendToTab(b.tab,a)}function e(a){m=a,(j.bizAuthenticationToken&&n||!j.bizAuthenticationToken)&&d(g())}function f(a){n=a,m&&d(g())}function g(){for(var a=0;a<m.notes.list.length;a++)m.notes.list[a].shardId=k.shardId;if(j.bizAuthenticationToken){for(var a=0;a<n.notes.list.length;a++)n.notes.list[a].shardId=l.shardId,n.notes.list[a].inBusinessNotebook=!0,m.notes.list.push(n.notes.list[a]);m.notes.list.sort(function(a,b){return b.updated-a.updated})}return m}function h(){k.client.NoteStoreExtra.findNotesWithSnippet(e,j.authenticationToken,p,0,q,o),j.bizAuthenticationToken&&l.client.NoteStoreExtra.findNotesWithSnippet(f,j.bizAuthenticationToken,p,0,q,o)}function i(a){if(j=a,j&&j.authenticationToken){var b=extension.getBaseUrl();k=new JsonRpc(null,["NoteStoreExtra.findNotesWithSnippet"],b),k.initWithAuthToken(j.authenticationToken,function(){j.bizAuthenticationToken?(l=new JsonRpc(null,["NoteStoreExtra.findNotesWithSnippet"],b),l.initWithAuthToken(j.bizAuthenticationToken,h)):h()})}}var j,k,l,m,n,o=a.resultSpec,p=a.noteFilter,q=10;auth.isAuthenticated(i),c&&c()}function f(a,b,c){a.name="cr_initialize",a.baseUrl=options.get("secureProto")+extension.getBootstrapInfo("serviceHost"),a.locale=extension.getBootstrapInfo("name"),a.userId=auth.getCurrentUser(),a.afterClip=options.get("afterClip"),a.basic=auth.getUserInfo().basic,a.plus=auth.getUserInfo().plus,a.premium=auth.getUserInfo().premium,a.noteSizeMax=auth.getUserInfo().noteSizeMax,a.quota=auth.getUserInfo().quota,a.userNoteCountMax=auth.getUserInfo().userNoteCountMax,a.sharingOptionsEnabled={facebook:extension.getBootstrapInfo("enableFacebookSharing"),linkedin:extension.getBootstrapInfo("enableLinkedInSharing"),singleNote:extension.getBootstrapInfo("enableSingleNoteSharing"),twitter:extension.getBootstrapInfo("enableTwitterSharing")},Browser.sendToTab(b.tab,a)}function g(a,b,c){function d(a){}function e(a){log.error(a)}var f=new NoteAttributes({source:"web.clip",sourceURL:a.sourceURL,reminderOrder:a.reminderOrder});a.reminderTime&&(f.reminderTime=a.reminderTime),extension.createNoteStoreClientFromUrl(a.noteStoreUrl).updateNote(a.token,new Note({guid:a.noteGuid,title:a.title,attributes:f}),d,e)}function h(b,c,d){function e(d){var e=options.get("secureProto")+extension.getBootstrapInfo("serviceHost")+"/shard/"+g+"/sh/"+b.guid+"/"+d;Browser.sendToTab(c.tab,{name:"sh_complete",url:e}),"url"===b.shareType&&a({text:e},c)}function f(a){log.error(a)}var g=null;g=/S=(s\d+):/.exec(b.token)[1],extension.createNoteStoreClientFromUrl(b.noteStoreUrl).shareNote(b.token,b.guid,e,f)}Browser.addMessageHandlers({copyText:a,emailNote:b,findContacts:c,getRelatedNotes:d,getSameSiteNotes:e,initializeClipResult:f,setReminder:g,shareNote:h}),Object.preventExtensions(this)}Object.preventExtensions(ClipResultBackground);