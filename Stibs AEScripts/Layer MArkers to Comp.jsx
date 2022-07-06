(function () {
    this.name = "Layer Markers to Comp";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    var theMarkers = [];
    if (theComp) {
        var theLayers = getSelectedLayersOrAllIfNoneSelected(theComp);
        for (var lyr = 0; lyr < theLayers.length; lyr++) {
            theMarkers.push(theLayers[lyr].marker);
        }
        for (var m = 0; m < theMarkers.length; m++) {
            var markerProp = theMarkers[m];
            for (var k = markerProp.numKeys; k >= 1; k--) {
                var newMarker = new MarkerValue(markerProp.keyValue(k).comment);
                // not sure how many of these are still relevant, 
                // but including them all for completeness
                newMarker.chapter = markerProp.keyValue(k).chapter;
                newMarker.url = markerProp.keyValue(k).url;
                newMarker.frameTarget = markerProp.keyValue(k).frameTarget;
                newMarker.CuePointName = markerProp.keyValue(k).CuePointName;
                newMarker.duration = markerProp.keyValue(k).duration;
                newMarker.eventCuePoint = markerProp.keyValue(k).eventCuePoint;
                newMarker.label = markerProp.keyValue(k).label;
                newMarker.protectedRegion = markerProp.keyValue(k).protectedRegion;
                theComp.markerProperty.setValueAtTime(markerProp.keyTime(k), newMarker);
                markerProp.removeKey(k);
            }
        }
    }
    app.endUndoGroup();

    function getSelectedLayersOrAllIfNoneSelected(theComp) {
        theComp = theComp || app.project.activeItem;
        if (theComp) {
            var theLayers = theComp.selectedLayers;
            if (theLayers.length === 0) {
                for (var lyr = 1; lyr <= theComp.layers.length; lyr++) {
                    theLayers.push(theComp.layer(lyr));
                }
            }
        }
        return theLayers;
    }
})()
