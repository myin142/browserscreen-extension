import { classes } from "./class-constants";
import { Utils } from "./utils";

export class Extension {
    /* Stylings */
    public static get mainStyle() {
        return document.querySelector(`#${classes.styleID}`);
    }

    public static createStyles(): void {
        if (this.mainStyle != null) return;

        let style = document.createElement("style");
        style.id = classes.styleID;

        let css = `
            ::-webkit-scrollbar{
                display: none;
            }
            body, html{
                overflow: hidden !important;
            }
            .${classes.fullscreenClass} {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                max-width: 100% !important;
                max-height: 100% !important;
                margin: auto;
            }
            .${classes.overlayClass} {
                z-Index: 2147483647 !important;
            }
        `;
        style.appendChild(document.createTextNode(css));

        document.querySelector("head").appendChild(style);
    }

    public static removeStyles(): void {
        let style = this.mainStyle;
        if (style != null) style.parentNode.removeChild(style);
    }

    /* Search */

    // TODO: support multiple videos
    public static findVideo(): HTMLVideoElement {
        return document.querySelector("video");
    }

    public static findIframeWithLink(link: string): Element {
        let msgSrc = Utils.getFormattedSource(link);
        let foundFrame = null;
        document.querySelectorAll("iframe").forEach((frame) => {
            let src = Utils.getFormattedSource(frame.src);
            if (src === msgSrc) {
                foundFrame = frame;
                return;
            }
        });

        return foundFrame;
    }

    public static findObjectWithLink(link: string): Element {
        let msgSrc = Utils.getFormattedSource(link);
        let foundObj = null;
        document.querySelectorAll("object").forEach((obj) => {
            let src = Utils.getFormattedSource(obj.data);
            if (src === msgSrc) {
                foundObj = obj;
                return;
            }
        });

        return foundObj;
    }

    /* Modify */

    public static overlayAllParents(elem: Element): void {
        Utils.addClassToAllParents(elem, classes.overlayClass);
    }

    public static removeOverlays(): void {
        Utils.removeAllClasses(classes.overlayClass);
    }

    public static fullscreenAllParents(elem: Element): void {
        Utils.addClassToAllParents(elem, classes.fullscreenClass);
    }

    public static removeFullscreens(): void {
        Utils.removeAllClasses(classes.fullscreenClass);
    }

    /* Emitting Messages */
    public static emitResizeOrRestore(): void {
        const message =
      this.mainStyle == null ? { resize: true } : { restore: true };
        this.sendMessage(message);
    }

    public static emitIfInsideIframe(): void {
        if (window != window.top) {
            this.sendMessage({ subWindow: window.location.href });
        }
    }

    public static emitFound(callback: () => void): void {
        this.sendMessage({ found: true }, callback);
    }

    private static sendMessage(msg: object, callback?: Function): void {
        browser.runtime.sendMessage(msg, callback);
    }
}
