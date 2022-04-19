// @target aftereffects
// license below

// more: https://blob.pureandapplied.com.au

(function (thisObj) {
    var scriptName = "Crop-n-Chop";

    function findBoundingBox(theComp, theLayers, useMotion) {
        // returns the left, right, top and bottom most point of a layer or set of layers in comp space
        // if motion is enabled it goes through all the frames looking for the bounding box containing all the motion.
        // note that this it calculates the value for the whole layer, even transparent parts.
        var boundingBox = { left: null, width: null, height: null, top: null };
        var originalCompTime = theComp.time;
        for (var i = 0; i < theLayers.length; i++) {
            var lyr = theLayers[i];
            var currTime = theComp.time;
            if (useMotion) {
                startTime = lyr.inPoint > 0 ? lyr.inPoint : 0;
                endTime =
                    lyr.outPoint < theComp.duration
                        ? lyr.outPoint
                        : theComp.duration;
            } else {
                startTime = endTime = currTime;
            }
            for (t = startTime; t <= endTime; t += theComp.frameDuration) {
                theComp.time = t;
                var srcRect = lyr.sourceRectAtTime(t, true);
                srcRect.right = srcRect.left + srcRect.width;
                srcRect.bottom = srcRect.top + srcRect.height;
                var toCompLeftTop = lyr.sourcePointToComp([srcRect.left, srcRect.top]);
                var toCompLeftBot = lyr.sourcePointToComp([srcRect.left, srcRect.bottom]);
                var toCompRightTop = lyr.sourcePointToComp([srcRect.right, srcRect.top]);
                var toCompRightBot = lyr.sourcePointToComp([srcRect.right, srcRect.bottom]);

                var toCompLeft = Math.min(toCompLeftTop[0], toCompLeftBot[0], toCompRightTop[0], toCompRightBot[0]);
                var toCompRight = Math.max(toCompLeftTop[0], toCompLeftBot[0], toCompRightTop[0], toCompRightBot[0]);
                var toCompTop = Math.min(toCompLeftTop[1], toCompLeftBot[1], toCompRightTop[1], toCompRightBot[1]);
                var toCompBottom = Math.max(toCompLeftTop[1], toCompLeftBot[1], toCompRightTop[1], toCompRightBot[1]);
                var toCompWidth = toCompRight - toCompLeft;
                var toCompHeight = toCompBottom - toCompTop;
                if (null === boundingBox.left | boundingBox.left > toCompLeft) { boundingBox.left = toCompLeft }
                if (null === boundingBox.width | boundingBox.width < toCompWidth) { boundingBox.width = toCompWidth }
                if (null === boundingBox.top | boundingBox.top > toCompTop) { boundingBox.top = toCompTop }
                if (null === boundingBox.height | boundingBox.height < toCompHeight) { boundingBox.height = toCompHeight }
            }
            theComp.time = currTime;
        }
        theComp.time = originalCompTime;
        return boundingBox;
    }

    function myPrefs(prefList) {
        this.prefs = {};

        this.parsePref = function (val, prefType) {
            switch (prefType) {
                case "integer":
                case "int":
                    return parseInt(val, 10);
                case "float":
                    return parseFloat(val);
                case "bool":
                    return (val === "true")
                default:
                    return val
            }
        }

        this.getPref = function (preference) {
            if (app.settings.haveSetting(scriptName, preference.name)) {
                this.prefs[preference.name] = this.parsePref(app.settings.getSetting(scriptName, preference.name), preference.prefType);
            } else {
                this.prefs[preference.name] = preference.factoryDefault;
                this.setPref(preference.name, preference.factoryDefault);
            }
        }

        this.setPref = function (prefname, value) {
            if (this.prefs[prefname] !== value) {
                this.prefs[prefname] = value;
                app.settings.saveSetting(scriptName, prefname, value);
            }
        }


        for (var p = 0; p < prefList.length; p++) {
            this.getPref(prefList[p]);
        }
    }

    function cropCompToBoundingBox(theComp, bounds, reframe, margin) {
        for (var s = 1; s < theComp.numLayers; s++) { //store selection state of the layers
            theComp.layer(s).wasSelected = theComp.layer(s).selected;
        }
        if (reframe) { //attach all layers to a point at the top left of the bounding box
            parentNull = theComp.layers.addNull();
            parentNull.property("Transform").property("Position").setValue([bounds.left, bounds.top, 0]);
            allLayers = theComp.layers;
            for (var i = 1; i <= allLayers.length; i++) {
                if (allLayers[i].parent === null && allLayers[i].index !== parentNull.index) {
                    allLayers[i].parent = parentNull;
                }
            }
        }
        if (margin.proportional) {
            margin.x = margin.value * bounds.width;
            margin.y = margin.value * bounds.height;
        } else {
            margin.x = Math.max(margin.value * bounds.width, margin.value * bounds.height);
            margin.y = margin.x;
        }

        theComp.width = Math.max(Math.min(Math.round(bounds.width + margin.x), 30000), 4); //min 4px, max 30,000px comp sizes
        theComp.height = Math.max(Math.min(Math.round(bounds.height + margin.y), 30000), 4);
        if (reframe) { //move the bounding box to the top left of the frame.
            parentNull.property("Transform").property("Position").setValue([margin.x / 2, margin.y / 2, 0]);
            parentNull.remove();
        }
        for (var s = 1; s < theComp.numLayers; s++) { //recall selection state
            theComp.layer(s).selected = theComp.layer(s).wasSelected | false;
            theComp.layer(s).wasSelected = null;
        }
    }

    function findAllUsesOfItem(theItem) {
        // returns an array of objects containing comp - a composition and an array of indexes, that are the layers that use theComp as their source
        var result = []
        var items = app.project.items;
        for (var itm = 1; itm <= items.length; itm++) {
            if (items[itm] instanceof CompItem) {
                var referringLayers = [];
                var theComp = items[itm];
                for (var lyr = 1; lyr <= theComp.numLayers; lyr++) {
                    var theSource = theComp.layers[lyr].source;
                    if ((theSource) && (theSource.id == theItem.id)) {
                        referringLayers.push(lyr);
                    }
                }
                if (referringLayers.length > 0) {
                    result.push({ "comp": theComp, "indexes": referringLayers });
                }
            }
        }
        return result;
    }

    function fromComp(theLayer, pos) {
        var tempPtFX = theLayer.effects.addProperty("ADBE Point Control");
        tempPtFX.name = "Temp Point for fromComp Script";
        tempPtFX.property("point").expression = "fromComp([" + pos[0] + ", " + pos[1] + "])";
        var result = tempPtFX.property("point").value;
        tempPtFX.remove();
        return result;
    }


    function adjustLayerPos(theComp, theLayer, bounds) {
        var originalBounds = findBoundingBox(theComp, theLayer, false);
        var offsetBounds = {
            "left": originalBounds.left + bounds.left,
            "right": originalBounds.left + bounds.right,
            "top": originalBounds.top + bounds.top,
            "bottom": originalBounds.top + bounds.bottom
        }
        if (theLayer.parent) {
            childBounds = fromComp(theLayer.parent, [originalBounds.left, originalBounds.top]);
            newChildBounds = fromComp(theLayer.parent, [offsetBounds.left, offsetBounds.top]);
            theLayer.transform.position.setValue(theLayer.transform.position.value + [childBounds.left - newChildBounds.left, childBounds.top - newChildBounds.top]);
        } else {
            theLayer.transform.position.setValue(theLayer.transform.position.value + [offsetBounds.left - originalBounds.left, offsetBounds.top - originalBounds.top]);
        }
    }


    function repositionCroppedComp(theComp, bounds) {
        // adjust the position of a comp that has been cropped in any comps it is used in
        var compList = findAllUsesOfItem(theComp); //returns array of [{comp, [indexes]}]
        for (var c = 0; c < compList.length; c++) {
            for (var i = 0; i < complist[c].indexes.length; i++) {
                adjustLayerPos(compList[c].comp, complist[c].indexes[i], bounds);
            }
        }
    }

    // ======== main function======================
    function cropNChop(reframe, useMotion, margin) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var selectedLayers = theComp.selectedLayers;
            if (selectedLayers.length > 0) {
                app.beginUndoGroup("Crop-n-Chop");
                var bounds = findBoundingBox(theComp, selectedLayers, useMotion);
                cropCompToBoundingBox(theComp, bounds, reframe, margin);
                app.endUndoGroup();
                return "W: " + Math.floor(theComp.width) + " H: " + theComp.height;
            } else {
                return "!!! Select layer(s) first !!!";
            }
        } else {
            return "!!! Select layer(s) in a comp first !!!"
        }
    }



    //=================================UI guff=============================
    // cropNChopUI
    // ============
    function buildCropNChopUI(thisObj) {
        if (thisObj instanceof Panel) {
            cropNChopUI = thisObj;
        } else {
            cropNChopUI = new Window('palette', scriptName, undefined, { resizeable: true });
        }

        // cropNChopUI.text = "Crop-n-Chop"; 
        cropNChopUI.orientation = "column";
        cropNChopUI.alignChildren = ["left", "top"];
        cropNChopUI.spacing = 10;
        cropNChopUI.margins = 16;

        var cropNResizePnl = cropNChopUI.add("panel", undefined, { name: "cropNResizePnl" });
        cropNResizePnl.text = "Crop-N-Chop";
        cropNResizePnl.orientation = "column";
        cropNResizePnl.alignChildren = ["left", "center"];
        cropNResizePnl.spacing = 10;
        cropNResizePnl.margins = [10, 16, 10, 10];
        // cropNResizePnl.preferredSize.width = 200; 


        // GROUP1
        // ======
        var group1 = cropNResizePnl.add("group", undefined, { name: "group1" });
        group1.orientation = "column";
        group1.alignChildren = ["left", "center"];
        group1.spacing = 10;
        group1.margins = 0;

        var useMotionChkBx = group1.add("checkbox", undefined, undefined);
        useMotionChkBx.name = "useMotionChkBx";
        useMotionChkBx.helpTip = "Allow space to fit moving layers";
        useMotionChkBx.text = "Include motion (⚠ slow)";

        var reframeChkBx = group1.add("checkbox", undefined, undefined);
        reframeChkBx.name = "reframeChkBx";
        reframeChkBx.helpTip = "Reframe the comp to match the bounds of selected layers.";
        reframeChkBx.text = "Reframe to fit layer(s)";

        var cropBtn = cropNResizePnl.add("button", undefined, undefined, { name: "cropBtn" });
        cropBtn.helpTip = "Crop the comp to match selected layers";
        cropBtn.text = "Crop Comp to selected";
        cropBtn.preferredSize.width = 180;

        // marginPnl
        // ====
        var marginPnl = cropNResizePnl.add("panel", undefined, { name: "marginPnl" });
        marginPnl.text = "Margin %"
        marginPnl.orientation = "column";
        marginPnl.alignChildren = ["left", "center"];
        marginPnl.spacing = 8;
        marginPnl.margins = 8;

        var marginSlidrGrp = marginPnl.add("group", undefined, { name: "marginSlidrGrp" });
        marginSlidrGrp.orientation = "row";
        marginSlidrGrp.preferredSize.width = 160;
        marginSlidrGrp.alignChildren = ["left", "center"];
        marginSlidrGrp.margins = 0;

        // var statictext1 = marginGrp.add("statictext", undefined, undefined, {name: "statictext1"}); 
        // statictext1.text = "±"; 

        var marginSlidr = marginSlidrGrp.add("slider", undefined, undefined, undefined, undefined);
        marginSlidr.name = "xSlidr"
        marginSlidr.helpTip = "add or subtract margins";
        marginSlidr.minvalue = -99;
        marginSlidr.maxvalue = 100;
        marginSlidr.preferredSize.width = 116;
        marginSlidr.preferredSize.height = 10;

        var marginTxtBx = marginSlidrGrp.add('edittext');
        marginTxtBx.name = "XTxtInput"
        marginTxtBx.preferredSize.width = 34;

        var proportionalChkBx = marginPnl.add("checkbox", undefined, undefined);
        proportionalChkBx.name = "proportionalChkBx";
        proportionalChkBx.helpTip = "margins proportional to width and height.";
        proportionalChkBx.text = "proportional";

        // INFO Text box
        var infoText = cropNResizePnl.add("statictext", undefined, undefined);
        infoText.name = "infoText"
        infoText.preferredSize.width = 180;

        var prefs = new myPrefs
            ([{
                name: useMotionChkBx.name,
                factoryDefault: false,
                prefType: "bool"
            }, {
                name: reframeChkBx.name,
                factoryDefault: true,
                prefType: "bool"
            }, {
                name: marginSlidr.name,
                factoryDefault: 0,
                prefType: "float"
            }, {
                name: proportionalChkBx.name,
                factoryDefault: false,
                prefType: "bool"
            }], scriptName);
        useMotionChkBx.value = prefs.prefs[useMotionChkBx.name];
        reframeChkBx.value = prefs.prefs[reframeChkBx.name];
        marginSlidr.value = prefs.prefs[marginSlidr.name];
        marginTxtBx.text = marginSlidr.value;


        // ================================================ Do the things ===================================================
        cropBtn.onClick = function () {
            var margin = { "proportional": proportionalChkBx.value, "value": marginSlidr.value / 100 }
            infoText.text = cropNChop(reframeChkBx.value, useMotionChkBx.value, margin);
        }

        // UI callbacks and guff
        //finicky detail, change the button text depending on whether we're reframing.
        function updateBtnText() {
            if (reframeChkBx.value) {
                cropBtn.text = "Crop Comp to selected";
                cropBtn.helpTip = "Crop Comp to fit selected layer(s),\ncentering the layer(s).";
            } else {
                cropBtn.text = "Size Comp to selected";
                cropBtn.helpTip = "Resize Comp to match the size selected layers,\n without centering.";
            }
        }
        reframeChkBx.onClick = function () {
            prefs.setPref(this.name, this.value);
            updateBtnText();
        }

        marginSlidr.onChange =
            useMotionChkBx.onClick = function () {
                prefs.setPref(this.name, this.value);
            }

        marginSlidr.onChanging = function () {
            marginTxtBx.text = Math.round(marginSlidr.value * 10) / 10;
        }



        marginTxtBx.onChange = function () {
            try {
                var parsedVal = parseFloat(marginTxtBx.text);
                if (isNaN(parsedVal)) {
                    parsedVal = marginSlidr.value;
                }
                marginSlidr.value = parsedVal;
                marginTxtBx.text = marginSlidr.value;
            } catch (e) {
                marginTxtBx.text = marginSlidr.value;
            }
            prefs.setPref(marginSlidr.name, marginSlidr.value);
        }
        updateBtnText();

        //Actually build the panel

        if (cropNChopUI instanceof Window) {
            cropNChopUI.center();
            cropNChopUI.show();
        } else {
            cropNChopUI.layout.layout(true);
        }


    }

    buildCropNChopUI(thisObj);
})(this)
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
