//@target aftereffects
(function(){
    this.name = "test";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        for(var i =0; i < theComp.selectedLayers.length; i++){
            theLayer = theComp.selectedLayers[i];
            
        }
    }
    app.endUndoGroup();
})()
