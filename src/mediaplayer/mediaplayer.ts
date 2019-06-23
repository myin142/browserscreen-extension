import { EventHandler } from './event-handler';
import { Container } from "./controls/container";
import { identifiers } from './constants';
import { VolumeSlider } from './controls/volume-slider';
import { ProgressBar } from './controls/progress-bar';
import { Loading } from './controls/loading';
import { Utils } from './utils';
import { ButtonState, Button } from './controls/button';
import { Label } from './controls/label';
import { Dropdown } from './controls/dropdown';
import { Slider } from './controls/slider';

export class MediaPlayer extends Container {

    private video: HTMLVideoElement;
    private documentEvents: EventHandler;
    private videoEvents: EventHandler;

    private idler: number;
    private idleTimer: number;
    private showing: boolean;

    private savedVolume: number;

    static get rewindAmount(){ return 10; }
    static get introSkipAmount(){ return 90; }
    static get debugging(){ return true; }
    static get controlsHeight(){ return 36; }

    constructor(video: HTMLVideoElement){
        super(identifiers.container);

        this.video = video;

        // Setup Idler to hide controls after 5 seconds of inactivity
        // idler = 0 -> starts idler
        // idler = -1 -> stops idler
        // Idler has to be setup before lock button is created
        this.startIdler();
        
        // Listen to Click and KeyUp because pause can be removed from a click or space press
        // Note: KeyPress does not get called on space press
        // Set idler directly to 5 on mouse leave to have a consistent showControls call
        this.documentEvents = new EventHandler(document);
        this.documentEvents.addEvents(["click", "keyup", "mousemove"], this.resetIdler.bind(this));
        this.documentEvents.addSingleEventListener("mouseleave", () => this.idler = 5);
        this.documentEvents.addSingleEventListener("mouseenter", this.resetIdler.bind(this));

        // Create Container Layout
        let leftContainer = new Container(identifiers.leftContainer);
        let rightContainer = new Container(identifiers.rightContainer);
        let subContainer = new Container(identifiers.subContainer);

        document.body.appendChild(this.node);
        document.head.appendChild(this.createStyle());

        // Create Controls
        let playBtn = this.createPlayButton();
        let volumeBtn = this.createVolumeButton();
        let forwardBtn = this.createForwardButton();
        let rewindBtn = this.createRewindButton();
        let fullscreenBtn = this.createFullscreenButton();
        let lockBtn = this.createLockButton();
        let introSkipBtn = this.createIntroSkipButton();
        let volumeSlider = new VolumeSlider(video);
        let progressBar = new ProgressBar(video);

        let timeLabel = this.createTimeLabel();
        let qualityLabel = this.createQualityLabel();
        let playrateMenu = this.createPlayRateDropdown();
        let loadingIcon = new Loading();

        // Add Controls to Containers
        leftContainer.appendMultiple([rewindBtn, playBtn, forwardBtn, volumeBtn, volumeSlider, timeLabel]);
        rightContainer.appendMultiple([qualityLabel, playrateMenu, fullscreenBtn, lockBtn, introSkipBtn]);
        subContainer.appendMultiple([progressBar, leftContainer, rightContainer]);
        this.appendMultiple([subContainer, loadingIcon]);

        [volumeSlider, progressBar].forEach((item) => {
            item.init();
        });

        // Add Event Listener to Video
        this.videoEvents = new EventHandler(video);
        this.videoEvents.addEvents(["play", "pause", "ended"], [playBtn]);
        this.videoEvents.addEventWithListeners("volumechange", [volumeBtn, volumeSlider]);
        this.videoEvents.addEventWithListeners("webkitfullscreenchange", [fullscreenBtn]);
        this.videoEvents.addEventWithListeners("timeupdate", [progressBar, timeLabel]);
        this.videoEvents.addEventWithListeners("progress", [progressBar.bufferProgress]);
        this.videoEvents.addEventWithListeners("loadedmetadata", [qualityLabel]);
        this.videoEvents.addEventWithListeners("ratechange", [playrateMenu.currentLabel]);
        this.videoEvents.addEvents(["waiting", "playing"], [loadingIcon]);
    }

