// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    // Sort Layers by In Point.jsx
    //
    // This script reorders layers in the active comp, sorted by inPoint.
    //

    function sortLayersDownByInPoint(thisObj) {
        var proj = app.project;
        var scriptName = "Sort Layers Down by In Point";

        // change this to true if you want to leave locked layers untouched.
        var doLocked = false;
        if (proj) {
            var activeItem = app.project.activeItem;
            if (
                activeItem != null &&
                activeItem instanceof CompItem &&
                activeItem.numLayers > 1
            ) {
                app.beginUndoGroup(scriptName);
                var theLayer;
                var keepSorting = true;
                while (keepSorting) {
                    keepSorting = false;
                    for (var i = 2; i <= activeItem.numLayers; i++) {
                        theLayer = activeItem.layer(i);
                        if (doLocked || !theLayer.locked) {
                            theLayer.wasLocked = theLayer.locked;
                            theLayer.locked = false;
                            if (
                                theLayer.inPoint <
                                activeItem.layer(i - 1).inPoint
                            ) {
                                theLayer.moveBefore(activeItem.layer(i - 1));
                                keepSorting = true;
                            }
                            theLayer.locked = theLayer.wasLocked;
                            theLayer.wasLocked = null;
                        }
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

    sortLayersDownByInPoint(this);
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
