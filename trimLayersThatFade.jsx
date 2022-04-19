// @target aftereffects
// license below

// more: https://blob.pureandapplied.com.au

(function () {
    function doSomethingWithSelectedLayersOrAllIfNoneSelected(doTheThing, theParams) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var firstLayer = 0;

            var theLayers = theComp.selectedLayers;
            if (theLayers.length === 0) {
                firstLayer = 1;
                theLayers = theComp.layers
            }
            for (var lyr = firstLayer; lyr < theLayers.length + firstLayer; lyr++) {
                doTheThing(theLayers[lyr], theParams)
            }
        }
    }
    function trimLayerFades(theLayer) {
        var theComp = theLayer.containingComp;
        var compStart = theComp.displayStartTime;
        var compEnd = compStart + theComp.duration;
        var frameDur = theComp.frameDuration;
        var theOpac = theLayer.transform.opacity;

        var firstTime = Math.max(compStart, theLayer.inPoint);
        var lastTime = Math.min(compEnd, theLayer.outPoint);

        if (theOpac.expressionEnabled) {
            for (var t = firstTime; t < theLayer.outPoint && theOpac.valueAtTime(t, false) === 0; t += frameDur) {
                theLayer.inPoint = t;
            }
            for (var t = lastTime; t > theLayer.inPoint && theOpac.valueAtTime(t, false) === 0; t -= frameDur) {
                theLayer.outPoint = t;
            }
        } else {
            if (theOpac.numKeys > 1) {
                for (var k = 1; k <= theOpac.numKeys && theOpac.keyValue(k) === 0; k++) {
                    theLayer.inPoint = theOpac.keyTime(k);
                }
                for (var k = theOpac.numKeys; k > 1 && theOpac.keyValue(k) === 0; k--) {
                    theLayer.outPoint = theOpac.keyTime(k);
                }
            }
        }
    }
    doSomethingWithSelectedLayersOrAllIfNoneSelected(trimLayerFades, null);
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
