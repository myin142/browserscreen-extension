function MediaControls(video, prefix){
    // Classes and Ids for Elements
    prefix = ((prefix == undefined) ? "" : prefix + "-");
    var identifiers = {
        style: prefix + "videoControlsStyle",
        container: prefix + "videoControls",
        buttons: prefix + "controls-btn",
        slider: prefix + "volume-slider",
        sliderHandle: prefix + "volume-slider-handle",

        timeDisplay: prefix + "time-display",
        timeCurr: prefix + "time-current",
        timeTotal: prefix + "time-total",

        leftContainer: prefix + "controls-leftContainer",
        rightContainer: prefix + "controls-rightContainer",
    }

    // Values for Elements
    var values = {
        controlsHeight: 36,
        sliderWidth: 52,
        sliderHandleSize: 12,
        sliderBarHeight: 3
    }

    // Create Container
    var container = document.createElement("DIV");
    container.id = identifiers.container;

    // Create UI Elements of Left Container
    var leftContainer = document.createElement("DIV");
    var playBtn = createPlayButton();
    var volBtn = createVolumeButton();
    var volSlide = createVolumeSlider();
    var timeLabel = createTimeLabel();
    leftContainer.appendChild(playBtn);
    leftContainer.appendChild(volBtn);
    leftContainer.appendChild(volSlide);
    leftContainer.appendChild(timeLabel);
    leftContainer.classList.add(identifiers.leftContainer);

    // Create UI Elements of Right Container
    var rightContainer = document.createElement("DIV");
    var fullscreenBtn = createFullscreenButton();
    var qualityBtn = createQualityButton();
    rightContainer.appendChild(qualityBtn);
    rightContainer.appendChild(fullscreenBtn);
    rightContainer.classList.add(identifiers.rightContainer);

    // Add Listeners to Video and add Style
    addVideoListeners();
    document.head.appendChild(createStyle());

    /* PUBLIC FUNCTION*/

    // Remove Controls and Listeners from original video source
    this.removeControls = function(){
        var controls = document.querySelector("#" + identifiers.container);
        if(controls != null) controls.parentNode.removeChild(controls);

        var style = document.querySelector("#" + identifiers.style);
        if(style != null) style.parentNode.removeChild(style);

        removeListeners();
    };

    /* END OF PUBLIC FUNCTION */

    // Append Elements to Container
    container.appendChild(leftContainer);
    container.appendChild(rightContainer);
    return container;

    // Video Listeners
    function addVideoListeners(){
        //video.addEventListener("click", videoClickListener);
        video.addEventListener("ended", videoEndedListener);
        video.addEventListener("volumechange", videoVolumeListener);
        video.addEventListener("play", videoPlayListener);
        video.addEventListener("pause", videoPauseListener);
        video.addEventListener("timeupdate", videoTimeListener);
        video.addEventListener("loadedmetadata", videoMetadataListener);
        video.addEventListener("webkitfullscreenchange", videoFullscreenListener);
    }
    /*function videoClickListener(){
        if(video.paused){
            video.play();
        } else {
            video.pause();
        }
    }*/
    function videoEndedListener(){
        changeReplay(playBtn);
    }
    function videoVolumeListener(){
        var volume = video.volume;

        if(volume == 0 || video.muted){
            changeMute(volBtn);
            setVolumeSlider(volSlide, 0);
        }else if(volume < 0.5){
            changeUnmuteLow(volBtn);
            setVolumeSlider(volSlide, getVolumeOffset());
        }else{
            changeUnmute(volBtn);
            setVolumeSlider(volSlide, getVolumeOffset());
        }
    }
    function videoPlayListener(){
        changePause(playBtn);
    }
    function videoPauseListener(){
        changePlay(playBtn);
    }
    function videoTimeListener(){
        var currTimeLabel = timeLabel.querySelector("." + identifiers.timeCurr);
        var time = getCurrentTime();
        if(currTimeLabel.innerHTML != time)
            currTimeLabel.innerHTML = time;
    }
    function videoMetadataListener(){
        var tTotal = timeLabel.querySelector("." + identifiers.timeTotal);
        tTotal.innerHTML = getTotalTime();
    }
    function videoFullscreenListener(){
        (document.webkitFullscreenElement == video) ? changeExitFull(fullscreenBtn) : changeFullscreen(fullscreenBtn);
    }

    function createStyle(){
        var css = `
            video::-webkit-media-controls-enclosure{
                display: none !important;
            }
            #`+identifiers.container+`{
                display: inline-flex;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-Index: 2147483647;
                font-family: Roboto, Arial, sans-serif;
                text-shadow: 0 0 2px rgba(0,0,0,.5);
                height: `+values.controlsHeight+`px;
                line-height: `+values.controlsHeight+`px;
                background: -webkit-linear-gradient(bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.2));
                justify-content: space-between;
            }
            .`+identifiers.leftContainer+`, .`+identifiers.rightContainer+`{
                display: inline-flex;
            }
            .`+identifiers.buttons+`{
                border: none;
                background: none;
                cursor: pointer;
                outline: 0;
                width: 46px;
                padding: 0;
            }
            .`+identifiers.buttons+`:hover path{
                fill: white;
            }
            .`+identifiers.slider+`{
                display: inline-block;
                position: relative;
                height: 100%;
                overflow: hidden;
                width: `+values.sliderWidth+`px;
                cursor: pointer;
            }
            .`+identifiers.sliderHandle+`{
                position: absolute;
                top: 50%;
                width: `+values.sliderHandleSize+`px;
                height: `+values.sliderHandleSize+`px;
                border-radius: `+(values.sliderHandleSize/2)+`px;
                margin-top: -`+(values.sliderHandleSize/2)+`px;
                background: white;
            }
            .`+identifiers.sliderHandle+`::before{
                background: white;
                left: -`+(values.sliderWidth - (values.sliderHandleSize/2))+`px;
            }
            .`+identifiers.sliderHandle+`::after{
                background: rgba(255,255,255,0.2);
                left: `+(values.sliderHandleSize/2)+`px;
            }
            .`+identifiers.sliderHandle+`::before, .`+identifiers.sliderHandle+`::after{
                content: '';
                position: absolute;
                display: block;
                top: 50%;
                height: `+values.sliderBarHeight+`px;
                margin-top: -2px;
                width: `+values.sliderWidth+`px;
            }
            .`+identifiers.timeDisplay+`{
                color: white;
                font-size: 12px;
                padding: 0 0.7em;
            }
        `;

        var style = document.createElement("STYLE");
        style.id = identifiers.style;
        style.innerHTML = css;
        return style;
    }
    function removeListeners(){
        //video.removeEventListener("click", videoClickListener);
        video.removeEventListener("ended", videoEndedListener);
        video.removeEventListener("volumechange", videoVolumeListener);
        video.removeEventListener("play", videoPlayListener);
        video.removeEventListener("pause", videoPauseListener);
        video.removeEventListener("timeupdate", videoTimeListener);
        video.removeEventListener("webkitfullscreenchange", videoFullscreenListener);
    }

    /*** Controls UI ***/
    function createSvgButton(){
        var btn = document.createElement("BUTTON");
        btn.classList.add(identifiers.buttons);
        btn.innerHTML = '<svg viewBox="0 0 36 36" width="36" height="36"><path fill="#eee"/></svg>';
        return btn;
    }

    // Quality Button
    function createQualityButton(){
        var btn = createSvgButton();
        console.log(video.videoWidth + "x" + video.videoHeight );

        return btn;
    }

    // Fullscreen Button
    function createFullscreenButton(){
        var btn = createSvgButton();
        (document.webkitFullscreenElement == video) ? changeExitFull(btn) : changeFullscreen(btn);
        btn.addEventListener("click", function(){
            var label = btn.getAttribute("aria-label");
            if(label == "Fullscreen"){
                video.webkitRequestFullscreen();
            }else{
                document.webkitExitFullscreen();
            }
        });
        return btn;
    }
    function changeFullscreen(btn){
        var fullscreen = "M 10 16 L 12 16 L 12 12 L 16 12 L 16 10 L 10 10 L 10 16 L 10 16 Z  M 12 20 L 10 20 L 10 26 L 16 26 L 16 24 L 12 24 L 12 20 L 12 20 Z  M 26 16 L 24 16 L 24 12 L 20 12 L 20 10 L 26 10 L 26 16 L 26 16 Z  M 24 20 L 26 20 L 26 26 L 20 26 L 20 24 L 24 24 L 24 20 L 24 20 Z";
        btn.setAttribute("aria-label", "Fullscreen");
        btn.querySelector("path").setAttribute("d", fullscreen);
    }
    function changeExitFull(btn){
        var exitFull = "M 14 14 L 10 14 L 10 16 L 16 16 L 16 10 L 14 10 L 14 14 L 14 14 Z  M 22 14 L 22 10 L 20 10 L 20 16 L 26 16 L 26 14 L 22 14 L 22 14 Z  M 20 26 L 22 26 L 22 22 L 26 22 L 26 20 L 20 20 L 20 26 L 20 26 Z  M 10 22 L 14 22 L 14 26 L 16 26 L 16 20 L 10 20 L 10 22 L 10 22 Z";
        btn.setAttribute("aria-label", "Exit Fullscreen");
        btn.querySelector("path").setAttribute("d", exitFull);
    }

    // Time Display
    function createTimeLabel(){
        var timeDisplay = document.createElement("DIV");
        timeDisplay.classList.add(identifiers.timeDisplay);

        var currTime = document.createElement("SPAN");
        currTime.innerHTML = getCurrentTime();
        currTime.classList.add(identifiers.timeCurr);

        var totalTime = document.createElement("SPAN");
        totalTime.innerHTML = getTotalTime();
        totalTime.classList.add(identifiers.timeTotal);

        var separator = getSeparator();

        timeDisplay.appendChild(currTime);
        timeDisplay.appendChild(separator);
        timeDisplay.appendChild(totalTime);
        return timeDisplay;
    }
    function getCurrentTime(){
        var time = video.currentTime;
        return normalizeTime(time);
    }
    function getTotalTime(){
        var time = video.duration;
        return normalizeTime(time);
    }
    function getSeparator(){
        var sep = document.createElement("SPAN");
        sep.innerHTML = " / ";
        return sep;
    }
    function normalizeTime(time){
        var minutes = Math.floor(time / 60);
        var seconds = Math.floor(time - minutes * 60);
        var x = (minutes < 10) ? "0" + minutes : minutes;
        var y = (seconds < 10) ? "0" + seconds : seconds;

        return x + ":" + y;
    }

    // Volume Slider
    function createVolumeSlider(){
        var slider = document.createElement("DIV");
        slider.classList.add(identifiers.slider);
        slider.setAttribute("aria-label", (video.volume * 100) + "% Volume");

        var sliderHandle = document.createElement("DIV");
        sliderHandle.classList.add(identifiers.sliderHandle);

        var offset = getVolumeOffset();
        sliderHandle.style.left = offset + "px";

        var dragging = false;
        slider.addEventListener("mousedown", function(e){
            dragging = true;
            changeVolume(e);
        });
        document.addEventListener("mousemove", function(e){
            if(dragging) changeVolume(e);
        });
        document.addEventListener("mouseup", function(e){
            dragging = false;
        });

        slider.appendChild(sliderHandle);
        return slider;

        function changeVolume(e){
            var handleSize = values.sliderHandleSize;
            var sliderL = slider.getBoundingClientRect().left + handleSize/2;
            var sliderR = slider.getBoundingClientRect().right - handleSize/2;
            var mouseX = e.pageX;

            var max = sliderR - sliderL;
            var relX = mouseX - sliderL;
            if(relX >= max){
                relX = max;
            }else if(relX <= 0){
                relX = 0;
            }

            setVolume(relX);
        }
    }
    function getVolumeOffset(){
        var currVol = video.volume;
        var offset = (values.sliderWidth-values.sliderHandleSize) * currVol;
        return offset;
    }
    function setVolume(offset){
        var volume = offset / (values.sliderWidth-values.sliderHandleSize);
        video.volume = volume;
        if(video.muted && video.volume > 0) video.muted = false;
    }
    function setVolumeSlider(slider, offset){
        slider.setAttribute("aria-label", ((offset == 0) ? 0 : (video.volume * 100)) + "% Volume");

        var slideHandle = volSlide.querySelector("." + identifiers.sliderHandle);
        slideHandle.style.left = offset + "px";
    }

    // Volume Button
    function createVolumeButton(){
        var btn = createSvgButton();
        (video.muted) ? changeMute(btn) : changeUnmute(btn);
        btn.addEventListener("click", function(){
    		var label = btn.getAttribute("aria-label");
            if(label == "muted"){
                video.muted = false;
                if(video.volume == 0) video.volume = 1;
            }else{
                video.muted = true;
            }
        });

        return btn;
    }
    function changeMute(btn){
        var muteBtn = "M 21.48 17.98 C 21.48 16.21 20.46 14.69 18.98 13.95 L 18.98 16.16 L 21.43 18.61 C 21.46 18.41 21.48 18.2 21.48 17.98 Z  M 23.98 17.98 C 23.98 18.92 23.78 19.8 23.44 20.62 L 24.95 22.13 C 25.61 20.89 25.98 19.48 25.98 17.98 C 25.98 13.7 22.99 10.12 18.98 9.22 L 18.98 11.27 C 21.87 12.13 23.98 14.81 23.98 17.98 Z  M 7.98 10.24 L 12.7 14.97 L 7.98 14.97 L 7.98 20.97 L 11.98 20.97 L 16.98 25.97 L 16.98 19.24 L 21.23 23.49 C 20.56 24.01 19.81 24.42 18.98 24.67 L 18.98 26.73 C 20.36 26.42 21.61 25.78 22.67 24.92 L 24.71 26.97 L 25.98 25.7 L 16.98 16.7 L 9.26 8.98 L 7.98 10.24 Z  M 14.88 12.05 L 16.97 14.14 L 16.97 9.98 L 14.88 12.05 Z";
        btn.setAttribute("aria-label", "muted");
        btn.querySelector("path").setAttribute("d", muteBtn);
    }
    function changeUnmute(btn){
        var unmuteBtn = "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z";
        btn.setAttribute("aria-label", "unmuted");
        btn.querySelector("path").setAttribute("d", unmuteBtn);
    }
    function changeUnmuteLow(btn){
        var unmuteLow = "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z";
        btn.setAttribute("aria-label", "unmuted low");
        btn.querySelector("path").setAttribute("d", unmuteLow);
    }

    // Play/Pause Button
    function createPlayButton(){
        var btn = createSvgButton();
        (video.paused) ? changePlay(btn) : changePause(btn);
        btn.addEventListener("click", function(){
    		var label = btn.getAttribute("aria-label");
    		(label == "pause") ? video.pause() : video.play();
        });
        return btn;
    }
    function changePlay(btn){
        var playBtn = "M 12,26 12,10 25,18 Z";
        btn.setAttribute("aria-label", "play");
        btn.querySelector("path").setAttribute("d", playBtn);
    }
    function changePause(btn){
        var pauseBtn = "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z";
        btn.setAttribute("aria-label", "pause");
        btn.querySelector("path").setAttribute("d", pauseBtn);
    }
    function changeReplay(btn){
        var replayBtn = "M 18,11 V 7 l -5,5 5,5 v -4 c 3.3,0 6,2.7 6,6 0,3.3 -2.7,6 -6,6 -3.3,0 -6,-2.7 -6,-6 h -2 c 0,4.4 3.6,8 8,8 4.4,0 8,-3.6 8,-8 0,-4.4 -3.6,-8 -8,-8 z";
        btn.setAttribute("aria-label", "replay");
        btn.querySelector("path").setAttribute("d", replayBtn);
    }
}
