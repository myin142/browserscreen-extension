import { Container } from "./container";
import { Listener } from "../event-handler";
import { identifiers } from "../constants";

export class Loading extends Container implements Listener {

    public static get loadingSize(): number { return 90; }

    public constructor(){
        super(identifiers.loading);
        this.innerHTML = "<svg class='circular' viewBox='25 25 50 50'><circle class='path' cx='50' cy='50' r='20' fill='none' stroke-width='3' stroke-miterlimit='10'/></svg>";
        this.toggle(false);
    }

    private toggle(show: boolean): void {
        this.node.style.display = (show) ? "block" : "none";
    }

    public update(event: Event): void {
        this.toggle(event.type == "waiting");
    }
}