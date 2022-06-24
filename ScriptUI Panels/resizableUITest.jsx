//@target aftereffects
(function (thisObj) {
    var scriptName = "resizableUITest";
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
        var stretchyBtn = new ResizableUIElement("button", pal, { "width": "50%", "height": "24px", "min-width": "40px", "max-width": "80px" });
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

    function ResizableUIElement(elementType, parent, geometry) {
        // initialise element
        this.element = parent.add(elementType, undefined, undefined);
        this.element.bounds = [undefined, undefined, undefined, undefined];
        
        this.proportionalDimensions = {};
        this.minimumDimensions = {};
        this.maximumDimensions = {};
        var dimensions = ["x", "y", "width", "height", "left", "top", "right", "bottom"]
        for (var d in dimensions) {
            if (geometry[d]) {
                var units = getUnits(geometry[d]);
                if (units.proportional) {
                    this.proportionalDimensions[d] = parseFloat(units.value) / 100;
                    if (geometry["min-" + d]) {
                        this.minimumDimensions[d] = parseFloat(geometry["min-" + d]);
                    }
                    if (geometry["max-" + d]) {
                        this.maximumDimensions[d] = parseFloat(geometry["max-" + d]);
                    }
                    if (parent.bounds && parent.bounds[d]) {
                        this.setToSize(d)
                    }
                } else {
                    this.element.bounds[d] = parseInt(units.value);
                }
            }
        }

        this.getUnits = function (s) {
            if (typeof s === "string") {
                var units = s.match(/(-*[\d.]+)(%|px){0,1}/);
                if (units) {
                    return {
                        "proportional": units[2] === "%",
                        "value": parseFloat(units[1])
                    }
                }
            }
            if (typeof s === "number") {
                return {
                    "proportional": false,
                    "value": s
                }
            }
        }

        this.setToSize = function (d) {
            var actualDimension = parent.bounds[d] * this.proportionalDimensions[d];
            // trim to max and min dimensions if diven
            actualDimension = this.minimumDimensions[d] ?
                Math.max(this.minimumDimensions[d], actualDimension) :
                actualDimension;
            actualDimension = this.maximumDimensions[d] ?
                Math.min(this.maximumDimensions[d], actualDimension) :
                actualDimension;

            this.element.bounds[d] = Math.round(actualDimension);
        }

        this.resizeProportionalElements = function () {
            for (var e = 0; e < this.proportionalElements.length; e++) {
                this.proportionalElements[e].resize();
            }
        }

        if (parent.proportionalElements) {
            parent.proportionalElements += this;
        } else {
            parent.proportionalElements = [this];
        }
        if (parent.onResize) {
        } else {
            parent.onResize = this.resizeProportionalElements;
        }

        this.resize = function () {
            for (var d in this.proportionalDimensions) {
                this.setToSize(d);
            }
        }
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
