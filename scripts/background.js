chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var first = false;

	// Resize first found Video
	if(message.found && !first){
		first = true;
		sendResponse();
		return true;
	}

	// Search for sub frame in other frames
	if(message.subWindow) chrome.tabs.sendMessage(sender.tab.id, {subWindow: message.subWindow});

	// Send Message to Resize/Restore
	if(message.resize) chrome.tabs.sendMessage(sender.tab.id, {resize: true});
	if(message.restore) chrome.tabs.sendMessage(sender.tab.id, {restore: true});
});

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		// Resize Video
		chrome.tabs.sendMessage(tabs[0].id, {start: true});
	});
});
