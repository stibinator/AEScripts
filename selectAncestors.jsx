// selects un-parented layers
(function(){var theComp = app.project.activeItem;
if (theComp && (theComp.selectedLayers.length === 1)){
    theLayer = theComp.selectedLayers[0];
    while (theLayer){
        theLayer.selected = true;
        theLayer = theLayer.parent;
    }
}})()