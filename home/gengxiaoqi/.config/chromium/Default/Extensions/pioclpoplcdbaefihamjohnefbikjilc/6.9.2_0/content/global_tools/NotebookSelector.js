/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
function NotebookSelector(a,b,c,d,e){"use strict";function f(){return fa.value.trim()}function g(){var a=f();if(""!==a){EDGE&&document.activeElement.blur(),ja.disabled=!0,x(!1);var b=la.checked,c=b===!0?null:3;if(h(a,c))J({error:Browser.i18n.getMessage("Error_Create_Notebook_ExistingName")});else{var d={name:a,personalNotebook:b};e(d)}}}function h(a,b){for(var c=a.toLowerCase(),d=0,e=pa.notebooks.length;d<e;d++)if(c===pa.notebooks[d].name.toLowerCase()&&(pa.notebooks[d].type===b||!pa.notebooks[d].type&&!b))return!0;return!1}function i(){fa.placeholder=Browser.i18n.getMessage("createNewNotebook"),ga.classList.add("hide"),fa.value="",la.checked=!0,ja.disabled=!1,G()}function j(){ga.classList.contains("hide")&&(Browser.sendToExtension({name:"trackEvent",category:"notebooks",action:"add_notebook"}),fa.placeholder=Browser.i18n.getMessage("enterName"),ga.classList.remove("hide"),setHeight())}function k(a){log.log("Generate notebooks list"),x(!1),d()}function l(a){return!(document.body.classList.contains("email")&&a.visibleToOthers)}function m(a){if(0===pa.notebooks.length&&0===a.notebooks.length&&a.exception?(_.classList.remove("hide"),aa.innerText=a.exception.msg):_.classList.add("hide"),a.exception){if(0!==pa.notebooks.length)return G(a.exception.msg),void x(!0)}else G();pa=a,B();for(var b=!1,c=null,d=1e3,e=0,f=pa.notebooks.length;e<f;e++){var g=pa.notebooks[e],h=n(g);((g.sharedNotebookIds?g.sharedNotebookIds.length:0)>0||g.published)&&(g.visibleToOthers=!0),qa&&qa===g.guid&&(b=!0,D(h)),pa.createdNotebookGuid&&g.guid===pa.createdNotebookGuid&&d>10?(qa=pa.createdNotebookGuid,pa.optionSelectedNotebook=g,d=10):pa.alwaysStartInNotebookGuid&&g.guid===pa.alwaysStartInNotebookGuid&&d>20?(pa.optionSelectedNotebook=g,d=20):pa.smartFilingNotebookGuid&&g.guid===pa.smartFilingNotebookGuid&&d>30?(pa.smartFilingNotebook=g,pa.optionSelectedNotebook=g,d=30):g.guid===pa.recentNotebookGuid&&d>40?(pa.recentNotebook=g,pa.alwaysStartInNotebookGuid||(pa.optionSelectedNotebook=g,d=40)):!pa.alwaysStartInNotebookGuid&&!pa.recentNotebookGuid&&g.defaultNotebook&&d>50&&(pa.optionSelectedNotebook=g,d=50),pa.optionSelectedNotebook&&g.guid===pa.optionSelectedNotebook.guid&&l(g)&&(c=h)}if(!b)if(c)D(c);else{console.error("Notebook is not exist. Select default notebook"),qa=null;for(var i=V.getElementsByClassName("nbNotebook"),e=0,j=i.length;e<j;e++)if(null!==i[e].getAttribute("default")){D(i[e]);break}}x(!0)}function n(a){var c=document.createElement("div");c.classList.add("nbNotebook");var d=document.createElement("span");d.innerText=a.name;for(var e=a.name.split(/\s+/),f=0;f<e.length;f++)P.insert(e[f],c),CommonSelector.SPECIAL_CHAR_REGEX.test(e[f])&&P.insert(e[f].replace(CommonSelector.SPECIAL_CHAR_REGEX,""),c);if(c.appendChild(d),a.owner){var g=document.createElement("span");g.classList.add("nbNotebookOwner"),g.innerText=" ("+a.owner+")",c.appendChild(g)}return a.type===GlobalUtils.NOTEBOOK_TYPE_LINKED?(c.classList.add("nbLinkedNotebook"),c.setAttribute("globalId",a.globalId),c.setAttribute("shardId",a.shardId),a.noteStoreUrl&&c.setAttribute("noteStoreUrl",encodeURIComponent(a.noteStoreUrl))):a.type===GlobalUtils.NOTEBOOK_TYPE_BUSINESS&&c.classList.add("nbBusinessNotebook"),F(c),y(c)||c.classList.add("nbHidden"),a.noShareNotes&&c.setAttribute("noShareNotes",""),c.addEventListener("click",function(){D(this),qa=this.getAttribute("guid"),b({userSelected:!0}),E()}),c.addEventListener("mouseover",function(){for(var a=V.querySelectorAll(".nbHover"),b=0;b<a.length;b++)a[b].classList.remove("nbHover");this.classList.add("nbHover")}),c.title=c.innerText,c.setAttribute("guid",a.guid),a.visibleToOthers&&c.setAttribute("visibleToOthers",""),a.defaultNotebook&&c.setAttribute("default",""),w(c,a.stack),c}function o(a){var b=document.createElement("div");b.classList.add("nbStack");var c=document.createElement("h3");return c.innerText=a,c.title=c.innerText,b.appendChild(c),w(b),b}function p(a,b,c,d,e){for(var f=e-1,g=a.toLowerCase();d<=f;){for(var h=d+Math.floor((f-d)/2),i=c[h],j=0;j<(b?b.length:0);j++)i=i[b[j]];if(g<i.innerText.toLowerCase())f=h-1;else{if(!(g>i.innerText.toLowerCase()))return h;d=h+1}}return-1}function q(){return a.classList.contains("nbOpen")}function r(){var b=a.classList.contains("nbOpen");return a.classList.remove("nbOpen"),U.value="",C(),c(),b}function s(b){return a.contains(b)}function t(a){for(var b=0;b<V.children.length;b++)if(V.children[b].classList.contains("nbNotebook")){if(V.children[b].getAttribute("guid")===a)return V.children[b]}else if(V.children[b].classList.contains("nbStack"))for(var c=0;c<V.children[b].children.length;c++)if(V.children[b].children[c].getAttribute("guid")===a)return V.children[b].children[c];return null}function u(){var a=GlobalUtils.NOTEBOOK_TYPE_PERSONAL;return R.classList.contains("nbSelectedLinked")?a=GlobalUtils.NOTEBOOK_TYPE_LINKED:R.classList.contains("nbSelectedBusiness")&&(a=GlobalUtils.NOTEBOOK_TYPE_BUSINESS),{defaultNotebook:R.hasAttribute("default"),globalId:R.getAttribute("globalId"),guid:R.getAttribute("guid"),name:R.innerText,noteStoreUrl:R.getAttribute("noteStoreUrl"),noShareNotes:R.hasAttribute("noShareNotes"),shardId:R.getAttribute("shardId"),type:a}}function v(a){if("Enter"===a.getKeyIdentifier()){var c=V.querySelector(".nbHover");c&&(D(c),qa=c.getAttribute("guid"),b({userSelected:!0}),E())}}function w(a,b){function c(a){return a.classList.contains("nbStack")?a.firstElementChild.innerText:a.classList.contains("nbNotebook")?a.innerText:void 0}var d=V;if(b){var e=V.querySelectorAll(".nbStack");d=e[p(b,["firstElementChild"],e,0,e.length)]||V,d===V&&(d=o(b))}b?CommonSelector.binaryInsert(d,c,a,1):CommonSelector.binaryInsert(d,c,a)}function x(a){a?(R.classList.remove("nbLoading"),da.classList.remove("rotating")):(R.classList.add("nbLoading"),da.classList.add("rotating"))}function y(a){for(var b=0;b<Q.length;b++)if(Q[b].indexOf(a)<0)return!1;return!0}function z(a){function b(a,c){var d=a[c];return d&&d.classList.contains("nbStack")?d="nextElementSibling"===c?d.children[1]:d.lastElementChild:d&&d.parentNode.classList.contains("nbStack")&&d===d.parentNode.children[0]?d=b(d.parentNode,c):!d&&a.parentNode.classList.contains("nbStack")&&(d=b(a.parentNode,c)),d}if(["Up","Down"].indexOf(a.getKeyIdentifier())>=0){var c="Up"===a.getKeyIdentifier()?"previousElementSibling":"nextElementSibling",d=V.querySelector(".nbHover")||N;if(d){for(var e=b(d,c);e&&e.classList.contains("nbHidden");)e=b(e,c);e&&!e.classList.contains("nbHidden")&&(d.classList.remove("nbHover"),e.classList.add("nbHover"),e.scrollIntoViewIfNeeded?e.scrollIntoViewIfNeeded():e.scrollIntoView())}a.preventDefault()}}function A(){a.classList.add("nbOpen"),U.focus(),setTimeout(function(){N&&(N.scrollIntoViewIfNeeded?N.scrollIntoViewIfNeeded():N.scrollIntoView())},50),c()}function B(){N=null,P=new Trie,Q=[],U.value="",V.innerHTML=""}function C(){for(var a=V.querySelectorAll(".nbNotebook.nbHover"),b=0;b<a.length;b++)a[b].classList.remove("nbHover");var c=U.value.trim();if(c){c=c.split(/\s+/),Q=[];for(var b=0;b<c.length;b++){for(var d=P.getMatching(c[b]),e=[],f=0;f<d.length;f++)e=e.concat(d[f][1]);Q.push(e)}for(var g=V.querySelectorAll(".nbNotebook"),b=0;b<g.length;b++)y(g[b])?g[b].classList.remove("nbHidden"):g[b].classList.add("nbHidden");V.classList.add("nbSearchOn");var h=V.querySelector(".nbNotebook:not(.nbHidden)");h&&h.classList.add("nbHover")}else{for(var i=V.querySelectorAll(".nbHidden"),b=0;b<i.length;b++)i[b].classList.remove("nbHidden");V.classList.remove("nbSearchOn")}}function D(a){N&&N.classList.remove("nbSelectedNotebook"),a.classList.add("nbSelectedNotebook"),N=a,R.innerText=a.innerText,R.title=R.innerText,R.setAttribute("guid",N.getAttribute("guid")),N.classList.contains("nbBusinessNotebook")?(R.classList.remove("nbSelectedLinked"),R.classList.add("nbSelectedBusiness"),R.removeAttribute("globalId"),R.removeAttribute("shardId"),R.removeAttribute("noteStoreUrl"),b({notebookType:GlobalUtils.NOTEBOOK_TYPE_BUSINESS})):N.classList.contains("nbLinkedNotebook")?(R.classList.remove("nbSelectedBusiness"),R.classList.add("nbSelectedLinked"),R.setAttribute("globalId",N.getAttribute("globalId")),R.setAttribute("shardId",N.getAttribute("shardId")),R.setAttribute("noteStoreUrl",N.getAttribute("noteStoreUrl")),b({notebookType:GlobalUtils.NOTEBOOK_TYPE_LINKED})):(R.classList.remove("nbSelectedBusiness"),R.classList.remove("nbSelectedLinked"),R.removeAttribute("globalId"),R.removeAttribute("shardId"),R.removeAttribute("noteStoreUrl"),b({notebookType:GlobalUtils.NOTEBOOK_TYPE_PERSONAL})),N.hasAttribute("noShareNotes")?R.setAttribute("noShareNotes",""):R.removeAttribute("noShareNotes"),N.hasAttribute("default")?R.setAttribute("default",""):R.removeAttribute("default")}function E(){a.classList.contains("nbOpen")?(i(),r()):A(),setHeight(!0)}function F(a){var b=U.value.trim();if(b){b=b.split(/\s+/);for(var c=0;c<b.length;c++)new RegExp("(?:\\s|^)"+b[c],"i").test(a.firstElementChild.innerText)&&(Q[c]||Q.push([]),Q[c].push(a))}}function G(a){ca.innerText=a||"",a?ba.classList.remove("hide"):ba.classList.add("hide"),setHeight()}function H(a){O=a,I()}function I(){O?ka.classList.remove("hide"):ka.classList.add("hide"),setHeight()}function J(a){x(!0),a.error?(G(a.error),ja.disabled=!1):a.result?(i(),E(),d()):Log.error("create notebook error: "+JSON.stringify(a))}function K(){return pa}function L(){return qa}function M(a){qa=a}var N,O,P=new Trie,Q=[],R=document.createElement("div"),S=document.createElement("div"),T=document.createElement("div"),U=document.createElement("input"),V=document.createElement("div"),W=document.createElement("div"),X=document.createElement("div"),Y=document.createElement("hr"),Z=document.createElement("span"),$=document.createElement("span"),_=document.createElement("div"),aa=document.createElement("div"),ba=document.createElement("div"),ca=document.createElement("span"),da=document.createElement("div"),ea=document.createElement("div"),fa=document.createElement("input"),ga=document.createElement("div"),ha=document.createElement("div"),ia=document.createElement("button"),ja=document.createElement("button"),ka=document.createElement("div"),la=document.createElement("input"),ma=document.createElement("input"),na=document.createElement("label"),oa=document.createElement("label"),pa={notebooks:[]},qa=null;a.classList.add("nbContainer"),R.classList.add("nbSelected"),S.classList.add("nbDropdown"),U.classList.add("nbSearchInput"),X.classList.add("nbRefreshNotebooksInfoBlock"),Y.classList.add("nbRefreshNotebooksLine"),Z.classList.add("nbRefreshNotebooksInfo"),_.classList.add("nbGlobalErrorBlock"),_.classList.add("hide"),aa.classList.add("globalErrorBlockInfo"),da.classList.add("nbRefreshNotebooksInfoBlockIcon"),da.classList.add("useSvg"),$.classList.add("nbRefreshNotebooksRefresh"),ba.classList.add("notebooksErrorBlock"),ba.classList.add("hide"),V.classList.add("nbList"),W.classList.add("nbInputFocuser"),ea.classList.add("nbAddNotebookBlock"),fa.classList.add("nbCreateNewNotebookInput"),fa.classList.add("useSvg"),fa.placeholder=Browser.i18n.getMessage("createNewNotebook"),ga.classList.add("nbCreateNewNotebookElementsBlock"),ga.classList.add("hide"),ha.classList.add("nbCreateNewNotebookButtons"),ia.classList.add("nbCreateNewNotebookCancelButton"),ja.classList.add("nbCreateNewNotebookCreateButton"),ka.classList.add("nbCreateNewNotebookRadioBlock"),ka.classList.add("useSvg"),la.id="createNewNotebookRadioBlock",ma.id="createNewNotebookRadioBusiness",la.type="radio",ma.type="radio",la.name="notebookType",ma.name="notebookType",la.value="personal",ma.value="business",la.setAttribute("checked","checked"),la.classList.add("nbCreateNewNotebookRadio"),ma.classList.add("nbCreateNewNotebookRadio"),na.setAttribute("for","createNewNotebookRadioBlock"),oa.setAttribute("for","createNewNotebookRadioBusiness"),na.innerHTML=Browser.i18n.getMessage("personal"),oa.innerHTML=Browser.i18n.getMessage("business"),U.placeholder=Browser.i18n.getMessage("findANotebook"),U.tabIndex=2,W.tabIndex=1,Z.innerHTML=Browser.i18n.getMessage("cantFindIt"),$.innerHTML=Browser.i18n.getMessage("refreshList"),X.appendChild(Y),X.appendChild(Z),X.appendChild(da),X.appendChild($),_.appendChild(aa),ba.appendChild(ca),ia.innerHTML=Browser.i18n.getMessage("regForm_cancel"),ja.innerHTML=Browser.i18n.getMessage("create"),a.appendChild(_),a.appendChild(R),T.appendChild(U),T.appendChild(ba),T.appendChild(ea),ea.appendChild(fa),ea.appendChild(ga),ga.appendChild(ka),ka.appendChild(la),ka.appendChild(na),ka.appendChild(ma),ka.appendChild(oa),ga.appendChild(ha),ha.appendChild(ia),ha.appendChild(ja),S.appendChild(T),S.appendChild(V),S.appendChild(X),a.appendChild(S),a.appendChild(W),SAFARI&&SAFARI_VERSION<600&&changeSvgToPng(),$.addEventListener("click",function(a){a.stopPropagation(),log.log("Refresh notebooks list"),Browser.sendToExtension({name:"trackEvent",category:"notebooks",action:"refresh"}),k(),U.focus()}),_.addEventListener("click",function(a){a.stopPropagation(),log.log("Refresh notebooks list"),_.classList.add("hide"),k(),U.focus()}),fa.addEventListener("focus",function(a){a.stopPropagation(),j()}),fa.addEventListener("click",function(a){a.stopPropagation()}),fa.addEventListener("keyup",function(a){a.stopPropagation(),a.preventDefault(),13===a.keyCode&&g()}),ka.addEventListener("click",function(a){a.stopPropagation()}),ia.addEventListener("click",function(a){a.stopPropagation(),i()}),ja.addEventListener("click",function(a){g(),a.stopPropagation()}),R.addEventListener("click",function(a){E(),a.stopPropagation()}),U.addEventListener("click",function(a){a.stopPropagation(),i()}),U.addEventListener("input",function(){C(),setHeight()}),U.addEventListener("keydown",z),U.addEventListener("keyup",v),W.addEventListener("focus",A),V.addEventListener("mousewheel",Browser.overrideScroll,!0),x(!1),this.getNotebooksData=K,this.getCreateNewNotebookValue=f,this.addNotebooks=m,this.saveNewNotebook=g,this.close=r,this.contains=s,this.findNotebookByGuid=t,this.getSelected=u,this.markStatus=x,this.open=A,this.reset=B,this.select=D,this.getUserSelectedNotebookGuid=L,this.setUserSelectedNotebookGuid=M,this.isOpened=q,this.hideCreateNewNotebookBlock=i,this.setIsBusinessAccountEnabled=H,this.receiveNotebookCreationResult=J,this.__defineGetter__("height",function(){return S.offsetTop+S.offsetHeight}),Object.preventExtensions(this)}Object.preventExtensions(NotebookSelector);