chrome.runtime.onMessage.addListener(function(message, sender) {
	if(message.iframe){
		chrome.tabs.sendMessage(sender.tab.id, {iframe: message.iframe});
	}
});

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

		// On Button click: send message to content scripts
		chrome.tabs.sendMessage(tabs[0].id, {message: "button_clicked"});

	});
});
