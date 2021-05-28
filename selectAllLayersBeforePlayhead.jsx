//@target aftereffects
(function(){
    this.name = "selectAllLayersAfterPlayhead";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        for(var i = 1; i <= theComp.numLayers; i++){
            theComp.layer(i).selected = (theComp.layer(i).inPoint < theComp.time && theComp.layer(i).outPoint < theComp.time );
            
        }
    }
    app.endUndoGroup();
})()
