// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app, CompItem */
(function () {
    app.beginUndoGroup("Shy layers locked");
    var theComp = app.project.activeItem;
    if (theComp instanceof CompItem) {
        for (var i = 1; i <= theComp.numLayers; i++) {
            if (theComp.layer(i).shy) { theComp.layer(i).locked = true; }
        }
    }
    // theComp.hideShyLayers = true;
    app.endUndoGroup();
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
