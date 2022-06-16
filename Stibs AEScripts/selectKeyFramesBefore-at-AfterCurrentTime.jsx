// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    var theComp = app.project.activeItem;
    var BEFORE = ScriptUI.environment.keyboardState.shiftKey;
    var AFTER = ScriptUI.environment.keyboardState.altKey;
    var AT = !BEFORE && !AFTER
    if (theComp) {
        var theLayers = theComp.selectedLayers;
        if (theLayers.length === 0) {
            for (var i = 1; i <= theComp.numLayers; i++) {
                theLayers.push(theComp.layer(i));
            }
        }
        for (var lyr = 0; lyr < theLayers.length; lyr++) {
            var curLyr = theLayers[lyr];
            var props = getPropertiesWithKeyFramesFromLayer(curLyr, false);
            for (var p = 0; p < props.length; p++) {
                var theProp = props[p];
                for (var k = 1; k <= theProp.numKeys; k++)
                    try {
                        if (BEFORE) {
                            theProp.setSelectedAtKey(
                                k,
                                theProp.keyTime(k) < theComp.time
                            )
                        }
                        if (AFTER) {
                            theProp.setSelectedAtKey(
                                k,
                                theProp.keyTime(k) > theComp.time
                            )
                        }
                        if (AT) {
                            // select all keys that happen during the current frame, 
                            // which means up to, but not including, 1 frame later than current time
                            theProp.setSelectedAtKey(
                                k,
                                (theProp.keyTime(k) - theComp.time) < theComp.frameDuration &&
                                (theProp.keyTime(k) >= theComp.time)
                            )
                        }

                    } catch (e) {
                        // writln(e);
                    }
            }
        }
    }
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
