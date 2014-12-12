const DEFAULT_BASE_URL = "http://www.library.drexel.edu/cgi-bin/r.cgi?url=$@";

function transformUrl(url, callback) {
    chrome.storage.sync.get({"base_url": DEFAULT_BASE_URL}, function(items) {
        var base = items["base_url"];
        if (base.indexOf("$@") >= 0) {
            base = base.replace("$@", url);
        }
        callback(base);
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    transformUrl(tab.url, function(newUrl) {
        chrome.tabs.update(tab.id, {"url": newUrl});
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    transformUrl(info.linkUrl, function(newUrl) {
        chrome.tabs.create({"url": newUrl});
    });
});

function initialize() {
    chrome.contextMenus.create({
        "title": "Open Link with EZProxy",
        "contexts": ["link"],
        "id": "redirect"
    });
}

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.storage.sync.get({"base_url": null}, function(items) {
        if (!items["base_url"]) {
            // migrate old format
            var legacyBase = localStorage["base_url"];
            if (legacyBase) {
                delete localStorage["base_url"];
            } else {
                legacyBase = DEFAULT_BASE_URL;
            }
            chrome.storage.sync.set({"base_url": legacyBase}, function() {
                initialize();
            });
        } else {
            initialize();
        }
    });
});

