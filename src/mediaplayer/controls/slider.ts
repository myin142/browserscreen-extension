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

    static get sliderHandleSize(){ return 12; }
    static get sliderBarHeight(){ return 3; }

    get valuePercent(){
        return this.valueFn() / this.max;
    }
    constructor({ valueFn, min, max, updateValue }){
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
    setRealtime(value: boolean){
        this.realtime = value;
    }
    setLabel(label: string){
        this.label = label;
    }
    setFullsize(bool: boolean){
        this.fullsize = bool;
    }

    setBeforeDrag(fn: () => void){
        this.beforeDrag = fn;
    }
    setWhileDrag(fn: () => void){
        this.whileDrag = fn;
    }
    setAfterDrag(fn: () => void){
        this.afterDrag = fn;
    }

    createSlider(){
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
    realtimeUpdate(e: MouseEvent){
        let newValue = this.getNewValue(e);
        if(this.realtime){
            this.updateValue(newValue);
        }else{
            let tempPercent = newValue / this.max;
            this.updateHandle(tempPercent);
        }
    }
    getNewValue(e: MouseEvent){
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
    init(){ // For initial position of slider elements
        this.updateNodeValues();
        this.updateHandle(this.valuePercent);
    }
    updateNodeValues(){
        let sliderSize = parseInt(Utils.getComputedStyle(this.node, "width"));
        this.realWidth = sliderSize;
        if(!this.fullsize){
            this.realWidth -= Slider.sliderHandleSize;
        }
    }
    updateHandle(percent: number){
        let handleOffset = (percent * this.realWidth) - ((this.fullsize) ? Slider.sliderHandleSize/2 : 0);
        this.handle.node.style.left = `${handleOffset}px`;
        this.sliderBarMain.node.style.transform = `scaleX(${percent})`;
    }
    update(){
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

    get valuePercent(){
        return this.valueFn() / this.max;
    }
    constructor({ valueFn, min, max }, className = null){
        super(className);
        this.valueFn = valueFn;
        this.min = min;
        this.max = max;
    }
    update(){
        this.node.style.transform = `scaleX(${this.valuePercent})`;
    }
}