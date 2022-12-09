// synchronises the KF labels for all keys on selected properties that occur at the same time.
// license below
// more: https://blob.pureandapplied.com.au

(function () {
    var NUMLABELS = (ScriptUI.environment.keyboardState.ctrlKey)? 2 : 16;
    this.name = "labelConcurrentKFs";
    function getAllKFs() {
        var allKFs = [];
        var theComp = app.project.activeItem;
        if (theComp) {
            var theProps = theComp.selectedProperties;
            for (var p = 0; p < theProps.length; p++) {
                var prop = theProps[p];
                var currentProp = { keyedProperty: prop, keyTimes: [] }
                for (var k = 1; k <= prop.numKeys; k++) {
                    currentProp.keyTimes.push(prop.keyTime(k));
                }
                allKFs.push(currentProp);
            }
        }
        return allKFs;
    }

    function setLabelForConcurrentKFs(theProperties) {
        var currentLabel = 1;
        for (var p = 0; p < theProperties.length; p++) {
            for (var k = 0; k < theProperties[p].keyTimes.length; k++) {
                var currentKeyTime = theProperties[p].keyTimes[k];
                if (currentKeyTime !== "done") {
                    theProperties[p].keyedProperty.setLabelAtKey(k + 1, currentLabel);
                    theProperties[p].keyTimes[k] = "done";
                    for (var othP = p + 1; othP < theProperties.length; othP++) {
                        for (var othK = 0; othK < theProperties[othP].keyTimes.length; othK++) {
                            if (theProperties[othP].keyTimes[othK] === currentKeyTime) {
                                theProperties[othP].keyedProperty.setLabelAtKey(othK + 1, currentLabel);
                                theProperties[othP].keyTimes[othK] = "done";
                            }
                        }
                    }
                }
                currentLabel = 1 + theProperties[p].keyedProperty.keyLabel(k + 1) % NUMLABELS;
            }
        }
    }

    app.beginUndoGroup(this.name);
    var allKFs = getAllKFs();
    setLabelForConcurrentKFs(allKFs);
    app.endUndoGroup();
})()


// ========= LICENSE ============
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
