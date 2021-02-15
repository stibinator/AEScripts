// @target aftereffects
var theComp = app.project.activeItem;
if (theComp){
    var theLayers = theComp.selectedLayers;
    for (var i =0; i < theLayers.length; i++){
        var markerProp = theLayers[i].property("Marker");
        for (var m = 1; m <= markerProp.numKeys; m++){
            theComp.markerProperty.setValueAtTime(markerProp.keyTime(m), markerProp.keyValue(m));
        }
    }
}
