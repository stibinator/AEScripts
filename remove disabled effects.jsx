// @target aftereffects
(function () {
    if (app.project.activeItem) {
        var theLayers = [];
        theLayers = app.project.activeItem.selectedLayers;
        if (theLayers.length === 0) {
            allTheLayers = app.project.activeItem.layers;
            for (l = 0; l < allTheLayers.length; l++) {
                theLayers[l] = allTheLayers[l + 1];
            }
        }
    }
    app.beginUndoGroup("Remove Disabled Effects");
    var removedCount = 0;
    for (var i = 0; i < theLayers.length; i++) {
        var theEffx = app.project.activeItem.layer(theLayers[i].index)(
            "Effects"
        );
        if (theEffx) {
            for (var f = 1; f <= theEffx.numProperties; f++) {
                if (
                    !theEffx.property(f).enabled &&
                    theEffx.property(f).isEffect
                ) {
                    theEffx.property(f).remove();
                    removedCount++;
                }
            }
        }
    }
    alert(
        "Removed " + removedCount + " effect" + (removedCount != 1 ? "s" : "")
    );
    app.endUndoGroup();
})();
