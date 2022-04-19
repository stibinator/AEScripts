// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    var theComp = app.project.activeItem;
    if (theComp) {
        app.beginUndoGroup("Remove keyframes from properties with only a single KF");
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
                if (theProp.numKeys === 1 && theProp.matchName != "ADBE Time Remapping") {
                    theProp.removeKey(1);
                }
            }
        
        }
        app.endUndoGroup();
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
