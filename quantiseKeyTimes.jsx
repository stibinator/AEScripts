// @target aftereffects
// snaps keyframes to frame boundaries. Useful to avoid problems when you have more than one keyframe per frame
// if you select some keyframes it will quantise just them,
//  or if you select a layer it will quantise all the keyframes in the layer
// or if nothing is selected it will quantise all the keys in the comp.
// @target aftereffects
//  @includepath "./(lib)/"
//  @include "copyproperties-makekey.jsx"
//  @include "jsextras.jsx"
//  @include "getproperties.jsx"
/* global getKeyAttributes, makeKeyWithAttributes, getPropertiesWithKeyFramesFromLayer, app, CompItem */

function quantiseKeytimes(theProp, theKeyIndexes){
    for (var i = 0; i < theKeyIndexes.length; i++ ){ 
        var newKeyTime = Math.floor(theProp.keyTime(theKeyIndexes[i]) / theComp.frameDuration) * theComp.frameDuration;
        var oldKeyAttributes = getKeyAttributes(theProp, theKeyIndexes[i]);
        theProp.removeKey(theKeyIndexes[i]);
        makeKeyWithAttributes(theProp, oldKeyAttributes, newKeyTime);
    }
}


app.beginUndoGroup("quantise keys");
var theComp = app.project.activeItem;
if (theComp instanceof CompItem){
    var theProps = theComp.selectedProperties;
    if (theProps.length === 0){
        theProps = [];
        // no properties or keys selected, but layers are
        var selectedLyrs =  theComp.selectedLayers;
        if (selectedLyrs.length > 0){
            for (var i = 0 ; i < selectedLyrs.length; i++){
                var layerProps = getPropertiesWithKeyFramesFromLayer(selectedLyrs[i], false);
                for (var p =0; p < layerProps.length; p++){
                    theProps.push(layerProps[p]);
                }
            }        
        // nothing selected, do all layers
        } else {
            // eslint-disable-next-line no-redeclare
            for (var i = 1 ; i <= theComp.numLayers; i++){
                // eslint-disable-next-line no-redeclare
                var layerProps = getPropertiesWithKeyFramesFromLayer(theComp.layer(i), false);
                // eslint-disable-next-line no-redeclare
                for (var p =0; p < layerProps.length; p++){
                    theProps.push(layerProps[p]);
                }
            }
        }
    }
    for (var p=0; p < theProps.length ; p++) {
        var theProp = theProps[p];
        // if there are keys selected
        if (theProp.selectedKeys.length > 0){
            var indices = theProp.selectedKeys;
        // if the property is selected but no keys (can this happen?)
        } else {
            var indices = Array.range(1, theProp.numKeys);
        }
        quantiseKeytimes(theProp, indices);
    }

}
app.endUndoGroup();
