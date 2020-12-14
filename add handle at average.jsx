/* global app */
//add a handle to all unparented layers
//@target aftereffects
function addHandleNull(theLayer, theHandle) {
    if (theLayer){
        if (! theLayer.parent) {
            theLayer.parent = theHandle;
        }
    }
}

function addCompHandle() {
    var proj = app.project;
    var scriptName = "add handle at average";
    var existingLayers = [];
    // change this to true if you want to leave locked layers untouched.
    var doLockedLayers = true;
    if (proj) {
        var averagePosition = [0,0,0]
        app.beginUndoGroup(scriptName);
        var comp = app.project.activeItem;
        if (comp) {
            var i;
            //make a separate array containing all the layers
            //to avoid weirdness when we add a null
            var theLayers = comp.selectedLayers;
            if (theLayers.length > 0) {
            //use selected layers if some layers are selected,
                for (i = 0; i < theLayers.length; i++) {
                    existingLayers.push(theLayers[i]);
                    averagePosition += theLayers[i].transform.position.value;
                }
            } else {
                // use all if not
                for (i = 1; i <= comp.layers.length; i++) {
                    existingLayers.push(comp.layers[i]);
                    averagePosition += comp.layers[i].transform.position.value;
                }
            }
            averagePosition /= existingLayers.length;
            //here comes the hoo-ha:
            //make the handle layer
            var theHandle = comp.layers.addNull();
            theHandle.name = "comp handle";
            theHandle.transform.position.setValue(averagePosition);
            //loop through and parent the layers to the handle
            for (i = 0; i < existingLayers.length; i++) {
                if ( existingLayers[i].locked ){
                    if (doLockedLayers){
                        existingLayers[i].locked = false;
                        addHandleNull(existingLayers[i], theHandle);
                        existingLayers[i].locked = true;
                    }
                } else {
                    addHandleNull(existingLayers[i], theHandle);
                }
            }
            //thus ends the hoo-ha
            app.endUndoGroup();
        } else {
            alert("Please select a comp to use this script", scriptName);
        }
    } else {
        alert("Please open a project first to use this script", scriptName);
    }
}

addCompHandle();
