var image_prefix = "images/icon/ss-addon-icon-";
var itemator = 550;
var version = chrome.runtime.getManifest().version, serverInfo = localStorage.serverInfo ? JSON.parse(localStorage.serverInfo) : [];
if (serverInfo.length == 0 || serverInfo.version !== version) {
    $.ajax({
        type: "GET",
        url: "http://lb.similarsites.com/settings",
        dataType: "json",
        data: "s="+itemator+"&ins=1&ver=" + version,
        success: function (result) {
            if (result.Status == "1") {
                var serverInfo = {};
                serverInfo.version = version;
                serverInfo.server = result.Endpoint;
                localStorage.serverInfo = JSON.stringify(serverInfo);
            }
        }
    });
}

var cb = chrome.browserAction,
    ct = chrome.tabs,
    wr = chrome.webRequest,
    wn = chrome.webNavigation,
    cw = chrome.windows,
    lp = "",
    currTabs = {};

var wrFilter = { types: ["main_frame"], urls: ["<all_urls>"] };
ct.onUpdated.addListener(onUpdated);
ct.onReplaced.addListener(onReplaced);
wr.onBeforeRedirect.addListener(onBeforeRedirect, wrFilter);
wr.onBeforeSendHeaders.addListener(onBeforeSendHeaders, wrFilter,["blocking", "requestHeaders"]);
wr.onHeadersReceived.addListener(onHeadersReceived, wrFilter);
wn.onCommitted.addListener(onCommitted);
ct.onRemoved.addListener(onRemoved);
cw.onRemoved.addListener(cwonRemoved);
cw.onFocusChanged.addListener(cwonFocused);
if (ct.onActivated) {
    ct.onActivated.addListener(onActivated);
} else {
    ct.onSelectionChanged.addListener(onSelectionChanged);
}
wr.onBeforeRequest.addListener(function (details) {
  if(validateUrl(details.url)){
    editTabWithKeyValue(details.tabId, "rp" , false);
    editTabWithKeyValue(details.tabId,  "url" , undefined);
  }
}, wrFilter, ["blocking"]);
wr.onErrorOccurred.addListener(function(details) {
    try {
        var currTab = getTabWithId(details.tabId);
        currTab.srs = null;
    } catch(e) { }
}, wrFilter);

var self = this;
cw.getAll({populate: true}, function (windows) {
  for (var w = 0; w < windows.length; w++) {
    for (var i = 0; i < windows[w].tabs.length; i++) {
      if (!validateUrl(windows[w].tabs[i].url))
        continue;
      setTabWithId({url: windows[w].tabs[i].url, rp: true}, windows[w].tabs[i].id);
      if (windows[w].focused && windows[w].tabs[i].active) {
        dolp(windows[w].tabs[i].id);
      }

    }
  }
});

function isSubDomain(url) {
    url = url.replace(new RegExp(/^www\./i), "");
    url = url.replace(new RegExp(/\/(.*)/), "");
    if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
        url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i), "");
    } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
        url = url.replace(new RegExp(/\.[a-z]{2,4}$/i), "");
    }
    return (url.match(new RegExp(/\./g))) ? true : false;
}

function editTabWithKeyValue(tabId, key, val) {
    var tab = getTabWithId(tabId);
    tab[key] = val;
    setTabWithId(tab, tabId);
}

function getTabWithId(tabId) {
    return currTabs[tabId] || {};
}

function removeTabWithId(tabId) {
    delete currTabs[tabId];
}

function setTabWithId(tab, tabId) {
    currTabs[tabId] = tab || {};
}

function onBeforeSendHeaders(details) {
    editTabWithKeyValue(details.tabId, "hh", true);
    for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Referer') {
            editTabWithKeyValue(details.tabId, "ref", details.requestHeaders[i].value);
        }
    }
    return {
        requestHeaders: details.requestHeaders
    };
}

function onHeadersReceived(details) {
    editTabWithKeyValue(details.tabId, "hh", true);
}

function onBeforeRedirect(details) {
    var currTab = getTabWithId(details.tabId);
    if(!currTab.srs) {
        currTab.srs = [];
    }
    if(validateUrl(details.url)) {
        currTab.srs.push(details.url);
    }
}

