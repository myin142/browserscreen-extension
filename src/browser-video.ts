import * as Plyr from 'plyr';
import { classes, plyr } from './class-constants';
import { Utils } from './utils';

export class BrowserVideo {

    public get found(): boolean {
        return this.video !== null;
    }

    public get container(): Element {
        return document.querySelector(plyr.main);
    }

    public get controls(): Element {
        return document.querySelector(plyr.controls);
    }

    private plyr;

    public constructor(public video: HTMLVideoElement) {
        if (video === null) { return; }

        this.markExistingPlyrControls();
        this.createControls();
        this.preventParentClick();
    }

    private markExistingPlyrControls(): void {
        const plyrClasses = [
            'plyr',
            'plyr__poster',
            'plyr__controls',
            'plyr__captions',
            'plyr__video-wrapper',
        ];

        plyrClasses.map(cls => document.querySelector(`.${cls}`))
            .filter(elem => elem !== null)
            .forEach(elem => {
                elem.classList.add(classes.existingControlsClass);
            });
    }

    private createControls(): void {
        this.plyr = new Plyr(this.video, {
            debug: true,
            clickToPlay: false,
        });
    }

    private preventParentClick(): void {
        this.controls.addEventListener('click', e => {
            e.stopPropagation();
        });
    }

    public restore() {
        this.moveVideoOutsideContainer();

        // Removing Controls ourselves
        // Plyr does not allow just deleting controls
        // Have to use custom version of plyr:
        //      Plyr.media.quality has to be configurable
        this.plyr.media.plyr = null;
        this.removePlayerContainer();

        this.removeExistingPlyrMarkers();
    }

    private moveVideoOutsideContainer(): void {
        this.container.parentNode.append(this.video);
    }

    private removeExistingPlyrMarkers(): void {
        Utils.removeAllClasses(classes.existingControlsClass);
    }

    private removePlayerContainer(): void {
        const container = this.container;
        container.parentNode.removeChild(container);
    }

}