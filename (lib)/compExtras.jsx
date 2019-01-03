function getCompLayers(theComp, skipLocked){
    var theLayers = [];
    for (var i =1; i <= theComp.numLayers; i++){
        if ((!skipLocked)||(! theComp.layer(i).locked)){
        theLayers.push(theComp.layer(i));
        }
    }
    return theLayers
}