var videoClass = "browserscreen_FullscreenVideoClass";
var styleID = "browserscreen_VideoStyleID";

chrome.runtime.onMessage.addListener(function(msg){

	if(msg.message == "button_clicked" && window == window.top){
		var style = document.querySelector("#" + styleID);

		// Video Browser Screen
		if(style == null){
			var video = findVideo();

			if(video == null){
				console.log("No Video could be found.");
			}else{
				createMainStyle();
				console.log(video);
			}
		}

		// Video Restore Size
		else{
			removeMainStyle();
			console.log("Restore Video");
		}
	}

});

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
		.`+videoClass+`{
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
