//@target aftereffects
(function(){
    this.name = "consolidateDuplicateComps";
    app.beginUndoGroup(this.name);
    var theProj = app.project;
    if (theProj ){
        for(var i = 1; i <= theProj.numItems; i++){
            theComp = theProj.item(i);
            for (var j = i; j <= theProj.numItems; j++) {
                if (theComp.name === theProj.item(j).name) {
                    try theComp.replace(theProj.)
                }
            }
            
        }
    }
    app.endUndoGroup();
})()
