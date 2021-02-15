// @target aftereffects
(function(){
    app.beginUndoGroup("Remove all comp markers")
    var theComp = app.project.activeItem;
    if (theComp ){
        var compMarkers = theComp.markerProperty;
        for(var i = compMarkers.numKeys; i> 0; i--){
            theComp.markerProperty.removeKey(i);
        }
    }
    app.endUndoGroup();
})()
