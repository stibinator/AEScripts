//@target aftereffects
// one click alpha matte tidying
// trims the selected layer(s)
// to match the length of the layers below them
// and sets them as layer mattes
(function () {
    var scriptName = "trimToLayerBelowAndSetAsAlphaMatte";
    app.beginUndoGroup(scriptName);
    var theComp = app.project.activeItem;
    if (theComp) {
        for (var i = 0; i < theComp.selectedLayers.length; i++) {
            theLayer = theComp.selectedLayers[i];
            if (theComp.numLayers > theLayer.index) {
                var targetLayer = theComp.layer(theLayer.index + 1);
                theLayer.inPoint = targetLayer.inPoint;
                theLayer.outPoint = targetLayer.outPoint;
                targetLayer.trackMatteType = TrackMatteType.ALPHA;
            }
        }
    }
    app.endUndoGroup();
})();
