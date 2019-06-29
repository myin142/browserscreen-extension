import { BrowserVideo } from './browser-video';
import { Extension } from './extension';
import { classes } from './class-constants';

declare global {
    interface Window {
        browser: any;
        msBrowser: any;
        chrome: any;
    }
}

// Cross Browser Support
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome
})();

// Format Link to prevent mistakes with http/https
function getFormattedSource(src: string): string {
    return src.replace(/^https?\:\/\//i, "").replace(/^http?\:\/\//i, "");
}

// Search for Link in IFRAMEs
function searchIFrames(link: string): HTMLIFrameElement {
    var iframes = document.querySelectorAll("iframe");
    for(var i = 0; i < iframes.length; i++){
        var elemSrc = getFormattedSource(iframes[i].src);
        var msgSrc = getFormattedSource(link);

        if(elemSrc == msgSrc)
            return iframes[i];
    }
}

// Search for Link in OBJECTs
function searchObjects(link: string): HTMLObjectElement {
    var objects = document.querySelectorAll("object");
    for(var i = 0; i < objects.length; i++){
        var elemSrc = getFormattedSource(objects[i].data);
        var msgSrc = getFormattedSource(link);

        if(elemSrc == msgSrc)
            return objects[i];
    }
}

function resizeAndEmitIframe(elem: Element): void {
    Extension.overlayAllParents(elem);
    Extension.fullscreenAllParents(elem);
    Extension.createStyles();
    Extension.emitIfInsideIframe();
}

function restoreWindow(): void {
    Extension.removeOverlays();
    Extension.removeFullscreens();
    Extension.removeStyles();
}

let video: BrowserVideo = null;

browser.runtime.onMessage.addListener((msg) => {

    // Check if resize or restore
    if (msg.start && window == window.top) {
        Extension.emitResizeOrRestore();
    }

    // Resize Video
    else if (msg.resize) {

        const videoElem = Extension.findVideo();
        video = new BrowserVideo(videoElem);

        if (video.found) {
            Extension.emitFound(() => {
                resizeAndEmitIframe(video.container);
                video.video.classList.add(classes.fullscreenClass);
            });
        }
    }

    // Restore Video
    else if (msg.restore) {
        if(video.found) video.restore();
        restoreWindow();
    }

    // On Message from an IFRAME/OBJECT
    else if(msg.subWindow){
        var link = msg.subWindow;

        // Search Iframes
        var iframe = searchIFrames(link);
        if(iframe != null){
            resizeAndEmitIframe(iframe);
            return;
        }

        // Search Objects
        var object = searchObjects(link);
        if(object != null){
            resizeAndEmitIframe(object);
            return;
        }

    }
});