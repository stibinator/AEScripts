var theComp = app.project.activeItem;
if (theComp){
    var theLayer = theComp.selectedLayers[0];
    var leaderLayer = theComp.layer(2);
    var indexOffset = theLayer.index - leaderLayer.index;
    for (var i = 0; i < theComp.selectedLayers.length; i++){
        theComp.selectedLayers[i].startTime = theComp.layer(theComp.selectedLayers[i].index - indexOffset ).startTime;
        }
    }
