//@target aftereffects
(function (thisObj) {
    var scriptName = "facts-n-figures";
    var SCRIPT_ID = "*FnF*";
    var versionNum = 0.1;
    var prefs = Preferences(scriptName);
    var CONTROL_TYPES = [
        "ADBE Slider Control",
        "ADBE Point Control",
        "ADBE Point3D Control",
        "ADBE Color Control"
    ];

    var LOCALISED_NAMES = {
        // localise these bois
        en: {
            max: "Maximum",
            min: "Minimum",
            av: "Average",
            med: "Median",
            afterEx: "After Expressions",
            prec: "Precision",
            calc: "Calculate",
            make: "Make Expression Ctrls",
            onlyKFs: "Only on Keyframes"
        }
    }

    var language = app.isoLanguage.split("_")[0];
    if (language in LOCALISED_NAMES) {
        lang = language;
    } else {
        lang = "en"
    }

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
            [undefined, undefined, 220, 22],
            methods
        );
        methodDD.name = "Calculation duration";
        methodDD.selection = prefs.getPref(methodDD);

        //-----------CheckBox-----------------------
        var chkbxGrp = pal.add("group");
        chkbxGrp.orientation = "column";
        chkbxGrp.spacing = 2;
        var chkBxSize = { x: 8, y: 36, width: 20, height: 20 };
        var et = { x: 30, y: 8, w: 40, h: 24, m: 4 };
        var editTextSize = [
            { x: et.x, y: et.y, width: et.w, height: et.h },
            { x: et.x + (et.w + et.m), y: et.y, width: et.w, height: et.h },
            { x: et.x + (et.w + et.m) * 2, y: et.y, width: et.w, height: et.h },
            { x: et.x + (et.w + et.m) * 3, y: et.y, width: et.w, height: et.h }
        ];//{ left: chkBxSize.width + 12, top: chkBxSize.y - 2, right: panelSize.width - 12, bottom: panelSize.height - 16 };
        var maxChkBxGrp = chkbxGrp.add("panel");
        maxChkBxGrp.text = LOCALISED_NAMES[lang].max;
        maxChkBxGrp.orientation = "row";
        maxChkBxGrp.alignChildren = "center";
        var maxChkBx = maxChkBxGrp.add(
            "checkbox",
            chkBxSize
        );
        maxChkBx.name = "maxChkBx"
        var maxTxt = [
            maxChkBxGrp.add("edittext", editTextSize[0], ""),
            maxChkBxGrp.add("edittext", editTextSize[1], ""),
            maxChkBxGrp.add("edittext", editTextSize[2], ""),
            maxChkBxGrp.add("edittext", editTextSize[3], "")
        ];
        var minChkBxGrp = chkbxGrp.add("panel");
        minChkBxGrp.text = LOCALISED_NAMES[lang].min;
        minChkBxGrp.orientation = "row";
        minChkBxGrp.alignChildren = "center";
        var minChkBx = minChkBxGrp.add(
            "checkbox",
            chkBxSize
        );
        minChkBx.name = "minChkBx"
        var minTxt = [
            minChkBxGrp.add("edittext", editTextSize[0], ""),
            minChkBxGrp.add("edittext", editTextSize[1], ""),
            minChkBxGrp.add("edittext", editTextSize[2], ""),
            minChkBxGrp.add("edittext", editTextSize[3], "")
        ];
        var avChkBxGrp = chkbxGrp.add("panel");
        avChkBxGrp.text = LOCALISED_NAMES[lang].av;
        avChkBxGrp.orientation = "row";
        avChkBxGrp.alignChildren = "center";
        var avChkBx = avChkBxGrp.add(
            "checkbox",
            chkBxSize
        );
        avChkBx.name = "avChkBx"
        var avTxt = [
            avChkBxGrp.add("edittext", editTextSize[0], ""),
            avChkBxGrp.add("edittext", editTextSize[1], ""),
            avChkBxGrp.add("edittext", editTextSize[2], ""),
            avChkBxGrp.add("edittext", editTextSize[3], "")
        ];
        var medChkBxGrp = chkbxGrp.add("panel");
        medChkBxGrp.text = LOCALISED_NAMES[lang].med;
        medChkBxGrp.orientation = "row";
        medChkBxGrp.alignChildren = "center";
        var medChkBx = medChkBxGrp.add(
            "checkbox",
            chkBxSize
        );
        medChkBx.name = "medChkBx"
        var medTxt = [
            medChkBxGrp.add("edittext", editTextSize[0], ""),
            medChkBxGrp.add("edittext", editTextSize[1], ""),
            medChkBxGrp.add("edittext", editTextSize[2], ""),
            medChkBxGrp.add("edittext", editTextSize[3], "")
        ];
        var settingsPanel = pal.add("panel");
        settingsPanel.text = "Settings";
        settingsPanel.spacing = 4;
        var afterExpChkBx = settingsPanel.add(
            "checkbox",
            [undefined, undefined, 220, 22],
            LOCALISED_NAMES[lang].afterEx
        );
        afterExpChkBx.name = "afterExpChkBx"
        var onlyKFsChkBx = settingsPanel.add(
            "checkbox",
            [undefined, undefined, 220, 22],
            LOCALISED_NAMES[lang].onlyKFs
        );
        onlyKFsChkBx.name = "onlyKFsChkBx"
        var precisionPanel = settingsPanel.add("panel");
        precisionPanel.text = "Precision (samples per frame)";
        var precision = TextSlider(
            container = precisionPanel,
            name = LOCALISED_NAMES[lang].prec,
            val = 1,
            min = 0.1,
            max = 100,
            callback = function () {
                // prefs.setPref(this);
                calculateStats(
                    methodDD.selection,
                    this.getVal(),
                    afterExpChkBx.value,
                    onlyKFsChkBx.value
                )
            },
            decimalPlaces = 2,
            dimensions = {
                width: 186,
                height: 22,
                sliderHeight: 12,
                sliderProportion: 0.5,
            },
            prefs = prefs
        );

        //-----------Button-------------------------
        var btnGrp = pal.add("group");
        btnGrp.orientation = "row";
        var calculateStatsBtn = btnGrp.add(
            "button",
            [undefined, undefined, 122, 22],
            LOCALISED_NAMES[lang].calc
        );
        var makeExprControlsBtn = btnGrp.add(
            "button",
            [undefined, undefined, 122, 22],
            LOCALISED_NAMES[lang].make
        );

        function updateEditText(stats) {
            for (var d = 0; d < 4; d++) {
                maxTxt[d].text = (d < stats.dimensions) ? stats.maxVal[d] : "-";
                minTxt[d].text = (d < stats.dimensions) ? stats.minVal[d] : "-";
                avTxt[d].text = (d < stats.dimensions) ? stats.average[d] : "-";
                medTxt[d].text = (d < stats.dimensions) ? stats.median[d] : "-";
            }
        }
        // ---------- UI Call backs -------------------
        methodDD.onChange =
            afterExpChkBx.onClick =
            calculateStatsBtn.onClick =
            function () {
                prefs.setPref(this);
                var stats = calculateStats(
                    methodDD.selection.index,
                    precision.getVal(),
                    afterExpChkBx.value,
                    onlyKFsChkBx.value
                )
                updateEditText(stats.statistics);
            };
        makeExprControlsBtn.onClick = function () {
            var switches = {
                doMax: maxChkBx.value,
                doMin: minChkBx.value,
                doAv: avChkBx.value,
                doMed: medChkBx.value,
            }

            var stats = calculateStats(
                methodDD.selection.index,
                precision.getVal(),
                afterExpChkBx.value,
                onlyKFsChkBx.value
            )
            updateEditText(stats.statistics);
            applyStats(stats, switches);
        }

        function togglePrecisionSlider() {
            // disable the precision slider if only using KFs
            precision.slidr.enabled =
                precision.editText.enabled =
                !onlyKFsChkBx.value;
        }
        onlyKFsChkBx.onClick = function () {
            togglePrecisionSlider()
            prefs.setPref(this)
        }

        function toggleMakeEXPBtn() {
            // disable the make expressions button if no checkboxes are lit
            makeExprControlsBtn.enabled =
                maxChkBx.value ||
                minChkBx.value ||
                avChkBx.value ||
                medChkBx.value
        }
        maxChkBx.onClick =
            minChkBx.onClick =
            medChkBx.onClick =
            avChkBx.onClick =
            afterExpChkBx.onClick =
            function () {
                toggleMakeEXPBtn();
                prefs.setPref(this);
            }

        onlyKFsChkBx.value = prefs.getPref(onlyKFsChkBx);
        maxChkBx.value = prefs.getPref(maxChkBx);
        minChkBx.value = prefs.getPref(minChkBx);
        medChkBx.value = prefs.getPref(medChkBx);
        avChkBx.value = prefs.getPref(avChkBx);

        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
        togglePrecisionSlider();
        toggleMakeEXPBtn();
        return pal;
    }

    //---------------------------- functions n shit ---------------------
    function calculateStats(
        method,
        precision,
        afterExpressions,
        onlyOnKFs
    ) {
        var stats = {
            minVal: ["☠", "☠", "☠", "☠"],
            maxVal: ["☠", "☠", "☠", "☠"],
            average: ["☠", "☠", "☠", "☠"],
            median: ["☠", "☠", "☠", "☠"],
        }
        var theComp = app.project.activeItem;
        if (theComp) {
            var theProps = theComp.selectedProperties;
            var p = 0;
            while (p < theProps.length && !theProps[p] instanceof Property) {
                p++
            }
            theProp = (p < theProps.length && theProps[p] instanceof Property) ? theProps[p] : null;
            if (theProp) {
                var theLayer = findLayer(theProps[p]);
                var timeSpan = calculateTimeSpan(method, theLayer, theComp);
                statistics = getStats(theComp, theProp, timeSpan, precision, afterExpressions, onlyOnKFs)
            }
        }
        return { statistics: statistics, lyr: theLayer, prop: theProp }
    }


    function applyStats(stats, switches) {
        if (stats.prop && stats.lyr) {
            if (switches.doMax) {
                makeExpressionControl(stats.lyr, stats.prop, LOCALISED_NAMES[lang].max, stats.statistics.maxVal)
            }
            if (switches.doMin) {
                makeExpressionControl(stats.lyr, stats.prop, LOCALISED_NAMES[lang].min, stats.statistics.minVal)
            }
            if (switches.doAv) {
                makeExpressionControl(stats.lyr, stats.prop, LOCALISED_NAMES[lang].av, stats.statistics.average)
            }
            if (switches.doMed) {
                makeExpressionControl(stats.lyr, stats.prop, LOCALISED_NAMES[lang].med, stats.statistics.median)
            }
        }
    }

    function makeExpressionControl(theLayer, prop, controlName, controlVal) {
        var newControlName = SCRIPT_ID + ": " + [((prop.propertyDepth > 1) ? [prop.parentProperty.name, prop.name].join(">") : prop.name), controlName].join(">");
        var newControl = theLayer.property("ADBE Effect Parade").property(newControlName);
        if (!newControl) {
            newControl = theLayer.property("ADBE Effect Parade").addProperty(CONTROL_TYPES[controlVal.length - 1]);
            newControl.name = newControlName;
        }
        newControl.property(1).setValue(controlVal);
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

    function calculateTimeSpan(method, theLayer, theComp) {
        //  methods = ["Layer bounds", "Comp bounds", "Work area", "First and last KFs"];
        switch (method) {
            case 0:

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
    function getDimensions(theProperty) {
        var valueType = theProperty.propertyValueType;
        switch (valueType) {
            case PropertyValueType.COLOR:
                //Array of 4 floating-point values in the range [0.0..1.0]. For example, [0.8, 0.3, 0.1, 1.0]
                return 4;
            case PropertyValueType.ThreeD_SPATIAL:
            // Array of three floating-point positional values. For example, an Anchor Point value might be [10.0, 20.2, 0.0]
            case PropertyValueType.ThreeD:
                // Array of three floating-point quantitative values. For example, a Scale value might be [100.0, 20.2, 0.0]
                return 3;
            case PropertyValueType.TwoD_SPATIAL:
            // Array of 2 floating-point positional values. For example, an Anchor Point value might be [5.1, 10.0]
            case PropertyValueType.TwoD:
                // Array of 2 floating-point quantitative values. For example, a Scale value might be [5.1, 100.0]
                return 2;
            case PropertyValueType.OneD:
            // A floating-point value.
            case PropertyValueType.LAYER_INDEX:
            // Integer; a value of 0 means no layer.
            case PropertyValueType.MASK_INDEX:
                // Integer; a value of 0 means no mask.
                return 1
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
                return 0;
        }
    }

    function getStats(theComp, theProperty, timeSpan, precision, afterExpressions, onlyOnKFs) {
        // try {
        var propDimensions = getDimensions(theProperty);
        var preExpressions = !afterExpressions;
        if (propDimensions > 0) {
            var values = [];
            if (onlyOnKFs) {
                for (var k = 1; k <= theProperty.numKeys; k++) {
                    values.push(
                        (propDimensions > 1) ?
                            theProperty.valueAtTime(theProperty.keyTime(k), preExpressions) :
                            [theProperty.valueAtTime(theProperty.keyTime(k), preExpressions)]
                    );
                }
            } else {
                for (var t = timeSpan.start; t < timeSpan.end; t += theComp.frameDuration / precision) {
                    values.push(
                        (propDimensions > 1) ?
                            theProperty.valueAtTime(t, preExpressions) :
                            [theProperty.valueAtTime(t, preExpressions)]
                    );
                }
            }
            var cumulative = values[0] * 0; //create array of zeros with the right dimensions
            var median = [];
            var minVal = [];
            var maxVal = [];
            // Don't declare arrays by assigning them to other arrays or weirdness awaits
            for (var d = 0; d < propDimensions; d++) {
                minVal[d] = values[0][d];
                maxVal[d] = values[0][d];
            }
            // calculate maxVal and minVal and create cumulative total
            for (var v = 0; v < values.length; v++) {
                for (var d = 0; d < propDimensions; d++) {
                    maxVal[d] = Math.max(maxVal[d], values[v][d]);
                    minVal[d] = Math.min(minVal[d], values[v][d]);
                    $.writeln("min: " + minVal[d] + " max " + maxVal[d]);
                }
                cumulative += values[v];
            }
            // calculate average
            var average = cumulative / values.length;
            // one dimensional number arrays get turned into scalars by the calculation,
            // force them back into arrays
            if (!average.length) {
                average = [average];
            }
            var sortedValues = [];
            for (var d = 0; d < propDimensions; d++) {
                for (var v = 0; v < values.length; v++) {
                    sortedValues.push(values[v][d]);
                }
                sortedValues.sort(function (a, b) { return a - b })
                var middleVal = Math.floor(values.length / 2);
                median[d] = (values.length % 2) ?
                    (sortedValues[middleVal] + sortedValues[middleVal + 1]) / 2 :
                    sortedValues[middleVal];
            }
        } else {
            minVal = maxVal = average = median = null;
        }
        // } catch (e) {
        // }
        return {
            maxVal: maxVal,
            minVal: minVal,
            average: average,
            median: median,
            dimensions: propDimensions
        };
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
        decimalPlaces,
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
        this.editText = grp.add("edittext", undefined, val.toFixed(decimalPlaces));
        this.editText.preferredSize.width =
            dimensions.width * (1 - dimensions.sliderProportion);
        this.editText.preferredSize.height = dimensions.height;
        this.editText.decimalPlaces = decimalPlaces;
        this.editText.slider = this.slidr;
        this.slidr.editText = this.editText;
        this.slidr.prefs = prefs;
        if (prefs) {
            this.slidr.value = prefs.getPref(this.slidr) || val;
            this.editText.text = this.slidr.value.toFixed(
                this.editText.decimalPlaces
            );
        }
        this.editText.onChange = function () {
            try {
                var newVal = parseFloat(this.text);
                if (isNaN(newVal)) {
                    this.text = this.slider.value.toFixed(this.decimalPlaces);
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
            this.editText.text = this.value.toFixed(this.editText.decimalPlaces);
        };
        this.slidr.onChange = function () {
            this.editText.text = this.value.toFixed(this.editText.decimalPlaces);
            if (this.prefs) {
                this.prefs.setPref(this);
            }
            if (callback) {
                callback();
            }
        };
        this.setVal = function (val) {
            this.slidr.value = val;
            this.editText.text = val.toFixed(this.decimalPlaces);
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
                } else if (anObject instanceof TextSlider) {
                    currentVal = anObject.getVal();
                }
                else {
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
