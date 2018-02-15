//TODO Handle Double IFRAMEs/OBJECTs
//TODO Handle multiple video sources
var debugging = true;

var videoClass = "browserscreen_VideoIDClass";
var fullscreenClass = "browserscreen_FullscreenVideoClass";
var styleID = "browserscreen_VideoStyleID";

chrome.runtime.onMessage.addListener(function(msg){
	var videos = null;

	// Find Videos on Website
	if(msg.search){
		videos = findVideos();

		if(debugging){
			console.log("Searching in Window");
			console.log(videos);
		}

		// No Video Found
		if(videos == null){
			console.log("No Videos could be found.");
		}

		// Found a Video
		else{
			chrome.runtime.sendMessage({found: true});
		}
	}
/*
	// Resize Videos
	else if(videos != null && msg.resize){
		createMainStyle();
		video.classList.add(videoClass);

		// Add video class to all parents
		var elem = video;
		while(elem != null && elem.classList != undefined){
			elem.classList.add(fullscreenClass);
			elem = elem.parentNode;
		}

		// Send message to top frame
		if(window != window.top)
			chrome.runtime.sendMessage({iframe: window.location.href});
	}

	// Restore Videos
	else if(videos != null && msg.restore){
		removeMainStyle();
		console.log("Restore Video");

		var video = document.querySelector("." + videoClass);
		if(video != null) video.classList.remove(videoClass);

		// Remove all parent elements with video class
		var elem = video;
		while(elem != null && elem.classList != undefined && elem.classList.contains(fullscreenClass)){
			elem.classList.remove(fullscreenClass);
			elem = elem.parentNode;
		}

		// Fix Youtube offset error
		window.dispatchEvent(new Event("resize"));
	}

	// On Message from an IFRAME
	else if(window == window.top && msg.iframe){
		var iframes = document.querySelectorAll("iframe");
		for(var i = 0; i < iframes.length; i++){
			var elemSrc = getFormattedSource(iframes[i].src);
			var msgSrc = getFormattedSource(msg.iframe);

			if(elemSrc == msgSrc)
				iframes[i].classList.add(fullscreenClass);
		}

		createMainStyle();
	}
*/
});

// Format Link to prevent mistakes with http/https
function getFormattedSource(src){
	return src.replace(/^https?\:\/\//i, "").replace(/^http?\:\/\//i, "");
}

// Find Video in Website: HTML5, FLASH, EMBEDED
function findVideos(){
	// Search HTML5 Videos
	var html5Vid = document.querySelectorAll("video");

	// Search OBJECT/Flash Videos
	var objVid = document.querySelectorAll("object");

	// Search EMBEDed Videos
	var embVid = document.querySelectorAll("embed");

	// Combine Videos into one array
	var videos = new array();
	videos.concat(html5Vid);
	videos.concat(objVid);
	videos.concat(embVid);

	return (videos.length == 0) ? null : videos;
}

// Create Main Styles used by Extension
function createMainStyle(){
	var style = document.createElement("style");
	style.id = styleID;

	var css = `
		body, html{
			overflow: hidden !important;
		}
		.`+fullscreenClass+`{
			position: fixed !important;
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			bottom: 0 !important;
			z-Index: 2147483647 !important;
			width: 100% !important;
			height: 100% !important;
			max-width: 100% !important;
			max-height: 100% !important;
			transform: none !important;
			background: black !important;
		}
	`;
	style.innerHTML = css;

	document.querySelector("head").appendChild(style);
}

// Remove Main Style
function removeMainStyle(){
	var style = document.querySelector("#" + styleID);
	if(style != null) style.parentNode.removeChild(style);
}