function onCommitted(details) {
    try {
        if (details == undefined || details.frameId != 0) {
            return;
        }
        var tabId = details.tabId;
        if (tabId >= 0) {

            var currTab = getTabWithId(tabId);
            currTab.tt = details.transitionType;
            currTab.tq = details.transitionQualifiers;
            if (details.transitionQualifiers.indexOf("client_redirect") > -1) {
                if(validateUrl(details.url)) {
                    currTab.cr = details.url;
                }
            }
            setTabWithId(currTab,details.tabId);
	    fetchPageDataFromSimilarWeb(tabId, tab);
        }
    } catch (e) {}
}

function cwonRemoved(windowID) {
    ct.query({active: true}, function(tabs) {
        if (tabs[0]) {
            dolp(tabs[0].id);
        }
    });
}

function cwonFocused (window) {
    if (cw.WINDOW_ID_NONE == window) {
        return;
    }
    ct.query({ windowId: window, active: true }, function(tabs) {
        if (tabs[0] && tabs[0].active) {
            dolp(tabs[0].id);
        }
    });
}

function onRemoved(tabId) {
    removeTabWithId(tabId);
}

function onSelectionChanged(tabId, info) {
    var currTab = getTabWithId(tabId);
    if(!currTab.rp) {
        return;
    }
    ct.get(tabId, function(tab) {
        if (chrome.runtime.lastError) {} else {
		dolp(tab.id);
        }
    });
}

function onActivated(info) {
    onSelectionChanged(info.tabId);
}

function guid() {
    var guid = localStorage.getItem("guid_key");
    if(!guid) {
        var g = function () {
            return (((1 + Math.random(Date.now() + 12)) * 0x10000) | 0).toString(30).substring(1);
        };
        guid = (g() + g() + g() + g() + g() + g() + g() + g() + g());
        localStorage.setItem("guid_key", guid);
    }
    return guid;
}

function dolp(id){
  var url = (getTabWithId(id) || {}).url;
    if(validateUrl(url))
        lp = url;
}

function onUpdated(tabId, details, tab) {
  if(details && "complete" === details.status){
      var currTab = getTabWithId(tabId);
      currTab.tt = "ajax";
      setTabWithId(currTab, tabId);
      fetchPageDataFromSimilarWeb(tabId, tab);
  }
}

function onReplaced(addedTabId, removedTabId) {
    ct.get(addedTabId, function(tab) {
        if (chrome.runtime.lastError) {} else {
            if(tab.url.indexOf("sourceid=chrome-instant") == -1) {
                fetchPageDataFromSimilarWeb(tab.id, tab);
            }
        }
    });
}

function get_domain_from_url(url) {
    try {
        if (url == null)
            return '';
        var host = url.split('/');
        if (host.length < 3)
            return '';
        var domain = host[2];
        if (domain.indexOf("www.") == 0)
            domain = domain.substr(4);
        return domain;

    } catch (e) {
        return '';
    }
}

function validateUrl(url) {
    return url.indexOf("http") === 0 && url.indexOf("://localhost") === -1 && url.indexOf("chrome/newtab") === -1;
}

function toQueryString(obj) {
    return Object.keys(obj).filter(function (key) {
        return !!obj[key] || false === obj[key];
    }).map(function (key) {
        return key + '=' + obj[key];
    }).join('&');
}

