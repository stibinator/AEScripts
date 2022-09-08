// @target aftereffects
// license below

// more: https://blob.pureandapplied.com.au

(function () {
    function traversePropertyGroups(pGroup, inclusive) {
        // walks through property groups, returning properties
        // if inclusive is true, returns property groups as well
        if (pGroup) {
            var props = [];
            //alert(pGroup.numProperties);
            if (typeof pGroup.numProperties !== "undefined") {
                if (inclusive) {
                    props.push(pGroup);
                }
                for (var pp = 1; pp <= pGroup.numProperties; pp++) {
                    var newProps = traversePropertyGroups(
                        pGroup.property(pp),
                        inclusive
                    );
                    if (newProps.length) {
                        for (var i = 0; i < newProps.length; i++) {
                            props.push(newProps[i]);
                        }
                    }
                }
            } else {
                props.push(pGroup);
            }
            return props;
        }
    }

    // eslint-disable-next-line no-unused-vars
    function getPropertiesWithKeyFramesFromLayer(theLayer, selectedOnly) {
        var props = [];
        //only return selected properties. Kinda trivial but here for ease of use
        if (selectedOnly) {
            for (var j = 0; j < theLayer.selectedProperties.length; j++) {
                if (theLayer.selectedProperties[j].numKeys > 0) {
                    props.push(theLayer.selectedProperties[j]);
                }
            }
        } else {
            for (var p = 1; p <= theLayer.numProperties; p++) {
                if (theLayer.property(p)) {
                    var propertyGroup = theLayer.property(p);
                    var newProps = traversePropertyGroups(propertyGroup, false);
                    if (newProps.length) {
                        for (var i = 0; i < newProps.length; i++) {
                            if (newProps[i].numKeys > 0) {
                                if (newProps[i].name != "Marker") {
                                    props.push(newProps[i]);
                                }
                            }
                        }
                    }
                }
            }
        }
        return props;
    }

    function doSomethingWithSelectedLayersOrAllIfNoneSelected(doTheThing, theParams) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var firstLayer = 0;

            var theLayers = theComp.selectedLayers;
            if (theLayers.length === 0) {
                firstLayer = 1;
                theLayers = theComp.layers;
            }
            for (var lyr = firstLayer; lyr < theLayers.length + firstLayer; lyr++) {
                doTheThing(theLayers[lyr], theParams)
            }
        }
    }
    
    function trimToFirstAndLastKeys(theLayer, doLocked, addLastFrame) {
        var theComp = theLayer.containingComp;
        var compStart = theComp.displayStartTime;
        var compEnd = compStart + theComp.duration;

        var theProps = getPropertiesWithKeyFramesFromLayer(theLayer, false);

        var firstTime = Math.max(theLayer.inPoint, theLayer.outPoint);
        var lastTime = Math.min(theLayer.inPoint, theLayer.outPoint);

        if (theLayer.locked && doLocked) {
            theLayer.wasLocked = true;
            theLayer.locked = false;
        }
        
        if (!theLayer.locked) {
            for (var p = 0; p < theProps.length; p++) {
                var prop = theProps[p];
                firstTime = Math.min(prop.keyTime(1), firstTime);
                lastTime = Math.max(prop.keyTime(prop.numKeys), lastTime);
                if (addLastFrame){
                    // add a frame if the ctrl key was down
                    lastTime += theComp.frameDuration;
                }
            }
            theLayer.inPoint = firstTime;
            theLayer.outPoint = lastTime;
        }
        
        if (theLayer.wasLocked) {
            // put stuff back like we found it
            theLayer.wasLocked = undefined;
            theLayer.locked = true;
        }
    }
    //   check for modifyer keys
    var doLockedLayers = ScriptUI.environment.keyboardState.shiftKey;
    var includeLastFrame = ScriptUI.environment.keyboardState.ctrlKey;
    // do the things
    app.beginUndoGroup("Trim to first and last KF");
        doSomethingWithSelectedLayersOrAllIfNoneSelected(trimToFirstAndLastKeys, doLockedLayers, includeLastFrame);
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
