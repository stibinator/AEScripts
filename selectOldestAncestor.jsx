// selects un-parented layers
(function(){var theComp = app.project.activeItem;
if (theComp && (theComp.selectedLayers.length === 1)){
    theLayer = theComp.selectedLayers[0];
    theLayer.selected = false;
    while (theLayer){
        oldestAncestor = theLayer;
        theLayer = theLayer.parent;
    }
    oldestAncestor.selected = true;
}})()