    destroyIdler(){
        clearInterval(this.idleTimer);
        this.idleTimer = undefined;
        Utils.logger("Destroying Idler");
    }
    stopIdler(){
        this.idler = -1;
    }
    startIdler(){
        this.idler = 0;

        // This should only be called from constructor
        if(this.idleTimer == undefined){
            this.idleTimer = setInterval(this.checkIdle.bind(this), 1000);
            this.showing = true;
            Utils.logger("Creating new idle timer");
        }
    }
    resetIdler(){
        if(this.idleTimer == undefined) return;

        // We have to start idler here manually because
        // it also has to be called even if controls are already shown
        this.startIdler();

        this.showControls(true);
    }
    checkIdle(){
        if(this.idler >= 0){

            // Pause idle timer if video is paused
            // otherwise controls will hide instantly after play
            if(this.video.paused || Utils.isPointer()){
                this.stopIdler();
                Utils.logger("Stopping idler");
            }

            // Limit idler value to 5(seconds)
            else if(this.idler < 5){
                this.idler += 1;
                Utils.logger(`Increased Idler: ${this.idler}`);
            }

            if(this.idler >= 5){
                this.showControls(false);
            }
        }
    }
    showControls(show: boolean){

        // Do not do anything if the status is the same
        if(this.showing == show) return;

        if(show){
            this.startIdler();
            this.node.style.marginBottom = "";

            Utils.logger("Show Controls");
        }else{
            this.stopIdler();
            this.node.style.marginBottom = `-${MediaPlayer.controlsHeight}px`;

            // Hide Playrate Dropdown if it is visible
            let playrate = this.node.querySelector(`.${identifiers.playSpeed}`);
            if(playrate.querySelector("ul").style.display == "block"){
                playrate.querySelector("div").click();
            }

            Utils.logger("Hide Controls");
        }
        
        this.showing = show;
    }
    removeControls(){
        // Remove Controls Container
        this.node.parentNode.removeChild(this.node);

        // Remove Controls Style
        let style = document.querySelector("#" + identifiers.style);
        if(style != null) style.parentNode.removeChild(style);

        // Remove all custom settings from Video and Document
        this.videoEvents.removeAll();
        this.documentEvents.removeAll();
        this.destroyIdler();
    }

    createIntroSkipButton(){
        return this.createButton([
            {name: "introSkip", condition: () => true, action: () => this.video.currentTime += MediaPlayer.introSkipAmount}
        ]);
    }
    createLockButton(){
        let updateEvent = new Event('update');

        return this.createButton([
            {name: "unlocked", condition: () => this.idleTimer != undefined, action: () => this.destroyIdler()},
            {name: "locked", condition: () => this.idleTimer == undefined, action: () => this.startIdler()},
        ]);
    }
    createFullscreenButton(){
        return this.createButton([
            {name: "fullscreen", condition: () => document.fullscreenElement == null, action: () => this.video.requestFullscreen()},
            {name: "exitFullscreen", condition: () => document.fullscreenElement == this.video, action: () => document.exitFullscreen()}
        ]);
    }
    createRewindButton(){
        return this.createButton([
            {name: "rewind", condition: () => true, action: () => this.video.currentTime -= MediaPlayer.rewindAmount}
        ]);
    }
    createForwardButton(){
        return this.createButton([
            {name: "fastForward", condition: () => true, action: () => this.video.currentTime += MediaPlayer.rewindAmount}
        ]);
    }
    createVolumeButton(){
        let mute = function(){
            this.video.muted = true
            this.savedVolume = this.video.volume;
            this.video.volume = 0;
        }
        return this.createButton([
            {name: "muted", condition: () => this.video.muted || this.video.volume == 0, action: () => {
                this.video.muted = false;
                if(this.savedVolume != null){
                    this.video.volume = this.savedVolume;
                    this.savedVolume = null;
                }
                if(this.video.volume == 0) this.video.volume = 1;
            }},
            {name: "volumeHigh", condition: () => !this.video.muted && this.video.volume >= .5, action: mute.bind(this)},
            {name: "volumeLow", condition: () => !this.video.muted && this.video.volume < .5, action: mute.bind(this)}
        ]);
    }
    createPlayButton(){
        return this.createButton([
            {name: "play", condition: () => this.video.paused, action: () => this.video.play()},
            {name: "pause", condition: () => !this.video.paused, action: () => this.video.pause()},
            {name: "replay", condition: () => this.video.ended, action: () => this.video.play()}
        ]);
    }
    createButton(states: ButtonState[]){
        let btn = new Button();
        states.forEach((item) => {
            btn.addState(item);
        });
        return btn;
    }

    createTimeLabel(){
        return new Label(identifiers.timeDisplay, () => {
            return `${Utils.normalizeTime(this.video.currentTime)} / ${Utils.normalizeTime(this.video.duration)}`
        });
    }
    createQualityLabel(){
        return new Label(identifiers.qualityLabel, () => {
            return `${this.video.videoHeight}p`;
        });
    }
    createPlayRateDropdown(){
        return new Dropdown(identifiers.playSpeed, [
                0.5,
                1,
                1.5,
                2,
                4,
            ],
            () => this.video.playbackRate,
            (value) => this.video.playbackRate = value,
            item => `${item}x`,
        );
    }

