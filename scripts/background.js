// Cross Browser Support
window.browser = (function(){
	return window.msBrowser ||
		window.browser ||
		window.chrome
})();

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var first = false;

	// Resize first found Video
	if(message.found && !first){
		first = true;
		sendResponse();
		return true;
	}

	// Search for sub frame in other frames
	if(message.subWindow) browser.tabs.sendMessage(sender.tab.id, {subWindow: message.subWindow});

	// Send Message to Resize/Restore
	if(message.resize) browser.tabs.sendMessage(sender.tab.id, {resize: true});
	if(message.restore) browser.tabs.sendMessage(sender.tab.id, {restore: true});
});

browser.browserAction.onClicked.addListener(function(tab){
	browser.tabs.query({active: true, currentWindow: true}, function(tabs){
		// Resize Video
		browser.tabs.sendMessage(tabs[0].id, {start: true});
	});
});
