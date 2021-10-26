// @target aftereffects
/* global app, CompItem */
// makes all locked layers shy.
// good whan you have complicated rigs
(function () {
    app.beginUndoGroup("Shy Locked Layers");
    var theComp = app.project.activeItem;
    if (theComp instanceof CompItem) {
        for (var i = 1; i <= theComp.numLayers; i++) {
            if (theComp.layer(i).locked) {
                theComp.layer(i).shy = true;
            }
        }
    }
    theComp.hideShyLayers = true;
    app.endUndoGroup();
})();
