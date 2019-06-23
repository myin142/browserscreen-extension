import { Container, Controls } from "./container";
import { Listener } from "../event-handler";
import { identifiers } from "../constants";
import { Utils } from "../utils";

export class Slider extends Container implements Controls, Listener {

    private valueFn: () => any;
    private updateValue: (x: any) => any;
    private min: number;
    private max: number;

    private realtime: boolean;
    private dragging: boolean;
    private fullsize: boolean;
    private label: string;

    private handle: Container;
    private sliderBarMain: Container;
    protected sliderBars: Container;

    private sliderL: number;
    private realWidth: number;

    private beforeDrag: () => void;
    private whileDrag: () => void;
    private afterDrag: () => void;

    public static get sliderHandleSize(): number { return 12; }
    public static get sliderBarHeight(): number { return 3; }

    private get valuePercent(): number {
        return this.valueFn() / this.max;
    }

    public constructor({ valueFn, min, max, updateValue }){
        super(identifiers.slider);

        this.valueFn = valueFn;
        this.min = min;
        this.max = max;
        this.updateValue = updateValue;
        this.realtime = true;
        this.dragging = false;
        this.fullsize = false;

        this.createSlider();
    }

    public setRealtime(value: boolean): void {
        this.realtime = value;
    }

    public setLabel(label: string): void {
        this.label = label;
    }

    public setFullsize(bool: boolean): void {
        this.fullsize = bool;
    }

    public setBeforeDrag(fn: () => void): void {
        this.beforeDrag = fn;
    }

    public setWhileDrag(fn: () => void): void {
        this.whileDrag = fn;
    }

    public setAfterDrag(fn: () => void): void {
        this.afterDrag = fn;
    }

    private createSlider(): void {
        this.handle = new Container(identifiers.sliderHandle);
        this.sliderBars = new Container(identifiers.sliderBars);
        this.sliderBarMain = new Container(identifiers.sliderBarMain);
        this.sliderBars.append(this.sliderBarMain);
        this.appendMultiple([this.sliderBars, this.handle]);

        // Add EventListener to enable dragging slider
        this.node.addEventListener("mousedown", (e) => {
            this.dragging = true;
            if(this.beforeDrag != undefined) this.beforeDrag();

            this.realtimeUpdate(e);
        });
        document.addEventListener("mousemove", (e) => {
            if(this.dragging){
                if(this.whileDrag != undefined) this.whileDrag();

                this.realtimeUpdate(e);
            }
        });
        document.addEventListener("mouseup", (e) => {
            if(this.dragging){
                this.dragging = false;
                if(this.afterDrag != undefined) this.afterDrag();
                if(!this.realtime) this.updateValue(this.getNewValue(e));
            }
        });
    }

    private realtimeUpdate(e: MouseEvent): void {
        let newValue = this.getNewValue(e);
        if(this.realtime){
            this.updateValue(newValue);
        }else{
            let tempPercent = newValue / this.max;
            this.updateHandle(tempPercent);
        }
    }

    private getNewValue(e: MouseEvent): number {
        // Has to be called everytime, because window can be resized
        this.sliderL = this.node.getBoundingClientRect().left;
        if(!this.fullsize){
            this.sliderL += Slider.sliderHandleSize/2;
        }

        // Controls how far the drag can go inside the slider
        let max = this.realWidth;
        let relX = e.pageX - this.sliderL;
        if(relX >= max){
            relX = max;
        }else if(relX <= 0){
            relX = 0;
        }

        let percentage = relX / this.realWidth;
        return percentage * this.max;
    }

    public init(): void { // For initial position of slider elements
        this.updateNodeValues();
        this.updateHandle(this.valuePercent);
    }

    private updateNodeValues(): void {
        let sliderSize = parseInt(Utils.getComputedStyle(this.node, "width"));
        this.realWidth = sliderSize;
        if(!this.fullsize){
            this.realWidth -= Slider.sliderHandleSize;
        }
    }

    private updateHandle(percent: number): void {
        let handleOffset = (percent * this.realWidth) - ((this.fullsize) ? Slider.sliderHandleSize/2 : 0);
        this.handle.node.style.left = `${handleOffset}px`;
        this.sliderBarMain.node.style.transform = `scaleX(${percent})`;
    }

    public update(): void {
        if(!this.realtime && this.dragging) return;

        this.updateHandle(this.valuePercent);

        if(this.label != undefined){
            this.node.setAttribute("aria-label", (this.valuePercent * 100).toFixed(0) + "% " + this.label);
        }

    }
}

export class PassiveSlider extends Container implements Controls, Listener {

    private valueFn: () => any;
    private max: number;
    private min: number;

    private get valuePercent(): number {
        return this.valueFn() / this.max;
    }

    public constructor({ valueFn, min, max }, className = null){
        super(className);
        this.valueFn = valueFn;
        this.min = min;
        this.max = max;
    }

    public update(): void {
        this.node.style.transform = `scaleX(${this.valuePercent})`;
    }
}