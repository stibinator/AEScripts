// var theComp = app.project.activeItem;
// var offset =0;
// for (i = 1; i <= theComp.numLayers; i++){

//     if ((! theComp.layer(i).property("Source Text")) && theComp.layer(i).hasVideo){
//         theComp.layer(i).position.setValue([theComp.layer(i).position.value[0] % 1920, theComp.layer(i).position.value[1]]);
//     }
// parent all text layers to the next layer that isn't a text layer
// if (theComp.layer(i).property("Source Text")){
//     offset = 1;
//     while (theComp.layer(i+offset).property("Source Text")){
//         offset++;
//     }
//     theComp.layer(i).parent = theComp.layer(i+offset);
// }

// rename text layers based on text
// theComp.layer(i).name =  theComp.layer(i).property("Source Text").value;

// for(j = 1; j<= 4; j++){
//         theLayers[i].opacity.removeKey(1);
// }

// add half second fade in fade out
// theLayers[i].opacity.setValueAtTime(theLayers[i].inPoint, 0);
// theLayers[i].opacity.setValueAtTime(theLayers[i].inPoint+ 0.5, 100);
// theLayers[i].opacity.setValueAtTime(theLayers[i].outPoint - 0.5, 100);
// theLayers[i].opacity.setValueAtTime(theLayers[i].outPoint, 0);
// }

var theLayers = app.project.activeItem.selectedLayers;
for (i in theLayers){
    theLayers[i].position.expression = "";
    theLayers[i].position.setValue([(theLayers[i].position.value[0]>960)? 500: theLayers[i].position.value[0],theLayers[i].position.value[1]]);
    
}

// function makeParentLayerOfAllUnparented(theComp, newParent)
// {
//     for (var i = 1; i <= theComp.numLayers; i++) {
//         var curLayer = theComp.layer(i);
//         var wasLocked = curLayer.locked;
//         curLayer.locked = false;
//         if (curLayer != newParent && curLayer.parent == null) {
//             curLayer.parent = newParent;
//         }
//         curLayer.locked = wasLocked
//     }
// }


// //
// // Scales the zoom factor of every camera by the given scale_factor.
// // Handles both single values and multiple keyframe values.
// function scaleAllCameraZooms(theComp, scaleBy)
// {
//     for (var i = 1; i <= theComp.numLayers; i++) {
//         var curLayer = theComp.layer(i);
//         if (curLayer.matchName == "ADBE Camera Layer") {
//             var curZoom = curLayer.zoom;
//             if (curZoom.numKeys == 0) {
//                 curZoom.setValue(curZoom.value * scaleBy);
//             } else {
//                 for (var j = 1; j <= curZoom.numKeys; j++) {
//                     curZoom.setValueAtKey(j,curZoom.keyValue(j)*scaleBy);
//                 }
//             }
//         }
//     }
// }

// function scaleComps(scale_factor)
// {
//     var activeItems = app.project.selection;
//     for (i in activeItems){
//         var activeItem = activeItems[i];
//         if ((activeItem != null) || (activeItem instanceof CompItem)) {
//             // Validate the input field, in case the user didn't defocus it first (which often can be the case).
//             // this.parent.parent.optsRow.text_input.notify("onChange");
            
//             var activeComp = activeItem;
            
//             // By bracketing the operations with begin/end undo group, we can 
//             // undo the whole script with one undo operation.
//             app.beginUndoGroup(scriptName);
            
//             // Create a null 3D layer.
//             var null3DLayer = activeComp.layers.addNull();
//             null3DLayer.threeDLayer = true;
            
//             // Set its position to (0,0,0).
//             null3DLayer.position.setValue([0,0,0]);
            
//             // Set null3DLayer as parent of all layers that don't have parents.  
//             makeParentLayerOfAllUnparented(activeComp, null3DLayer);
            
//             // Set new comp width and height.
//             activeComp.width  = Math.floor(activeComp.width * scale_factor);
//             activeComp.height = Math.floor(activeComp.height * scale_factor);
            
//             // Then for all cameras, scale the Zoom parameter proportionately.
//             scaleAllCameraZooms(activeComp, scale_factor);
            
//             // Set the scale of the super parent null3DLayer proportionately.
//             var superParentScale = null3DLayer.scale.value;
//             superParentScale[0] = superParentScale[0] * scale_factor;
//             superParentScale[1] = superParentScale[1] * scale_factor;
//             superParentScale[2] = superParentScale[2] * scale_factor;
//             null3DLayer.scale.setValue(superParentScale);
            
//             // Delete the super parent null3DLayer with dejumping enabled.
//             null3DLayer.remove();
            
//             app.endUndoGroup();
            
//             // Reset scale_factor to 1.0 for next use.
//             // scale_factor = 1.0;
//             // if (this.parent.parent.optsRow.scaleButton.value) {
//             // 	this.parent.parent.optsRow.text_input.text = "1.0";
//         }
//     }
// }


// scaleComps(2);