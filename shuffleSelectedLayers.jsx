// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// randomly orders layers
(function () {
    app.beginUndoGroup("Shuffle Selected Layers");
    var curComp = app.project.activeItem;
    var theLayers = curComp.layers;
    var selectedLayrs = [];
    var unselectedLayers = [];
    var unselectedIndexes = [];
    for (i = 1; i <= theLayers.length; i++) {
        if (theLayers[i].selected) {
            selectedLayrs.push(theLayers[i]);
        } else {
            unselectedLayers.push(theLayers[i]);
            unselectedIndexes.push(theLayers[i].index);
        }
    }

    for (i = 0; i < selectedLayrs.length; i++) {
        r = Math.floor(Math.random() * selectedLayrs.length);
        if (selectedLayrs[r].index !== selectedLayrs[i].index) {
            selectedLayrs[i].moveBefore(selectedLayrs[r]);
        }
    }
    var needsSorting = true;
    // var sortCount =0;
    while (needsSorting) {
        needsSorting = false;
        // sortCount++;
        for (i = 0; i < unselectedLayers.length; i++) {
            if (unselectedLayers[i].index < unselectedIndexes[i]) {
                // alert("" + unselectedLayers[i].index + " was: " + unselectedIndexes[i] );
                unselectedLayers[i].moveAfter(
                    curComp.layers[unselectedIndexes[i]]
                );
                needsSorting = true;
            } else if (unselectedLayers[i].index > unselectedIndexes[i]) {
                unselectedLayers[i].moveBefore(
                    curComp.layers[unselectedIndexes[i]]
                );
                needsSorting = true;
            }
        }
    }
    // alert(sortCount);
    app.endUndoGroup();
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
