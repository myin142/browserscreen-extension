var resized = false;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

	// Resize first found Video
	if(message.found){

		// Resize first found video
		if(!resized){
			resized = true;
			sendResponse();
			return true;
		}

		// Found multiple videos on different windows
		else{
			console.log("Another Window already found a video.");
		}
	}

	if(message.subWindow){
		chrome.tabs.sendMessage(sender.tab.id, {subWindow: message.subWindow});
	}
});

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

		// Restore Video
		if(resized){
			chrome.tabs.sendMessage(tabs[0].id, {restore: true});
			resized = false;
		}

		// Resize Video
		else{
			chrome.tabs.sendMessage(tabs[0].id, {resize: true});
		}
	});
});
