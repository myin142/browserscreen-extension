import { Slider } from "./slider";
import { identifiers } from "../constants";

export class VolumeSlider extends Slider {
    static get volSliderWidth(){ return 52; }
    constructor(video: HTMLVideoElement){
        let values = {
            valueFn: () => video.volume,
            min: 0,
            max: 1,
            updateValue: (newValue) => video.volume = newValue
        };
        super(values);

        this.setWhileDrag(() => {
            if(video.volume > 0) video.muted = false;
            if(video.volume == 0) video.muted = true;
        });
        this.setAfterDrag(() => {
            if(video.volume > 0) video.muted = false;
            if(video.volume == 0) video.muted = true;
        });
        this.setLabel("Volume");
        this.addClass(identifiers.volSlider);
    }
}