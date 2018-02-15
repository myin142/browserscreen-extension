var foundVideos = 0;
var resized = false;

chrome.runtime.onMessage.addListener(function(message, sender) {

	// Count Videos on Website
	if(message.found){
		if(foundVideos == 0){
			foundVideos++;
		}
	}

	if(message.iframe){
		chrome.tabs.sendMessage(sender.tab.id, {iframe: message.iframe});
	}
});

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

		// Restore Video
		if(resized){
			chrome.tabs.sendMessage(tabs[0].id, {restore: true});
		}

		// Search Videos
		else{
			chrome.tabs.sendMessage(tabs[0].id, {search: true);
		}
	});
});
