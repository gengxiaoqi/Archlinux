// Gets similiar sites
var t = chrome.tabs, testUrl = "http://www.elance.com";
t.query({currentWindow: true, active: true}, function (tabs) {
    var tab = tabs[0], url = tab.url;
    if (url.indexOf("http") === 0) {
        var server;
        if (localStorage.serverInfo) {
            server = JSON.parse(localStorage.serverInfo);
        } else {
            server = {server: "https://t.similarsites.com"}
        }
        var similarQuery = server.server + "/related?s=5501&md=18&q=" + encodeURIComponent(url);
        getRelatedData(similarQuery, url);
    } else {
        showErrorInfo(url);
    }
});

/*
$("body").on("click", ".item-detail", function () {
    var url = $(this).attr("data-url");
    window.open(url, "_blank")
});
*/

$("body").on("click", "a", function (e) {
  e.preventDefault();
  if (this.href) {
    window.open(this.href, "_blank");
  }
});

function getRelatedData(similarQuery, url) {
    $.ajax({
        type: "GET",
        url: similarQuery,
        //url: "http://localhost:63342/SimilarSites%204.1.1/related.xml",
        dataType: "xml",
        success: function (result) {
            processSimiliarXML(result, url);
        },
        error: function () {
        }
    });
}

// Processes similiar site XML
function processSimiliarXML(xml, url) {
    var cnt;
    try {
        var info = $(xml), status = info.find("status").text();
        if (status == 0) {
            var curDomain = info.find("search_site url").text();
            $(".toWord").fadeIn("fast");
            $(".siteName").text(curDomain);
            $("#similarTitle a").attr("href", " http://www.similarsites.com/site/" + curDomain).click(function () {
                window.open($(this).attr("href"));
            });
            // Enumerate similiar sites and create a 'button' for them.

            info.find("site").each(function (i) {
                if (i < 9) {
                    var name = $(this).find("title").text(),
                        url = $(this).find("url").text(),
                        icon = $(this).find("icon").text(),
                        image = $(this).find("image").text(),
                        description = $(this).find("description").text(),
                        title = $(this).find("title").text();
                    url = 'http://' + url;
                    addSiteButton(name, url, icon, image, description, title);
                    cnt = cnt + 1;
                }
            });
            processSimiliar();
        }
        if (status == 1 || cnt == 0) {
            showErrorInfo(url);
        }
    }
    catch (ex) {
    }
}

function showErrorInfo(url) {
    $(".siteName").html("<b style='color: red;'>Error...</b>");
    $(".siteName").parent("a").attr("href", "http://www.similarsites.com/");
    var errResult =
        '<div class="container" style="height: 100%">' +
        '<p class="no-results-para">Unable to locate results for: <span class="site">' + get_hostname(url) + '</span></p>' +
        '<p class="no-results-para">Please check the URL or try again later.</p>' +
        '</div>';
    $('.InnerContainer').html(errResult);
    $("#error-img").click(function () {
        t.create({url: "http://www.similarsites.com/"});
    });
}


// Adds a site button.
function addSiteButton(name, url, icon, image, description, title) {
    var hostUrl = getHost(url);
    var button = createButton(name, hostUrl, icon, image, description, title);
    $('.InnerContainer').append(button);
    return button;
}

// Creates a site button element
function createButton(name, url, icon, image, description, title) {
    if (name == null)         name = '';
    if (url == null)          url = '';
    if (icon == null)         icon = '';
    if (image == null)        image = '';
    if (description == null)  description = '';
    var finalStr = '\
    <div class="item itemCss">\
        <div class="item-billboard item-billboard-css">\
            <div class="item-billboard-img">\
                <a target="_blank" href="http://' + url + '"><img alt="' + name + '" src="' + image.replace("&t=0", "&t=1") + '" /></a>\
            </div>\
             <div class="item-billboard-site">\
                <h3>\
                    <span class="js-linkout result-title" data-site="' + url + '" data-position="8"><a target="_blank"  href="http://' + url + '">' + capitaliseFirstLetter(title) + '</a></span>\
                </h3>\
            </div>\
        </div>\
        <div class="item-detail" data-url="http://' + url + '">\
            <div class="item-detail-desc">\
                <p>' + description + '</p>\
            </div>\
            <div class="item-detail-btn" title="click to visit the site">\
                 <img class="favicon" src="' + icon + '"><a target="_blank"  href="http://' + url + '"><span class="title">' + url + '</span></a>\
            </div>\
        </div>\
    </div> \
    ';
    return finalStr;
}

function processSimiliar() {
    var buttonCount = $('.ThumbRIWrapper').length;
    // setBadge(buttonCount);
    $('.ThumbRIWrapper').click(function () {
        var cur_url = "http://www." + $('.ThumbURLWrapper', this).html();
        t.create({'url': cur_url});
    });

    $('.ThumbRIWrapper').mouseover(function () {
        $(this).addClass('ThumbHover');
        $('.thumbnail', this).css('display', 'block');
    });

    $('.ThumbRIWrapper').mouseout(function () {
        $(this).removeClass('ThumbHover');
        $('.thumbnail', this).css('display', 'none');
    });

    chrome.tabs.getSelected(null, function (tab) {
        var url = tab.url;
        // alert(url);
        var title_url = get_hostname(url).replace('http://', '').replace('www.', '');
        title_url = title_url[0].toUpperCase() + title_url.substr(1).toLowerCase();
        $('.headerBlue_title').html(title_url + ' - ' + 'Similar Sites');
        $('#moreResults_text').click(function () {
            var cur_url = "http://www.similarsites.com/search?searchURL=" + get_hostname(url).replace('http://www.', '') + "&ref=" + localStorage["src"];
            chrome.tabs.create({'url': cur_url});
        });

        $('#moreResults_bt').click(function () {
            var cur_url = "http://www.similarsites.com/search?searchURL=" + get_hostname(url).replace('http://www.', '') + "&ref=" + localStorage["src"];
            chrome.tabs.create({'url': cur_url});
        });
        $('#footer a').click(function (event) {
            event.preventDefault();
        });


        $('#aboutUs_text').click(function () {
            var cur_url = "http://www.similarsites.com/about.aspx";
            chrome.tabs.create({'url': cur_url});
        });

        $('#privacy_text').click(function () {
            var cur_url = "http://www.similarsites.com/privacy-policy.aspx";
            chrome.tabs.create({'url': cur_url});
        });

        $('#remove_text').click(function () {
            var cur_url = "http://blog.similarsites.com/remove-similarsites-app/";
            chrome.tabs.create({'url': cur_url});
        });


        $('#footer_logo_bt').click(function () {
            var cur_url = "http://www.similarsites.com/";
            chrome.tabs.create({'url': cur_url});
        });
    });
}

function getHost(url) {
    var anchor = document.createElement('a');
    anchor.href = url;
    return anchor.hostname;
}

function get_hostname(url) {
    return url.match(/:\/\/(.[^/]+)/)[1];
}

// Initiates the entire process of displaying recommendations and getting similiar sites
function updateRootSite(tab) {
    try {
        getSimiliarSites(tab.url);
    }
    catch (ex) {
    }
}

function capitaliseFirstLetter(string) {
    string = string.length > 40 ? string.substr(0, 40) + "..." : string;
    //return (string.charAt(0).toUpperCase() + string.slice(1)).substr(0, 45) + "...";
    return string.charAt(0).toUpperCase() + string.slice(1);
}