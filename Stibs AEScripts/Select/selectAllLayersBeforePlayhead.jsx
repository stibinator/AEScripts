// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    this.name = "selectAllLayersBeforePlayhead";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    var shiftHeld = ScriptUI.environment.keyboardState.shiftKey;
    if (theComp) {
        for (var i = 1; i <= theComp.numLayers; i++) {
            if (shiftHeld) {
                theComp.layer(i).selected = (theComp.layer(i).inPoint < theComp.time || theComp.layer(i).outPoint < theComp.time);
            } else {
                theComp.layer(i).selected = (theComp.layer(i).inPoint < theComp.time && theComp.layer(i).outPoint < theComp.time);
            }
        }
    }
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
