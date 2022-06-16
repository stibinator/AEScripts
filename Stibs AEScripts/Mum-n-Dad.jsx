// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app, CompItem */
// if multiple layers are selected creates a null that acts as the parent for all selected layers
// or if one layer is selected makes that the parent for the everything in the comp
// or if nothing is selected, makes a new null the parent of everything in the comp
(function () {
    app.beginUndoGroup("make parent for comp");
    var nullName = "Parent Null"; //change this to whatever
    var layer, theLayer;
    var theComp = app.project.activeItem;
    var newParent = null;
    if (theComp instanceof CompItem) {
        var selectedLyr = theComp.selectedLayers;
        var numSelected = selectedLyr.length;

        // 1 or fewer layers selected. All the unparented comp items will be affected    
        if (numSelected <= 1) {
            selectedLyr = [];
            for (var i = 1; i <= theComp.numLayers; i++) {
                selectedLyr.push(theComp.layer(i));
            }
        }
        // 1 layer selected, it will become the new parent
        if (numSelected === 1) {
            newParent = selectedLyr[0];
        }

        // create a null for a parent if we need it
        if (!newParent) {
            var averagePosition = [0, 0];
            var numChildren = 0;
            for (layer = 0; layer < selectedLyr.length; layer++) {
                theLayer = selectedLyr[layer];
                if (!theLayer.parent) {
                    averagePosition += theLayer.position.value;
                    numChildren++;
                }
            }
            averagePosition /= numChildren
            newParent = theComp.layers.addNull();
            newParent.name = nullName;
            newParent.position.setValue(averagePosition);
        }
        // do the parenting
        for (layer = 0; layer < selectedLyr.length; layer++) {
            theLayer = selectedLyr[layer];
            if (!theLayer.parent) {
                if (newParent.index != theLayer.index) {
                    var wasLocked = theLayer.locked;
                    theLayer.locked = false;
                    theLayer.parent = newParent;
                    theLayer.locked = wasLocked;
                }
            }
        }
    }
    app.endUndoGroup();
})()
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
