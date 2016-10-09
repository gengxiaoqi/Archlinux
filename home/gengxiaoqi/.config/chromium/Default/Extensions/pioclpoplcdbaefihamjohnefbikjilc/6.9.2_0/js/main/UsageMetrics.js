/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
function UsageMetrics(a,b,c){"use strict";function d(){var a=new Date,b=Math.floor(a.getMinutes()/j)*j;return a.setMinutes(b),a.setSeconds(0),a.setMilliseconds(0),Math.round(a.getTime()/1e3)}function e(a){var b=d();return l>=b?void(a&&a()):(m[b]=!0,void f(a))}function f(a){if(!navigator.onLine)return void(a&&a());var b=0,c=0;for(var d in m){var e=parseInt(d);b++,e>c&&(c=e)}b>0?g(b,c,a):a&&a()}function g(d,e,f){function g(a,d){if(a){m=[],e>l&&(l=e);var g=Persistent.get("uploaded");g||(g={}),g[j.userId]=a.uploaded,Persistent.set("uploaded",g);var h=Persistent.get("savedAuthInfo"),i=Persistent.get("shownNearQuotaUpsell"),n=Persistent.get("shownSpeedbump");h&&h.userInfo&&h.userInfo[j.userId]&&h.userInfo[j.userId].monthEnd&&h.userInfo[j.userId].monthEnd<new Date&&(h.userInfo[j.userId].monthEnd+=2592e6,i||(i={}),delete i[j.userId],Persistent.set("shownNearQuotaUpsell",i),n||(n={}),delete n[j.userId],Persistent.set("shownSpeedbump",n)),Persistent.set("savedAuthInfo",h);var o=Persistent.get("userLastUpdated")||0,p=Persistent.get("googleConnection");(!p||!p[j.userId]||p[j.userId].version<k||new Date>=p[j.userId].expires||a.userLastUpdated>o||a.userLastUpdated>p[j.userId].lastQueried)&&extension.createUtilityClient().getOAuthCredential(j.authenticationToken,OAUTH_CREDENTIAL_SERVICE_GOOGLE_CONNECT,function(a){var b=Persistent.get("googleConnection");b||(b={}),b[auth.getCurrentUser()]={lastQueried:new Date-0,connected:!0,expires:a.expires,version:k},Persistent.set("googleConnection",b)},function(a){if("EDAMNotFoundException"===a.__proto__.name&&"OAuthCredential"===a.identifier||"EDAMUserException"===a.__proto__.name&&a.code===EDAMErrorCode.DATA_CONFLICT){var b=Persistent.get("googleConnection");b||(b={}),b[auth.getCurrentUser()]={lastQueried:new Date-0,connected:!1,version:k},Persistent.set("googleConnection",b)}else log.error(a)}),a.userLastUpdated>o&&(Persistent.set("userLastUpdated",a.userLastUpdated),b.apply(null,c))}f&&f()}function h(){n.client.NoteStore.getSyncStateWithMetrics(g,j.authenticationToken,{sessions:d})}function i(a){j=a,j&&j.authenticationToken?(n=new JsonRpc(null,["NoteStore.getSyncStateWithMetrics"],extension.getBaseUrl()),n.initWithAuthToken(j.authenticationToken,h)):(log.warn("Tried to send UsageMetrics, but not logged in."),f&&f())}var j,n;a(i)}function h(){var a={};a.lastSent=l,a.activityBlocks={};for(var b in m)a.activityBlocks[b]=m[b];return a}function i(a){try{l=a.lastSent,m=a.activityBlocks}catch(b){l=0,m={},log.warn("Failed to import saved UsageMetrics from JSON object.")}}var j=15,k=2,l=0,m={};this.recordActivity=e,this.send=f,this.getJson=h,this.importFromJson=i,Object.preventExtensions(this)}function UsageMetricsManager(a,b,c){function d(){try{var d=Persistent.get("usageMetrics");for(var e in d)g[e]=new UsageMetrics(a,b,c),g[e].importFromJson(d[e])}catch(f){log.warn("Failure restoring usage metrics. Setting blank."),g={}}}function e(){var a={};for(var b in g)a[b]=g[b].getJson();Persistent.set("usageMetrics",a)}function f(){function d(d){var h=Persistent.get("lastActiveTimes");h||(h={});var i=d?d.userId:"unauthed";if(h[i]||(h[i]={count:0}),h.unauthed||(h.unauthed={count:0}),h[i].time=(new Date).getTime(),h.unauthed.time=h[i].time,Persistent.set("lastActiveTimes",h),d&&(f=d.username),f){var j=g[f];j||(j=new UsageMetrics(a,b,c),g[f]=j),j.recordActivity(e)}}var f="";a(d)}var g={};d(),this.recordActivity=f,Object.preventExtensions(this)}Object.preventExtensions(UsageMetrics),Object.preventExtensions(UsageMetricsManager);