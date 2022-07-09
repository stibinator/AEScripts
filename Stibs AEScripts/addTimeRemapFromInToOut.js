// @target aftereffects
// license below

// more: https://blob.pureandapplied.com.au

(function () {
    this.name = "Add Time Remap From In To Out"
    
    function doSomethingWithSelectedLayersOrAllIfNoneSelected(doTheThing, theParams) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var firstLayer = 0;

            var theLayers = theComp.selectedLayers;
            if (theLayers.length === 0) {
                firstLayer = 1;
                theLayers = theComp.layers;
            }
            for (var lyr = firstLayer; lyr < theLayers.length + firstLayer; lyr++) {
                doTheThing(theLayers[lyr], theParams)
            }
        }
    }


    function addTimeRemapFromInToOut(theLayer, doLockedLayers) {

        if (theLayer.locked && doLockedLayers) {
            theLayer.wasLocked = true;
            theLayer.locked = false;
        }
        if (!theLayer.locked) {
            wasTimeRemapped = theLayer.timeRemapEnabled;
            theLayer.timeRemapEnabled = true;
            theLayer.timeRemap.setValueAtTime(theLayer.inPoint, theLayer.timeRemap.setValueAtTime(theLayer.inPoint));
            theLayer.timeRemap.setValueAtTime(theLayer.outPoint, theLayer.timeRemap.setValueAtTime(theLayer.outPoint));
            if (!wasTimeRemapped || ScriptUI.environment.keyboardState.ctrlKey) {
                // don't delete unnecessary keyframes on layers that already have TR on, unless the ctrl key is held down
                for (var k = theLayer.timeRemap.numKeys; k > 0; k--) {
                    // layers can be time reversed, meaning their in-points can be after the outpoint
                    // this checks to see whether the keyframe is outside the layer bounds either way
                    if ((theLayer.timeRemap.keyTime(k) < theLayer.inPoint && theLayer.timeRemap.keyTime(k) < theLayer.outPoint)
                        || (theLayer.timeRemap.keyTime(k) > theLayer.inPoint && theLayer.timeRemap.keyTime(k) > theLayer.outPoint)) {
                        theLayer.timeRemap.removeKey(k);
                    };
                }
            }
        }
        
        if (theLayer.wasLocked) {
            // put stuff back like we found it
            theLayer.wasLocked = undefined;
            theLayer.locked = true;
        }
    }
    // ----------------------- the real Hoo-Hah ------------------------------
    app.beginUndoGroup(this.name);
    var doLockedLayers = ScriptUI.environment.keyboardState.shiftKey;
    doSomethingWithSelectedLayersOrAllIfNoneSelected(addTimeRemapFromInToOut, doLockedLayers);
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