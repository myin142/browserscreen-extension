var videoClass = "browserscreen_FullscreenVideoClass";
var styleID = "browserscreen_VideoStyleID";

chrome.runtime.onMessage.addListener(function(msg){

	if(msg.message == "button_clicked" && window == window.top){
		var video = document.querySelector("#" + videoClass);

		// Video Browser Screen
		if(video == null){
			var browserVideo = findVideo();

			if(browserVideo == null){
				console.log("No Video could be found.");
			}else{
				console.log(browserVideo);
			}
		}

		// Video Restore Size
		else{
			console.log("Restore Video");
		}
	}

});

// Find Video in Website: HTML5, 
function findVideo(){

}
