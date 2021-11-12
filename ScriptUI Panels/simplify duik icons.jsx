// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app, Panel, ShapeLayer*/

(function (thisObj) {
    var scriptName = "Simplify Duik Icons";
    var SHAPE_NAMES = ["Square", "Circle", "Polygon", "Star"];
    var HANDLESUFFIX = "_Handle";
    //initialise the label colours
    var userLabelColours = readLabelColoursFromPrefs();

    function setHandleStyle(
        theLayer,
        deleteIK,
        makeNewIcons,
        iconSize,
        iconOpacity,
        iconShape,
        iconPoints,
        makeNewAnchors,
        anchorSize,
        anchorBrightness,
        anchorShape,
        anchorPoints
    ) {
        var icon = theLayer.property("Contents").property("Icon");
        if (icon) {
            icon.remove();
        }

        var anchor = theLayer.property("Contents").property("Anchor");
        if (anchor) {
            anchor.remove();
        }

        var ik = theLayer.property("Contents").property("IK");
        if (ik) {
            ik.remove();
        }

        if (deleteIK) {
            var ikLine = theLayer.property("Contents").property("IK Line");
            if (ikLine) {
                ikLine.remove();
            }
        }

        var boneColour = getLabelColour(theLayer);
        var anchorColour = (boneColour * anchorBrightness) / 100;
        var iconSizeArr =
            iconShape < 2 ? [iconSize, iconSize] : [iconSize, iconSize / 2];
        var anchorSizeArr =
            anchorShape < 2
                ? [anchorSize, anchorSize]
                : [anchorSize, anchorSize / 2];
        if (makeNewAnchors) {
            newShape(
                theLayer,
                "Anchor",
                anchorSizeArr,
                false,
                anchorColour,
                100,
                anchorShape,
                anchorPoints
            );
        }
        if (makeNewIcons) {
            newShape(
                theLayer,
                "Icon",
                iconSizeArr,
                boneColour,
                false,
                iconOpacity,
                iconShape,
                iconPoints
            );
        }
    }

    function getHandlePositionForLayerGroup(
        handlePos,
        selectedLyrs,
        useAverage
    ) {
        var sum = selectedLyrs[0].position.value;
        var max = selectedLyrs[0].position.value;
        var min = selectedLyrs[0].position.value;

        for (var i = 1; i < selectedLyrs.length; i++) {
            var p = selectedLyrs[i].position.value;
            for (var m = 0; m < p.length; m++) {
                sum[m] += p[m];
                max[m] = Math.max(max[m], p[m]);
                min[m] = Math.min(min[m], p[m]);
            }
        }
        var dif = max - min;
        return useAverage
            ? [
                sum[0] / selectedLyrs.length,
                sum[1] / selectedLyrs.length,
                sum[2] / selectedLyrs.length,
            ]
            : [
                (handlePos[0] / 2) * dif[0],
                (handlePos[1] / 2) * dif[1],
                (handlePos[2] / 2) * dif[2],
            ];
    }

    function findParent(aLayer, tree) {
        if (tree == null) {
            tree = [];
        }
        if (aLayer.parent) {
            tree.push(aLayer.parent);
            return findParent(aLayer.parent, tree);
        } else {
            return tree;
        }
    }

    function groupLayers(selectedLyrsArr, handlePos, useAverage) {
        if (selectedLyrsArr.length > 1) {
            var newHandle = app.project.activeItem.layers.addShape();
            newHandle.position.setValue(
                getHandlePositionForLayerGroup(
                    handlePos,
                    selectedLyrsArr,
                    useAverage
                )
            );
            newHandle.parent = findLatestCommonAncestor(selectedLyrsArr);
            if (newHandle.parent && newHandle.parent.threeDLayer) {
                newHandle.threeDLayer = true;
            }
            for (var lyr = 0; lyr < selectedLyrsArr.length; lyr++) {
                selectedLyrsArr[lyr].parent = newHandle;
            }
            return newHandle;
        }
    }

    function makeNewHandleLayer(theLayer) {
        var newShape = app.project.activeItem.layers.addShape();
        newShape.name = theLayer.name + HANDLESUFFIX;
        //if the layer isn't a shape layer, create one and make it the parent of the layer
        makeHandleParentOfLayer(newShape, theLayer, true);
        theLayer.selected = false; //just to be sure
        newShape.selected = true;
        return newShape;
    }

    function includes(theArr, theObj, exactMatching) {
        for (var a = 0; a < theArr.length; a++) {
            if (exactMatching) {
                if (theArr[a] === theObj) {
                    return true;
                }
            } else {
                if (theArr[a] == theObj) {
                    return true;
                }
            }
        }
        return false;
    }

    function findLatestCommonAncestor(theLayers) {
        for (var tl = 0; tl < theLayers.length; tl++) {
            theLayers[tl].lineage = findParent(theLayers[tl], []);
        }
        if (theLayers[0].lineage.length > 0) {
            var latestCommonAncestor = null;
            var foundCommonAncestor = false;
            for (
                var p = 0;
                p < theLayers[0].lineage.length && !foundCommonAncestor;
                p++
            ) {
                latestCommonAncestor = theLayers[0].lineage[p];
                tl = 1;
                var keepLooking = true;
                while (tl < theLayers.length && keepLooking) {
                    if (
                        includes(
                            theLayers[tl].lineage,
                            latestCommonAncestor,
                            true
                        )
                    ) {
                        tl++;
                        keepLooking = true;
                        foundCommonAncestor = true;
                    } else {
                        keepLooking = false;
                        foundCommonAncestor = false;
                    }
                }
            }
            if (foundCommonAncestor) {
                return latestCommonAncestor;
            }
        }
        return null;
    }

    function makeHandleParentOfLayer(newHandle, theLayer, adoptTransforms) {
        newHandle.threeDLayer = theLayer.threeDLayer;
        if (theLayer.parent) {
            newHandle.parent = theLayer.parent;
        }
        if (adoptTransforms) {
            newHandle.position.setValue(theLayer.position.value);
            newHandle.rotation.setValue(theLayer.rotation.value);
            newHandle.scale.setValue(theLayer.scale.value);
        }
        theLayer.parent = newHandle;
    }

    function newShape(
        theLayer,
        shapeName,
        shapeSizeArr,
        fillColour,
        strokeColour,
        shapeOpac,
        shapeType,
        shapePoints
    ) {
        var shapeStr = ["Rect", "Ellipse", "Star", "Star"];
        var newGroup = theLayer
            .property("Contents")
            .addProperty("ADBE Vector Group");
        newGroup.name = shapeName;
        var newShapeItem = newGroup.content.addProperty(
            "ADBE Vector Shape - " + shapeStr[shapeType]
        );

        if (shapeType > 1) {
            newShapeItem.property("ADBE Vector Star Type").setValue(2);
            newShapeItem
                .property("ADBE Vector Star Points")
                .setValue(shapePoints);
            newShapeItem
                .property("ADBE Vector Star Outer Radius")
                .setValue(shapeSizeArr[0]);
            if (shapeType > 2) {
                newShapeItem.property("ADBE Vector Star Type").setValue(1);
                newShapeItem
                    .property("ADBE Vector Star Inner Radius")
                    .setValue(shapeSizeArr[1]);
            }
        } else {
            newShapeItem
                .property("ADBE Vector " + shapeStr[shapeType] + " Size")
                .setValue(shapeSizeArr);
        }
        if (fillColour) {
            var newFill = newGroup.content.addProperty(
                "ADBE Vector Graphic - Fill"
            );
            newFill.property("ADBE Vector Fill Color").setValue(fillColour);
            newFill.property("ADBE Vector Fill Opacity").setValue(shapeOpac);
        }

        if (strokeColour) {
            var newStroke = newGroup.content.addProperty(
                "ADBE Vector Graphic - Stroke"
            );
            newStroke
                .property("ADBE Vector Stroke Color")
                .setValue(strokeColour);
            newStroke
                .property("ADBE Vector Stroke Opacity")
                .setValue(shapeOpac);
        }
    }

    function readLabelColoursFromPrefs() {
        try {
            // returns an array of colour objects corresponding to the label colours in the user's prefs
            // colours are 8-bit rgb values with r g and b components
            // eg. [{r: 255, g: 123, b:0}]
            app.preferences.saveToDisk(); //flush any unsaved prefs to disk
            var versionStr = "" + app.version.match(/([0-9]+.[0-9]+)/)[1];
            var prefsFilePath =
                Folder.userData.absoluteURI +
                "/Adobe/After Effects/" +
                versionStr +
                "/Adobe After Effects " +
                versionStr +
                " Prefs-indep-general.txt";
            var prefs = new File(prefsFilePath);
            // var labelColours = [];
            // lets make rainbows
            //note that label colours are 1-indexed because wtf adobe!?
            // so label[16] exists
            // also, label[0] is no label.
            var labelColours = [{ r: 128, g: 128, b: 128 }]; // no label
            // in case somt goes wrong reading the prefs. Shouldn't happen (but did)
            for (var c = 1; c <= 16; c++) {
                var colour = {};
                var ph = (c / 16) * Math.PI;

                colour.r = Math.pow(Math.cos(ph), 2) * 256;
                colour.g = Math.pow(Math.cos(ph - (2 * Math.PI) / 3), 2) * 256;
                colour.b = Math.pow(Math.cos(ph + (2 * Math.PI) / 3), 2) * 256;
                labelColours[c] = colour;
            }
            if (prefs.exists) {
                prefs.open("r");
                var line = prefs.readln();
                var notDoneYet = true;
                while (!prefs.eof & notDoneYet) {
                    if (line.match(/\["Label Preference Color Section.*/)) {
                        line = prefs.readln();
                        while (line) {
                            var labelNum = line.match(
                                /"Label Color ID 2 # ([0-9]+)"/
                            );
                            var labelVal = line.match(/.*= FF(.*)/);
                            var encodedData = labelVal[1];
                            var inQuotes = false;
                            var colourStr = "";
                            var colour = {
                                r: 0,
                                g: 0,
                                b: 0,
                            };
                            for (var i = 0; i < encodedData.length; i++) {
                                if (encodedData[i] === '"') {
                                    inQuotes = !inQuotes;
                                } else {
                                    if (inQuotes) {
                                        colourStr += encodedData
                                            .charCodeAt(i)
                                            .toString(16);
                                    } else {
                                        colourStr += encodedData[i];
                                    }
                                }
                            }

                            colour.r = parseInt(colourStr.slice(0, 2), 16);
                            colour.g = parseInt(colourStr.slice(2, 4), 16);
                            colour.b = parseInt(colourStr.slice(4), 16);
                            // label colours aren't stored in numerical order, but in alphabetical order, I think.
                            // Anyway parsing the labelNum assigns the right label to the right index.
                            labelColours[parseInt(labelNum[1], 10)] = colour;
                            line = prefs.readln();
                        }
                        notDoneYet = false;
                    }
                    line = prefs.readln();
                }
                prefs.close();
            }
            return labelColours;
        } catch (e) {
            alert(e);
            return false;
        }
    }

    function getLabelColour(theLayer) {
        if (!userLabelColours) {
            userLabelColours = readLabelColoursFromPrefs();
        }
        var label = theLayer.label;
        return [
            userLabelColours[label].r / 255,
            userLabelColours[label].g / 255,
            userLabelColours[label].b / 255,
        ];
    }

    function updateNumberField(offset) {
        try {
            var pts = parseInt(this.text);
            if (isNaN(pts)) {
                pts = 6;
            }
            if (!(typeof offset === "undefined" || offset === null)) {
                pts += offset;
            }
            if (pts < 3) {
                pts = 3;
            }
            this.text = "" + pts;
        } catch (e) {
            this.text = "6";
        }
    }

    function myPrefs(prefList) {
        this.prefs = {};

        this.parsePref = function (val, prefType) {
            switch (prefType) {
                case "integer":
                    return parseInt(val, 10);
                case "float":
                    return parseFloat(val);
                case "bool":
                    return val === "true";
                default:
                    return val;
            }
        };

        this.getPref = function (preference) {
            if (app.settings.haveSetting(scriptName, preference.name)) {
                this.prefs[preference.name] = this.parsePref(
                    app.settings.getSetting(scriptName, preference.name),
                    preference.prefType
                );
            } else {
                this.prefs[preference.name] = preference.factoryDefault;
                this.setPref(preference.name, preference.factoryDefault);
            }
        };

        this.setPref = function (prefname, value) {
            if (this.prefs[prefname] !== value) {
                this.prefs[prefname] = value;
                app.settings.saveSetting(scriptName, prefname, value);
            }
        };

        for (var p = 0; p < prefList.length; p++) {
            this.getPref(prefList[p]);
        }
    }

    function buildUI(thisObj) {
        /* Original dialog came from here:
    Code for Import https://scriptui.joonas.me 
    */

        // DIALOG
        // ====================================================================================
        if (thisObj instanceof Panel) {
            var pal = thisObj;
        } else {
            pal = new Window("palette", scriptName, undefined, {
                resizeable: true,
            });
        }
        if (pal !== null) {
            pal.orientation = "column";
            pal.alignChildren = ["left", "top"];
            pal.spacing = 10;
            pal.margins = 16;

            var DoTheThingsBtn = pal.add("button", undefined, undefined, {
                name: "DoTheThingsBtn",
            });
            DoTheThingsBtn.text = "Create Handle";
            DoTheThingsBtn.preferredSize.width = 220;

            // DELETBOX
            // ========

            var deletBox = pal.add("panel", undefined, undefined, {
                name: "deletBox",
            });
            var deleteIKChkBx = deletBox.add("checkbox", undefined, undefined);
            deleteIKChkBx.name = "deleteIKChkBx";
            deleteIKChkBx.text = "Delete DuIK IK lines";
            deleteIKChkBx.preferredSize.width = 200;
            deletBox.margins = [10, 6, 10, 2];
            // deleteIKChkBx.margins = 10, 10,;

            // GROUPLAYERS
            // ===================================================================================
            var GroupLayers = pal.add("panel", undefined, undefined, {
                name: "GroupLayers",
                borderStyle: "black",
            });
            GroupLayers.text = "Group";
            GroupLayers.preferredSize.width = 200;
            GroupLayers.orientation = "column";
            GroupLayers.alignChildren = ["left", "top"];
            GroupLayers.spacing = 4;
            GroupLayers.margins = 10;

            var groupLayersBtn = GroupLayers.add(
                "button",
                undefined,
                undefined
            );
            groupLayersBtn.name = "groupChkBx";
            groupLayersBtn.helpTip =
                "Create a single handle for multiple layers.";
            groupLayersBtn.text = "Create 1 handle for all layers";
            groupLayersBtn.preferredSize.width = 200;

            // ==== slider text headers
            var headerText = GroupLayers.add("group", undefined, {
                name: "XGrp",
            });
            headerText.orientation = "row";
            headerText.alignChildren = ["left", "center"];
            headerText.spacing = 10;
            headerText.margins = 1;
            headerText.alignment = ["fill", "top"];

            var statictext1 = headerText.add(
                "statictext",
                undefined,
                undefined,
                {
                    name: "statictext1",
                }
            );
            statictext1.text = "Handle Position";
            statictext1.preferredSize.width = 148;

            var statictext2 = headerText.add(
                "statictext",
                undefined,
                undefined,
                {
                    name: "statictext2",
                }
            );
            statictext2.text = "Center";

            // SLIDER GROUP==================
            var sliderGroup = GroupLayers.add("group", undefined);
            sliderGroup.orientation = "column";
            sliderGroup.spacing = 0;

            // XGRP1
            // =====
            var XGrp = sliderGroup.add("group", undefined, {
                name: "XGrp1",
            });
            XGrp.orientation = "row";
            XGrp.alignChildren = ["left", "center"];
            XGrp.spacing = 10;
            XGrp.margins = 1;
            XGrp.alignment = ["fill", "top"];

            var statictext3 = XGrp.add("statictext", undefined, undefined, {
                name: "statictext3",
            });
            statictext3.text = "X";

            var xSlider = XGrp.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            xSlider.name = "xSlider";
            xSlider.minvalue = 0;
            xSlider.maxvalue = 1;
            xSlider.preferredSize.width = 160;

            xSlider.cntrChkBx = XGrp.add("checkbox", undefined, undefined);
            xSlider.cntrChkBx.name = "xSlider.cntrChkBx";

            // YGRP
            // ====
            var YGrp = sliderGroup.add("group", undefined, {
                name: "YGrp",
            });
            YGrp.orientation = "row";
            YGrp.alignChildren = ["left", "center"];
            YGrp.spacing = 10;
            YGrp.margins = 1;
            YGrp.alignment = ["fill", "top"];

            var statictext4 = YGrp.add("statictext", undefined, undefined, {
                name: "statictext4",
            });
            statictext4.text = "Y";

            var ySlider = YGrp.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            ySlider.name = "ySlider";
            ySlider.minvalue = 0;
            ySlider.maxvalue = 1;
            ySlider.preferredSize.width = 160;

            ySlider.cntrChkBx = YGrp.add("checkbox", undefined, undefined);
            ySlider.cntrChkBx.name = "ySlider.cntrChkBx";

            // ZGRP
            // ====
            var ZGrp = sliderGroup.add("group", undefined, {
                name: "ZGrp",
            });
            ZGrp.orientation = "row";
            ZGrp.alignChildren = ["left", "center"];
            ZGrp.spacing = 10;
            ZGrp.margins = 1;
            ZGrp.alignment = ["fill", "top"];

            var statictext5 = ZGrp.add("statictext", undefined, undefined, {
                name: "statictext5",
            });
            statictext5.text = "Z";

            var zSlider = ZGrp.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            zSlider.name = "zSlider";
            zSlider.minvalue = 0;
            zSlider.maxvalue = 1;
            zSlider.preferredSize.width = 160;

            zSlider.cntrChkBx = ZGrp.add("checkbox", undefined, undefined);
            zSlider.cntrChkBx.name = "zSlider.cntrChkBx";

            // average checkbox
            var averageChkBx = GroupLayers.add(
                "checkbox",
                undefined,
                undefined
            );
            averageChkBx.name = "Average";
            averageChkBx.helpTip =
                "Put the handle at the average position (not always the middle)";
            averageChkBx.text = "Average";
            averageChkBx.alignment = ["left", "top"];

            // CREATBOX
            // ================================================================================================
            var creatBox = pal.add("panel", undefined, undefined, {
                name: "creatBox",
            });
            creatBox.text = "Create";
            creatBox.orientation = "column";
            creatBox.alignChildren = ["left", "top"];
            creatBox.spacing = 6;
            creatBox.margins = [10, 16, 10, 6];
            var createIconsChkBx = creatBox.add(
                "checkbox",
                undefined,
                undefined
            );
            createIconsChkBx.name = "createIconsChkBx";
            createIconsChkBx.text = "Icons";

            // Icon size
            // ======
            var icnSizePanel = creatBox.add("panel", undefined, undefined, {
                name: "icnSizePanel",
            });
            icnSizePanel.text = "Icon size";
            icnSizePanel.orientation = "row";
            icnSizePanel.alignChildren = ["left", "top"];
            icnSizePanel.spacing = 10;
            icnSizePanel.margins = [10, 8, 10, 6];

            var iconSizeSlider = icnSizePanel.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            iconSizeSlider.name = "iconSizeSlider";
            iconSizeSlider.helpTip = "Icon size, from 5 - 500";
            iconSizeSlider.minvalue = 20;
            iconSizeSlider.maxvalue = 100;
            iconSizeSlider.preferredSize.width = 146;
            var iconSizeText = icnSizePanel.add(
                "statictext",
                undefined,
                iconSizeSlider.value
            );
            iconSizeText.preferredSize.width = 20;
            // icon opacity
            // ======
            var iconOpacityPanel = creatBox.add("panel", undefined, undefined, {
                name: "iconOpacityPanel",
            });
            iconOpacityPanel.text = "Icon Opacity";
            iconOpacityPanel.orientation = "column";
            iconOpacityPanel.alignChildren = ["left", "top"];
            iconOpacityPanel.spacing = 10;
            iconOpacityPanel.margins = [10, 8, 10, 6];

            var iconOpacitySlider = iconOpacityPanel.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            iconOpacitySlider.name = "iconOpacitySlider";
            iconOpacitySlider.helpTip = "Icon opacity";
            iconOpacitySlider.minvalue = 0;
            iconOpacitySlider.maxvalue = 100;
            iconOpacitySlider.preferredSize.width = 176;

            // icon shape
            // ======
            var icnShapeGrp = creatBox.add("group", undefined, {
                name: "icnShapeGrp",
            });
            icnShapeGrp.orientation = "row";
            icnShapeGrp.alignChildren = ["left", "center"];
            icnShapeGrp.spacing = 10;
            icnShapeGrp.margins = 0;

            var iconShapeDDList = icnShapeGrp.add(
                "dropdownlist",
                undefined,
                undefined,
                {
                    items: SHAPE_NAMES,
                }
            );
            iconShapeDDList.name = "iconShapeDDList";
            iconShapeDDList.preferredSize.width = 90;

            // ----------[-] iconShapeDDList.txtBx [+] grouplet ----------
            iconShapeDDList.minus = icnShapeGrp.add(
                "Button",
                undefined,
                undefined,
                {
                    name: "iconShapeDDList.minus",
                }
            );
            iconShapeDDList.minus.text = "-";
            iconShapeDDList.minus.preferredSize.width = 20;
            iconShapeDDList.txtBx = icnShapeGrp.add(
                "edittext",
                undefined,
                undefined,
                undefined,
                undefined
            );
            iconShapeDDList.txtBx.name = "iconPoints";
            iconShapeDDList.txtBx.preferredSize.width = 30;
            iconShapeDDList.txtBx.update = updateNumberField;
            iconShapeDDList.plus = icnShapeGrp.add(
                "Button",
                undefined,
                undefined,
                {
                    name: "iconShapeDDList.plus",
                }
            );
            iconShapeDDList.plus.text = "+";
            iconShapeDDList.plus.preferredSize.width = 20;

            // ========
            var divider1 = creatBox.add("panel", undefined, undefined, {
                name: "divider1",
            });
            divider1.alignment = "fill";
            //create anchors
            var createAnchorsChkBx = creatBox.add(
                "checkbox",
                undefined,
                undefined
            );
            createAnchorsChkBx.name = "createAnchorsChkBx";

            createAnchorsChkBx.text = "Anchors";

            // anchor size
            // ======
            var anchorSizePanel = creatBox.add("panel", undefined, undefined, {
                name: "anchorSizePanel",
            });
            anchorSizePanel.text = "Anchor Size";
            anchorSizePanel.orientation = "row";
            anchorSizePanel.alignChildren = ["left", "top"];
            anchorSizePanel.spacing = 10;
            anchorSizePanel.margins = [10, 8, 10, 6];

            var anchorSizeSlider = anchorSizePanel.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            anchorSizeSlider.name = "anchorSizeSlider";
            anchorSizeSlider.helpTip = "Anchor size from 0 - 500";
            anchorSizeSlider.minvalue = 20;
            anchorSizeSlider.maxvalue = 100;
            anchorSizeSlider.preferredSize.width = 146;
            var anchorSizeText = anchorSizePanel.add(
                "statictext",
                undefined,
                anchorSizeSlider.value
            );
            anchorSizeText.preferredSize.width = 20;

            // PANEL3
            // ======
            var anchorBrightnessPanel = creatBox.add(
                "panel",
                undefined,
                undefined,
                {
                    name: "anchorBrightnessPanel",
                }
            );
            anchorBrightnessPanel.text = "Anchor Brightness";
            anchorBrightnessPanel.orientation = "column";
            anchorBrightnessPanel.alignChildren = ["left", "top"];
            anchorBrightnessPanel.spacing = 10;
            anchorBrightnessPanel.margins = [10, 8, 10, 6];

            var anchorBrightnessSlider = anchorBrightnessPanel.add(
                "slider",
                undefined,
                undefined,
                undefined,
                undefined
            );
            anchorBrightnessSlider.name = "anchorBrightnessSlider";
            anchorBrightnessSlider.helpTip =
                "Brightness of anchor stroke, from black to white";
            anchorBrightnessSlider.minvalue = 0;
            anchorBrightnessSlider.maxvalue = 150;
            anchorBrightnessSlider.preferredSize.width = 176;

            // GROUP2
            // ======
            var anchorShapeGroup = creatBox.add("group", undefined, {
                name: "anchorShapeGroup",
            });
            anchorShapeGroup.orientation = "row";
            anchorShapeGroup.alignChildren = ["left", "center"];
            anchorShapeGroup.spacing = 10;
            anchorShapeGroup.margins = 0;

            var anchorShapeDDList = anchorShapeGroup.add(
                "dropdownlist",
                undefined,
                undefined,
                {
                    items: SHAPE_NAMES,
                }
            );
            anchorShapeDDList.name = "anchorShapeDDList";
            anchorShapeDDList.preferredSize.width = 90;

            // ----------[-] anchorPoints [ grouplet ----------+]
            anchorShapeDDList.minus = anchorShapeGroup.add(
                "Button",
                undefined,
                undefined,
                {
                    name: "anchorShapeDDList.minus",
                }
            );
            anchorShapeDDList.minus.text = "-";
            anchorShapeDDList.minus.preferredSize.width = 20;
            anchorShapeDDList.txtBx = anchorShapeGroup.add(
                "edittext",
                undefined,
                undefined,
                undefined,
                undefined
            );
            anchorShapeDDList.txtBx.name = "anchorShapeDDList.txtBx";
            anchorShapeDDList.txtBx.preferredSize.width = 30;
            anchorShapeDDList.txtBx.update = updateNumberField;

            anchorShapeDDList.plus = anchorShapeGroup.add(
                "Button",
                undefined,
                undefined,
                {
                    name: "anchorShapeDDList.plus",
                }
            );
            anchorShapeDDList.plus.text = "+";
            anchorShapeDDList.plus.preferredSize.width = 20;

            // ------------------------- Preferences ---------------------------------

            var prefs = new myPrefs([
                {
                    name: "deleteIconsChkBx",
                    factoryDefault: true,
                    prefType: "bool",
                },
                {
                    name: "deleteAnchorsChkBx",
                    factoryDefault: true,
                    prefType: "bool",
                },
                {
                    name: "deleteIKChkBx",
                    factoryDefault: true,
                    prefType: "bool",
                },
                {
                    name: "createIconsChkBx",
                    factoryDefault: true,
                    prefType: "bool",
                },
                {
                    name: "iconSizeSlider",
                    factoryDefault: 50,
                    prefType: "float",
                },
                {
                    name: "iconOpacitySlider",
                    factoryDefault: 50,
                    prefType: "float",
                },
                {
                    name: "iconShapeDDList",
                    factoryDefault: 1,
                    prefType: "integer",
                },
                {
                    name: "iconPoints",
                    factoryDefault: 6,
                    prefType: "integer",
                },
                {
                    name: "createAnchorsChkBx",
                    factoryDefault: 1,
                    prefType: "bool",
                },
                {
                    name: "anchorSizeSlider",
                    factoryDefault: 10,
                    prefType: "float",
                },
                {
                    name: "anchorBrightnessSlider",
                    factoryDefault: 10,
                    prefType: "float",
                },
                {
                    name: "anchorShapeDDList",
                    factoryDefault: 0,
                    prefType: "integer",
                },
                {
                    name: "anchorShapeDDList.txtBx",
                    factoryDefault: 6,
                    prefType: "integer",
                },
                {
                    name: "xSlider",
                    factoryDefault: 0.5,
                    prefType: "float",
                },
                {
                    name: "ySlider",
                    factoryDefault: 0.5,
                    prefType: "float",
                },
                {
                    name: "zSlider",
                    factoryDefault: 0.5,
                    prefType: "float",
                },
            ]);

            // initialise stuff
            var uiValues = [
                deleteIKChkBx,
                groupLayersBtn,
                xSlider,
                ySlider,
                zSlider,
                createIconsChkBx,
                iconSizeSlider,
                iconOpacitySlider,
                createAnchorsChkBx,
                anchorSizeSlider,
                anchorBrightnessSlider,
            ];
            for (var u = 0; u < uiValues.length; u++) {
                uiValues[u].value = prefs.prefs[uiValues[u].name];
            }
            iconShapeDDList.selection = prefs.prefs[iconShapeDDList.name];
            anchorShapeDDList.selection = prefs.prefs[anchorShapeDDList.name];
            iconShapeDDList.txtBx.text =
                prefs.prefs[iconShapeDDList.txtBx.name];
            anchorShapeDDList.txtBx.text =
                prefs.prefs[anchorShapeDDList.txtBx.name];

            activateControls(anchorShapeDDList);
            activateControls(iconShapeDDList);
            var scaledIconSize = scaleUIElements(iconSizeSlider.value);
            var scaledAnchorSize = scaleUIElements(anchorSizeSlider.value);
            iconSizeText.text = scaledIconSize;
            anchorSizeText.text = scaledAnchorSize;

            averageChkBx.onClick = function () {
                sliderGroup.enabled = !this.value;
                prefs.setPref(averageChkBx.name, averageChkBx.value);
            };
            var handlePos = [xSlider.value, ySlider.value, zSlider.value];
            var slidrs = [xSlider, ySlider, zSlider];
            for (var slidr = 0; slidr < slidrs.length; slidr++) {
                slidrs[slidr].cntrChkBx.value = slidrs[slidr].value === 0.5;
                slidrs[slidr].onChange = function () {
                    this.cntrChkBx.value = this.value === 0.5;
                    handlePos = [xSlider.value, ySlider.value, zSlider.value];
                    prefs.setPref(this.name, this.value);
                };
            }

            xSlider.cntrChkBx.onClick = function () {
                xSlider.value = 0.5;
                prefs.setPref(xSlider.name, xSlider.value);
            };
            ySlider.cntrChkBx.onClick = function () {
                ySlider.value = 0.5;
                prefs.setPref(ySlider.name, ySlider.value);
            };
            zSlider.cntrChkBx.onClick = function () {
                zSlider.value = 0.5;
                prefs.setPref(zSlider.name, zSlider.value);
            };

            deleteIKChkBx.onClick =
                createIconsChkBx.onClick =
                createAnchorsChkBx.onClick =
                function () {
                    prefs.setPref(this.name, this.value);
                    adjustIconShape(true);
                };

            iconSizeSlider.onChange = anchorSizeSlider.onChange = function () {
                prefs.setPref(this.name, this.value);
                scaledIconSize = scaleUIElements(iconSizeSlider.value);
                scaledAnchorSize = scaleUIElements(anchorSizeSlider.value);
                iconSizeText.text = scaledIconSize;
                anchorSizeText.text = scaledAnchorSize;
                adjustIconShape(false);
            };
            iconOpacitySlider.onChange = anchorBrightnessSlider.onChange =
                function () {
                    prefs.setPref(this.name, this.value);
                    adjustIconShape(false);
                };

            iconShapeDDList.onChange = anchorShapeDDList.onChange =
                function () {
                    prefs.setPref(this.name, this.selection.index);
                    activateControls(this);
                    adjustIconShape(false);
                };

            iconShapeDDList.txtBx.onChange = function () {
                this.update();
                prefs.setPref(this.name, parseInt(this.text));
                adjustIconShape(false);
            };
            anchorShapeDDList.txtBx.onChange = function () {
                this.update();
                prefs.setPref(this.name, parseInt(this.text));
                adjustIconShape(false);
            };

            iconShapeDDList.plus.onClick = function () {
                iconShapeDDList.txtBx.update(1);
                prefs.setPref(
                    iconShapeDDList.txtBx.name,
                    parseInt(iconShapeDDList.txtBx.text)
                );
                adjustIconShape(false);
            };
            iconShapeDDList.minus.onClick = function () {
                iconShapeDDList.txtBx.update(-1);
                prefs.setPref(
                    iconShapeDDList.txtBx.name,
                    parseInt(iconShapeDDList.txtBx.text)
                );
                adjustIconShape(false);
            };

            anchorShapeDDList.plus.onClick = function () {
                anchorShapeDDList.txtBx.update(1);
                prefs.setPref(
                    anchorShapeDDList.txtBx.name,
                    parseInt(anchorShapeDDList.txtBx.text)
                );
                adjustIconShape(false);
            };
            anchorShapeDDList.minus.onClick = function () {
                anchorShapeDDList.txtBx.update(-1);
                prefs.setPref(
                    anchorShapeDDList.txtBx.name,
                    parseInt(anchorShapeDDList.txtBx.text)
                );
                adjustIconShape(false);
            };

            // ------------------------- do the things -------------------------------
            DoTheThingsBtn.onClick = function () {
                adjustIconShape(true);
            };

            if (pal instanceof Window) {
                pal.center();
                pal.show();
            } else {
                pal.layout.layout(true);
            }
        }

        function activateControls(ddList) {
            ddList.txtBx.enabled = ddList.selection.index > 1; // activate the points controls for poly and star
            ddList.minus.enabled = ddList.selection.index > 1;
            ddList.plus.enabled = ddList.selection.index > 1;
        }

        function scaleUIElements(theSize) {
            if (app.project && app.project.activeItem) {
                var compBiggestDimension = Math.max(
                    app.project.activeItem.width,
                    app.project.activeItem.height
                );
            } else {
                compBiggestDimension = 1920;
            }
            //make the biggest possible icon 1/3 of the comp's largest dimension. Smalles size is 6 pixels
            return Math.max(
                Math.round(
                    (compBiggestDimension / 3) * Math.pow(theSize / 100, 3)
                ),
                6
            );
        }

        function getSelectedLayers() {
            //make a proper array, instead of a stupid layerCollection object
            var selectedLyrsArr = [];
            for (
                var s = 0;
                s < app.project.activeItem.selectedLayers.length;
                s++
            ) {
                selectedLyrsArr.push(app.project.activeItem.selectedLayers[s]);
            }
            return selectedLyrsArr;
        }

        groupLayersBtn.onClick = function () {
            app.beginUndoGroup("create handle for selected");
            var selectedLyrsArr = getSelectedLayers();
            var groupHandle = groupLayers(
                selectedLyrsArr,
                handlePos,
                averageChkBx.value
            );
            var iconPointsInt = parseInt(iconShapeDDList.txtBx.text);
            var anchorPointsInt = parseInt(anchorShapeDDList.txtBx.text);
            setHandleStyle(
                groupHandle,
                deleteIKChkBx.value,
                createIconsChkBx.value,
                scaledIconSize,
                iconOpacitySlider.value,
                iconShapeDDList.selection.index,
                iconPointsInt,
                createAnchorsChkBx.value,
                scaledAnchorSize,
                anchorBrightnessSlider.value,
                anchorShapeDDList.selection.index,
                anchorPointsInt
            );
            app.endUndoGroup();
        };

        function adjustIconShape(createNew) {
            app.beginUndoGroup("Create Handle");
            // try {
            if (app.project && app.project.activeItem) {
                var iconPointsInt = parseInt(iconShapeDDList.txtBx.text);
                var anchorPointsInt = parseInt(anchorShapeDDList.txtBx.text);

                var selectedLyrsArr = getSelectedLayers();

                if (selectedLyrsArr.length === 0 && createNew) {
                    var newShapeLyr = app.project.activeItem.layers.addShape();
                    newShapeLyr.name = "Handle";
                    newShapeLyr.selected = true;
                    selectedLyrsArr.push(newShapeLyr);
                }

                for (var b = 0; b < selectedLyrsArr.length; b++) {
                    var theLayer = selectedLyrsArr[b];
                    if (!(theLayer instanceof ShapeLayer)) {
                        theLayer = makeNewHandleLayer(theLayer);
                    }
                    //make sure the layer is set to guide layer
                    theLayer.guideLayer = true;
                    setHandleStyle(
                        theLayer,
                        deleteIKChkBx.value,
                        createIconsChkBx.value,
                        scaledIconSize,
                        iconOpacitySlider.value,
                        iconShapeDDList.selection.index,
                        iconPointsInt,
                        createAnchorsChkBx.value,
                        scaledAnchorSize,
                        anchorBrightnessSlider.value,
                        anchorShapeDDList.selection.index,
                        anchorPointsInt
                    );
                }
            }
            // } catch (e) {
            //     alert(e);
            // }
            app.endUndoGroup();
        }
    }

    buildUI(thisObj);
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
