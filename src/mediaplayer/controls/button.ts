import { Container, Controls } from "./container";
import { Listener } from "../event-handler";
import { identifiers } from "../constants";

export class Button extends Container implements Controls, Listener {

    private states: ButtonState[];
    private activeState: number;

    static get buttonWidth(){ return 46; }
    static get paths(){
        return {
            play: "M 12,26 12,10 25,18 Z",
            pause: "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z",
            replay: "M 18,11 V 7 l -5,5 5,5 v -4 c 3.3,0 6,2.7 6,6 0,3.3 -2.7,6 -6,6 -3.3,0 -6,-2.7 -6,-6 h -2 c 0,4.4 3.6,8 8,8 4.4,0 8,-3.6 8,-8 0,-4.4 -3.6,-8 -8,-8 z",

            muted: "M 21.48 17.98 C 21.48 16.21 20.46 14.69 18.98 13.95 L 18.98 16.16 L 21.43 18.61 C 21.46 18.41 21.48 18.2 21.48 17.98 Z  M 23.98 17.98 C 23.98 18.92 23.78 19.8 23.44 20.62 L 24.95 22.13 C 25.61 20.89 25.98 19.48 25.98 17.98 C 25.98 13.7 22.99 10.12 18.98 9.22 L 18.98 11.27 C 21.87 12.13 23.98 14.81 23.98 17.98 Z  M 7.98 10.24 L 12.7 14.97 L 7.98 14.97 L 7.98 20.97 L 11.98 20.97 L 16.98 25.97 L 16.98 19.24 L 21.23 23.49 C 20.56 24.01 19.81 24.42 18.98 24.67 L 18.98 26.73 C 20.36 26.42 21.61 25.78 22.67 24.92 L 24.71 26.97 L 25.98 25.7 L 16.98 16.7 L 9.26 8.98 L 7.98 10.24 Z  M 14.88 12.05 L 16.97 14.14 L 16.97 9.98 L 14.88 12.05 Z",
            volumeHigh: "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z",
            volumeLow: "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z",

            rewind: "M 18.204 20.541 L 18.204 26.317 L 12.602 22.158 L 7 18 L 12.602 13.842 L 18.204 9.683 L 18.204 15.459 L 20.383 13.842 L 25.985 9.683 L 25.985 18 L 25.985 26.317 L 20.383 22.158 L 18.204 20.541 Z",
            fastForward: "M 17.781 20.541 L 17.781 26.317 L 23.383 22.158 L 28.985 18 L 23.383 13.842 L 17.781 9.683 L 17.781 15.459 L 15.602 13.842 L 10 9.683 L 10 18 L 10 26.317 L 15.602 22.158 L 17.781 20.541 Z",

            fullscreen: "M 10 16 L 12 16 L 12 12 L 16 12 L 16 10 L 10 10 L 10 16 L 10 16 Z  M 12 20 L 10 20 L 10 26 L 16 26 L 16 24 L 12 24 L 12 20 L 12 20 Z  M 26 16 L 24 16 L 24 12 L 20 12 L 20 10 L 26 10 L 26 16 L 26 16 Z  M 24 20 L 26 20 L 26 26 L 20 26 L 20 24 L 24 24 L 24 20 L 24 20 Z",
            exitFullscreen: "M 14 14 L 10 14 L 10 16 L 16 16 L 16 10 L 14 10 L 14 14 L 14 14 Z  M 22 14 L 22 10 L 20 10 L 20 16 L 26 16 L 26 14 L 22 14 L 22 14 Z  M 20 26 L 22 26 L 22 22 L 26 22 L 26 20 L 20 20 L 20 26 L 20 26 Z  M 10 22 L 14 22 L 14 26 L 16 26 L 16 20 L 10 20 L 10 22 L 10 22 Z",

            locked: "M 15 16.356 L 21 16.356 L 21 12.17 C 21 11.91 20.93 11.65 20.8 11.41 C 20.66 11.14 20.46 10.91 20.21 10.72 C 19.58 10.24 18.8 9.98 18 10 C 17.2 9.98 16.42 10.24 15.78 10.72 C 15.32 11.06 15.03 11.6 15 12.17 L 15 16.356 Z  M 23 16.4 C 24.139 16.618 25 17.62 25 18.822 L 25 24.85 C 25 26.211 23.895 27.316 22.534 27.316 L 13.466 27.316 C 12.105 27.316 11 26.211 11 24.85 L 11 18.822 C 11 17.62 11.861 16.618 13 16.4 L 13 12.15 C 13 12.13 13 12.12 13 12.11 C 13.05 10.92 13.63 9.83 14.58 9.12 C 15.57 8.38 16.77 7.98 18 8 C 19.24 7.98 20.45 8.38 21.44 9.14 C 21.9 9.49 22.28 9.94 22.56 10.46 C 22.85 10.98 23 11.57 23 12.16 C 23 12.16 23 12.17 23 12.17 L 23 16.4 Z",
            unlocked: "M 15 16.356 L 22.534 16.356 C 23.895 16.356 25 17.461 25 18.822 L 25 24.85 C 25 26.211 23.895 27.316 22.534 27.316 L 13.466 27.316 C 12.105 27.316 11 26.211 11 24.85 L 11 18.822 C 11 17.62 11.861 16.618 13 16.4 L 13 12.15 C 13 12.13 13 12.12 13 12.11 C 13.05 10.92 13.63 9.83 14.58 9.12 C 15.57 8.38 16.77 7.98 18 8 C 19.24 7.98 20.45 8.38 21.44 9.14 C 21.9 9.49 22.28 9.94 22.56 10.46 C 22.85 10.98 23 11.57 23 12.16 C 23 12.16 23 12.17 23 12.17 L 21 12.17 C 21 11.91 20.93 11.65 20.8 11.41 C 20.66 11.14 20.46 10.91 20.21 10.72 C 19.58 10.24 18.8 9.98 18 10 C 17.2 9.98 16.42 10.24 15.78 10.72 C 15.32 11.06 15.03 11.6 15 12.17 L 15 16.356 Z",
            introSkip: "M 17 22.923 L 12 26 L 12 22.923 L 7 26 L 7 10 L 12 13.077 L 12 10 L 17 13.077 L 17 10 L 30 18 L 17 26 L 17 22.923 Z",
        }
    }
    constructor(){
        super(identifiers.buttons, "BUTTON");
        this.states = new Array();
        this.activeState = -1;

        // Create Generic Button
        this.innerHTML = '<svg viewBox="0 0 36 36" width="36" height="36"><path fill="#CCC" fill-rule="evenodd" /></svg>';
        this.node.addEventListener("click", () => {
            this.states[this.activeState].action()

            // After every action we have to update the state
            // This is needed for buttons without direct connection to events
            // Like the lock button
            this.update();
        });
    }
    addState({ name, condition, action }: ButtonState){
        this.states.push({name, condition, action});

        // While Adding State, save current active State
        if(condition()){
            this.changeState(this.states.length - 1);
        }
    }
    update(){
        this.states.forEach((item, index) =>{
            if(item.condition()){
                this.changeState(index);
            }
        });
    }
    changeState(index: number){
        this.activeState = index;
        let label = this.states[this.activeState].name;

        // Change Button Icon
        let btn = this.node;
        btn.setAttribute("aria-label", label);
        btn.querySelector("path").setAttribute("d", Button.paths[label])
    }
}

export interface ButtonState {
    name: string;
    condition: () => boolean;
    action: () => void;
}
