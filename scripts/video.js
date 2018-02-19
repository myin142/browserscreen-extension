function MediaControls(video, prefix){
    // Classes and Ids for Elements
    prefix = ((prefix == undefined) ? "" : prefix + "-");
    var identifiers = {
        style: prefix + "videoControlsStyle",
        buttons: prefix + "controls-btn",
        slider: prefix + "volume-slider",
        sliderHandle: prefix + "volume-slider-handle",

        timeDisplay: prefix + "time-display",
        timeCurr: prefix + "time-current",
        timeTotal: prefix + "time-total",

        qualityLabel: prefix + "quality-label",
        playSpeed: prefix + "playback-speed",

        container: prefix + "videoControls",
        subContainer: prefix + "sub-container",
        leftContainer: prefix + "controls-leftContainer",
        rightContainer: prefix + "controls-rightContainer",

        progressBar: prefix + "progress-bar",
        progressContainer: prefix + "progress-bar-container",
        currProgress: prefix + "curr-progress-bar",
        currBuffer: prefix + "curr-buffered-bar",
        previewTime: prefix + "progress-bar-time",

        loading: prefix + "loading-icon",
    }

    // Values for Elements
    var values = {
        controlsHeight: 36,
        buttonWidth: 46,
        sliderWidth: 52,
        sliderHandleSize: 12,
        sliderBarHeight: 3,
        progressHeight: 3,
        progressContainer: 16,

        loadingSize: 80,
        loadingBorder: 5,

        idler: 0,

        playbackRates: [
            0.25,
            0.5,
            1,
            1.25,
            1.5,
            2
        ]
    }

    // Create Container
    var container = document.createElement("DIV");
    container.id = identifiers.container;

    // Create Sub Container
    var subContainer = document.createElement("DIV");
    subContainer.classList.add(identifiers.subContainer);

    // Append Elements to document
    container.appendChild(subContainer);
    document.body.appendChild(container);
    document.head.appendChild(createStyle());

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
    var playSpeedBtn = createPlaySpeedButton();
    var qualityLabel = createQualityLabel();
    rightContainer.appendChild(qualityLabel);
    rightContainer.appendChild(playSpeedBtn);
    rightContainer.appendChild(fullscreenBtn);
    rightContainer.classList.add(identifiers.rightContainer);

    // Create Progress Bar and Add elements to sub container
    var progressBar = createProgressBar();
    subContainer.appendChild(progressBar);
    subContainer.appendChild(leftContainer);
    subContainer.appendChild(rightContainer);

    // Update UI for first display
    updateVolumeButton();
    updateCurrentProgress();
    updateCurrentBuffer();

    // Add Listeners to Video and add Style
    addVideoListeners();

    /* PUBLIC FUNCTION*/

    // Remove Controls and Listeners from original video source
    this.removeControls = function(){
        if(container != null) container.parentNode.removeChild(container);

        var style = document.querySelector("#" + identifiers.style);
        if(style != null) style.parentNode.removeChild(style);

        removeListeners();
        video.style.cursor = "";
    };

    /* END OF PUBLIC FUNCTION */

    var idleInterval = startIdler();
    return container;

    // Video Listeners
    function addVideoListeners(){
        video.addEventListener("ended", videoEndedListener);
        video.addEventListener("volumechange", videoVolumeListener);
        video.addEventListener("play", videoPlayListener);
        video.addEventListener("pause", videoPauseListener);
        video.addEventListener("timeupdate", videoTimeListener);
        video.addEventListener("loadedmetadata", videoMetadataListener);
        video.addEventListener("webkitfullscreenchange", videoFullscreenListener);
        video.addEventListener("ratechange", videoRateListener);
        video.addEventListener("progress", videoProgressListener);
        video.addEventListener("waiting", videoWaitListener);
        video.addEventListener("playing", videoPlayingListener);
        video.addEventListener("mouseleave", videoMouseLeaveListener);
        video.addEventListener("mouseenter", videoMouseEnterListener);
        video.addEventListener("mousemove", videoMouseMoveListener);
        container.addEventListener("mousemove", videoMouseMoveListener);
    }
    function videoEndedListener(){
        changeReplay(playBtn);
    }
    function videoVolumeListener(){
        updateVolumeButton();
    }
    function videoPlayListener(){
        changePause(playBtn);
        idleInterval = startIdler();
    }
    function videoPauseListener(){
        changePlay(playBtn);
        showControls(1);
    }
    function videoTimeListener(){
        if(video.seeking || video.paused) return;

        var currTimeLabel = timeLabel.querySelector("." + identifiers.timeCurr);
        var time = getCurrentTime();
        if(currTimeLabel.innerHTML != time){
            currTimeLabel.innerHTML = time;
        }

        updateCurrentProgress();
    }
    function videoMetadataListener(){
        var tTotal = timeLabel.querySelector("." + identifiers.timeTotal);
        tTotal.innerHTML = getTotalTime();

        qualityLabel.removeChild(qualityLabel.firstChild);
        qualityLabel.appendChild(getQuality());
    }
    function videoFullscreenListener(){
        (document.webkitFullscreenElement == video) ? changeExitFull(fullscreenBtn) : changeFullscreen(fullscreenBtn);
    }
    function videoRateListener(){
        var rateText = playSpeedBtn.querySelector("SPAN");
        rateText.innerHTML = video.playbackRate + "x";
    }
    function videoProgressListener(){
        updateCurrentBuffer();
    }
    function videoWaitListener(){
        displayLoading();
    }
    function videoPlayingListener(){
        var loading = container.querySelector("." + identifiers.loading);
        if(loading != null)
            loading.style.display = "none";
    }
    function videoMouseLeaveListener(e){
        if(!video.paused && !insideBoundary(e)){
            showControls(0);
        }
    }
    function videoMouseEnterListener(){
        if(!video.paused){
            showControls(1);
        }
    }
    function videoMouseMoveListener(){
        if(!video.paused){
            if(isControls()){
                values.idler = 0;
            }else{
                showControls(1);
            }
        }
    }

    function createStyle(){
        var css = `
            video::-webkit-media-controls-enclosure{
                display: none !important;
            }
            #`+identifiers.container+`{
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 0 0.7em;
                z-Index: 2147483647;
                font-family: Roboto, Arial, sans-serif;
                font-size: 12px;
                text-align: center;
                -webkit-user-select: none;
                line-height: `+values.controlsHeight+`px;
                height: `+values.controlsHeight+`px;
                transition: height .2s;
            }
            .`+identifiers.subContainer+`{
                height: 100%;
                display: inline-flex;
                justify-content: space-between;
                position: relative;
                width: 100%;
                color: #CCC;
                background: rgba(0,0,0,0.6);
            }
            .`+identifiers.leftContainer+`, .`+identifiers.rightContainer+`{
                display: inline-flex;
            }
            .`+identifiers.buttons+`, .`+identifiers.playSpeed+`, .`+identifiers.playSpeed+` ul{
                border: none;
                background: none;
                cursor: pointer;
                outline: 0;
                width: `+values.buttonWidth+`px;
                padding: 0;
                margin: 0;
                position: relative;
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
            .`+identifiers.timeDisplay+`, .`+identifiers.qualityLabel+`{
                padding: 0 0.7em;
            }
            .`+identifiers.playSpeed+` ul{
                position: absolute;
                bottom: `+(values.controlsHeight + values.progressContainer)+`px;
                left: 0;
                list-style: none;
                line-height: 25px;
                display: none;
                background: rgba(0,0,0,0.6);
            }
            .`+identifiers.playSpeed+` li:hover{
                background: rgba(60,60,60,0.8);
            }
            .`+identifiers.playSpeed+` span{
                display: block;
            }
            .`+identifiers.playSpeed+` span:hover{
                color: white;
            }
            .`+identifiers.progressContainer+`{
                position: absolute;
                width: 100%;
                top: -`+values.progressContainer+`px;
                height: `+values.progressContainer+`px;
                cursor: pointer;
            }
            .`+identifiers.progressContainer+`:hover .`+identifiers.progressBar+`{
                bottom: -`+(values.progressContainer - (values.progressHeight * 2))+`px;
            }
            .`+identifiers.progressContainer+`:hover .`+identifiers.progressBar+` *:not(.`+identifiers.previewTime+`), .`+identifiers.progressContainer+`:hover .`+identifiers.progressBar+`::before{
                height: `+(values.progressHeight * 2)+`px;
            }
            .`+identifiers.progressContainer+`:hover .`+identifiers.previewTime+`{
                display: block;
            }
            .`+identifiers.progressBar+`{
                position: relative;
                height: `+values.progressHeight+`px;
                bottom: -`+(values.progressContainer - values.progressHeight)+`px;
            }
            .`+identifiers.currProgress+`, .`+identifiers.currBuffer+`, .`+identifiers.progressBar+`::before{
                height: 100%;
                position: absolute;
                width: 100%;
                left: 0;
                top: 0;
                -webkit-transition: transform .5s;
                transition: transform .5s;
                transform-origin: 0% 50%;
                transform: scaleX(0);
            }
            .`+identifiers.currProgress+`{
                background: red;
            }
            .`+identifiers.currBuffer+`{
                background: rgba(150,150,150,0.8);
            }
            .`+identifiers.progressBar+`::before{
                content: '';
                background: rgba(90,90,90,0.5);
                transform: scaleX(1);
            }
            .`+identifiers.previewTime+`{
                position: absolute;
                background: rgba(80,80,80,0.7);
                height: 12px;
                padding: 0.4em;
                line-height: 12px;
                top: -20px;
                display: none;
            }
            .`+identifiers.loading+`{
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: `+values.loadingSize+`px;
                height: `+values.loadingSize+`px;
                border-radius: 50%;
            }
            .`+identifiers.loading+` .circular{
              animation: rotate 2s linear infinite;
              height: 100%;
              transform-origin: center center;
              width: 100%;
              margin: auto;
            }
            .`+identifiers.loading+` .path{
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
              animation: dash 1.5s ease-in-out infinite;
              stroke-linecap: round;
              stroke: rgba(150,150,150,.5);
            }
            @keyframes rotate {
              100% {
                transform: rotate(360deg);
              }
            }
            @keyframes dash {
              0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
              }
              50% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -35px;
              }
              100% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -124px;
              }
            }
        `;

        var style = document.createElement("STYLE");
        style.id = identifiers.style;
        style.innerHTML = css;
        return style;
    }
    function removeListeners(){
        video.removeEventListener("ended", videoEndedListener);
        video.removeEventListener("volumechange", videoVolumeListener);
        video.removeEventListener("play", videoPlayListener);
        video.removeEventListener("pause", videoPauseListener);
        video.removeEventListener("timeupdate", videoTimeListener);
        video.removeEventListener("loadedmetadata", videoMetadataListener);
        video.removeEventListener("webkitfullscreenchange", videoFullscreenListener);
        video.removeEventListener("ratechange", videoRateListener);
        video.removeEventListener("progress", videoProgressListener);
        video.removeEventListener("waiting", videoWaitListener);
        video.removeEventListener("playing", videoPlayingListener);
        video.removeEventListener("mouseleave", videoMouseLeaveListener);
        video.removeEventListener("mouseenter", videoMouseEnterListener);
        video.removeEventListener("mousemove", videoMouseMoveListener);
    }
    function displayLoading(){
        var loading = container.querySelector("." + identifiers.loading);
        if(loading == null){
            loading = document.createElement("DIV");
            loading.classList.add(identifiers.loading);
            loading.innerHTML = "<svg class='circular' viewBox='25 25 50 50'><circle class='path' stroke='#000' cx='50' cy='50' r='20' fill='none' stroke-width='2' stroke-miterlimit='10'/></svg>";
            loading.style.display = "none";
            container.appendChild(loading);
        }else if(loading.style.display == "none"){
            loading.style.display = "block";
        }
    }
    function showControls(status){
        video.style.cursor = (status) ? "" : "none";
        container.style.height = (status) ? "" : "0px";

        if(status && !video.paused && idleInterval == null){
            idleInterval = startIdler();
        }

        if(!status){
            clearInterval(idleInterval);
            values.idler = 0;
            idleInterval = null;
        }
    }
    function isControls(){
        return (container.style.height == "0px") ? false : true;
    }
    function insideBoundary(e){
        var boundary = {
            L: video.getBoundingClientRect().left,
            R: video.getBoundingClientRect().right,
            T: video.getBoundingClientRect().top,
            B: video.getBoundingClientRect().bottom
        };
        var mouse = {X: e.pageX, Y: e.pageY};

        if(mouse.X > boundary.L && mouse.X < boundary.R && mouse.Y > boundary.T && mouse.Y < boundary.B){
            return true;
        }else{
            return false;
        }
    }
    function startIdler(){
        return setInterval(function(){
            if(isControls()){
                if(values.idler == 1){
                    showControls(0);
                }else{
                    values.idler++;
                }
            }
        }, 1500);
    }

    /*** Controls UI ***/
    function createSvgButton(){
        var btn = document.createElement("BUTTON");
        btn.classList.add(identifiers.buttons);
        btn.innerHTML = '<svg viewBox="0 0 36 36" width="36" height="36"><path fill="#CCC"/></svg>';
        return btn;
    }

    // Progress Bar
    function createProgressBar(){
        var container = document.createElement("DIV");
        container.classList.add(identifiers.progressContainer);

        var bar = document.createElement("DIV");
        bar.classList.add(identifiers.progressBar);

        var timeLabel = document.createElement("DIV");
        timeLabel.classList.add(identifiers.previewTime);

        var currProgress = document.createElement("DIV");
        currProgress.classList.add(identifiers.currProgress);

        var currBuffered= document.createElement("DIV");
        currBuffered.classList.add(identifiers.currBuffer);

        var draggingTimeBar = false;
        var wasPlaying = false;
        container.addEventListener("mousemove", function(e){
            var offset = relativeMouseX(e, bar);
            showTimestamp(offset);
        });
        container.addEventListener("mousedown", function(e){
            if(!video.paused){
                video.pause();
                wasPlaying = true;
            }
            draggingTimeBar = true;
            currProgress.style.transition = "transform 0s";
            timeLabel.style.display = "block";
            moveHandle(e);
        });
        document.addEventListener("mousemove", function(e){
            if(draggingTimeBar) moveHandle(e);
        });
        document.addEventListener("mouseup", function(e){
            if(draggingTimeBar){
                draggingTimeBar = false;
                timeLabel.style.display = "";
                currProgress.style.transition = "";
                seekVideo(e);

                if(wasPlaying){
                    video.play();
                    wasPlaying = false;
                }
            }
        });

        bar.appendChild(currBuffered);
        bar.appendChild(currProgress);
        container.appendChild(bar);
        container.appendChild(timeLabel);
        return container;

        function moveHandle(e){
            var offset = relativeMouseX(e, bar);
            showTimestamp(offset);

            var percentage = getPercentage(offset);
            currProgress.style.transform = "scaleX("+percentage+")";
        }
        function seekVideo(e){
            var scale = currProgress.style.transform;
            var percentage = scale.substring(scale.indexOf("(")+1, scale.indexOf(")"));
            video.currentTime = percentage * video.duration;
        }
    }
    function showTimestamp(offset){
        var percentage = getPercentage(offset);
        var time = video.duration * percentage;

        var label = progressBar.querySelector("." + identifiers.previewTime);
        label.innerHTML = normalizeTime(time);
        label.style.left = (offset-label.offsetWidth/2) + "px";
    }
    function getPercentage(offset){
        var bar = progressBar.querySelector("." + identifiers.progressBar);
        var max = bar.getBoundingClientRect().right - bar.getBoundingClientRect().left;
        var percentage = offset / max;
        return percentage;
    }
    function relativeMouseX(e, bar){
        var progressBarL = bar.getBoundingClientRect().left;
        var progressBarR = bar.getBoundingClientRect().right;
        var mouseX = e.pageX;

        var max = progressBarR - progressBarL;
        var relX = mouseX - progressBarL;
        if(relX >= max){
            relX = max;
        }else if(relX <= 0){
            relX = 0;
        }

        return relX;
    }
    function getScaleByTime(time){
        var percentage = time / video.duration;
        return percentage;
    }
    function getBufferRangeIndex(){
        var buffers = video.buffered;
        var index = 0;
        for(var i = 0; i < buffers.length; i++){
            var bufferEnd = buffers.end(i);
            var lastBuffer = buffers.end(index);
            if(bufferEnd > video.currentTime){
                if(lastBuffer <= video.currentTime || (lastBuffer > video.currentTime && bufferEnd < lastBuffer)){
                    index = i;
                }
            }
        }
        return index;
    }
    function updateCurrentBuffer(){
        if(video.buffered.length > 0){
            var bufferId = getBufferRangeIndex();
            var currBuff = video.buffered.end(bufferId);
            var currBuffered = progressBar.querySelector("." + identifiers.currBuffer);
            currBuffered.style.transform = "scaleX("+getScaleByTime(currBuff)+")";
        }
    }
    function updateCurrentProgress(){
        var currTime = video.currentTime;
        var currProgress = progressBar.querySelector("." + identifiers.currProgress);
        currProgress.style.transform = "scaleX("+getScaleByTime(currTime)+")";
    }

    // Playback Speed Button
    function createPlaySpeedButton(){
        var container = document.createElement("DIV");
        container.classList.add(identifiers.playSpeed);

        var currRate = document.createElement("SPAN");
        currRate.innerHTML = video.playbackRate + "x";
        container.appendChild(currRate);

        var playbackOptions = document.createElement("UL");
        for(var i = 0; i < values.playbackRates.length; i++){
            var option = document.createElement("LI");
            option.innerHTML = values.playbackRates[i];
            playbackOptions.appendChild(option);
        }
        container.appendChild(playbackOptions);

        currRate.addEventListener("click", function(){
            toggleDisplay(playbackOptions);
        });

        playbackOptions.addEventListener("click", function(e){
            var target = e.srcElement;
            video.playbackRate = target.innerHTML;
            toggleDisplay(playbackOptions);
        });

        return container;
    }
    function toggleDisplay(elem){
        var display = elem.style.display;
        elem.style.display = (display == "block") ? "none" : "block";
    }

    // Quality Button
    function createQualityLabel(){
        var container = document.createElement("DIV");
        container.classList.add(identifiers.qualityLabel);
        container.appendChild(getQuality());

        return container;
    }
    function getQuality(){
        var text = document.createElement("SPAN");
        text.innerHTML = video.videoHeight + "p";
        return text;
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
            if(dragging){
                dragging = false;
            }
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
    function updateVolumeButton(){
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
