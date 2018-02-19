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

function percentToframes(percent, comp) {
    comp = defaultFor(comp, app.project.activeItem);
    return (comp.duration * percent / (100 * comp.frameDuration));
}

function timeToHMSF(theTime, comp) {
    //convert theTime in seconds to h:MM:SS:FF string
    comp = defaultFor(comp, app.project.activeItem);
    if (comp) {
        var hr = 3600;
        var min = 60;
        var sec = 1;
        var hrs = Math.floor(theTime / hr);
        theTime = theTime % hr;
        var mins = Math.floor(theTime / min);
        theTime = theTime % min;
        var secs = Math.floor(theTime / sec);
        theTime = theTime % 1;
        var frames = Math.round(theTime / comp.frameDuration);
        return "" + hrs + ":" + zeroPad(2, mins) + ":" + zeroPad(2, secs) + ":" + zeroPad(2, frames);
    }
}

function framesToHMSF(frames, comp) {
    //convert time in frames to h:MM:SS:FF string
    comp = defaultFor(comp, app.project.activeItem);
    if (comp) {
        var hr = 3600 / comp.frameDuration;
        var min = 60 / comp.frameDuration;
        var sec = 1 / comp.frameDuration;
        var hrs = Math.floor(frames / hr);
        frames = frames % hr;
        var mins = Math.floor(frames / min);
        frames = frames % min;
        var secs = Math.floor(frames / sec);
        frames = Math.round(frames % sec);
        return "" + hrs + ":" + zeroPad(2, mins) + ":" + zeroPad(2, secs) + ":" + zeroPad(2, frames);
    }
    return false;
}

function percentToHMSF(percent, comp) {
    comp = defaultFor(comp, app.project.activeItem);
    if (comp) {
        return framesToHMSF(percentToframes(percent, comp), comp);
    }
    return false;
}
function zeroPad(digits, num, pad) {
    pad = defaultFor(pad, "0");
    for (var i = 0; i < digits; i++) {
        pad += "0";
    }
    return (pad + num).slice(0 - digits);
}

function parseTimeString(theString, comp) {
    comp = defaultFor(comp, app.project.activeItem);
    if (comp) {
        theString = "" + theString;
        //this took ages to work out
        //allows user to lazily enter timecode, eg to enter 1 minute you type 1.. rather than 0:1:0:0
        var hrsStr = theString.match(/(\d+)\D\d*\D\d*\D\d*$/); //matches  "0:1:2:3" and "0..." and returns '0'
        var minStr = theString.match(/(\d+)\D\d*\D\d*$/); //matches "0:1:2:3" , "1,2.3" and "1.." and returns 1
        var secStr = theString.match(/(\d+)\D\d*$/); //and so on..
        var frmStr = theString.match(/(\d+)$/);
        //return the result in seconds
        /* jshint ignore:start */
        // Code here will be ignored by JSHint.
        var hrs = hrsStr
            ? parseInt(hrsStr)
            : 0;
        var min = minStr
            ? parseInt(minStr)
            : 0;
        var sec = secStr
            ? parseInt(secStr)
            : 0;
        var frm = frmStr
            ? parseInt(frmStr)
            : 0;
        /* jshint ignore:end */
        return 3600 * hrs + 60 * min + sec + comp.frameDuration * frm;
    }
    return false;
}