    createStyle(){
        let css = `
            video::-webkit-media-controls-enclosure{
                display: none !important;
            }

            /* Container Styles */
            .${identifiers.container}{
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
                line-height: ${MediaPlayer.controlsHeight}px;
                height: ${MediaPlayer.controlsHeight}px;
                transition: margin .2s;
            }
            .${identifiers.subContainer}{
                height: 100%;
                display: inline-flex;
                justify-content: space-between;
                position: relative;
                width: 100%;
                color: #CCC;
                background: rgba(0,0,0,0.6);
            }
            .${identifiers.leftContainer}, .${identifiers.rightContainer}{
                display: inline-flex;
            }

            /* Button Styles */
            .${identifiers.buttons}, .${identifiers.playSpeed}, .${identifiers.playSpeed} ul{
                border: none !important;
                background: none !important;
                cursor: pointer;
                outline: 0;
                width: ${Button.buttonWidth}px;
                padding: 0 !important;
                margin: 0;
                position: relative;
            }
            .${identifiers.buttons}:hover path{
                fill: white;
            }
            .${identifiers.timeDisplay}, .${identifiers.qualityLabel}{
                padding: 0 0.7em;
                max-width: 200px;
            }
            .${identifiers.playSpeed} ul{
                position: absolute;
                bottom: ${(MediaPlayer.controlsHeight + ProgressBar.progressContainer)}px;
                left: 0;
                list-style: none;
                line-height: 25px;
                display: none;
                background: rgba(0,0,0,0.6) !important;
            }
            .${identifiers.playSpeed} li:hover{
                background: rgba(60,60,60,0.8);
            }
            .${identifiers.previewTime}{
                position: absolute;
                background: rgba(80,80,80,0.7);
                height: 12px;
                padding: 0.4em;
                line-height: 12px;
                top: -20px;
                display: none;
            }

            /* Slider Styles */
            .${identifiers.progressSlider}{
                position: absolute !important;
                top: -${(Slider.sliderBarHeight + ProgressBar.progressContainer) / 2}px;
                left: 0;
                right: 0;
                height: ${ProgressBar.progressContainer}px !important;
            }
            .${identifiers.progressSlider}:hover{
                position: absolute !important;
                top: -${(Slider.sliderBarHeight + ProgressBar.progressContainer) / 2}px;
                left: 0;
                right: 0;
                height: ${ProgressBar.progressContainer}px !important;
            }
            .${identifiers.progressSlider} .${identifiers.sliderHandle}{
                transform: scale(0);
                background: red;
            }
            .${identifiers.progressSlider}:hover .${identifiers.sliderHandle}, .${identifiers.progressSlider}:focus .${identifiers.sliderHandle}{
                transform: scale(1);
            }
            .${identifiers.volSlider} .${identifiers.sliderBarMain}{
                background: white;
            }
            .${identifiers.volSlider}{
                width: ${VolumeSlider.volSliderWidth}px;
            }
            .${identifiers.slider}{
                display: inline-block;
                position: relative;
                height: 100%;
                cursor: pointer;
            }
            .${identifiers.slider}::after{
                content: '';
                display: block;
                background: rgba(255,255,255,0.2);
            }
            .${identifiers.sliderBars}, .${identifiers.slider}::after{
                position: absolute;
                height: ${Slider.sliderBarHeight}px;
                margin-top: -${Slider.sliderBarHeight - 1}px;
                width: 100%;
                top: 50%;
            }
            .${identifiers.sliderHandle}{
                position: absolute;
                top: 50%;
                width: ${Slider.sliderHandleSize}px;
                height: ${Slider.sliderHandleSize}px;
                border-radius: ${Slider.sliderHandleSize / 2}px;
                margin-top: -${Slider.sliderHandleSize / 2}px;
                background: white;
                transform-origin: 50% 50%;
                transition: transform 0.1s ease-out;
            }
            .${identifiers.sliderBarMain}, .${identifiers.sliderBarBuffer}{
                height: 100%;
                position: absolute;
                width: 100%;
                left: 0;
                top: 0;
                transform-origin: 0% 50%;
                transform: scaleX(0);
            }
            .${identifiers.sliderBarMain}{
                background: red;
            }
            .${identifiers.sliderBarBuffer}{
                background: rgba(150,150,150,0.8);
                z-index: -1;
            }

            /* Loading Styles */
            .${identifiers.loading}{
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${Loading.loadingSize}px;
                height: ${Loading.loadingSize}px;
                border-radius: 50%;
            }
            .${identifiers.loading} .circular{
              animation: rotate 2s linear infinite;
              height: 100%;
              transform-origin: center center;
              width: 100%;
              margin: auto;
            }
            .${identifiers.loading} .path{
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
              animation: dash 1.5s ease-in-out infinite;
              stroke-linecap: round;
              stroke: rgba(180,180,180,1);
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

        // Create Style and return
        let style = document.createElement("STYLE");
        style.id = identifiers.style;
        style.innerHTML = css;
        return style;
    }
}
