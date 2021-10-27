// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// snaps keyframes to frame boundaries. Useful to avoid problems when you have more than one keyframe per frame
// if you select some keyframes it will quantise just them,
//  or if you select a layer it will quantise all the keyframes in the layer
// or if nothing is selected it will quantise all the keys in the comp.
// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

/* global getKeyAttributes, makeKeyWithAttributes, getPropertiesWithKeyFramesFromLayer, app, CompItem */

(function () {
    function makeRange(a, b, step) {
        var A = [];
        A[0] = a;
        step = step || 1;
        while (a + step <= b) {
            a += step;
            A[A.length] = a;
        }
        return A;
    };

    function getKeyAttributes(theProperty, keyIndex) {
        //in lieu of a proper keyframe object this returns all the details of a keyframe, given a property and key index.
        var theAttributes = {};
        theAttributes.keyTime = theProperty.keyTime(keyIndex);
        theAttributes.keyVal = theProperty.keyValue(keyIndex);
        theAttributes.canInterp =
            theProperty.isInterpolationTypeValid(
                KeyframeInterpolationType.BEZIER
            ) ||
            theProperty.isInterpolationTypeValid(
                KeyframeInterpolationType.HOLD
            ) ||
            theProperty.isInterpolationTypeValid(
                KeyframeInterpolationType.LINEAR
            );
        if (theAttributes.canInterp) {
            theAttributes.keyInInterpolationType =
                theProperty.keyInInterpolationType(keyIndex);
            theAttributes.keyOutInterpolationType =
                theProperty.keyOutInterpolationType(keyIndex);
            if (theAttributes.keyInInterpolationType) {
                theAttributes.keyInTemporalEase =
                    theProperty.keyInTemporalEase(keyIndex);
                theAttributes.keyOutTemporalEase =
                    theProperty.keyOutTemporalEase(keyIndex);
            }
        }
        //ignore spatial tangents for things like masks
        theAttributes.isSpatial =
            theProperty.isSpatial &&
            (theProperty.propertyValueType ==
                PropertyValueType.ThreeD_SPATIAL ||
                theProperty.propertyValueType ==
                    PropertyValueType.TwoD_SPATIAL);

        if (theAttributes.isSpatial) {
            theAttributes.keyInSpatialTangent =
                theProperty.keyInSpatialTangent(keyIndex);
            theAttributes.keyOutSpatialTangent =
                theProperty.keyOutSpatialTangent(keyIndex);
        }
        return theAttributes;
    }

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

    function makeKeyWithAttributes(theProperty, keyAttributes, keyTime) {
        //turns theAttributes from getKeyAttributes into a new keyframe
        if (theProperty.canVaryOverTime) {
            try {
                theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
                var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class

                if (keyAttributes.canInterp) {
                    theProperty.setTemporalEaseAtKey(
                        newKeyIndex,
                        keyAttributes.keyInTemporalEase,
                        keyAttributes.keyOutTemporalEase
                    );
                    //important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
                    theProperty.setInterpolationTypeAtKey(
                        newKeyIndex,
                        keyAttributes.keyInInterpolationType,
                        keyAttributes.keyOutInterpolationType
                    );
                }

                //theProperty.setInterpolationTypeAtKey(theAttributes.keyInInterpolationType-6412, theAttributes.keyOutInterpolationType-6412); //WTF Javascript?
                if (keyAttributes.isSpatial) {
                    theProperty.setSpatialTangentsAtKey(
                        newKeyIndex,
                        keyAttributes.keyInSpatialTangent,
                        keyAttributes.keyOutSpatialTangent
                    );
                }
                return newKeyIndex;
            } catch (e) {
                writeln(e);
                return false;
            }
        } else {
            return false;
        }
    }

    function quantiseKeytimes(theComp, theProp, theKeyIndexes, beat) {
        if (!beat) {
            beat = theComp.frameDuration;
        }
        for (var i = theKeyIndexes.length - 1; i >= 0; i--) {
            var newKeyTime =
                Math.floor(
                    theProp.keyTime(theKeyIndexes[i]) / theComp.frameDuration
                ) * theComp.frameDuration;
            var oldKeyAttributes = getKeyAttributes(theProp, theKeyIndexes[i]);
            theProp.removeKey(theKeyIndexes[i]);
            makeKeyWithAttributes(theProp, oldKeyAttributes, newKeyTime);
        }
    }

    app.beginUndoGroup("quantise keys");
    var theComp = app.project.activeItem;
    if (theComp instanceof CompItem) {
        var theProps = theComp.selectedProperties;
        if (theProps.length === 0) {
            theProps = [];
            // no properties or keys selected, but layers are
            var selectedLyrs = theComp.selectedLayers;
            if (selectedLyrs.length > 0) {
                for (var i = 0; i < selectedLyrs.length; i++) {
                    var layerProps = getPropertiesWithKeyFramesFromLayer(
                        selectedLyrs[i],
                        false
                    );
                    for (var p = 0; p < layerProps.length; p++) {
                        theProps.push(layerProps[p]);
                    }
                }
                // nothing selected, do all layers
            } else {
                for (var i = 1; i <= theComp.numLayers; i++) {
                    var layerProps = getPropertiesWithKeyFramesFromLayer(
                        theComp.layer(i),
                        false
                    );
                    for (var p = 0; p < layerProps.length; p++) {
                        theProps.push(layerProps[p]);
                    }
                }
            }
        }
        for (var p = 0; p < theProps.length; p++) {
            var theProp = theProps[p];
            // if there are keys selected
            if (theProp.selectedKeys.length > 0) {
                var indices = theProp.selectedKeys;
                // if the property is selected but no keys (can this happen?)
            } else {
                var indices = makeRange(1, theProp.numKeys);
            }
            quantiseKeytimes(theComp, theProp, indices);
        }
    }
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
