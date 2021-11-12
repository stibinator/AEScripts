//@target aftereffects
(function (thisObj) {
    var scriptName = "graphicstest";
    var versionNum = 0.1;
    var methods = ["apples", "oranges", "pears", "the void"];
    var prefs = Preferences(scriptName);

    function decodeSVG(srcSVG) {
        var components = [];

    }
    function conComponent(
        // individual drawing objects, can have their own stroke and fill
        type,
        strokeColour,
        strokeWidth,
        fillColour,
        coords
    ) {
        this.type = type;  //- one of ["polyline", "rectangle", "polygon", "ellipse"]
        this.strokeColour = strokeColour; // [r, g, b, a] from [0.0, 0.0, 0.0, 0.0] to [1.0, 1.0, 1.0, 1.0]
        this.strokeWidth = strokeWidth;    //in pixels
        this.fillColour = fillColour;  //rgba array as above
        this.coord = coords; //array of [x, y] points
        return this;
    }

    function Icon(svg, graphics) {
        this.graphics = graphics;
        this.xml = new XML(svg);
        this.items = this.xml.elements;
        this.width = this.xml.svg.@width;
        this.height = this.xml.svg.@height;

        // set default stroke and fill, if not specified make invisible
        //default stroke colour for icon, [r, g, b, a] from [0.0, 0.0, 0.0, 0.0] to [1.0, 1.0, 1.0, 1.0]
        this.strokeColour = strokeColour || [0.0, 0.0, 0.0, 0.0];
         //default stroke width for icon in pixels
        this.strokeWidth = strokeWidth || 0;
        //default fill colour for polygons rects and ellipses, rgba array as above
        this.fillColour = fillColour || [0.0, 0.0, 0.0, 0.0];
        // array of IconComponent
        this.components = components || [];
        
        this.draw = function() {
            for (var c = 0; c < this.components.length; c++) {
                var component = this.components[c];
                var iconStrokeColour = this.strokeColour || [0.0, 0.0, 0.0, 0.0];
                var iconStrokeWidth = this.strokeWidth || 0.0;
                var iconFillColor = this.fillColour || [0.0, 0.0, 0.0, 0.0];
                var thePen = this.graphics.newPen(ScriptUIGraphics.PenType.SOLID_COLOR, iconStrokeColour, iconStrokeWidth);
                var theBrush = this.graphics.newBrush(ScriptUIGraphics.BrushType.SOLID_COLOR, iconFillColor);
                var thePath = this.graphics.newPath();
                if (component.strokeColour) { thePen.color = component.strokeColour }
                if (component.strokeWidth) { thePen.width = component.strokeWidth }
                if (component.fillColour) { theBrush.color = component.fillColour }
                if (component.type === "polyline") {
                    this.graphics.moveTo(component.coords[0][1], component.coords[0][1]);
                    for (var p = 0; p < component.coords.length; p++) {
                        this.graphics.lineTo(component.coords[p][0], component.coords[p][1]);
                    }
                }
                if (component.type = "rectangle") {
                    this.graphics.moveTo(component.coords[0][1], component.coords[0][1]);
                    this.graphics.rectPath(component.coords[1][0], component.coords[1][1]);
                }
                if (component.type === "polygon") {
                    this.graphics.moveTo(component.coords[0][1], component.coords[0][1]);
                    for (var p = 0; p < component.coords.length; p++) {
                        this.graphics.lineTo(component.coords[p][0], component.coords[p][1]);
                    }
                    this.graphics.closePath();
                }
                if (component.type === "ellipse") {
                    this.graphics.moveTo(component.coords[0][1], component.coords[0][1]);
                    this.graphics.ellipsePath(component.coords[1][0], component.coords[1][1]);
                }
                // if there's a visible stroke
                if (thePen.width && thePen.color[3]) { this.graphics.strokePath(thePen, thePath) }
                // if there's visible fill
                if (theBrush.color[3]) { this.graphics.fillPath(theBrush, thePath) }

            }
        }

        return this;
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

        // modified version of Adam Plouff's BattleStyle UI
        function buttonColorVector(parentObj, iconSvg, hoverIconSvg) {
            var btn = parentObj.add("button", [0, 0, size[0], size[1], undefined]);
            btn.baseIcon = new Icon(iconSvg);
            btn.icon = btn.baseIcon;
            btn.hoverIcon = new Icon(hoverIconSvg);
            btn.onDraw = btn.icon.draw;

            if (hoverIconSvg) {
                try {
                    btn.addEventListener("mouseover", function () {
                        btn.icon = btn.hoverIcon;
                        pal.layout.layout(true); // auto layout
                        pal.layout.resize(); // resize everything
                    });
                    btn.addEventListener("mouseout", function () {
                        btn.icon = btn.baseIcon;
                        pal.layout.layout(true); // auto layout
                        pal.layout.resize(); // resize everything
                    });
                }
                catch (err) {
                    // fail silently
                }
            }

            return btn;
        }


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
