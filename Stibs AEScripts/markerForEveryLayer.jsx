// adds a comp marker at the start of every layer
// hold ctrl to add the marker at the end of every layer
// hold shift to make the duration of the marker the same as the layer duration
// license below
// more: https://blob.pureandapplied.com.au

(function(){
    this.name = "markerForEveryLayer";
    var ENDMARKER = ScriptUI.environment.keyboardState.ctrlKey;
    var LONGMARKER = ScriptUI.environment.keyboardState.shiftKey;

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
                doTheThing(theLayers[lyr], theComp)
            }
        }
    }

    function theThing(theLayer, theComp){
        var theMarker = new MarkerValue(theLayer.name);
        if (LONGMARKER) {
            theMarker.duration = theLayer.outPoint- theLayer.inPoint;
            ENDMARKER = false; // have to start at the inpoint for long markers
        }
        theComp.markerProperty.setValueAtTime(
            (ENDMARKER) ? theLayer.outPoint : theLayer.inPoint,
            theMarker);
    }

    app.beginUndoGroup(this.name);

        doSomethingWithSelectedLayersOrAllIfNoneSelected(theThing, "is a layer")
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
