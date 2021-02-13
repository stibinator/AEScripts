var theComp=app.project.activeItem;
if (theComp){
    var theLayers = theComp.selectedLayers;
    if (theLayers.length === 0){
        for (var i = 1; i <= theComp.numLayers; i++){
            theLayers.push(theComp.layer(i));
        }
    }
    for(var lyr = 0; lyr < theLayers.length; lyr++){
        var curLyr = theLayers[lyr];
        var props = getPropertiesWithKeyFramesFromLayer(curLyr, false);
        for(var p = 0; p < props.length; p++){
            var theProp = props[p];
            for (var k = 1; k <= theProp.numKeys; k++)
            try {
                theProp.setSelectedAtKey(k, (theProp.keyTime(k) > theComp.time));
            } catch(e){
                // writln(e);
            }
        }
        
    }
}



// eslint-disable-next-line no-unused-vars
function getPropertiesWithKeyFramesFromLayer(theLayer, selectedOnly) {
    var props = [];
    //only return selected properties. Kinda trivial but here for ease of use
    if (selectedOnly) {
        for (var j = 0; j < theLayer.selectedProperties.length; j++) {
            if (theLayer.selectedProperties[j].numKeys > 0) {
                props.push(theLayer.selectedProperties[j]);
            }
        }
    } else {
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        if (newProps[i].numKeys > 0) {
                            if (newProps[i].name != "Marker") {
                                props.push(newProps[i]);
                            }
                        }
                    }
                }
            }
        }
    }
    return props;
}