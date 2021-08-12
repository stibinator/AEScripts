//@target aftereffects
(function (thisObj) {
    var scriptName = "ticks-n-tocks";
    var versionNum = 0.1;
    var methods = ["apples", "oranges", "pears", "the void"];
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
        var methodDD = pal.add(
            "dropdownlist",
            [undefined, undefined, 180, 22],
            methods
        );
        methodDD.name = "methodDD";
        methodDD.selection = prefs.getPref(methodDD);

        //-----------CheckBox-----------------------
        var yesOrNoChkBx = pal.add(
            "checkbox",
            [undefined, undefined, 180, 22],
            "Yes"
        );
        //-----------Button-------------------------
        var doTheThingsBtn = pal.add(
            "button",
            [undefined, undefined, 180, 22],
            "Do the Things"
        );

        //-----------TextSlider-------------------------
        var mySlidr = TextSlider(
            (container = pal),
            (name = "lengthSlidr"),
            (val = 1),
            (min = 1),
            (max = 100),
            (callback = function () {
                doTheThings(
                    yesOrNoChkBx.value,
                    methodDD.selection,
                    this.getVal()
                );
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

        // ---------- UI Call backs -------------------
        methodDD.onChange = function () {
            prefs.setPref(this);
        };
        yesOrNoChkBx.onChange = function () {
            prefs.setPref(this);
        };
        doTheThingsBtn.onClick = function () {
            doTheThings(
                yesOrNoChkBx.value,
                methodDD.selection,
                mySlidr.getVal()
            );
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
    function doTheThings(yesOrNo, flavour, amount) {
        app.beginUndoGroup(scriptName);
        alert(
            yesOrNo
                ? "Yes! " + amount + " " + flavour.text
                : "No! " + amount + " " + flavour.text
        );
        var theComp = app.project.activeItem;
        if (theComp) {
            for (var i = 0; i < theComp.selectedLayers.length; i++) {
                theLayer = theComp.selectedLayers[i];
            }
        }
        app.endUndoGroup();
    }

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
