//@target aftereffects
(function () {
    this.name = "makeMattesChildOFLayers";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp) {
        var theLayers = theComp.selectedLayers;
        if (!theLayers.length) {
            for (var lyr = 1; lyr <= theComp.numLayers; lyr++) {
                theLayers[lyr - 1] = theComp.layers[lyr];
            }
        }
        for (var i = 0; i < theLayers.length; i++) {
            var theLayer = theLayers[i];
            if (theLayer.isTrackMatte) {
                theLayer.parent = theComp.layer(theLayer.index + 1);
            }
        }
    }
    app.endUndoGroup();
})()
