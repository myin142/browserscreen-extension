import { Container, Controls } from "./container";
import { Listener } from "../event-handler";

export class Label extends Container implements Controls, Listener {

    private updateFn: () => string;

    public constructor(className: string, updateFn: () => string){
        super(className);
        this.updateFn = updateFn;
        this.update();
    }

    public update(): void {
        this.innerHTML = this.updateFn();
    }
}