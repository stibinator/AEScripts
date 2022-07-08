//@target aftereffects
(function (thisObj) {
    var scriptName = "resizableUITest";
    var versionNum = 0.1;
    var methods = ["apples", "oranges", "pears", "the void"];
    var prefs = Preferences(scriptName);

    function buildGUI(thisObj) {
        var pal =
            thisObj instanceof Panel
                ? thisObj
                : new Window("dialog", thisObj.scriptTitle, undefined, {
                    resizeable: true,
                });
        pal.orientation = "row";
        // ----------------------- UI Elements here ---------------------
        var stretchyBtn = new ResizableUIElement(
            "button",
            pal,
            {
                "width": "75%",
                "height": "90%",
                "min-width": "40px",
                "max-width": "360px",
                "min-height": 123,
                "x": "0px", "y": "0px"
            },
            "OHAI",
            { name: "ok" }
        );
        stretchyBtn.name = "button mcButtFace"
        var stretchyBtn2 = new ResizableUIElement(
            "staticText",
            pal,
            {
                "width": "25%",
                "height": "80%",
                "min-width": "0px",
                "min-height": 22
            },
            "Here be text",
            { name: "statx txct" }
        );
        stretchyBtn.name = "button mcButtFace"
        //------------------------ build the GUI ------------------------
        // var t = pal.add( "button", undefined, "HELO" );
        pal.name = "Window"
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

    function ResizableUIElement(elementType, parent, geometry, text, elementProperties) {
        this.name = "resizeableUIE_" + elementType;
        $.writeln("creating new stretchybutton " + this.name);
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

        this.setToSize = function (d, pos) {
            $.writeln("setToSize(" + d + ") for: " + this.name);
            var totalMargins = 0;
            if (d === "width") {
                this.element.bounds.left = pos.left;
                totalMargins = parent.margins.left * parent.proportionalElements.length + parent.margins.right;
            } else {
                this.element.bounds.top = pos.top;
                totalMargins = parent.margins.top * parent.proportionalElements.length + parent.margins.bottom;
            };
            
            var actualDimension = (parent.bounds[d] - totalMargins) * this.proportionalDimensions[d];
            // trim to max and min dimensions if diven
            actualDimension = this.minimumDimensions[d] ?
                Math.max(this.minimumDimensions[d], actualDimension) :
                actualDimension;
            actualDimension = this.maximumDimensions[d] ?
                Math.min(this.maximumDimensions[d], actualDimension) :
                actualDimension;

            this.element.bounds[d] = Math.round(actualDimension);
        }
        this.resize = function (pos) {
            for (var d in this.proportionalDimensions) {
                this.setToSize(d, pos);
            }
        }

        this.resizeProportionalElements = function () {
            $.writeln("resizeProportionalElements for " + this.name);

            for (var e = 0; e < this.proportionalElements.length; e++) {
                var pos = {
                    "left": this.margins[0],
                    "top": this.margins[3]
                };
                if (e > 0) {
                    if (this.orientation === "row") {
                        pos.left = this.proportionalElements[e - 1].element.bounds.right + this.margins.left;
                    } else {
                        pos.top = this.proportionalElements[e - 1].element.bounds.bottom + this.margins.top;
                    }
                }
                this.proportionalElements[e].resize(pos);
            }

        }


        // initialise element
        var bounds = {};
        var preferredSize = {};
        this.proportionalDimensions = {};
        this.minimumDimensions = {};
        this.maximumDimensions = {};
        var dimensions = ["x", "y", "width", "height", "left", "top", "right", "bottom"]
        for (var d = 0; d < dimensions.length; d++) {
            var dim = dimensions[d];
            if (geometry[dim]) {
                var units = this.getUnits(geometry[dim]);
                if (units.proportional) {
                    this.proportionalDimensions[dim] = parseFloat(units.value) / 100;
                    if (geometry["min-" + dim]) {
                        this.minimumDimensions[dim] = parseFloat(geometry["min-" + dim]);
                    }
                    if (geometry["max-" + dim]) {
                        this.maximumDimensions[dim] = parseFloat(geometry["max-" + dim]);
                    }
                } else {
                    bounds[dim] = parseInt(units.value);
                }
            }
            preferredSize[dim] = this.minimumDimensions[dim];
            bounds[dim] = preferredSize[dim];
        }
        this.element = parent.add(elementType, bounds, text, elementProperties);
        this.element.preferredSize = preferredSize;

        if (parent.proportionalElements) {
            //parent is already proportional aware
            parent.proportionalElements.push(this);
        } else {
            parent.proportionalElements = [this];
            // parent is not proportional aware, 
            // add this.resizeProportionalElements method to its onResize and onShow callback
            if (parent.onResize) {
                var currentCallback = parent.onResize;
                parent.onResize = function () {
                    currentCallback();
                    this.resizeProportionalElements();
                }
            } else {
                parent.onResize = this.resizeProportionalElements;
            }
            if (parent.onShow) {
                var currentCallback = parent.onShow;
                parent.onShow = function () {
                    currentCallback();
                    this.resizeProportionalElements();
                }
            } else {
                parent.onShow = this.resizeProportionalElements;
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
