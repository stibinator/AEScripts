// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// selects immediate children of selected layer
(function () {
    var theComp = app.project.activeItem;
    if (theComp) {
        var parentLayers = [];
        for (i = 1; i <= theComp.numLayers; i++) {
            if (theComp.layer(i).selected) {
                parentLayers.push(i);
            }
            theComp.layer(i).selected = false;
        }
        for (i = 1; i <= theComp.numLayers; i++) {
            for (p = 0; p < parentLayers.length; p++) {
                if (
                    theComp.layer(i).parent &&
                    theComp.layer(i).parent.index === parentLayers[p]
                ) {
                    theComp.layer(i).locked = false;
                    theComp.layer(i).selected = true;
                }
            }
        }
    }
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
