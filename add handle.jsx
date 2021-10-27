// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app */
//add a handle to all unparented layers
// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function addHandleNull(theLayer, theHandle) {
    if (theLayer) {
        if (!theLayer.parent) {
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
        var averagePosition = [0, 0, 0];
        app.beginUndoGroup(scriptName);
        var comp = app.project.activeItem;
        if (comp) {
            //make a separate array containing all the layers
            //to avoid weirdness when we add a null
            var theLayers = comp.selectedLayers;
            if (theLayers.length > 0) {
                //use selected layers if some layers are selected,
                for (var i = 0; i < theLayers.length; i++) {
                    existingLayers.push(theLayers[i]);
                }
            } else {
                // use all if not
                for (var i = 1; i <= comp.layers.length; i++) {
                    existingLayers.push(comp.layers[i]);
                }
            }

            //here comes the hoo-ha:
            //make the handle layer
            var theHandle = comp.layers.addNull();
            theHandle.name = "comp handle";
            //loop through and parent the layers to the handle
            for (var i = 0; i < existingLayers.length; i++) {
                if (existingLayers[i].locked) {
                    if (doLockedLayers) {
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

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
