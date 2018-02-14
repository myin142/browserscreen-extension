var videoClass = "browserscreen_VideoIDClass";
var fullscreenClass = "browserscreen_FullscreenVideoClass";
var styleID = "browserscreen_VideoStyleID";

chrome.runtime.onMessage.addListener(function(msg){

	if(msg.message == "button_clicked"){
		var style = document.querySelector("#" + styleID);

		// Video Browser Screen
		if(style == null){
			var video = findVideo();

			if(video == null){
				console.log("No Video could be found.");
			}else{
				console.log("Found a video");
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
		}

		// Video Restore Size
		else{
			removeMainStyle();
			console.log("Restore Video");
			video.classList.remove(videoClass);

			// Remove all parent elements with video class
			var elem = video;
			while(elem != undefined && elem.classList.contains(fullscreenClass)){
				elem.classList.remove(fullscreenClass);
				elem = elem.parentNode;
			}

			// Fix Youtube offset error
			window.dispatchEvent(new Event("resize"));

		}
	}
	else if(window == window.top && msg.iframe){
		var iframes = document.querySelectorAll("iframe");
		console.log(msg.iframe);
		for(var i = 0; i < iframes.length; i++){
			console.log(iframes[i].src);
			var elemSrc = getFormattedSource(iframes[i].src);
			var msgSrc = getFormattedSource(msg.iframe);

			if(elemSrc == msgSrc)
				iframes[i].classList.add(fullscreenClass);
		}

		createMainStyle();
	}

});

function getFormattedSource(src){
	return src.replace(/^https?\:\/\//i, "").replace(/^http?\:\/\//i, "");
}

// Find Video in Website: HTML5,
function findVideo(){
	var vid = document.querySelector("video");
	if(vid != null) return vid;

	console.log("No HTML5 video found.");
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

function removeMainStyle(){
	var style = document.querySelector("#" + styleID);
	if(style != null) style.parentNode.removeChild(style);
}
