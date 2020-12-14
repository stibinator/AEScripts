 // eslint-disable-next-line no-unused-vars
 function getLayerAsZeroIndexedArrayWTFAdobe(theComp){
    var theLayers = [];
    if (theComp){
        var allLayers = theComp.layers;
        for (var i = 1; i <= allLayers.length; i++){
            theLayers.push(allLayers[i]);
        }
    }
    return theLayers;
}