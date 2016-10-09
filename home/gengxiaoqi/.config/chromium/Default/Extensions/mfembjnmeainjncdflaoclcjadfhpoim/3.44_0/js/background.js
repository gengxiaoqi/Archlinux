chrome.extension.onMessage.addListener(function(req, sender, callback) {
	var ret = window[req.method](req);

	if (callback)
	{
		callback(ret);
	}
});

chrome.omnibox.onInputEntered.addListener(function(text) {
    var url = 'https://www.goodwordguide.com/dictionary/' + text.replace(/\s+/g, '+');

	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.update(tab.id, {url: url});
	});
});

function getOption (req)
{
	return localStorage;
}

function genericOnClick(info, tab)
{
	chrome.tabs.create({
		url: 'https://www.goodwordguide.com/dictionary/' + (info.selectionText).toLowerCase()
	});
}

var id = chrome.contextMenus.create({
	title: 'Search Good Word Guide for \'%s\'',
	contexts: ['selection'],
	onclick: genericOnClick
});

function install_notice()
{
	update_app_detail();
	
	if (localStorage.getItem('install_time'))
        return;

    var now = new Date().getTime();
    localStorage.setItem('install_time', now);
    chrome.tabs.create({url: chrome.extension.getURL('pages/options.html')});
}

install_notice();

function update_app_detail ()
{
	var url = chrome.extension.getURL("manifest.json"),
		xhr = new XMLHttpRequest();
		
	xhr.onreadystatechange = function(e)
	{
		if (xhr.readyState == 4 && xhr.status == 200)
		{
			var manifest = xhr.responseText;
			localStorage['app'] = manifest;
		}
	};

	xhr.open("GET", url);
	xhr.send();
}