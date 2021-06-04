//@target aftereffects
(function(){
    this.name = "crossFadeOverlappingLayers";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        for(var i = 1; i < theComp.selectedLayers.length; i++){
            theLayer = theComp.selectedLayers[i-1];
            theLayer.opacity.setValueAtTime(theComp.selectedLayers[i].inPoint, 100);
            theLayer.opacity.setValueAtTime(theLayer.outPoint + theComp.frameDuration, 0);
        }
    }
    app.endUndoGroup();
})()
