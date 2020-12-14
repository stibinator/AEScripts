/* @target aftereffects */
/* global app */
var IN = true;
var OUT = false;

function alignSource(theLayer, theTime, inOrOut) {
    if (inOrOut === IN) {
        theLayer.startTime = theTime;
    } else {
        theLayer.startTime = theTime - theLayer.source.duration;
    }
}
var lyrs = app.project.activeItem.selectedLayers;
for (var i = 0; i < lyrs.length; i++) {
    alignSource(lyrs[i], app.project.activeItem.time, OUT);
}