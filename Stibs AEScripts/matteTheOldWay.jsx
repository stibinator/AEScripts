// license below
// more: https://blob.pureandapplied.com.au

(function () {
    this.name = "matteTheOldWay";
    function doSomethingWithSelectedLayersOrAllIfNoneSelected(doTheThing, theParams) {
        var theComp = app.project.activeItem;
        if (theComp) {
            if (theComp.selectedLayers.length ) {
                for (var lyr = 0; lyr < theComp.selectedLayers.length; lyr++) {
                    doTheThing(theComp.selectedLayers[lyr], theParams)
                }
            } else {
                for (var lyr = 2; lyr <= theComp.numLayers; lyr+= 2) {
                    doTheThing(theComp.layer[lyr], theParams)
                }
            }
        }
    }

    function setMatteToPrevLayer(theLayer, trackMatteTypes) {
        if (theLayer.index > 1) {
            var trackMatteLayer = theLayer.containingComp.layer(theLayer.index - 1)
            theLayer.setTrackMatte(trackMatteLayer, trackMatteTypes)
        }
    }

    app.beginUndoGroup(this.name);
    var inverted = 1 * ScriptUI.environment.keyboardState.shiftKey;
    var luma = 2 * ScriptUI.environment.keyboardState.ctrlKey;
    var myTrackMatteType = [
        TrackMatteType.ALPHA,
        TrackMatteType.ALPHA_INVERTED,
        TrackMatteType.LUMA,
        TrackMatteType.LUMA_INVERTED][inverted + luma]
    doSomethingWithSelectedLayersOrAllIfNoneSelected(setMatteToPrevLayer, myTrackMatteType)
    app.endUndoGroup();
})()


// ========= LICENSE ============
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
