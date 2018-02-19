//@target aftereffects
/* jshint ignore:start */
// Code here will be ignored by JSHint.
#include "defaultFor.jsx"
/* jshint ignore:end */

function time2Frames(time, comp) {
    comp = defaultFor(comp, app.project.activeItem);
    return time / comp.frameDuration;
}

function frames2Time(frame, comp) {
    comp = defaultFor(comp, app.project.activeItem);
    return frame * comp.frameDuration;
}

function percentToframes(percent, comp){
    comp = defaultFor(comp, app.project.activeItem);
    return(comp.duration * percent/(100*comp.frameDuration) );
}

function framesToHMSF(frames, comp){
    var hr = 3600/comp.frameDuration;
    var min = 60/comp.frameDuration;
    var sec = 1/comp.frameDuration;
    var hrs = Math.floor(frames/hr);
    frames = frames % hr;
    var mins = Math.floor(frames/min);
    frames = frames % min;
    var secs = Math.floor(frames/sec);
    frames = Math.round(frames % sec);
    return "" + hrs + ":" + zeroPad(2, mins) + ":" + zeroPad(2, secs) + ":" + zeroPad(2, frames);
}

function percentToHMSF (percent, comp){
    return framesToHMSF(percentToframes(percent, comp), comp);
}
function zeroPad(digits, num){
    pad="0";
    for (var i = 0; i < digits; i++) {
        pad += "0";
    }
    return(pad + num).slice(0-digits);
}
