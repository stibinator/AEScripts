// license below
// more: https://blob.pureandapplied.com.au

(function(){
    this.name = "alignSourceStartTime";
    trimStart = ScriptUI.environment.keyboardState.shiftKey;
    function doSomethingWithSelectedLayersOrAllIfNoneSelected(doTheThing, trimStart) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var firstLayer = 0;
            var theLayers = theComp.selectedLayers;
            if (theLayers.length === 0) {
                firstLayer = 1;
                theLayers = theComp.layers;
            }
            var lastSelected = theLayers[theLayers.length - 1];
            for (var lyr = firstLayer; lyr < theLayers.length + firstLayer; lyr++) {
                synchStart(theLayers[lyr], lastSelected.startTime, trimStart, lastSelected.inPoint)
            }
        }
    }

    function synchStart(theLayer, synchPoint, trimStart, inPt){
        theLayer.startTime = synchPoint;
        if (trimStart) {
            theLayer.inPoint = inPt;
        }
    }

    app.beginUndoGroup(this.name);
        doSomethingWithSelectedLayersOrAllIfNoneSelected(synchStart)
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
