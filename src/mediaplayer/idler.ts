import { EventHandler } from './event-handler';
import { Utils } from './utils';

export interface IdlerCallback {
    onIdle: () => void;
    onMove: () => void;
    prevent?: () => boolean;
}

export class Idler {

    private documentEvents: EventHandler;
    private idleTime: number;
    private idleInterval: number;

    public constructor(private callback: IdlerCallback) {

        // Setup Idler to hide controls after 5 seconds of inactivity
        // idler = 0 -> starts idler
        // idler = -1 -> stops idler
        this.startIdler();
        
        // Listen to Click and KeyUp because pause can be removed from a click or space press
        // Note: KeyPress does not get called on space press
        // Set idler directly to 5 on mouse leave to have a consistent showControls call
        this.documentEvents = new EventHandler(document);
        this.documentEvents.addEvent(["click", "keyup", "mousemove", "mouseenter"], () => this.resetIdler());
        this.documentEvents.addEvent("mouseleave", () => this.idleTime = 5);
    }

    private stopIdler(): void {
        this.idleTime = -1;
    }

    private startIdler(): void {
        this.idleTime = 0;

        // This should only be called from constructor
        if(this.idleInterval == undefined){
            this.idleInterval = setInterval(this.checkIdle.bind(this), 1000);
            Utils.logger("Creating new idle timer");
        }
    }

    private resetIdler(): void {
        if(this.idleInterval == undefined) return;

        // We have to start idler here manually because
        // it also has to be called even if controls are already shown
        // this.startIdler();
        this.idleTime = 0;

        this.callback.onMove();
    }

    private checkIdle(): void {
        if(this.idleTime >= 0){

            // Pause idle timer if video is paused
            // otherwise controls will hide instantly after play
            if(this.callback.prevent && this.callback.prevent()) {
                this.stopIdler();
                Utils.logger("Stopping idler");
            }

            // Limit idler value to 5(seconds)
            if(this.idleTime < 5){
                this.idleTime += 1;
                Utils.logger(`Increased Idler: ${this.idleTime}`);
            }

            else if(this.idleTime >= 5){
                this.callback.onIdle();
                this.stopIdler();
            }
        }
    }

    public destroy() {
        this.documentEvents.removeAll();
        this.destroyIdler();
    }

    private destroyIdler(): void {
        clearInterval(this.idleInterval);
        this.idleInterval = undefined;
        Utils.logger("Destroying Idler");
    }

}