// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    // Sort Layers by In Point.jsx
    //
    // This script reorders layers in the active comp, sorted by inpoint or if ctrl is held down, outPoint.
    //
    var DOWN = ScriptUI.environment.keyboardState.shiftKey;
    var OUT = ScriptUI.environment.keyboardState.ctrlKey;

    function SortLayersByoutPoint(thisObj) {
        var proj = app.project;
        var scriptName = "Sort Layers by In Point";

        function sortByoutPoint(comp_layers, unlockedOnly) {
            var total_number = comp_layers.length;
            while (total_number >= 2) {
                var layer_was_moved = false;
                for (j = 1; j <= total_number; j++) {
                    if (
                        (DOWN && !OUT &&
                            comp_layers[j].inPoint >
                            comp_layers[total_number].inPoint) ||
                        (DOWN && OUT &&
                            comp_layers[j].outPoint >
                            comp_layers[total_number].outPoint) ||
                        (!DOWN && !OUT &&
                            comp_layers[j].inPoint <
                            comp_layers[total_number].inPoint) ||
                        (!DOWN && OUT &&
                            comp_layers[j].outPoint <
                            comp_layers[total_number].outPoint)

                    ) {
                        if (comp_layers[j].locked) {
                            if (unlockedOnly == false) {
                                comp_layers[j].locked = false;
                                comp_layers[j].moveAfter(
                                    comp_layers[total_number]
                                );
                                comp_layers[total_number].locked = true;
                                layer_was_moved = true;
                            }
                        } else {
                            comp_layers[j].moveAfter(comp_layers[total_number]);
                            layer_was_moved = true;
                        }
                    }
                }
                if (!layer_was_moved) {
                    total_number = total_number - 1;
                }
            }
        }

        // change this to true if you want to leave locked layers untouched.
        var unlockedOnly = false;
        if (proj) {
            var activeItem = app.project.activeItem;
            if (activeItem != null && activeItem instanceof CompItem) {
                app.beginUndoGroup(scriptName);
                var activeCompLayers = activeItem.layers;
                sortByoutPoint(activeCompLayers, unlockedOnly);
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

    SortLayersByoutPoint(this);
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
