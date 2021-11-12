// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    var BEFORE = true;
    var AFTER = false;

    function removeKeys(theProps, theTime, beforeOrAfter) {

        for (var p = 0, len = theProps.length; p < len; p++) {
            var theProp = theProps[p];
            var i = 1;
            while (i <= theProp.numKeys) {
                if ((theProp.keyTime(i) > theTime) & (beforeOrAfter === AFTER)) {
                    theProp.removeKey(i);
                } else if ((theProp.keyTime(i) < theTime) & (beforeOrAfter === BEFORE)) {
                    theProp.removeKey(i);
                } else {
                    i++;
                }
            };
        }
    }

    app.beginUndoGroup("remove keys after playhead");
    var theComp = app.project.activeItem;
    if (theComp instanceof CompItem) {
        removeKeys(theComp.selectedProperties, theComp.time, AFTER);
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
