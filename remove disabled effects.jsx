// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    if (app.project.activeItem) {
        var theLayers = [];
        theLayers = app.project.activeItem.selectedLayers;
        if (theLayers.length === 0) {
            allTheLayers = app.project.activeItem.layers;
            for (l = 0; l < allTheLayers.length; l++) {
                theLayers[l] = allTheLayers[l + 1];
            }
        }
    }
    app.beginUndoGroup("Remove Disabled Effects");
    var removedCount = 0;
    for (var i = 0; i < theLayers.length; i++) {
        var theEffx = app.project.activeItem.layer(theLayers[i].index)(
            "Effects"
        );
        if (theEffx) {
            for (var f = 1; f <= theEffx.numProperties; f++) {
                if (
                    !theEffx.property(f).enabled &&
                    theEffx.property(f).isEffect
                ) {
                    theEffx.property(f).remove();
                    removedCount++;
                }
            }
        }
    }
    alert(
        "Removed " + removedCount + " effect" + (removedCount != 1 ? "s" : "")
    );
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
