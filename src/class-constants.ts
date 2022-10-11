export const classes = {
    // videoClass: 'browserscreen_VideoIDClass',
    fullscreenClass: 'browserscreen_FullscreenVideoClass',
    styleID: 'browserscreen_VideoStyleID',
    // controlsID: 'browserscreen_VideoControlsID',
    overlayClass: 'browserscreen_OverlayClass',
    existingControlsClass: 'browserscreen_existingPlyr',
};

export const plyr = {
    main: `.plyr:not(.${classes.existingControlsClass})`,
    controls: `.plyr__controls:not(.${classes.existingControlsClass})`,
    wrapper: `.plyr__video_wrapper:not(.${classes.existingControlsClass})`,
};