// Cross Browser Support
window.browser = (function(){
	return window.msBrowser ||
		window.browser ||
		window.chrome
})();

var debugging = false;

var videoClass = "browserscreen_VideoIDClass";
var fullscreenClass = "browserscreen_FullscreenVideoClass";
var styleID = "browserscreen_VideoStyleID";
var controlsID = "browserscreen_VideoControlsID";
var overlayClass = "browserscreen_OverlayClass";

var mControls = null;

document.addEventListener("webkitfullscreenchange", (event) => {

	if(document.webkitFullscreenElement){
		let style = document.querySelector("#" + styleID);
		if(style == null){
			document.webkitExitFullscreen();

			let elem = document.webkitFullscreenElement;
			let vid = findVideos(elem);
			resizeElements(vid, false);
			addToParents(elem, overlayClass);
		}
	}
});

browser.runtime.onMessage.addListener(function(msg){
	if(debugging) console.log("Window: " + window.location.href);

	// Check if resize or restore
	if(msg.start && window == window.top){
		if(debugging) console.log("Checking Resize/Restore");

		// Detect active BrowerScreen by Main Style
		var style = document.querySelector("#" + styleID);
		if(style == null){
			browser.runtime.sendMessage({resize: true});
		}else{
			browser.runtime.sendMessage({restore: true});
		}
	}

	// Resize Video
	else if(msg.resize){
		if(debugging) console.log("Searching in Window");

		var vid = findVideos(document);
		if(vid == null){
			if(debugging) console.log("No Videos could be found.");
			return;
		}

		// Found a Video
		browser.runtime.sendMessage({found: true}, function(response){
			if(debugging){
				console.log("Resize Video");
				console.log(vid);
			}

			// Resize Video and all top frames
			vid.classList.add(videoClass);
			resizeElements(vid);

			// Create Video Controls for HTML5 Videos
			if(vid.tagName == "VIDEO"){
				if(debugging) console.log("Creating Controls");
				createControls(vid);
			}
		});
	}

	// Restore Video
	else if(msg.restore){
		if(debugging) console.log("Restore Video");

		// Restore Elements and Remove Controls
		var vid = document.querySelector("." + videoClass);
		restoreElements();
		removeControls();

		if(vid != null){
			vid.classList.remove(videoClass);
		}
	}

	// On Message from an IFRAME/OBJECT
	else if(msg.subWindow){
		if(debugging) console.log("Search Sub Window");
		var link = msg.subWindow;

		// Search Iframes
		var iframe = searchIFrames(link);
		if(iframe != null){
			resizeElements(iframe);
			if(debugging){
				console.log("Found Iframe: ");
				console.log(iframe);
			}
			return;
		}

		// Search Objects
		var object = searchObjects(link);
		if(object != null){
			resizeElements(object);
			if(debugging){
				console.log("Found Object: ");
				console.log(object);
			}
			return;
		}

		if(debugging) console.log("Nothing Found");
	}

});

function createControls(video){
    mControls = MediaControls(video, "browserscreen");
}

function removeControls(){
	if(mControls != null){
		if(debugging) console.log("Removing Controls");
		mControls.removeControls();
		mControls = null;
	}
}

// Search for Link in IFRAMEs
function searchIFrames(link){
	var iframes = document.querySelectorAll("iframe");
	for(var i = 0; i < iframes.length; i++){
		var elemSrc = getFormattedSource(iframes[i].src);
		var msgSrc = getFormattedSource(link);

		if(elemSrc == msgSrc)
			return iframes[i];
	}
}

// Search for Link in OBJECTs
function searchObjects(link){
	var objects = document.querySelectorAll("object");
	for(var i = 0; i < objects.length; i++){
		var elemSrc = getFormattedSource(objects[i].data);
		var msgSrc = getFormattedSource(link);

		if(elemSrc == msgSrc)
			return objects[i];
	}
}

// Remove Styles and Fullscreen Classes
function restoreElements(){
	removeMainStyle();

	// Remove Fullscreen Classes
	var elems = document.querySelectorAll("."+fullscreenClass);
	for(var i = 0; i < elems.length; i++){
		elems[i].classList.remove(fullscreenClass);
		elems[i].classList.remove(overlayClass);
	}

	// Fix Youtube offset error
	window.dispatchEvent(new Event("resize"));
}

function addToParents(elem, className){
	while(elem != null && elem.classList != undefined){
		elem.classList.add(className);
		elem = elem.parentNode;
	}
}

// Add Fullscreen Classes to all Parents of Video and message top frames
function resizeElements(elem, overlay = true){

	// Resize all Parents
	while(elem != null && elem.classList != undefined){
		elem.classList.add(fullscreenClass);

		if(overlay){
			elem.classList.add(overlayClass);
		}
		elem = elem.parentNode;
	}

	createMainStyle();

	// Resize all top frames
	if(window != window.top){
		if(debugging) console.log("Searching for frame: " + window.location.href);
		browser.runtime.sendMessage({subWindow: window.location.href});
	}
}

// Format Link to prevent mistakes with http/https
function getFormattedSource(src){
	return src.replace(/^https?\:\/\//i, "").replace(/^http?\:\/\//i, "");
}

// Find Videos in Website: FLASH, HTML5, EMBEDED. Flash before HTML5 for Crunchyroll
function findVideos(root){
	// Search Flash Videos
	var vid = root.querySelector("video");

	// Search HTML5 Videos
	if(vid == null){
		vid = root.querySelector("object[type='application/x-shockwave-flash']");

		// Search EMBEDed Videos
		if(vid == null){
			vid = root.querySelector("embed");
		}
	}

	return vid;
}

// Create Main Styles used by Extension
function createMainStyle(){
	if(document.querySelector("#" + styleID) != null) return;

	var style = document.createElement("style");
	style.id = styleID;

	var css = `
		::-webkit-scrollbar{
			display: none;
		}
		body, html{
			overflow: hidden !important;
		}
		.`+fullscreenClass+`{
			position: fixed !important;
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			bottom: 0 !important;
			width: 100% !important;
			height: 100% !important;
			max-width: 100% !important;
			max-height: 100% !important;
			transform: none !important;
			background: black !important;
		}
		.`+overlayClass+`{
			z-Index: 2147483647 !important;
		}
		#`+controlsID+`{
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-Index: 2147483647;
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
