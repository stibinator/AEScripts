// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    var theComp = app.project.activeItem;
    var sampleTime = theComp.frameDuration / 100;
    if (theComp) {
        app.beginUndoGroup("extend animation");
        var theProps = theComp.selectedProperties;
        for (var p = 0; p < theProps.length; p++) {
            var prop = theProps[p];
            extendMotion(theProps[p])
        }
        app.endUndoGroup();
    }

    function extendMotion(prop) {
        if (prop.numKeys) {
            var lastkeyTime = prop.keyTime(prop.numKeys);
            var firstKeyTime = prop.keyTime(1);
            if (theComp.duration > lastkeyTime) {
                var lastKFVal = prop.keyValue(prop.numKeys);
                var prevVal = prop.valueAtTime(lastkeyTime - sampleTime, true)
                var lastKeySpeed = (lastKFVal - prevVal) / sampleTime;
                prop.setValueAtTime(theComp.duration, lastKFVal + lastKeySpeed * (theComp.duration - lastkeyTime));
            }
            if (firstKeyTime > 0) {
                var firstKFVal = prop.keyValue(1);
                var postVal = prop.valueAtTime(firstKeyTime + sampleTime, true)
                var firstKeySpeed = (postVal - firstKFVal) / sampleTime;
                prop.setValueAtTime(0, firstKFVal + firstKeySpeed * (0 - firstKeyTime));
            }
        }

    }
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
