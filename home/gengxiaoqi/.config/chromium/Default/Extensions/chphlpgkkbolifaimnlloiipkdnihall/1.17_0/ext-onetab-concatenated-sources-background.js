var Xj=false;var y1='1.17';var BK=false;var IK=false;var bX="onmousemove";var vj="onmousedown";var Vj="onmouseover";var J="onmouseup";var N1="onmouseout";var aK="onclick";var F1="ondblclick";var JX="onmouseleave";var Ej="mousemove";var dX="mousedown";var r1="mouseover";var m1="mouseup";var GX="mouseout";var QK="click";var T="dblclick";var D1=false;var J1=100006;function zj(){return document.body};var pX='aaa';var $X='NEW_TRANSACTION';W6S=false;k6S=true;var _X={};function C1(Fn,xn){_X[Fn]=xn;if(k6S)D(Fn,xn)};function U(pn){return pn.indexOf(oX)==0};function OK(In){return In.indexOf(nK)==0};function bj(Cn,mn){WK('availableVersion',function(BB){if(!BB)Cn(false);else {var VB=parseInt(y1.substring(0,y1.indexOf(".")));var DB=parseInt(y1.substring(y1.indexOf(".")+1));var lB=parseInt(BB.substring(0,BB.indexOf(".")));var eB=parseInt(BB.substring(BB.indexOf(".")+1));var nB=false;if(VB<lB)nB=true;if(VB==lB){if(DB<eB)nB=true}Cn(nB)}},mn)};C1('upgradeAvailable',function(yn,jn){bj(jn,$X)});function V(Ln,an){K().RW('extensionKey',function(YB,$B){if(!YB){YB=oK();K().wW('extensionKey',YB,function(){Ln(YB,$B)},$B)}else {Ln(YB,$B)}},an)};C1('getExtensionKey',function(on,Un){V(Un,$X)});var BX=function(un,zn){UX(function(rB,QB){if(!rB['tabGroups']){rB['tabGroups']=[];rj(rB,function(Bl){un(Bl)},QB)}else {un(QB)}},zn)};var EX=function(Sn){lX(undefined,Sn)};C1('displayOneTabAction',function(cn,Pn){EX(Pn)});var YX=function(gn,Nn,wn){h(function(HB){HX(HB,function(nl){zK();nl(Nn)},gn,wn)})};var G=function(bn,En,An){var Xn=bn['linkUrl'];var vn='';if(bn['linkTitle'])vn=bn['linkTitle'];else {if(k6S&&(Xn==window.Aj)){vn=window.jX}else {vn=Xn}}zX(Xn,vn,function(){zK()},En,An)};var lj=function(qn,On){E1(function(ZB){xK(ZB,true,function(el){lX(true,el)},qn,On)})};var z=function(sn,hn,dn){E1(function(KB,RB){var TB=[];if(RB){for(var fB in KB)if(parseInt(KB[fB]['index'])!=parseInt(RB['index']))TB.push(KB[fB]);if(TB.length>0){xK(TB,true,function(ll){zK();if(hn)hn(dn);ll()},sn,dn)}else {if(hn)hn(dn)}}else {if(!W6S)alert('no active tab (B)');else if(D1)console.log('no active tab (B)');hn(dn)}})};var dK=function(kn,Mn){E1(function(IB,xB){var FB=[];if(xB){for(var pB in IB)if(parseInt(IB[pB]['index'])<parseInt(xB['index']))FB.push(IB[pB]);if(FB.length>0){xK(FB,true,function(Dl){zK();Dl()},kn,Mn)}}})};var wX=function(Gn,Wn){E1(function(yB,mB){var CB=[];if(mB){for(var jB in yB)if(parseInt(yB[jB]['index'])>parseInt(mB['index']))CB.push(yB[jB]);if(CB.length>0){xK(CB,true,function(Vl){zK();Vl()},Gn,Wn)}}})};var KX=function(_n,BV,Jn){DK(function(aB){xK(aB,true,function($l){lX(true,function(){if(BV)BV()});$l()},_n,Jn)})};C1('sendAllTabsInAllWindowsToOneTabAction',function(eV,nV){KX(eV.$W,nV,$X)});function zK(lV){$j(function(uB){var LB=undefined;for(var zB=0;zB<uB.length;zB++){var UB=uB[zB];var oB=UB['url'];if(oB.indexOf(oX)==0){LB=UB;break}}if(LB){WX(LB,function(){if(lV)lV()})}else {if(lV)lV()}})};function nj(VV,DV){UX(function(cB,PB){var SB=cB['tabGroups'];if(!SB)SB=[];var gB=0;for(var NB=0;NB<SB.length;NB++){var wB=SB[NB];gB+=wB['tabsMeta'].length}if(gB==0){$j(function(Ql){for(var Yl in Ql){if(U(Ql[Yl]['url'])){W(Ql[Yl],function(){u1()})}}if(VV)VV()})}else {if(VV)VV()}},DV)};C1('closeOneTabIfEmpty',function(YV,$V){return nj($V,$X)});function lX(rV,QV){$j(function(XB){var vB=undefined;for(var AB=0;AB<XB.length;AB++){var iB=XB[AB];var EB=iB['url'];if(EB.indexOf(oX)==0){if(vB){W(vB)}else {vB=iB}}}if(vB){if(rV){MX(vB,function(){WX(vB,function(){if(QV)QV()})})}else {MX(vB,function(){if(QV)QV()})}}else {fK(oX,function(){if(QV)QV()})}})};function aj(RV,HV){var ZV=V1(RV);var TV=true;$j(function(dB){var qB=undefined;for(var sB=0;sB<dB.length;sB++){var bB=dB[sB];var OB=bB['url'];if(OB==ZV){if(qB){W(qB)}else {qB=bB}}}if(qB){if(TV){WX(qB,function(){})}MX(qB,function(){if(HV)HV()})}else {fK(ZV,function(){if(HV)HV()})}})};C1('showOrRefreshAndFocusScriptPage',function(KV,fV){return aj(KV.url,fV)});var hX=function(xV,IV,pV,FV){AX(function(MB,hB){var kB=Qj('restoreWindow',MB);if(IV=='currentWindow')kB='currentWindow';if(IV=='newWindow')kB='newWindow';E1(function(rl){var Zl=0;for(var Rl in rl){var Hl=rl[Rl];if(Hl['pinned']||Hl['isPinned'])continue;if(U(Hl['url']))continue;Zl++}if(kB=='currentWindow'||((kB=='newWindow')&&(IV!='newWindow')&&(Zl==0))){for(var Rl=0;Rl<xV.length;Rl++){var Tl=xV[Rl];d(Tl['url'],!!Tl['pinned'],false,function(){u1()})}}else {eK(xV,function(){u1()})}if(pV)pV(hB)});setTimeout(function(){nj(undefined,$X)},200)},FV)};C1('restoreTabsMeta',function(CV,mV){hX(CV.Mj,CV.Kn,mV,$X)});function j1(jV,aV,yV){UX(function(eP,BP){var WB=eP['tabGroups'];var DP=jV.split('\n');var JB=new Date().getTime();var _B=function(){var fl={};fl['createDate']=JB--;fl['tabsMeta']=[];fl['id']=nX();return fl};var $P=_B();for(var YP in DP){var lP=DP[YP];if(!lP){if($P['tabsMeta'].length>0){WB.push($P);$P=_B()}}else {var VP;var GB;if(lP.indexOf(' | ')!=-1){VP=lP.substring(0,lP.indexOf(' | '));GB=lP.substring(lP.indexOf(' | ')+' | '.length)}else {VP=lP;GB=UK(lP)}if(VP.indexOf('://')==-1)VP='http://'+VP;var nP={};nP['id']=Tj();nP['url']=VP;nP['title']=G1(GB);$P['tabsMeta'].push(nP)}}if($P['tabsMeta'].length>0){WB.push($P)}rj(eP,function(Kl){lX(true,function(){if(aV)aV()})},BP)},yV)};C1('importTabsFromText',function(UV,LV){j1(UV.text,LV,$X)});C1('getAllMessages',function(SV,uV){var zV=["addOneTabNow","95PctMemoryReduction","noTabsInOneTabYet","importUrls","exportImportUrls","pleaseWaitTripleDot","about","optionTabGroupRestoreNewWindow","optionPinnedTabsDontSend","beforeLostInMessBrowserSlow","sendAllTabsAllWindowsToPlaceholder","convertTabsIntoAList","tooManyTabsSpeedUpFirefox","sendOnlyThisTabToPlaceholder","emptyOneTabInfoMsg","OneTabAlsoAvailableForFirefox","feedback","optionRestoreRemovalDefault","features","unlockBeforeDeleting","sendRightTabsToOneTab","tab","sendAllTabsToPlaceholder","options","sendThisWebLinkToOneTab","namedTabGroups","export","excludeDomainFromOneTab","optionStartupLaunchDisplay","lockTabGroup","optionTabGroupRestoreCurrentWindowAlways","noSignupRegistrationRequired","optionStartupLaunchNone","optionDuplicatesRejectDesc","unstarTabGroup","shareAllAsWebPage","nameThisTabGroup","afterInstantReliefRestoreLater","languageTitle","memoryAfter99","sendThisWebLinkToPlaceholder","optionRestoreRemovalDefaultDesc","sendLeftTabsToOneTab","optionRestoreRemovalKeepDesc","nowAvailableInLanguage","moreTripleDot","sendOnlyThisTabToOneTab","restoreAll","optionPinnedTabsDontSendDesc","optionPinnedTabsAllow","exportUrls","optionDuplicatesAllow","bringAllTabsIntoOneTab","import","total0Tabs","2tabs","optionPinnedTabsTitle","manifestDescription","displayOneTab","memoryBefore1981","optionDuplicatesTitle","sendAllTabsToOneTab","optionTabGroupRestoreNewWindowAlways","newExclamation","userLanguage","sendCurrentTabToOneTab","optionDuplicatesReject","save95PctReduceTabClutterGoogleChrome","areYouSureYouWantToDeleteThisTab","pasteInUrlsInstructions","1tab","exportThenImportNote","optionRestoreRemovalTitle","excludeWebSiteFromOneTab","optionStartupLaunchNoneDesc","sendAllTabsAllWindowsToOneTab","optionRestoreRemovalKeep","total2Tabs","deleteAll","createdPreceedingDate","sendAllTabsExceptThisTabToPlaceholder","optionPinnedTabsNote","starTabGroup","total1Tab","unlockTabGroup","help","optionTabGroupRestoreTitle","sendRightTabsToPlaceholder","areYouSureYouWantToDeleteTheseTabs","shareAsWebPage","optionStartupLaunchTitle","sendLeftTabsToPlaceholder","reduceMemoryUsageBy95Pct","sendAllTabsExceptThisToOneTab"];var oV={};for(var PV in zV)oV[zV[PV]]=x1(zV[PV]);setTimeout(function(){uV(oV)},1);return true});var h=function(cV){window['chrome']['tabs']['query']({'active':true,'currentWindow':true},function(QP){if(QP&&QP.length==1)cV(QP[0])})};var oX=window['chrome']['runtime']['getURL']('onetab.html');var nK=oX.substr(0,oX.length-'onetab.html'.length);function D(wV,gV){window['chrome']['runtime']['onMessage']['addListener'](function(TP,HP,RP){if(TP.type==wV){var ZP=FK.parse(TP.$n);var rP={};gV(ZP,function(xl){if(!xl)xl={};rP.$n=FK.cW(xl);RP(rP)});return true}})};function Sj(EV,vV,iV){var NV={};NV.qW=EV;NV.$n={};if(vV)NV.$n=FK.cW(vV);DK(function(KP){for(var fP in KP){if(U(KP[fP]['url'])){window['chrome']['tabs']['sendMessage'](KP[fP]['id'],NV,function(Fl){if(iV)iV(Fl)})}}})};function E1(AV){window['chrome']['windows']['getLastFocused']({'populate':true},function(xP){window['chrome']['tabs']['query']({'windowId':xP['id']},function(ml){var pl;for(var Il in ml){if(ml[Il]['active'])pl=ml[Il]}AV(ml,pl)})})};function DK(XV,bV){window['chrome']['windows']['getLastFocused'](undefined,function(FP){window['chrome']['windows']['getAll']({'populate':true},function(jl){for(var yl in jl){var Cl=jl[yl];if(bV&&(Cl['id']==FP['id']))continue;XV(Cl['tabs'])}})})};function $j(qV){window['chrome']['tabs']['query']({},function(pP){qV(pP)})};function O1(sV,OV){window['chrome']['windows']['getLastFocused'](undefined,function(IP){window['chrome']['tabs']['query']({},function(Pl){var ul={};for(var Sl in Pl){var Ll=Pl[Sl];var al=Ll['windowId'];if(OV&&(al==IP['id']))continue;if(!ul[al])ul[al]=[];ul[al].push(Ll)}var zl=[];for(var Sl in ul){var ol=[];for(var Ul in ul[Sl])ol.push(ul[Sl][Ul]);zl.push(ol)}sV(zl)})})};function WX(hV,dV){window['chrome']['tabs']['reload'](hV['id'],{},function(){dV()})};function W(MV,kV){window['chrome']['tabs']['remove'](MV['id'],function(){if(kV)kV()})};function F(BO,GV){var _V=[];for(var JV in BO)_V.push(BO[JV]);while(_V.length>0){var WV=_V.pop();W(WV,function(){F(_V,function(){GV()})})}};function MX(eO,nO){window['chrome']['tabs']['update'](eO['id'],{'active':true},function(){window['chrome']['windows']['update'](eO['windowId'],{'focused':true},function(){if(nO)nO()})})};function fK(DO,lO){window['chrome']['tabs']['create']({'url':DO},function(){if(lO)lO()})};function d(QO,VO,YO,$O){window['chrome']['windows']['getLastFocused']({'populate':true},function(mP){window['chrome']['tabs']['create']({'windowId':mP['id'],'pinned':!!VO,'active':!!YO,'url':QO},function(){if($O)$O()})})};function eK(rO,HO){window['chrome']['windows']['create']({'focused':true,'url':rO[0]['url']},function(CP){window['chrome']['tabs']['query']({'windowId':CP['id']},function(cl){window['chrome']['tabs']['update'](cl[0]['id'],{'pinned':!!rO[0]['pinned']},function(){if(rO.length==1){if(HO)HO()}else {for(var RO=1;RO<rO.length;RO++){var TO=rO[RO];var ZO=function(By){d(TO['url'],!!TO['pinned'],false,function(){if(By==(rO.length-1))if(HO)HO()})}(RO)}}})})})};function cX(KO,fO,xO){if(KO)fO['parentId']=KO.pW;var FO={};FO.pW=window['chrome']['contextMenus']['create'](fO);if(xO)setTimeout(xO,1);return FO};function cj(mO,pO,CO){if(mO)pO['parentId']=mO.pW;var IO=pO.title;var jO={};jO.pW=window['chrome']['contextMenus']['create'](pO);jO.nn=function(jP){window['chrome']['contextMenus']['update'](jO.pW,{'enabled':jP},function(){})};jO.sW=function(yP){window['chrome']['contextMenus']['update'](jO.pW,{'type':'checkbox','checked':yP},function(){})};jO.LW=function(aP){window['chrome']['contextMenus']['update'](jO.pW,{'title':aP},function(){})};if(CO)setTimeout(CO,1);return jO};function qK(aO,yO){if(aO){window['chrome']['contextMenus']['removeAll'](function(){yO()})}else yO()};function mX(UO){var LO={'type':'separator','contexts':['all']};if(UO)LO['parentId']=UO.pW;window['chrome']['contextMenus']['create'](LO)};function Q1(oO){window['chrome']['runtime']['onMessage']['addListener'](function(UP,LP,oP){if(UP.type=='linkRightClick'){oO(UP.title,UP.url)}})};function S(){};S.prototype.wW=function(SO,uO,zO){window['localStorage'][SO]=uO;zO()};S.prototype.RW=function(cO,PO){PO(window['localStorage'][cO])};var tj=new S();function K(){return tj};function N(gO){window['chrome']['browserAction']['onClicked']['addListener'](function(zP){gO()})};function SK(){window['chrome']['commands']['onCommand']['addListener'](function(uP){if(uP=='display-onetab'){lX()}if(uP=='send-current-tab-to-onetab'){YX()}if(uP=='send-all-tabs-in-current-window-to-onetab'){lj()}if(uP=='send-all-tabs-in-all-windows-to-onetab'){KX(undefined,undefined)}if(uP=='send-all-tabs-except-this-to-onetab'){z(undefined,undefined)}})};function k1(iO){window['chrome']['tabs']['onCreated']['addListener'](function(SP){window['chrome']['tabs']['get'](SP['id'],function(gl){iO()})});window['chrome']['tabs']['onUpdated']['addListener'](function(cP,PP,gP){iO()});window['chrome']['tabs']['onMoved']['addListener'](function(wP,NP){iO()});window['chrome']['tabs']['onRemoved']['addListener'](function(iP,vP){iO()});window['chrome']['tabs']['onReplaced']['addListener'](function(AP,EP){iO()});window['chrome']['tabs']['onDetached']['addListener'](function(XP,bP){iO()});window['chrome']['tabs']['onAttached']['addListener'](function(qP,OP){iO()});var vO={};var NO=undefined;var wO=undefined;window['chrome']['tabs']['onActivated']['addListener'](function(sP){window['chrome']['tabs']['get'](sP['tabId'],function(Nl){if(!Nl)return; var wl=NO?NO:undefined;vO[Nl['windowId']]=Nl;if(typeof wO==='undefined')wO=Nl['windowId'];if(wO==Nl['windowId'])NO=Nl;if(wl!=NO['id'])iO()})});window['chrome']['windows']['onFocusChanged']['addListener'](function(hP){var dP=NO?NO['id']:undefined;wO=hP;if(vO.hasOwnProperty(wO)){NO=vO[wO]}if(NO&&(dP!=NO['id']))iO()})};function sK(EO){window['chrome']['tabs']['query']({},function(kP){EO()})};function V1(AO){return window['chrome']['runtime']['getURL'](AO)};function Y(){window['chrome']['webRequest']['onCompleted']['addListener'](function(GP){if(GP['statusCode']==200&&GP['method']=='GET'&&GP['fromCache']==false&&GP['method']=='GET'){try{pK(UK(GP['url']),undefined)}catch(MP){if(D1)console.log(MP)}}},{'urls':['http://*/*','https://*/*'],'types':['main_frame']},['responseHeaders'])};function x1(XO){return window['chrome']['i18n']['getMessage'](XO)};function h1(qO,bO){if(qO['f']<bO['f'])return 1;if(qO['f']>bO['f'])return -1;return 0};var d1=12;var iX=30;var L=150;function pK(dO,sO,OO){if(dO.indexOf('www.google.')!=-1){if(sO)sO(OO);return }K().RW('topSites',function(YG,nG){var BG;if(!YG)BG={};else BG=FK.parse(YG);var $G=0;var lG=P1(new Date(new Date().getTime()+$G));var JP=[];var _P=[];for(var eG in BG)if(eG!=lG)JP.push(eG);JP.sort();while(JP.length>d1)_P.push(JP.splice(0,1)[0]);for(var QG in _P)delete BG[_P[QG]];for(var eG in BG){if(eG!=lG){var WP=BG[eG];if(WP.length>iX){WP.sort(h1);if(WP.length>iX)WP=WP.slice(0,iX);BG[eG]=WP}}}if(!BG[lG])BG[lG]=[];var VG=undefined;var WP=BG[lG];for(var QG in WP)if(WP[QG]['u']==dO)VG=WP[QG];if(!VG){VG={'u':dO,'f':0};WP.push(VG)}VG['f']++;if(WP.length>L){Xj:for(var QG=1;QG<1000;QG++){for(var DG in WP){if(WP[DG]['f']==QG){WP.splice(DG,1);break Xj}}}}K().wW('topSites',FK.cW(BG),function(vl){if(sO)sO(vl)},nG)},OO)};var L1={};var JK=function(){L1.PW=undefined;L1.Vn=undefined;L1.Hn=undefined;L1.KW=[];L1.yW=[];L1.BW=[];L1.fW=[];L1.dj=[];L1.CW=[];L1.YW=[];L1.Dn=undefined};var FX=function(kO,GO){for(var WO in kO){var hO=kO[WO];for(var MO in hO){hO[MO].nn(GO)}}};function u1(){setTimeout(function(){vX($X)},100)};var NK='';function vX(_O){AX(function(HG,rG){O1(function(il){E1(function(Tv,Vv){var nv=false;if(!Vv||!Vv['url']){if(D1)console.log('no active tab (A)');return }var rv=Vv['url'];nv=U(rv);L1.Vn.nn(!nv);NK=Vv['url'];L1.Dn.nn(!nv);if(Vv['url']&&(Vv['url'].toLowerCase().indexOf('http')==0)){L1.Dn.LW(x1('excludeDomainFromOneTab').replace('DOMAIN.COM',UK(Vv['url'])))}else {L1.Dn.LW(x1('excludeWebSiteFromOneTab'))}L1.Dn.sW(p1(rv,HG));FX([L1.KW,L1.yW,L1.BW,L1.fW,L1.dj,L1.CW],true);var lv=false;var Zv=false;var $v=false;var Bv=false;var JO=false;for(var Hv in Tv){if(Vv){if(parseInt(Tv[Hv]['index'])<parseInt(Vv['index'])){if(Tv[Hv]['url']){if(!U(Tv[Hv]['url']))lv=true}}if(parseInt(Tv[Hv]['index'])>parseInt(Vv['index'])){if(Tv[Hv]['url']){if(!U(Tv[Hv]['url']))Zv=true}}if(!U(Tv[Hv]['url'])){Bv=true;if(Tv[Hv]['id']!=Vv['id'])$v=true}}}for(var Hv in il){var Qv=il[Hv];for(var Yv in Qv){var Dv=Qv[Yv];if(!U(Dv['url']))JO=true}}if(!Bv)FX([L1.KW],false);if(nv||!Bv)FX([L1.yW],false);if(!lv)FX([L1.BW],false);if(!Zv)FX([L1.fW],false);if(!JO)FX([L1.dj],false);if(!$v)FX([L1.CW],false)})},true)},_O)};function q(fv,Rv){qK(L1.PW,function(){JK();yK(Rv);u1();if(fv)fv()})};C1('recreateContextMenus',function(xv,Kv){q(Kv,$X)});function yK(pv){L1.PW=cX(undefined,{'type':'normal','contexts':['all'],'title':'OneTab'});L1.Vn=cj(L1.PW,{'type':'normal','title':x1('displayOneTab'),'contexts':['all'],'onclick':function(TG,ZG){EX()}});var Fv=cj(L1.PW,{'type':'normal','title':x1('sendAllTabsToOneTab'),'contexts':['all'],'onclick':function(fG,RG){lj(undefined,$X)}});L1.KW.push(Fv);var Lv=cj(L1.PW,{'type':'normal','title':x1('sendThisWebLinkToOneTab'),'contexts':['link'],'onclick':function(xG,KG){G(xG,undefined,$X)}});L1.YW.push(Lv);mX(L1.PW);var jv=cj(L1.PW,{'type':'normal','title':x1('sendOnlyThisTabToOneTab'),'contexts':['all'],'onclick':function(pG,FG){YX(undefined,undefined,$X)}});L1.yW.push(jv);var yv=cj(L1.PW,{'type':'normal','title':x1('sendAllTabsExceptThisToOneTab'),'contexts':['all'],'onclick':function(mG,IG){z(undefined,undefined,$X)}});L1.CW.push(yv);var mv=cj(L1.PW,{'type':'normal','title':x1('sendLeftTabsToOneTab'),'contexts':['all'],'onclick':function(jG,CG){dK(undefined,$X)}});L1.BW.push(mv);var Cv=cj(L1.PW,{'type':'normal','title':x1('sendRightTabsToOneTab'),'contexts':['all'],'onclick':function(aG,yG){wX(undefined,$X)}});L1.fW.push(Cv);var av=cj(L1.PW,{'type':'normal','title':x1('sendAllTabsAllWindowsToOneTab'),'contexts':['all'],'onclick':function(UG,LG){KX(undefined,undefined,$X)}});L1.dj.push(av);mX(L1.PW);L1.Dn=cj(L1.PW,{'type':'checkbox','checked':false,'contexts':['all'],'title':x1('excludeWebSiteFromOneTab'),'onclick':function(zG,oG){AX(function(Xl,Al){var bl=UK(NK);var El=HK(bl,Xl);if(El){Pj(bl,function(){u1()},Al)}else {i1(bl,function(){u1()},Al)}},$X)}});var Iv=false;UX(function(cG,SG){var uG=cG['tabGroups'];if(!uG)uG=[];for(var wG=0;wG<uG.length;wG++){var gG=uG[wG];if(gG['label']&&R1(gG['label'])!=''){Iv=true;break}}if(Iv){mX(L1.PW);L1.Hn=cX(L1.PW,{'type':'normal','contexts':['all'],'title':x1('namedTabGroups')},function(){for(var sl=0;sl<uG.length;sl++){var Ol=uG[sl];if(Ol['label']&&R1(Ol['label'])!=''){var ql=function(ov){var Uv=cX(L1.Hn,{'type':'normal','contexts':['all'],'title':ov['label']},function(){L1.KW.push(cj(Uv,{'type':'normal','title':x1('sendAllTabsToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['all'],'onclick':function(nk,Bk){lj(ov['id'],$X)}}));L1.YW.push(cj(Uv,{'type':'normal','title':x1('sendThisWebLinkToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['link'],'onclick':function(lk,ek){G(lk,ov['id'],$X)}}));L1.yW.push(cj(Uv,{'type':'normal','title':x1('sendOnlyThisTabToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['all'],'onclick':function(Vk,Dk){YX(ov['id'],undefined,$X)}}));L1.CW.push(cj(Uv,{'type':'normal','title':x1('sendAllTabsExceptThisTabToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['all'],'onclick':function(Yk,$k){z(ov['id'],undefined,$X)}}));L1.BW.push(cj(Uv,{'type':'normal','title':x1('sendLeftTabsToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['all'],'onclick':function(rk,Qk){dK(ov['id'],$X)}}));L1.fW.push(cj(Uv,{'type':'normal','title':x1('sendRightTabsToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['all'],'onclick':function(Zk,Hk){wX(ov['id'],$X)}}));L1.dj.push(cj(Uv,{'type':'normal','title':x1('sendAllTabsAllWindowsToPlaceholder').replace('PLACEHOLDER',ov['label']),'contexts':['all'],'onclick':function(Rk,Tk){KX(ov['id'],undefined,$X)}}))})}(Ol)}}})}mX(L1.PW);var NG=cj(L1.PW,{'type':'normal','title':x1('help'),'contexts':['all'],'onclick':function(hl,dl){fK('http://www.one-tab.com/help')}});if(D1){var PG=cj(L1.PW,{'type':'normal','title':'debug','contexts':['all'],'onclick':function(Ml,kl){UX(function(uv,zv){console.log(FK.cW(uv));V(function(ey,ny){console.log(FK.cW(ey));K().RW('topSites',function(Kk,fk){console.log(Kk);AX(function(nY,BY){console.log(nY);K().RW('installDate',function(B$,n$){console.log('installDate',B$);K().RW('lastSeenVersion',function(BH,Jw){console.log('lastSeenVersion',BH)},n$)},BY)},fk)},ny)},zv)},$X)}})}},pv)};var FK={cW:function(Pv){var gv,Nv,wv,cv='',Sv;switch(typeof Pv){case 'object':;if(Pv){if(Pv instanceof Array){for(Nv=0;Nv<Pv.length;++Nv){Sv=this.cW(Pv[Nv]);if(cv){cv+=','}cv+=Sv}return '['+cv+']'}else if(typeof Pv.toString!='undefined'){for(Nv in Pv){Sv=Pv[Nv];if(typeof Sv!='undefined'&&typeof Sv!='function'){Sv=this.cW(Sv);if(cv){cv+=','}cv+=this.cW(Nv)+':'+Sv}}return '{'+cv+'}'}}return 'null';case 'number':;return isFinite(Pv)?String(Pv):'null';case 'string':;wv=Pv.length;cv='\"';for(Nv=0;Nv<wv;Nv+=1){gv=Pv.charAt(Nv);if(gv>=' '){if(gv=='\\'||gv=='\"'){cv+='\\'}cv+=gv}else {switch(gv){case '\b':;cv+='\\b';break;case '\f':;cv+='\\f';break;case '\n':;cv+='\\n';break;case '\r':;cv+='\\r';break;case '\t':;cv+='\\t';break;default:; gv=gv.charCodeAt();cv+='\\u00'+Math.floor(gv/16).toString(16)+(gv%16).toString(16)}}}return cv+'\"';case 'boolean':;return String(Pv);default:; return 'null'}},parse:function(Ev){var sv=0;var kv=' ';function Xv(vG){throw {name:'JSONError',message:vG,Yn:sv-1,text:Ev}};function qv(){kv=Ev.charAt(sv);sv+=1;return kv};function Ov(){while(kv!==''&&kv<=' '){qv()}};function Av(){var XG,AG='',EG,iG;if(kv=='\"'){Xj:while(qv()){if(kv=='\"'){qv();return AG}else if(kv=='\\'){switch(qv()){case 'b':;AG+='\b';break;case 'f':;AG+='\f';break;case 'n':;AG+='\n';break;case 'r':;AG+='\r';break;case 't':;AG+='\t';break;case 'u':;iG=0;for(XG=0;XG<4;XG+=1){EG=parseInt(qv(),16);if(!isFinite(EG)){break Xj}iG=iG*16+EG}AG+=String.fromCharCode(iG);break;default:; AG+=kv}}else {AG+=kv}}}Xv("Bad string")};function bv(){var bG=[];if(kv=='['){qv();Ov();if(kv==']'){qv();return bG}while(kv){bG.push(vv());Ov();if(kv==']'){qv();return bG}else if(kv!=','){break}qv();Ov()}}Xv("Bad array")};function hv(){var OG,qG={};if(kv=='{'){qv();Ov();if(kv=='}'){qv();return qG}while(kv){OG=Av();Ov();if(kv!=':'){break}qv();qG[OG]=vv();Ov();if(kv=='}'){qv();return qG}else if(kv!=','){break}qv();Ov()}}Xv("Bad object")};function iv(){var dG='',sG;if(kv=='-'){dG='-';qv()}while(kv>='0'&&kv<='9'){dG+=kv;qv()}if(kv=='.'){dG+='.';while(qv()&&kv>='0'&&kv<='9'){dG+=kv}}if(kv=='e'||kv=='E'){dG+='e';qv();if(kv=='-'||kv=='+'){dG+=kv;qv()}while(kv>='0'&&kv<='9'){dG+=kv;qv()}}sG=+dG;if(!isFinite(sG)){Xv("Bad number")}else {return sG}};function dv(){switch(kv){case 't':;if(qv()=='r'&&qv()=='u'&&qv()=='e'){qv();return true}break;case 'f':;if(qv()=='a'&&qv()=='l'&&qv()=='s'&&qv()=='e'){qv();return false}break;case 'n':;if(qv()=='u'&&qv()=='l'&&qv()=='l'){qv();return null}break}Xv("Syntax error")};function vv(){Ov();switch(kv){case '{':;return hv();case '[':;return bv();case '\"':;return Av();case '-':;return iv();default:; return kv>='0'&&kv<='9'?iv():dv()}};return vv()}};function UK(Mv){if(Mv.indexOf('://')==-1)Mv='http://'+Mv;Mv=Mv.substring(Mv.indexOf('://')+'://'.length);if(Mv.indexOf('/')!=-1)Mv=Mv.substring(0,Mv.indexOf('/'));return Mv.toLowerCase()};function l1(_v,Gv){for(var Wv in _v)if(_v[Wv]==Gv)return true;return false};function I(Jv){if(typeof Jv=='string')Jv=document.getElementById(Jv);if(!Jv)return; while(Jv.childNodes.length>0)Jv.removeChild(Jv.childNodes[0])};function S1(BT){var nT=document.createElement('div');nT.style.fontSize='1px';nT.style.height=BT+'px';nT.style.width=1+'px';return nT};function ij(eT,DT){for(var lT=0;lT<DT.length;lT++){if(DT[lT]==eT){DT.splice(lT,1);lT--}}};function H(QT){var $T=QT?QT:window.event;var HT=0;var VT=0;var YT=0;var rT=0;if($T!=null){if(BK){YT=$T.shiftKey;VT=$T.altKey;HT=$T.ctrlKey}else {YT=$T.shiftKey;HT=$T.ctrlKey;VT=$T.altKey;rT=$T.metaKey}}return (HT||rT||YT)};function pj(fT){var TT=fT?fT:window.event;var xT=0;var ZT=0;var RT=0;var KT=0;if(TT!=null){if(BK){RT=TT.shiftKey;ZT=TT.altKey;xT=TT.ctrlKey}else {RT=TT.shiftKey;xT=TT.ctrlKey;ZT=TT.altKey;KT=TT.metaKey}}return (xT||KT)};function xX(mT){var pT=mT?mT:window.event;var jT=0;var FT=0;var IT=0;var CT=0;if(pT!=null){if(BK){IT=pT.shiftKey;FT=pT.altKey;jT=pT.ctrlKey}else {IT=pT.shiftKey;jT=pT.ctrlKey;FT=pT.altKey;CT=pT.metaKey}}return (IT)};function gK(yT){yT['noCacheRandom']=W1()};function W1(){return new Date().getTime()+Math.round(Math.random()*10000)+''};function aX(oT,LT,UT){gK(LT);var aT=FK.cW(LT);xj(oT,aT,function(hG){if(UT)UT(FK.parse((hG)))})};function xj(PT,uT,ST){var zT=U1();zT.open(uT==null?"GET":"POST",PT,true);zT.setRequestHeader("Content-Type","text/xml");zT.onreadystatechange=function(){var MG=false;MG=(zT.readyState==4);if(MG){var kG=zT.responseText;ST(kG)}};zT.send(uT)};function U1(){var cT=new XMLHttpRequest();return cT};function oK(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(_G){var WG=Math.random()*16|0,GG=_G=='x'?WG:(WG&0x3|0x8);return GG.toString(16)})};var uK='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('');function nX(vT,wT){var NT=uK,gT=[],iT=0;wT=wT||NT.length;vT=vT||22;for(iT=0;iT<vT;iT++)gT[iT]=NT[0|Math.random()*wT];return gT.join('')};function Tj(){return nX()};function R1(ET){if(!ET==null||ET==undefined)return '';return ET.replace(/^\s+/,'').replace(/\s+$/,'')};function gX(XT){var qT=document.createElement('span');var bT=XT.indexOf('OneTab');var AT=bT+'OneTab'.length;if(bT==0){qT.appendChild(PK());qT.appendChild(document.createTextNode(XT.substring(AT)))}else {qT.appendChild(document.createTextNode(XT.substring(0,bT)));qT.appendChild(PK());if(AT!=XT.length)qT.appendChild(document.createTextNode(XT.substring(AT)))}return qT};function PK(){var sT=document.createElement('span');var OT=document.createElement('span');OT.style.fontStyle='italic';OT.appendChild(document.createTextNode('One'));sT.appendChild(OT);sT.appendChild(document.createTextNode('Tab'));return sT};function M(dT){var hT=dT.split('OneTab');var MT=document.createElement('span');for(var kT in hT){if(hT[kT]=='')MT.appendChild(PK());else MT.appendChild(document.createTextNode(hT[kT]))}return MT};function B(_T){var WT=new Date(_T.valueOf()),GT=(_T.getUTCDay()+6)%7,JT;WT.setUTCDate(WT.getUTCDate()-GT+3);JT=WT.valueOf();WT.setUTCMonth(0,1);if(WT.getUTCDay()!==4){WT.setUTCMonth(0,1+((4-WT.getUTCDay())+7)%7)}return Math.ceil((JT-WT)/(7*24*3600*1000))+1};function cK(BQ,nQ){while(BQ.length<nQ)BQ='0'+BQ;return BQ};function P1(eQ){return (eQ.getUTCFullYear()+'').substr(2)+cK(B(eQ)+'',2)};function Kj(lQ){if(lQ==0)return x1('total0Tabs');if(lQ==1)return x1('total1Tab');return x1('total2Tabs').replace('2',lQ+'')};function Yj(VQ){var DQ=(VQ==1?x1('1tab'):(x1('2tabs').replace('2',VQ+'')));return DQ};function M1(YQ,QQ){var $Q='';for(var rQ=0;rQ<QQ;rQ++)$Q+=YQ;return $Q};function XX(HQ){HQ.sort(function(B6,JG){if(B6['starred']||JG['starred']){if(!JG['starred'])return -1;else if(!B6['starred'])return 1;else {if(B6['starredDate']>JG['starredDate'])return 1;if(B6['starredDate']<JG['starredDate'])return -1;return 0}}else {if(B6['createDate']>JG['createDate'])return -1;if(B6['createDate']<JG['createDate'])return 1;return 0}})};function G1(ZQ){if(!ZQ)ZQ='';return ZQ.replace(/[\x00-\x1F\x7F-\x9F]/g,"")};function NX(TQ){rK();BX(function(n6){var e6=function(Gl){N(function(){lj(undefined,$X)});sK(function(){K().RW('lastSeenVersion',function(Dy,ly){AX(function(Fk,xk){UX(function(DY,lY){var eY=DY['tabGroups'];if(!eY)eY=[];var VY=0;for(var YY=0;YY<eY.length;YY++){var $Y=eY[YY];VY+=$Y['tabsMeta'].length}if(y1!=Dy){K().wW('lastSeenVersion',y1,function(e$){},lY)}else {if(VY>0&&Qj('startupLaunch',Fk)=='displayOneTab'){lX()}}},xk)},ly)},$X)});q(undefined,Gl);if(k6S){Q1(function(fQ,RQ){window.jX=fQ;window.Aj=RQ})}SK();k1(function(){u1()});Y()};K().RW('installDate',function(Wl,_l){if(!Wl){K().wW('installDate',new Date().getTime(),function(KQ){e6(KQ)},_l)}else {e6(_l)}},n6)},TQ)};function rK(){C1('createNewTab',function(D6,l6){fK(D6.url,l6)});C1('createNewTabInLastFocusedWindowWithOpts',function(Y6,V6){d(Y6.url,!!Y6._W,!!Y6.uW,V6)});C1('createNewTabsInNewFocusedWindow',function(r6,Q6){eK(r6.Mj,Q6)})};function AX(FQ,xQ){K().RW('settings',function(Z6,H6){if(!Z6)FQ({},H6);else FQ(FK.parse(Z6),H6)},xQ)};C1('getSettings',function(IQ,pQ){AX(pQ,$X)});function Z1(jQ,CQ,mQ){K().wW('settings',FK.cW(jQ),CQ,mQ)};C1('storeSettings',function(aQ,yQ){Z1(aQ.EW,yQ,$X)});var gj={'restoreWindow':'newWindow','pinnedTabs':'ignore','startupLaunch':'displayOneTab','restoreRemoval':'default','duplicates':'allow'};function WK(UQ,oQ,LQ){AX(function(R6,T6){oQ(Qj(UQ,R6,T6))},LQ)};C1('getSetting',function(uQ,zQ){WK(uQ.NW,function(f6){zQ({value:f6})},$X)});function Qj(SQ,PQ){if(PQ[SQ])return PQ[SQ];else return gj[SQ]};function UX(gQ,cQ){K().RW('state',function(x6,K6){if(!x6){gQ({},K6)}else {gQ(FK.parse(x6),K6)}},cQ)};C1('getState',function(NQ,wQ){UX(wQ,$X)});function rj(EQ,iQ,vQ){K().RW('state',function(C6,p6){var I6=C6;var F6=EQ['tabGroups'];for(var m6=0;m6<F6.length;m6++){if(F6[m6]['tabsMeta'].length==0){F6.splice(m6,1);m6--}}K().wW('state',FK.cW(EQ),function(Jl){K().RW('state',function(bQ,XQ){try{FK.parse(bQ)}catch(AQ){K.wW('state',I6,function(Vy){if(!W6S)alert('Out of local storage memory - could not store extension state')},XQ)}finally{Sj('storedStateChanged',{QW:EQ});if(iQ)iQ(XQ)}},Jl)},p6)},vQ)};C1('storeState',function(OQ,qQ){rj(OQ.QW,qQ,$X)});function g(dQ,kQ,hQ,sQ){UX(function(y6,j6){if(!y6[dQ])y6[dQ]=[];y6[dQ].push(kQ);rj(y6,function(BN){if(hQ)hQ(BN)},j6)},sQ)};function zX(B8,MQ,GQ,WQ,_Q){var JQ={'id':Tj(),'url':B8,'title':G1(MQ)};T1(JQ,WQ,GQ,_Q)};function HX(V8,n8,e8,l8){if(U(V8['url'])){n8(function(){});return }var D8={'id':Tj(),'url':V8['url'],'title':G1(V8['title'])};if((V8['pinned']||V8['isPinned']))D8['pinned']=true;T1(D8,e8,function(){n8(function(){W(V8,function(){u1()})})},l8)};function T1(r8,Y8,H8,Q8){UX(function(o6,U6){var a6=o6['tabGroups'];XX(a6);var L6=undefined;if(typeof Y8==='undefined'){for(var S6=0;S6<a6.length;S6++){var u6=a6[S6];if(u6['starred']||u6['locked'])continue;L6=u6;L6['tabsMeta'].splice(0,0,r8);break}}else {for(var S6=0;S6<a6.length;S6++){var u6=a6[S6];if(u6['id']==Y8){L6=u6;L6['tabsMeta'].splice(0,0,r8);break}}}if(!L6){var z6=Tj();a6.push({'id':z6,'tabsMeta':[r8],'createDate':new Date().getTime()})}rj(o6,H8,U6)},Q8)};function xK(T8,K8,Z8,R8,f8){AX(function(c6,P6){UX(function(VN,DN){var nN=VN['tabGroups'];XX(nN);var pN=[];for(var xN in T8){if(!K8)pN.push(T8[xN]);else {if(!p1(T8[xN]['url'],c6))pN.push(T8[xN])}}var eN=[];var HN=[];for(var xN=0;xN<pN.length;xN++){var $N=pN[xN];var RN=$N['url'];var FN=false;if(RN.indexOf('://tabmemfree.appspot.com')!=-1){FN=true;break}}if(FN){if(!W6S)alert('The OneTab extension is not compatible with TabMemFree. Please ensure that none of your tabs are parked with TabMemFree, then uninstall the TabMemFree extension and restart your web browser before using OneTab.');Z8(function(){});return }Xj:for(var xN=0;xN<pN.length;xN++){var $N=pN[xN];var RN=$N['url'];if(($N['pinned']||$N['isPinned'])&&Qj('pinnedTabs',c6)=='ignore'){continue}if(U(RN)){continue}if(OK(RN)&&!U(RN)){HN.push($N);continue}if((RN.indexOf('chrome://chrome-signin')==0)||RN=='chrome://newtab/'||RN=='about:blank'||RN==''||RN=='about:home'||RN=='about:newtab'){HN.push($N);continue}if(RN.indexOf('chrome-devtools://')==0){continue}if(Qj('duplicates',c6)=='reject'){for(var rN in nN){for(var ZN in nN[rN]['tabsMeta']){if(nN[rN]['tabsMeta'][ZN]['url']==RN){HN.push($N);continue Xj}}}for(var rN in eN){if(eN[rN]['url']==RN){HN.push($N);continue Xj}}}HN.push($N);var KN={'id':Tj(),'url':RN,'title':G1($N['title'])};if(($N['pinned']||$N['isPinned']))KN['pinned']=true;eN.push(KN)}var fN=false;if(typeof R8==='undefined'){R8=Tj();fN=true}var TN=function(){Z8(function(){setTimeout(function(){F(HN,function(){u1()})},1)})};if(fN){g('tabGroups',{'id':R8,'tabsMeta':eN,'createDate':new Date().getTime()},function(){TN()},DN)}else {for(var rN=0;rN<nN.length;rN++){var QN=nN[rN];if(QN['id']==R8){var lN=QN;var YN=[];YN.push(0);YN.push(0);for(var ZN in eN)YN.push(eN[ZN]);Array.prototype.splice.apply(lN['tabsMeta'],YN);break}}rj(VN,function(Be){TN()},DN)}},P6)},f8)};function p1(F8,x8){return HK(UK(F8),x8)};function HK(I8,p8){if(p8['excludedDomains']){for(var m8 in p8['excludedDomains'])if(p8['excludedDomains'][m8]==I8)return true}return false};function i1(y8,j8,C8){AX(function(w6,g6){if(!HK(y8,w6)){if(!w6['excludedDomains'])w6['excludedDomains']=[];w6['excludedDomains'].push(y8);Z1(w6,j8,g6)}else {j8(g6)}},C8)};function Pj(U8,L8,a8){AX(function(v6,N6){if(!v6['excludedDomains'])return; for(var i6=0;i6<v6['excludedDomains'].length;i6++){if(v6['excludedDomains'][i6]==U8){v6['excludedDomains'].splice(i6,1);Z1(v6,function(IN){if(L8)L8()},N6);return }else {if(L8)L8()}}},a8)};var fX=function(){window['_gaq']=window['_gaq']||[];window['_gaq'].push(['_setAccount','UA-38573374-2']);window['_gaq'].push(['_trackPageview']);var z8=document.createElement('script');z8['type']='text/javascript';z8['async']=true;z8['src']='https://ssl.google-analytics.com/ga.js';var o8=document.getElementsByTagName('script')[0];o8.parentNode.insertBefore(z8,o8)};fX();NX()