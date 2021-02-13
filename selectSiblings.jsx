// @target aftereffects
// selects un-parented layers
(function(){var theComp = app.project.activeItem;
if (theComp && (theComp.selectedLayers.length === 1)){
    theLayer = theComp.selectedLayers[0];
    for(var n = 1; n <= theComp. numLayers; n++){

        theComp.layer(n).selected = ((theComp.layer(n).parent) && (theComp.layer(n).parent.index === theLayer.parent.index));
    }
}})()
