//@target aftereffects
(function (thisObj) {
    var scriptName = "facts-n-figures";
    var versionNum = 0.1;
    var prefs = Preferences(scriptName);

    function buildGUI(thisObj) {
        // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
        var pal =
            thisObj instanceof Panel
                ? thisObj
                : new Window("palette", thisObj.scriptTitle, undefined, {
                    resizeable: true,
                });
        // ----------------------- UI Elements here ---------------------
        // ----------dropDownList-------------------
        var methods = ["Layer bounds", "Comp bounds", "Work area", "First and last KFs"];
        var methodDD = pal.add(
            "dropdownlist",
            [undefined, undefined, 180, 22],
            methods
        );
        methodDD.name = "Calculation duration";
        methodDD.selection = prefs.getPref(methodDD);

        //-----------CheckBox-----------------------
        var maxChkBx = pal.add(
            "checkbox",
            [undefined, undefined, 180, 22],
            "max"
        );
        var minChkBx = pal.add(
            "checkbox",
            [undefined, undefined, 180, 22],
            "min"
        );
        var avChkBx = pal.add(
            "checkbox",
            [undefined, undefined, 180, 22],
            "average"
        );
        var medChkBx = pal.add(
            "checkbox",
            [undefined, undefined, 180, 22],
            "median"
        );
        var afterExpChkBx = pal.add(
            "checkbox",
            [undefined, undefined, 180, 22],
            "After expressions"
        );

        var precision = TextSlider(
            (container = pal),
            (name = "precision"),
            (val = 1),
            (min = 0.1),
            (max = 100),
            (callback = function () {
                prefs.setPref(this);
                doTheThings(
                    methodDD.selection,
                    maxChkBx.value,
                    minChkBx.value,
                    avChkBx.value,
                    medChkBx.value,
                    this.getVal(),
                    afterExpChkBx.value
                )
            }),
            (precision = 1),
            (dimensions = {
                width: 180,
                height: 22,
                sliderHeight: 12,
                sliderProportion: 0.5,
            }),
            (prefs = prefs)
        );

        //-----------Button-------------------------
        var doTheThingsBtn = pal.add(
            "button",
            [undefined, undefined, 180, 22],
            "Calculate"
        );

        // ---------- UI Call backs -------------------
        methodDD.onChange =
            maxChkBx.onClick =
            minChkBx.onClick =
            avChkBx.onClick =
            medChkBx.onClick =
            doTheThingsBtn.onClick =
            function () {
                prefs.setPref(this);
                doTheThings(
                    methodDD.selection.index,
                    maxChkBx.value,
                    minChkBx.value,
                    avChkBx.value,
                    medChkBx.value,
                    precision.getVal(),
                    afterExpChkBx.value
                )
            };

        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    }

    //---------------------------- functions n shit ---------------------
    function doTheThings(
        method,
        doMax,
        doMin,
        doAv,
        doMed,
        precision,
        afterExpressions
    ) {
        app.beginUndoGroup(scriptName);

        var theComp = app.project.activeItem;
        if (theComp) {
            var theProps = theComp.selectedProperties;
            for (var p = 0; p < theProps.length; p++) {
                var timeSpan = calculateTimeSpan(method, theProps[p], theComp);
                var stats = Stats(theComp, theProps[p], timeSpan, precision, afterExpressions);
                alert(
                    ((doMax) ? "max " + stats.max : "") +
                    ((doMin) ? "\nmin: " + stats.min : "") +
                    ((doAv) ? "\nav: " + stats.average : "") +
                    ((doMed) ? "\nmed: " + stats.median : "")
                )
            }
        }
        app.endUndoGroup();
    }

    function findLayer(theProperty) {
        // gets the layer a property is on
        var p = theProperty;
        var pa = theProperty.parentProperty;
        while (pa) {
            p = pa;
            pa = pa.parentProperty;
        }
        return p
    }

    function calculateTimeSpan(method, prop, theComp) {
        //  methods = ["Layer bounds", "Comp bounds", "Work area", "First and last KFs"];
        switch (method) {
            case 0:
                var theLayer = findLayer(prop);
                return { start: theLayer.inPoint, end: theLayer.outPoint };
            case 1:
                return { start: 0, end: theComp.duration };
            case 2:
                return { start: theComp.workAreaStart, end: theComp.workAreaDuration + theComp.workAreaStart };
            case 3:
                if (prop.numKeys > 1) {
                    return { start: prop.keyTime(1), end: prop.keyTime(prop.numKeys) };
                } else {
                    return { start: 0, end: 0 };
                }
        }
    }

    function Stats(theComp, theProperty, timeSpan, precision, afterExpressions) {
        var valueType = theProperty.propertyValueType;
        // try {
        switch (valueType) {
            case PropertyValueType.ThreeD_SPATIAL:
            // Array of three floating-point positional values. For example, an Anchor Point value might be [10.0, 20.2, 0.0]
            case PropertyValueType.ThreeD:
                // Array of three floating-point quantitative values. For example, a Scale value might be [100.0, 20.2, 0.0]
                this.dimensions = 3;
                break;
            case PropertyValueType.TwoD_SPATIAL:
            // Array of 2 floating-point positional values. For example, an Anchor Point value might be [5.1, 10.0]
            case PropertyValueType.TwoD:
                // Array of 2 floating-point quantitative values. For example, a Scale value might be [5.1, 100.0]
                this.dimensions = 2;
                break;
            case PropertyValueType.OneD:
            // A floating-point value.
            case PropertyValueType.LAYER_INDEX:
            // Integer; a value of 0 means no layer.
            case PropertyValueType.MASK_INDEX:
                // Integer; a value of 0 means no mask.
                this.dimensions = 1
                break;
            case PropertyValueType.COLOR:
            //Array of 4 floating-point values in the range [0.0..1.0]. For example, [0.8, 0.3, 0.1, 1.0]
            case PropertyValueType.NO_VALUE:
            // Stores no data.
            case PropertyValueType.CUSTOM_VALUE:
            // Custom property value, such as the Histogram property for the Levels effect.
            case PropertyValueType.MARKER:
            // MarkerValue object
            case PropertyValueType.SHAPE:
            // Shape object
            case PropertyValueType.TEXT_DOCUMENT:
                // TextDocument object
                this.dimensions = 0;
        }
        if (this.dimensions > 0) {
            this.values = [];
            for (var t = timeSpan.start; t < timeSpan.end; t += theComp.frameDuration / precision) {
                this.values.push(
                    (this.dimensions > 1) ?
                        theProperty.valueAtTime(t, afterExpressions) :
                        [theProperty.valueAtTime(t, afterExpressions)]
                );
            }
            this.max = [];
            this.min = [];
            this.average = [];
            this.cumulative = [];
            this.median = [];
            for (var d = 0; d < this.dimensions; d++) {
                this.max = this.values[d];
                this.min = this.values[d];
                this.average = this.values[d];
                this.cumulative[d] = 0;

                for (var v = d; v < this.values.length; v += this.dimensions) {
                    this.max[d] = Math.max(this.max[d], this.values[d]);
                    this.min[d] = Math.min(this.min[d], this.values[d]);
                    this.cumulative[d] += this.values[d];
                }
                this.average[d] = this.cumulative[d] / this.values.length;
                this.median[d] = this.values[Math.round(this.values.length / 2)];
            }
            this.status = "Stats updated"
        } else {
            this.min = this.max = this.average = this.median = null;
            this.status = "Cannot calculate stats for this kind of property."
        }
        // } catch (e) {
        //     this.status = "Error: " + e;
        // }
        return this;
    }
    // -----------------Text Slider------------------------------------------
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
