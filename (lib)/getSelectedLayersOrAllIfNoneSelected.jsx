// @target aftereffects
var theComp=app.project.activeItem;
if (theComp){
    var theLayers = theComp.selectedLayers;
    if (selectedLayers.length === 0){
        for (var i = 1; i <= theComp.numLayers; i++){
            theLayers.push(theComp.layer(i));
        }
    }
    for(var lyr = 0; lyr < theLayers.length; lyr++){
        //do the things
    }
}
