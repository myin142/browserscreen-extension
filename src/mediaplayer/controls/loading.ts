import { Container } from "./container";
import { Listener } from "../event-handler";
import { identifiers } from "../constants";

export class Loading extends Container implements Listener {
    static get loadingSize(){ return 90; }
    constructor(){
        super(identifiers.loading);
        this.innerHTML = "<svg class='circular' viewBox='25 25 50 50'><circle class='path' cx='50' cy='50' r='20' fill='none' stroke-width='3' stroke-miterlimit='10'/></svg>";
        this.toggle(false);
    }
    toggle(show: boolean){
        this.node.style.display = (show) ? "block" : "none";
    }

    update(event: Event){
        this.toggle(event.type == "waiting");
    }
}