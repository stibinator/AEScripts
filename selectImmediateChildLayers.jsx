// @target aftereffects
// selects immediate children of selected layer
(function () {
    var theComp = app.project.activeItem;
    if (theComp) {
        var parentLayers = [];
        for (i = 1; i <= theComp.numLayers; i++) {
            if (theComp.layer(i).selected) {
                parentLayers.push(i);
            }
            theComp.layer(i).selected = false;
        }
        for (i = 1; i <= theComp.numLayers; i++) {
            for (p = 0; p < parentLayers.length; p++) {
                if (
                    theComp.layer(i).parent &&
                    theComp.layer(i).parent.index === parentLayers[p]
                ) {
                    theComp.layer(i).locked = false;
                    theComp.layer(i).selected = true;
                }
            }
        }
    }
})();
