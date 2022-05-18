// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    // trimToFades.jsx
    // this script trims surplus off layers where the opacity is zero.
    //
    // @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

    function getCompLayers(theComp, skipLocked){
        var theLayers = [];
        for (var i =1; i <= theComp.numLayers; i++){
            if ((!skipLocked)||(! theComp.layer(i).locked)){
            theLayers.push(theComp.layer(i));
            }
        }
        return theLayers
    }

    function trimLayersToFades(thisObj) {
        var proj = app.project;
        var scriptName = "Trim To Fades";

        function trimToFades(theLayer, frameDuration, doLengthen) {
            var opac = theLayer.opacity;

            if (opac.expressionEnabled) {
                while (
                    theLayer.inPoint < theLayer.outPoint &&
                    opac.valueAtTime(theLayer.inPoint, false) === 0
                ) {
                    theLayer.inPoint += frameDuration;
                }

                while (
                    theLayer.outPoint > theLayer.inPoint &&
                    opac.valueAtTime(theLayer.outPoint, false) === 0
                ) {
                    theLayer.outPoint -= frameDuration;
                }
            } else {
                var i = 1;
                while (
                    i < opac.numKeys &&
                    opac.valueAtTime(opac.keyTime(i), true) === 0
                ) {
                    if (doLengthen || theLayer.inPoint < opac.keyTime(i)) {
                        theLayer.inPoint = opac.keyTime(i);
                    }
                    i++;
                }
                i = opac.numKeys;

                while (i > 1 && opac.valueAtTime(opac.keyTime(i), true) === 0) {
                    if (doLengthen || theLayer.outPoint > opac.keyTime(i)) {
                        theLayer.outPoint = opac.keyTime(i);
                    }
                    i--;
                }
            }
        }

        // change this to true if you want to leave locked layers untouched.
        var unlockedOnly = false;
        if (proj) {
            var activeItem = app.project.activeItem;
            var frameDuration = 1 / activeItem.frameRate;
            if (activeItem != null && activeItem instanceof CompItem) {
                app.beginUndoGroup(scriptName);
                var theLayer;
                var theLayers =
                    activeItem.selectedLayers.length > 0
                        ? activeItem.selectedLayers
                        : getCompLayers(activeItem, unlockedOnly);
                for (var i = 0; i < theLayers.length; i++) {
                    theLayer = theLayers[i];
                    if (!unlockedOnly || !theLayer.locked) {
                        trimToFades(theLayer, frameDuration, true);
                    }
                }
                app.endUndoGroup();
            } else {
                alert(
                    "Please select an active comp to use this script",
                    scriptName
                );
            }
        } else {
            alert(
                "Please open a project first to use this script.",
                scriptName
            );
        }
    }

    trimLayersToFades(this);
})();

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
