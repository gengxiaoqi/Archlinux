(function(){Registry.require(["pingpong","helper"],function(){var h=Registry.get("pingpong"),k=Registry.get("helper"),e=null,c=[],b=null;Registry.register("layout","5271",{init:function(a,d){var g=function(){if(c.length){var f=c.pop();console.log("Try to load layout",f);Registry.loadFile(["layout",f,a].join("/"));b=window.setTimeout(function(){b=null;g()},1E3)}else console.warn("Layout: Unable to load file",a)};h.ping(function(a){c=["default",k.getUrlArgs().layout||(a&&a.config?a.config.layout:
null)||"default"];g();d.suc&&d.suc()},d.fail)},render:function(a){b&&(window.clearTimeout(b),b=null);a(e);e=null},getLayouts:function(){var a=[],b=["test"];Registry.isDevVersion("helper")&&b.forEach(function(b){Registry.getRaw("layout/"+b+"/options.js")&&a.push(b)});return a},editorThemes:"default solarized monokai mdn-like eclipse railscasts".split(" ")})})})();