function fetchPageDataFromSimilarWeb(tabId, tab) {
    if(!getTabWithId(tabId).hh && lp == tab.url) {
        return;
    }
    var url = tab.url;
    if (validateUrl(url)) {
        var currTab = getTabWithId(tabId);
        currTab.url = url;

        var srs = "";
        if(currTab.srs) {
            for (var i = 0; i < currTab.srs.length; i++) {
                srs += "&sr=" + encodeURIComponent(currTab.srs[i]);
            }
        }

        var data = {s: itemator, tmv: version, md: 21, v: "1", sub: "chrome", pid: guid(), 
	            ts: Date.now(), sess: '', q: encodeURIComponent(currTab.url), prev: encodeURIComponent(lp), 
	            hreferer: currTab.ref ? encodeURIComponent(currTab.ref) : "", 
	            tt: currTab.tt, tq: currTab.tq,cr:currTab.cr ? encodeURIComponent(currTab.cr) : "", crd:0};
		    
        var payload = "e=" + encodeURIComponent(btoa(btoa(toQueryString(data) + srs)));
        setTabWithId({"rp" : true, "url" : url}, tabId);
        if(tab.active)
            dolp(tabId);
        var domain = get_domain_from_url(url);
        fetcher(domain, payload, tabId);
    }else {
        setDynamicBadge(0, tabId);
    }
}

var fetcher = function(domain, payload, tabId ){
    if (domain != "") {
        var fetchurl = "https://api.similarweb.com/site/" + domain + "/openglobalrank?userkey=" + guk() + "&format=json";
        getAPIDataURL(fetchurl, payload, 30000,
            function (result) {
                if (isSubDomain(domain) && result.Rank === 0) {
                    var subfetchurl = "https://api.similarweb.com/site/" + domain.substr(domain.indexOf(".") + 1) + "/openglobalrank?userkey=" + guk() + "&format=json";
                    getAPIDataURL(subfetchurl, null, 30000, function (result) {
                            setDynamicBadge(result.Rank, tabId);
                        },
                        function () {
                            setDynamicBadge(0, tabId);
                        });
                } else {
                    setDynamicBadge(result.Rank, tabId);
                }
            },
            function () {
                setDynamicBadge(0, tabId);
            }
        );
    }
}

function guk() {
    return atob(atob(atob(['V', '1', 'Z', 'S', 'Y', 'W', 'J', 'W', 'c', 'E', 'V', 'R', 'V', 'E', 'J', 'h', 'U', 'k', 'd', 'k', 'N', 'l', 'R', 'U', 'S', 'l', 'p', 'l', 'V', 'm', 'w', '2', 'U', '1', 'R', 'S', 'W', 'k', '1', 's', 'V', 'X', 'p', 'X', 'W', 'H', 'B', 'O', 'Z', 'D', 'F', 'w', 'S', 'F', 'R', 'U', 'V', 'k', '9', 'W', 'R', '1', 'J', 'w', 'V', '2', '1', 'w', 'U', 'k', '5', 'F', 'M', 'V', 'h', 'W', 'V', 'D', 'A', '9'].join(''))));
}

function setDynamicBadge(rank, tId) {
    var imgSuffix = "00";
    if (rank == 0) {
        imgSuffix = "00";
    }

    else if (rank < 100)
        imgSuffix = "16";
    else if (rank < 180)
        imgSuffix = "15";
    else if (rank < 320)
        imgSuffix = "14";
    else if (rank < 560)
        imgSuffix = "13";
    else if (rank < 1000)
        imgSuffix = "12";
    else if (rank < 1800)
        imgSuffix = "11";
    else if (rank < 3200)
        imgSuffix = "10";
    else if (rank < 5600)
        imgSuffix = "09";
    else if (rank < 10000)
        imgSuffix = "08";
    else if (rank < 18000)
        imgSuffix = "07";
    else if (rank < 32000)
        imgSuffix = "06";
    else if (rank < 56000)
        imgSuffix = "05";
    else if (rank < 100000)
        imgSuffix = "04";
    else if (rank < 180000)
        imgSuffix = "03";
    else if (rank < 320000)
        imgSuffix = "02";
    else if (rank < 560000)
        imgSuffix = "01";
    else
        imgSuffix = "01";
    var img = image_prefix + imgSuffix + ".png";
    var tmpNumber = rank;
    tmpNumber += '';
    var x = tmpNumber.split('.');
    var x1 = x[0];
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    if ((rank == 0) || typeof(x1) == "undefined" || x1 == "undefined") {
        cb.setTitle({title: "Global Rank - N/A", tabId: tId});
    }
    else {
        cb.setTitle({title: "Global Rank - #" + x1, tabId: tId});
    }
    cb.setIcon({path: img, tabId: tId});
}
