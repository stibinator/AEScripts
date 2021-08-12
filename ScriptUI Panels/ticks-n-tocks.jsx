//@target aftereffects
(function (thisObj) {
    var scriptName = "ticks-n-tocks";
    var versionNum = 0.1;
    var methods = [
        "frames",
        "seconds",
        "BPM",
        "work area division",
        "comp division",
    ];
    var prefs = Preferences(scriptName);

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
        var oldKeyAttributes = [];
        var newKeyTimes = [];
        for (var i = theKeyIndexes.length - 1; i >= 0; i--) {
            newKeyTimes.push(
                Math.floor(theProp.keyTime(theKeyIndexes[i]) / beat) * beat
            );
            oldKeyAttributes.push(getKeyAttributes(theProp, theKeyIndexes[i]));
            theProp.removeKey(theKeyIndexes[i]);
        }
        for (var i = 0; i < newKeyTimes.length; i++) {
            makeKeyWithAttributes(theProp, oldKeyAttributes[i], newKeyTimes[i]);
        }
    }

    function quantise(method, beatLength) {
        app.beginUndoGroup(scriptName);
        var theComp = app.project.activeItem;
        var beat;
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
            switch (methods[method]) {
                case "frames":
                    beat = theComp.frameDuration * beatLength;
                    break;
                case "seconds":
                    beat = beatLength;
                    break;
                case "BPM":
                    beat = 60 / beatLength;
                    break;
                case "work area division":
                    beat = theComp.workAreaDuration / beatLength;
                    break;
                case "comp division":
                    beat = theComp.duration / beatLength;
                    break;
            }

            for (var p = 0; p < theProps.length; p++) {
                var theProp = theProps[p];
                var indices = [];
                // if there are keys selected
                if (theProp.selectedKeys.length > 0) {
                    var indices = theProp.selectedKeys;
                    // if the property is selected but no keys (can this happen?)
                } else {
                    for (var i = 1; i <= theProp.numKeys; i++) {
                        indices.push(i);
                    }
                }
                quantiseKeytimes(theComp, theProp, indices, beat);
            }
        }
        app.endUndoGroup();
    }

    // ======================UI=============================================
    function buildGUI(thisObj) {
        // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
        var pal =
            thisObj instanceof Panel
                ? thisObj
                : new Window("palette", thisObj.scriptTitle, undefined, {
                      resizeable: true,
                  });
        // ----------------------- UI Elements here ---------------------
        var settingsGrp = pal.add("group");
        settingsGrp.orientation = "row";

        var methodDD = settingsGrp.add(
            "dropdownlist",
            [undefined, undefined, 130, 22],
            methods
        );
        methodDD.name = "methodDD";
        methodDD.selection = prefs.getPref(methodDD);

        var quantiseLengthText = settingsGrp.add("editText", undefined, "1");
        quantiseLengthText.preferredSize.width = 40;
        quantiseLengthText.name = "quantiseLengthText";
        quantiseLengthText.text = prefs.getPref(quantiseLengthText) || "1";
        quantiseLengthText.onChange = function () {
            quantiseLengthText.text = getLength();
            prefs.setPref(quantiseLengthText);
        };
        var doTheThingsBtn = pal.add(
            "button",
            [undefined, undefined, 180, 22],
            "Quantise"
        );
        // UI Callbacks
        doTheThingsBtn.onClick = function () {
            doTheThings(methodDD.selection);
        };

        methodDD.onChange = function () {
            var oldMethod = methodDD.savedPref;
            if (oldMethod !== null) {
                var newVal;
                switch (methods[oldMethod]) {
                    case "frames":
                        if (app.project.activeItem) {
                            newVal =
                                getLength() *
                                app.project.activeItem.frameDuration;
                        }
                        break;
                    case "seconds":
                        newVal = getLength();
                        break;
                    case "BPM":
                        newVal = 60 / getLength();
                        break;
                    case "work area division":
                        if (app.project.activeItem) {
                            newVal =
                                app.project.activeItem.workAreaDuration /
                                getLength();
                        }
                        break;
                    case "comp division":
                        if (app.project.activeItem) {
                            newVal = theComp.duration / getLength();
                        }
                        break;
                }
                if (newVal) {
                    switch (methods[this.selection.index]) {
                        case "frames":
                            if (app.project.activeItem) {
                                quantiseLengthText.text = newVal/ app.project.activeItem.frameDuration;
                            }
                            break;
                        case "seconds":
                            quantiseLengthText.text = newVal;
                            break;
                        case "BPM":
                            quantiseLengthText.text = 60 / newVal;

                            break;
                        case "work area division":
                            if (app.project.activeItem) {
                                quantiseLengthText.text = app.project.activeItem.workAreaDuration / newVal
                            }
                            break;
                        case "comp division":
                            if (app.project.activeItem) {
                                quantiseLengthText.text = app.project.activeItem.duration / newVal;
                            }
                            break;
                    }
                }
            }
            prefs.setPref(this);
        };
        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
        function getLength() {
            var val = parseFloat(quantiseLengthText.text);
            if (isNaN(val)) {
                quantiseLengthText.text = quantiseLengthText.savedPref || 1;
                val = parseFloat(quantiseLengthText.text);
            }
            return val;
        }

        function doTheThings() {
            quantise(methodDD.selection.index, getLength());
        }
    }

    //---------------------------- functions n shit ---------------------

    //slider with textBox + bells + whistles
    function TextSlider(
        container,
        name,
        val,
        min,
        max,
        callback,
        precision,
        dimensions,
        prefs
    ) {
        if (!dimensions) {
            dimensions = {};
        }
        dimensions.width = dimensions.width || 180;
        dimensions.height = dimensions.height || 22;
        dimensions.sliderHeight = dimensions.sliderHeight || 12;
        dimensions.sliderProportion = dimensions.sliderProportion || 0.75;

        this.grp = container.add("group", undefined);
        this.grp.orientation = "row";
        this.grp.preferredSize.width = dimensions.width;
        this.grp.preferredSize.height = dimensions.height;
        this.slidr = grp.add("slider", undefined, val, min, max);
        this.slidr.name = name;
        this.slidr.preferredSize.width =
            dimensions.width * dimensions.sliderProportion - 10;
        this.slidr.preferredSize.height = dimensions.sliderHeight;
        this.editText = grp.add("edittext", undefined, val.toFixed(precision));
        this.editText.preferredSize.width =
            dimensions.width * (1 - dimensions.sliderProportion);
        this.editText.preferredSize.height = dimensions.height;
        this.editText.precision = precision;
        this.editText.slider = this.slidr;
        this.slidr.editText = this.editText;
        this.slidr.prefs = prefs;
        if (prefs) {
            this.slidr.value = prefs.getPref(this.slidr) || val;
            this.editText.text = this.slidr.value.toFixed(
                this.editText.precision
            );
        }
        this.editText.onChange = function () {
            try {
                var newVal = parseFloat(this.text);
                if (isNaN(newVal)) {
                    this.text = this.slider.value.toFixed(this.precision);
                } else {
                    this.slider.value = newVal;
                }
            } catch (e) {
                // ??
            }
            if (this.slider.prefs) {
                this.slider.prefs.setPref(this.slider);
            }
            if (callback) {
                callback();
            }
        };
        this.slidr.onChanging = function () {
            this.editText.text = this.value.toFixed(this.editText.precision);
        };
        this.slidr.onChange = function () {
            this.editText.text = this.value.toFixed(this.editText.precision);
            if (this.prefs) {
                this.prefs.setPref(this);
            }
            if (callback) {
                callback();
            }
        };
        this.setVal = function (val) {
            this.slidr.value = val;
            this.editText.text = val.toFixed(this.precision);
        };
        this.getVal = function () {
            return this.slidr.value;
        };
        return this;
    }

    //---------------------------- ui prefs -----------------------------
    function Preferences(scriptName) {
        // look for preferences for this object
        // provide a setPref function to allow values to be stored in AE's preferences
        // scriptName sets the section of the preference file they are saved in.
        this.prefsName = scriptName;
        parsePref = function (val, prefType) {
            switch (prefType) {
                case "integer":
                case "int":
                    return parseInt(val, 10);
                case "float":
                    return parseFloat(val);
                case "bool":
                    return val === "true";
                default:
                    return val;
            }
        };

        this.setPref = function (anObject) {
            var currentVal;
            if (anObject.name) {
                if (anObject.hasOwnProperty("value")) {
                    currentVal = anObject.value;
                } else if (anObject.hasOwnProperty("selection")) {
                    currentVal = anObject.selection.index;
                } else if (anObject instanceof EditText) {
                    currentVal = anObject.text;
                } else {
                    throw "objects must have a 'text' or 'value' property to set preferences";
                }

                if (anObject.savedPref !== currentVal) {
                    anObject.savedPref = currentVal;
                    app.settings.saveSetting(
                        this.prefsName,
                        anObject.name,
                        currentVal
                    );
                }
            }
        };

        this.getPref = function (anObject) {
            if (anObject.name) {
                if (app.settings.haveSetting(this.prefsName, anObject.name)) {
                    // get prefs for UI control
                    var prefType;
                    if (anObject instanceof Slider) {
                        prefType = "float";
                    } else if (
                        anObject instanceof Checkbox ||
                        anObject instanceof RadioButton
                    ) {
                        prefType = "bool";
                    } else if (anObject instanceof DropDownList) {
                        prefType = "int";
                    } else if (anObject instanceof EditText) {
                        prefType = "string";
                    } else {
                        // objects can use specified pref types with the type of the returned result determined by a preftype property
                        // otherwise the default is a string
                        prefType = anObject.prefType;
                    }
                    var result = (anObject.savedPref = this.parsePref(
                        app.settings.getSetting(this.prefsName, anObject.name),
                        prefType
                    ));
                }
                return result;
            } else {
                throw "objects must have a name to be given prefs.";
            }
        };
        return this;
    }

    //--------------------- go ahead and run ----------------------
    buildGUI(thisObj);
})(this);
