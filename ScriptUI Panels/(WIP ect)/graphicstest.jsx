//@target aftereffects

(function (thisObj) {
    var scriptName = "graphicstest";
    var versionNum = 0.1;
    var methods = ["apples", "oranges", "pears", "the void"];
    var prefs = Preferences(scriptName);

    function IconComponent(
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
        this.coords = coords; //array of [x, y] points
        this.draw = function (icon) {
            var thePen = icon.graphics.newPen(icon.graphics.PenType.SOLID_COLOR, icon.strokeColour, icon.strokeWidth);
            var theBrush = icon.graphics.newBrush(icon.graphics.BrushType.SOLID_COLOR, icon.fillColour);
            var thePath = icon.graphics.newPath();
            if (this.strokeColour) { thePen.color = this.strokeColour }
            if (this.strokeWidth !== null) { thePen.lineWidth = this.strokeWidth }
            if (this.fillColour) { theBrush.color = this.fillColour }
            if (this.type === "polyline") {
                icon.graphics.moveTo(this.coords[0][0], this.coords[0][1]);
                for (var p = 0; p < this.coords.length; p++) {
                    icon.graphics.lineTo(this.coords[p][0], this.coords[p][1]);
                }
            }
            if (this.type === "rectangle") {
                // icon.graphics.moveTo(this.coords[0][0], this.coords[0][1]);
                // controlObj.graphics.rectPath (left, top[, width, height])
               icon.graphics.rectPath(this.coords.left, this.coords.top, this.coords.width, this.coords.height);
               }
            if (this.type === "polygon") {
                icon.graphics.moveTo(this.coords[0][1], this.coords[0][1]);
                for (var p = 0; p < this.coords.length; p++) {
                    icon.graphics.lineTo(this.coords[p][0], this.coords[p][1]);
                }
                icon.graphics.closePath();
            }
            if (this.type === "ellipse") {
                // icon.graphics.moveTo(this.coords[0][1], this.coords[0][1]);
                // controlObj.graphics.ellipsePath (left, top[, width, height])
                icon.graphics.ellipsePath(this.coords.left, this.coords.top, this.coords.width, this.coords.height)
            }
            // if there's a visible stroke
            if (thePen.lineWidth && thePen.color[3]) { icon.graphics.strokePath(thePen) }
            // if there's visible fill
            if (theBrush.color[3]) { icon.graphics.fillPath(theBrush) }

        }
        return this;

    }

    function decodeSVG(svg, icon) {
        icon.size = svg.size || [200, 200]
        icon.strokeColour = svg.strokeColour || [0.0, 0.0, 0.0, 0.0];
        //default stroke width for icon in pixels
        icon.strokeWidth = svg.strokeWidth || 0;
        //default fill colour for polygons rects and ellipses, rgba array as above
        icon.fillColour = svg.fillColour || [0.0, 0.0, 0.0, 0.0];
        // array of IconComponent
        icon.components = svg.components || [];
    }


    function Icon(iconSvg, graphics) {
        if (iconSvg) {
            this.graphics = graphics;
            decodeSVG(iconSvg, this);

            // set default stroke and fill, if not specified make invisible
            //default stroke colour for icon, [r, g, b, a] from [0.0, 0.0, 0.0, 0.0] to [1.0, 1.0, 1.0, 1.0]


            this.draw = function () {
                for (var c = 0; c < this.components.length; c++) {
                    this.components[c].draw(this);
                }
            }
            return this
        }
        return null;
    }


    function buttonColorVector(parentObj, iconSvg, hoverIconSvg) {
        var baseIcon = new Icon(iconSvg, parentObj.graphics);
        var btn = parentObj.add("button", [0, 0, baseIcon.size[0], baseIcon.size[1], undefined]);
        btn.icon = baseIcon;
        btn.onDraw = btn.icon.draw();

        if (hoverIconSvg) {
            var hoverIcon = new Icon(hoverIconSvg, parentObj.graphics);
            try {
                btn.addEventListener("mouseover", function () {
                    btn.icon = hoverIcon;
                    pal.layout.layout(true); // auto layout
                    pal.layout.resize(); // resize everything
                });
                btn.addEventListener("mouseout", function () {
                    btn.icon = baseIcon;
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
        var testSVG = {
            size: [300, 200],
            strokeColour: [0.0, 0.0, 0.0, 1.0],
            strokeWidth: 2.0,
            fillColour: [1.0, 1.0, 1.0, 1.0],
            components: [
                new IconComponent(
                    type = "rectangle",
                    strokeColour = [0.6, 1.0, 0.0, 1.0],
                    strokeWidth = 2.0,
                    fillColour = [0.1, 0.0, 0.5, 1.0],
                    coords = { left: 10, top: 0, width: 20, height: 20 }
                )//,
                // new IconComponent(
                //     type = "polygon",
                //     strokeColour = null,
                //     strokeWidth = null,
                //     fillColour = [0.1, 0.0, 0.5, 1.0],
                //     coords =[[0,0], [10,100], [100,80], [120, 8]]
                // )
            ]
        }
        var newIconBtn = new buttonColorVector(pal, testSVG, null)

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
