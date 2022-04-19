// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

(function (thisObj) {
    scriptTitle = "copyMultiLayer";

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
    //make key but don't set attributes
    // eslint-disable-next-line no-unused-vars
    function makeKeyAtTime(theProperty, keyAttributes, keyTime) {
        theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
    }

    //set attributes
    // eslint-disable-next-line no-unused-vars
    function setKeyAttributes(theProperty, keyAttributes, keyTime) {
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

        if (keyAttributes.isSpatial) {
            theProperty.setSpatialTangentsAtKey(
                newKeyIndex,
                keyAttributes.keyInSpatialTangent,
                keyAttributes.keyOutSpatialTangent
            );
        }
        return newKeyIndex;
    }

    //set attribute in reverse
    // eslint-disable-next-line no-unused-vars
    function setKeyAttributesReversed(theProperty, keyAttributes, keyTime) {
        var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class
        if (keyAttributes.canInterp) {
            theProperty.setTemporalEaseAtKey(
                newKeyIndex,
                keyAttributes.keyOutTemporalEase,
                keyAttributes.keyInTemporalEase
            );
            //important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
            theProperty.setInterpolationTypeAtKey(
                newKeyIndex,
                keyAttributes.keyOutInterpolationType,
                keyAttributes.keyInInterpolationType
            );
        }

        if (keyAttributes.isSpatial) {
            theProperty.setSpatialTangentsAtKey(
                newKeyIndex,
                keyAttributes.keyOutSpatialTangent,
                keyAttributes.keyInSpatialTangent
            );
        }
        return newKeyIndex;
    }

    function defaultFor(arg, val, replaceNullandEmptyVals) {
        //eslint-disable-line no-unused-vars
        if (replaceNullandEmptyVals) {
            return typeof arg !== "undefined" || arg === null || arg === []
                ? val
                : arg;
        }
        return typeof arg !== "undefined" ? arg : val;
    }

    function getIndividualProperties(theProps) {
        // recursively extracts individual properties from a property group.
        var props = [];
        for (var p = 0; p <= theProps.length; p++) {
            if (theProps[p]) {
                var propertyGroup = theProps[p];
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        props.push(newProps[i]);
                    }
                }
            }
        }
        return props;
    }

    function getSelectedKeys(theComp) {
        //the object this function will return: an array of keys and the first key's time
        var theKeys = {
            keys: [],
            firstSelectedKeyTime: null,
            lastSelectedKeyTime: null,
        };
        var theComp = defaultFor(theComp, app.project.activeItem, true);
        var selLayers = theComp.selectedLayers;

        //drill down to get to the keys:
        for (var i = 0; i < selLayers.length; i++) {
            var selectedProps = selLayers[i].selectedProperties;
            for (var j = 0; j < selectedProps.length; j++) {
                var selectedKeyframes = selectedProps[j].selectedKeys;
                for (var k = 0; k < selectedKeyframes.length; k++) {
                    //get the attributes of the selected key - note that the key list is 1-indexed WTF adobe?
                    var theAttributes = getKeyAttributes(
                        selectedProps[j],
                        selectedKeyframes[k]
                    );
                    if (
                        theKeys.firstSelectedKeyTime === null ||
                        theAttributes.keyTime < theKeys.firstSelectedKeyTime
                    ) {
                        theKeys.firstSelectedKeyTime = theAttributes.keyTime;
                    }
                    if (
                        theKeys.lastSelectedKeyTime === null ||
                        theAttributes.keyTime > theKeys.lastSelectedKeyTime
                    ) {
                        theKeys.lastSelectedKeyTime = theAttributes.keyTime;
                    }
                    //add a new object to the array of keys:
                    theKeys.keys.push({
                        layerIndex: selLayers[i].index,
                        prop: selectedProps[j],
                        attributes: theAttributes,
                    });
                }
            }
        }
        return theKeys;
    }

    function copyTimeSlice(theComp) {
        var theProps = [];
        var theVals = [];
        theComp = defaultFor(theComp, app.project.activeItem, true);
        var selLayers = theComp.selectedLayers;
        for (var layer = 0; layer < selLayers.length; layer++) {
            var theLayer = selLayers[layer];
            theProps.push = theLayer.selectedProperties;
        }
        var individualProps = getIndividualProperties(theProps);
        for (var prop = 0; prop < individualProps.length; prop++) {
            theVals.push({
                prop: individualProps[prop],
                val: individualProps[prop].value,
            });
        }
        return theVals;
    }

    function pasteTimeSlice(theVals, theComp) {
        theComp = defaultFor(theComp, app.project.activeItem, true);
        for (var i = 0; i < theVals.length; i++) {
            theVals[i].prop.setValueAtTime(theComp.time, theVals[i].val);
        }
    }

    buildGUI = function (thisObj) {
        // theCopiedKeys = prefs.readFromPrefs();
        var pal =
            thisObj instanceof Panel
                ? thisObj
                : new Window("palette", scriptTitle, undefined, {
                    resizeable: true,
                });
        pal.alignChildren = ["left", "top"];
        //text = "vers. 0.1.1";
        var beforeBtnImg = "copy_multi/before-ph.png";
        var afterBtnImg = "copy_multi/after-ph.png";
        var beforePH = ScriptUI.newImage(
            beforeBtnImg,
            undefined,
            beforeBtnImg,
            afterBtnImg
        );
        var afterPH = ScriptUI.newImage(
            afterBtnImg,
            undefined,
            afterBtnImg,
            beforeBtnImg
        );

        var row1 = pal.add(
            "group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fill']}"
        );
        var row2 = pal.add(
            "group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fill']}"
        );
        var row3 = pal.add(
            "group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fill']}"
        );

        var copyPasteBttn = row1.add(
            "iconbutton",
            {
                x: undefined,
                y: undefined,
                width: 32,
                height: 32,
            },
            File("copy_multi/copy-paste.png")
        );

        var copyPasteRevBttn = row1.add(
            "iconbutton",
            {
                x: undefined,
                y: undefined,
                width: 32,
                height: 32,
            },
            File("copy_multi/copy-paste_rev.png")
        );

        var copyTimeSliceBttn = row2.add(
            "iconbutton",
            {
                x: undefined,
                y: undefined,
                width: 32,
                height: 32,
            },
            File("copy_multi/copy-TS.png")
        );
        var pasteTimeSliceBttn = row2.add(
            "iconbutton",
            {
                x: undefined,
                y: undefined,
                width: 32,
                height: 32,
            },
            File("copy_multi/paste-TS.png")
        );

        var beforeAfterToggle = row3.add(
            "iconbutton",
            {
                x: undefined,
                y: undefined,
                width: 32,
                height: 32,
            },
            afterPH,
            {
                style: "toolbutton",
                toggle: true,
            }
        );
        // copyBttn.helpTip = "copy";
        // pasteBttn.helpTip = "paste";
        // pasteRevBttn.helpTip = "paste reversed";
        copyPasteBttn.helpTip = "copy + paste";
        copyPasteRevBttn.helpTip = "copy + paste reversed";
        beforeAfterToggle.helpTip =
            "paste reversed keys before / after playhead";
        copyTimeSliceBttn.helpTip = "copy time slice of selected layers";
        pasteTimeSliceBttn.helpTip = "paste time slice as keyframes";
        copyPasteBttn.onClick = function () {
            var theComp = app.project.activeItem;
            if (theComp instanceof CompItem) {
                app.beginUndoGroup("copy and paste Keys");
                var theCopiedKeys = getSelectedKeys(theComp);
                // prefs.saveToPrefs(theCopiedKeys);
                pasteKeys(theCopiedKeys, beforeAfterToggle.value, theComp);
                app.endUndoGroup();
                // pasteBttn.enabled = true;
                // pasteRevBttn.enabled = true;
            }
        };

        copyPasteRevBttn.onClick = function () {
            var theComp = app.project.activeItem;
            if (theComp instanceof CompItem) {
                app.beginUndoGroup("copy and paste Keys");
                theCopiedKeys = getSelectedKeys(theComp);
                // prefs.saveToPrefs(theCopiedKeys);
                pasteKeysReverse(
                    theCopiedKeys,
                    beforeAfterToggle.value,
                    theComp
                );
                app.endUndoGroup();
                // pasteBttn.enabled = true;
                // pasteRevBttn.enabled = true;
            }
        };

        beforeAfterToggle.onClick = function () {
            if (beforeAfterToggle.value) {
                beforeAfterToggle.image = beforePH;
            } else {
                beforeAfterToggle.image = afterPH;
            }
        };

        copyTimeSliceBttn.onClick = function () {
            var theComp = app.project.activeItem;
            if (theComp instanceof CompItem) {
                var timeSlice = copyTimeSlice(theComp);
                pasteTimeSliceBttn.enabled = true;
            }
        };

        pasteTimeSliceBttn.onClick = function () {
            var theComp = app.project.activeItem;
            if (theComp instanceof CompItem) {
                pasteTimeSlice(timeSlice, theComp);
            }
        };
        //-------end of the buttons, build the GUI-----------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    };
    //--------------------now for the real hoo-ha------------------

    pasteKeys = function (theCopiedKeys, beforePlayHead, theComp) {
        if (theCopiedKeys !== null) {
            for (var i = 0; i < theCopiedKeys.keys.length; i++) {
                var theKey = theCopiedKeys.keys[i];
                var offsetTime =
                    theKey.attributes.keyTime -
                    theCopiedKeys.lastSelectedKeyTime;
                if (beforePlayHead !== true) {
                    offsetTime =
                        theKey.attributes.keyTime -
                        theCopiedKeys.firstSelectedKeyTime;
                }
                makeKeyWithAttributes(
                    theKey.prop,
                    theKey.attributes,
                    theComp.time + offsetTime
                );
            }
        }
    };

    pasteKeysReverse = function (theCopiedKeys, beforePlayHead, theComp) {
        if (theCopiedKeys !== null) {
            for (var i = 0; i < theCopiedKeys.keys.length; i++) {
                var theKey = theCopiedKeys.keys[i];
                if (beforePlayHead === true) {
                    var offsetTime =
                        theKey.attributes.keyTime -
                        theCopiedKeys.firstSelectedKeyTime;
                    makeKeyAtTime(
                        theKey.prop,
                        theKey.attributes,
                        theComp.time - offsetTime
                    );
                } else {
                    offsetTime =
                        theCopiedKeys.lastSelectedKeyTime -
                        theKey.attributes.keyTime;
                    makeKeyAtTime(
                        theKey.prop,
                        theKey.attributes,
                        theComp.time + offsetTime
                    );
                }
            }
            for (var k = 0; k < theCopiedKeys.keys.length; k++) {
                var theNewKey = theCopiedKeys.keys[k];
                if (beforePlayHead === true) {
                    offsetTime =
                        theNewKey.attributes.keyTime -
                        theCopiedKeys.firstSelectedKeyTime;
                    setKeyAttributesReversed(
                        theNewKey.prop,
                        theNewKey.attributes,
                        theComp.time - offsetTime
                    );
                } else {
                    offsetTime =
                        theCopiedKeys.lastSelectedKeyTime -
                        theNewKey.attributes.keyTime;
                    setKeyAttributesReversed(
                        theNewKey.prop,
                        theNewKey.attributes,
                        theComp.time + offsetTime
                    );
                }
            }
        }
    };

    getSelectedKeys = function (theComp) {
        //the object this function will return: an array of keys and the first key's time
        var theKeys = {
            keys: [],
            firstSelectedKeyTime: null,
            lastSelectedKeyTime: null,
        };
        var selLayers = theComp.selectedLayers;

        //drill down to get to the keys:
        for (var i = 0; i < selLayers.length; i++) {
            var selectedProps = selLayers[i].selectedProperties;
            for (var j = 0; j < selectedProps.length; j++) {
                var selectedKeyframes = selectedProps[j].selectedKeys;
                if (selectedKeyframes) {
                    for (var k = 0; k < selectedKeyframes.length; k++) {
                        //get the attributes of the selected key - note that the key list is 1-indexed WTF adobe?
                        var theAttributes = getKeyAttributes(
                            selectedProps[j],
                            selectedKeyframes[k]
                        );
                        if (
                            theKeys.firstSelectedKeyTime === null ||
                            theAttributes.keyTime < theKeys.firstSelectedKeyTime
                        ) {
                            theKeys.firstSelectedKeyTime =
                                theAttributes.keyTime;
                        }
                        if (
                            theKeys.lastSelectedKeyTime === null ||
                            theAttributes.keyTime > theKeys.lastSelectedKeyTime
                        ) {
                            theKeys.lastSelectedKeyTime = theAttributes.keyTime;
                        }
                        //add a new object to the array of keys:
                        theKeys.keys.push({
                            layerIndex: selLayers[i].index,
                            prop: selectedProps[j],
                            attributes: theAttributes,
                        });
                    }
                }
            }
        }
        return theKeys;
    };

    copyTimeSlice = function (theComp) {
        var theProps = [];
        var theVals = [];
        theComp = defaultFor(theComp, app.project.activeItem, true);
        var selLayers = theComp.selectedLayers;
        for (var layer = 0; layer < selLayers.length; layer++) {
            var theLayer = selLayers[layer];
            var selProps = getIndividualProperties(theLayer.selectedProperties);
            for (var p = 0; p < selProps.length; p++) {
                theProps.push(selProps[p]);
            }
        }
        for (var prop = 0; prop < theProps.length; prop++) {
            theVals.push({ prop: theProps[prop], val: theProps[prop].value });
        }
        return theVals;
    };

    pasteTimeSlice = function (theVals, theComp) {
        app.beginUndoGroup("paste Time Slice");
        if (theVals) {
            theComp = defaultFor(theComp, app.project.activeItem, true);
            for (var i = 0; i < theVals.length; i++) {
                theVals[i].prop.setValueAtTime(theComp.time, theVals[i].val);
            }
        }
        app.endUndoGroup();
    };

    defaultFor = function (arg, val, replaceNullandEmptyVals) {
        //eslint-disable-line no-unused-vars
        if (replaceNullandEmptyVals) {
            return typeof arg !== "undefined" || arg === null || arg === []
                ? val
                : arg;
        }
        return typeof arg !== "undefined" ? arg : val;
    };

    getIndividualProperties = function (theProps) {
        // recursively extracts individual properties from a property group.
        var props = [];
        for (var p = 0; p <= theProps.length; p++) {
            if (theProps[p]) {
                var propertyGroup = theProps[p];
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        props.push(newProps[i]);
                    }
                }
            }
        }
        return props;
    };

    traversePropertyGroups = function (pGroup, inclusive) {
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
    };

    getKeyAttributes = function (theProperty, keyIndex) {
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
    };

    //make key but don't set attributes
    makeKeyAtTime = function (theProperty, keyAttributes, keyTime) {
        theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
    };

    makeKeyWithAttributes = function (theProperty, keyAttributes, keyTime) {
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
    };

    //set attributes
    setKeyAttributes = function (theProperty, keyAttributes, keyTime) {
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

        if (keyAttributes.isSpatial) {
            theProperty.setSpatialTangentsAtKey(
                newKeyIndex,
                keyAttributes.keyInSpatialTangent,
                keyAttributes.keyOutSpatialTangent
            );
        }
        return newKeyIndex;
    };

    //set attribute in reverse
    setKeyAttributesReversed = function (theProperty, keyAttributes, keyTime) {
        var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class
        if (keyAttributes.canInterp) {
            theProperty.setTemporalEaseAtKey(
                newKeyIndex,
                keyAttributes.keyOutTemporalEase,
                keyAttributes.keyInTemporalEase
            );
            //important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
            theProperty.setInterpolationTypeAtKey(
                newKeyIndex,
                keyAttributes.keyOutInterpolationType,
                keyAttributes.keyInInterpolationType
            );
        }
    };

    makeKeyAtTime = function (theProperty, keyAttributes, keyTime) {
        theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
    };

    // prefs = new PrefsFile(scriptTitle);
    buildGUI(thisObj);
})(this);

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
