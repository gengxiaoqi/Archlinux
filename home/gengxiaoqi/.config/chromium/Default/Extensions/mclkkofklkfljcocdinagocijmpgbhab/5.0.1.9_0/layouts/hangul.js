(function() { var f=function(a,b,c){return a.call.apply(a.bind,arguments)},h=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}},k=function(a,b,c){k=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?f:h;return k.apply(null,arguments)},m=function(a){var b=["google",
"elements","keyboard","hangulTransform"],c=l;b[0]in c||!c.execScript||c.execScript("var "+b[0]);for(var d;b.length&&(d=b.shift());)b.length||void 0===a?c[d]?c=c[d]:c=c[d]={}:c[d]=a},n=function(){this.a="\u1100 \u1101 \u1100\u1109 \u1102 \u1102\u110c \u1102\u1112 \u1103 \u1105 \u1105\u1100 \u1105\u1106 \u1105\u1107 \u1105\u1109 \u1105\u1110 \u1105\u1111 \u1105\u1112 \u1106 \u1107 \u1107\u1109 \u1109 \u110a \u110b \u110c \u110e \u110f \u1110 \u1111 \u1112 \u1100\u1105".split(" ");this.c={"\u1104":"\u1104",
"\u1108":"\u1108","\u110d":"\u110d"};for(var a=0;a<this.a.length;a++)this.c[this.a[a]]=String.fromCharCode(4520+a);this.A={"\u1169\u1161":"\u116a","\u1169\u1162":"\u116b","\u1169\u1175":"\u116c","\u116e\u1165":"\u116f","\u116e\u1166":"\u1170","\u116e\u1175":"\u1171","\u1173\u1175":"\u1174"};this.l=/[\u11a8-\u11c3]/g;this.j=RegExp("\u1169\u1161|\u1169\u1162|\u1169\u1175|\u116e\u1165|\u116e\u1166|\u116e\u1175|\u1173\u1175","g");this.h=/[\uac00-\ud7af]/g;this.i=/([\u1100-\u1112][\u1161-\u1175][\u11a7-\u11c3]?)/g;
this.s=RegExp("([\u1161-\u1175])([\u1100-\u1112])([\u1100-\u1112][\u1161-\u1175])");this.m=RegExp("([\u1161-\u1175])(\u1100\u1109|\u1102\u110c|\u1102\u1112|\u1105\u1100|\u1105\u1107|\u1105\u1109|\u1105\u1110|\u1105\u1111|\u1105\u1112|\u1107\u1109)(([^\u1161-\u1175]|$))");this.o=RegExp("([\u1161-\u1175])([\u1100-\u1112])([\u1100-\u1112]([^\u1161-\u1175]|$))");this.u=RegExp("([\u1161-\u1175])([\u1100-\u1112])(([^\u1100-\u1112\u1161-\u1175]|$))");this.b={"\u1107":"\u3142","\u110c":"\u3148","\u1103":"\u3137",
"\u1100":"\u3131","\u1109":"\u3145","\u116d":"\u315b","\u1167":"\u3155","\u1163":"\u3151","\u1162":"\u3150","\u1166":"\u3154","\u1106":"\u3141","\u1102":"\u3134","\u110b":"\u3147","\u1105":"\u3139","\u1112":"\u314e","\u1169":"\u3157","\u1165":"\u3153","\u1161":"\u314f","\u1175":"\u3163","\u110f":"\u314b","\u1110":"\u314c","\u110e":"\u314a","\u1111":"\u314d","\u1172":"\u3160","\u116e":"\u315c","\u1173":"\u3161","\u1108":"\u3143","\u110d":"\u3149","\u1104":"\u3138","\u1101":"\u3132","\u110a":"\u3146",
"\u1164":"\u3152","\u1168":"\u3156"};this.f={};for(var b in this.b)this.f[this.b[b]]=b},p=function(a,b){return b.replace(a.l,function(b){return a.a[b.charCodeAt(0)-4519-1]})},q=function(a,b){return b.replace(a.j,function(b){return a.A[b]})},l=this;n.prototype.w=function(a){a=a.charCodeAt(0)-44032;var b=4519+a%28;return String.fromCharCode(4352+a/588)+String.fromCharCode(4449+a%588/28)+(4519==b?"":String.fromCharCode(b))};n.prototype.v=function(a){return String.fromCharCode(28*(21*(a.charCodeAt(0)-4352)+(a.charCodeAt(1)-4449))+(3<=a.length?a.charCodeAt(2)-4519:0)+44032)};n.prototype.g=function(a,b,c,d){return b+this.c[c]+d};
(function(){var a=new n;m(function(b){var c;c=b.replace("\u001d","");var d="";b=0;for(var e;e=c.charAt(b);++b)var g=a.f[e],d=d+(g?g:e);b=d.replace(a.h,k(a.w,a));e=k(a.g,a);c=q(a,p(a,b)).replace(a.s,e).replace(a.m,e).replace(a.o,e).replace(a.u,e).replace(a.i,k(a.v,a));d="";for(b=0;e=c.charAt(b);++b)g=a.b[e],d+=g?g:e;return d});google.elements.keyboard.loadme({id:"hangul"})})(); })()
