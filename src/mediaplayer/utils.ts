import { MediaPlayer } from "./mediaplayer";

export class Utils{

    public static normalizeTime(time: number): string{
        // Convert Time to Minutes and Seconds
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time - hours * 3600) / 60);
        let seconds = Math.floor(time - (minutes * 60) - (hours * 3600));

        let hourStr = this.prependTime(hours);
        let minuteStr = this.prependTime(minutes);
        let secondStr = this.prependTime(seconds);
        let dateTime = ((hourStr != "00") ? hourStr + ":" : "") + minuteStr + ":" + secondStr;

        return dateTime;
    }

    private static prependTime(time: number): string {
        return `${time < 10 ? '0' : ''}${time}`;
    }

    public static logger(msg: string): void {
        if(MediaPlayer.debugging){
            console.log(msg);
        }
    }

    public static isPointer(): boolean {
        let hovers = document.querySelector(":hover");
        if(hovers == null){
            this.logger("No Hover Element");
            return false;
        }

        let innerHover: Element;
        while(hovers){
            innerHover = hovers;
            hovers = innerHover.querySelector(":hover");
        }

        let pointer = window.getComputedStyle(innerHover).cursor == "pointer";
        this.logger("Is Pointer: " + pointer);
        return pointer;
    }

    public static getComputedStyle(elem: Element, style: string): string{
        return window.getComputedStyle(elem, null).getPropertyValue(style);
    }
}