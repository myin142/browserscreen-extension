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
        const link = msg.subWindow;

        // Search Iframes
        const iframe = Extension.findIframeWithLink(link);
        if(iframe != null){
            resizeAndEmitIframe(iframe);
            return;
        }

        // Search Objects
        const object = Extension.findObjectWithLink(link);
        if(object != null){
            resizeAndEmitIframe(object);
            return;
        }

    }
});