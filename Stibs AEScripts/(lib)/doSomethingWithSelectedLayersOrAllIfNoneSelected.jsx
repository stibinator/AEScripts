(function () {
    function doSomethingWithSelectedLayersOrAllIfNoneSelected(doTheThing, theParams) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var firstLayer = 0;

            var theLayers = theComp.selectedLayers;
            if (theLayers.length === 0) {
                firstLayer = 1;
                theLayers = theComp.layers
            }
            for (var lyr = firstLayer; lyr < theLayers.length + firstLayer; lyr++) {
                doTheThing(theLayers[lyr], theParams)
            }
        }
    }
})()