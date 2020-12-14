// @target aftereffects
// @includepath "../(lib)"
// @include "defaultFor.jsx"
// @include "timeconversions.jsx"
// @include "spacetransforms.jsx"
// @include "vectormaths.jsx"
// @include "getproperties.jsx"
// @include "copyproperties-makekey.jsx"
// @script "copyMultiLayer"
/* global app, Panel, ScriptUI, CompItem, makeKeyWithAttributes, makeKeyAtTime, setKeyAttributesReversed, getKeyAttributes, defaultFor, getIndividualProperties */

var thisScript = this;
thisScript.scriptTitle = "copyMultiLayer";
//var theComp = app.project.activeItem;

thisScript.run = function() {
    // thisScript.prefs = new PrefsFile(thisScript.scriptTitle);
    this.buildGUI(thisScript);
};

thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisObj.w = (thisObj instanceof Panel)? thisObj: new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    thisObj.w.alignChildren = ['left', 'top'];
    //thisObj.text = "vers. 0.1.1";
    var beforeBtnImg = "copy_multi/before-ph.png";
    var afterBtnImg = "copy_multi/after-ph.png";
    var beforePH = ScriptUI.newImage(beforeBtnImg, undefined, beforeBtnImg, afterBtnImg);
    var afterPH = ScriptUI.newImage(afterBtnImg, undefined, afterBtnImg, beforeBtnImg);

    var row1 = thisObj.w.add("group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fill']}");
    var row2 = thisObj.w.add("group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fill']}");
    var row3 = thisObj.w.add("group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fill']}");

    var copyPasteBttn = row1.add("iconbutton", {
        "x": undefined,
        "y": undefined,
        "width": 32,
        "height": 32
    }, File("copy_multi/copy-paste.png"));

    var copyPasteRevBttn = row1.add("iconbutton", {
        "x": undefined,
        "y": undefined,
        "width": 32,
        "height": 32
    }, File("copy_multi/copy-paste_rev.png"));

    var copyTimeSliceBttn = row2.add("iconbutton", {
        "x": undefined,
        "y": undefined,
        "width": 32,
        "height": 32
    }, File("copy_multi/copy-TS.png"));
    var pasteTimeSliceBttn = row2.add("iconbutton", {
        "x": undefined,
        "y": undefined,
        "width": 32,
        "height": 32
    }, File("copy_multi/paste-TS.png"));

    var beforeAfterToggle = row3.add("iconbutton", {
        "x": undefined,
        "y": undefined,
        "width": 32,
        "height": 32
    }, afterPH, {
        style: 'toolbutton',
        toggle: true
    });
    // copyBttn.helpTip = "copy";
    // pasteBttn.helpTip = "paste";
    // pasteRevBttn.helpTip = "paste reversed";
    copyPasteBttn.helpTip = "copy + paste";
    copyPasteRevBttn.helpTip = "copy + paste reversed";
    beforeAfterToggle.helpTip = "paste reversed keys before / after playhead";
    copyTimeSliceBttn.helpTip = "copy time slice of selected layers";
    pasteTimeSliceBttn.helpTip = "paste time slice as keyframes";
    // copyBttn.preferredSize = [42, 42];
    // copyPasteBttn.preferredSize = [42, 42];
    // pasteBttn.preferredSize = [42, 42];
    // pasteRevBttn.preferredSize = [42, 42];
    // copyPasteRevBttn.preferredSize = [42, 42];

    // pasteBttn.enabled = false;
    // pasteRevBttn.enabled = false;
    // pasteTimeSliceBttn.enabled = false;

    // copyBttn.onClick = function() {
    //     var theComp = app.project.activeItem;
    //     if (theComp instanceof CompItem) {
    //         app.beginUndoGroup("copy keys");
    //         thisObj.theCopiedKeys = thisObj.getSelectedKeys(theComp);
    //         thisObj.prefs.saveToPrefs(thisObj.theCopiedKeys);
    //         app.endUndoGroup();
    //         pasteBttn.enabled = true;
    //         pasteRevBttn.enabled = true;
    //     }
    // };

    // pasteBttn.onClick = function() {
    //     var theComp = app.project.activeItem;
    //     if (theComp instanceof CompItem) {
    //         app.beginUndoGroup("paste keys");
    //         if (thisObj.theCopiedKeys === null) {
    //             thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    //         }
    //         if (thisObj.theCopiedKeys !== null) {
    //             thisObj.pasteKeys(thisObj.theCopiedKeys, beforeAfterToggle.value, theComp);
    //         } else {
    //             writeln("no copied keys found");
    //         }
    //         app.endUndoGroup();
    //     }
    // };

    copyPasteBttn.onClick = function() {
        var theComp = app.project.activeItem;
        if (theComp instanceof CompItem) {
            app.beginUndoGroup("copy and paste Keys"); 
            thisObj.theCopiedKeys = thisObj.getSelectedKeys(theComp);
            // thisObj.prefs.saveToPrefs(thisObj.theCopiedKeys);
            thisObj.pasteKeys(thisObj.theCopiedKeys, beforeAfterToggle.value, theComp);
            app.endUndoGroup();
            // pasteBttn.enabled = true;
            // pasteRevBttn.enabled = true;
        }
    };

    // pasteRevBttn.onClick = function() {
    //     var theComp = app.project.activeItem;
    //     if (theComp instanceof CompItem) {
    //         app.beginUndoGroup("paste keys");
    //         if (thisObj.theCopiedKeys === null) {
    //             thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    //         }
    //         if (thisObj.theCopiedKeys !== null) {
    //             thisObj.pasteKeysReverse(thisObj.theCopiedKeys, beforeAfterToggle.value, theComp);
    //         } else {
    //             writeln("no copied keys found");
    //         }
    //         app.endUndoGroup();
    //     }
    // };

    copyPasteRevBttn.onClick = function() {
        var theComp = app.project.activeItem;
        if (theComp instanceof CompItem) {
            app.beginUndoGroup("copy and paste Keys"); 
            thisObj.theCopiedKeys = thisObj.getSelectedKeys(theComp);
            // thisObj.prefs.saveToPrefs(thisObj.theCopiedKeys);
            thisObj.pasteKeysReverse(thisObj.theCopiedKeys, beforeAfterToggle.value, theComp);
            app.endUndoGroup();
            // pasteBttn.enabled = true;
            // pasteRevBttn.enabled = true;
        }
    };

    beforeAfterToggle.onClick = function() {
        if (beforeAfterToggle.value) {
            beforeAfterToggle.image = beforePH;
        } else {
            beforeAfterToggle.image = afterPH;
        }
    };

    copyTimeSliceBttn.onClick = function() {
        var theComp = app.project.activeItem;
        if (theComp instanceof CompItem) {
            thisObj.timeSlice = thisScript.copyTimeSlice(theComp);
            pasteTimeSliceBttn.enabled = true;
        }
    };

    pasteTimeSliceBttn.onClick = function() {
        var theComp = app.project.activeItem;
        if (theComp instanceof CompItem) {
            thisScript.pasteTimeSlice(thisScript.timeSlice, theComp);
        }
    };
    //-------end of the buttons, build the GUI-----------------------
    if (thisObj.w instanceof Window) {
        thisObj.w.center();
        thisObj.w.show();
    } else
        thisObj.w.layout.layout(true);
    }
;
//--------------------now for the real hoo-ha------------------

thisScript.pasteKeys = function(theCopiedKeys, beforePlayHead, theComp) {
    if (theCopiedKeys !== null) {
        for (var i = 0; i < theCopiedKeys.keys.length; i++) {
            var theKey = theCopiedKeys.keys[i];
            var offsetTime = theKey.attributes.keyTime - theCopiedKeys.lastSelectedKeyTime;
            if (beforePlayHead !== true) {
                offsetTime = theKey.attributes.keyTime - theCopiedKeys.firstSelectedKeyTime;
            }
            makeKeyWithAttributes(theKey.prop, theKey.attributes, theComp.time + offsetTime);
        }
    }
};

thisScript.pasteKeysReverse = function(theCopiedKeys, beforePlayHead, theComp) {
    if (theCopiedKeys !== null) {
        for (var i = 0; i < theCopiedKeys.keys.length; i++) {
            var theKey = theCopiedKeys.keys[i];
            if (beforePlayHead === true) {
                var offsetTime = theKey.attributes.keyTime - theCopiedKeys.firstSelectedKeyTime;
                makeKeyAtTime(theKey.prop, theKey.attributes, theComp.time - offsetTime);
            } else {
                offsetTime = theCopiedKeys.lastSelectedKeyTime - theKey.attributes.keyTime;
                makeKeyAtTime(theKey.prop, theKey.attributes, theComp.time + offsetTime);
            }
        }
        for (var k = 0; k < theCopiedKeys.keys.length; k++) {
            var theNewKey = theCopiedKeys.keys[k];
            if (beforePlayHead === true) {
                offsetTime = theNewKey.attributes.keyTime - theCopiedKeys.firstSelectedKeyTime;
                setKeyAttributesReversed(theNewKey.prop, theNewKey.attributes, theComp.time - offsetTime);
            } else {
                offsetTime = theCopiedKeys.lastSelectedKeyTime - theNewKey.attributes.keyTime;
                setKeyAttributesReversed(theNewKey.prop, theNewKey.attributes, theComp.time + offsetTime);
            }
        }
    }
};

thisScript.getSelectedKeys = function(theComp) {
    //the object this function will return: an array of keys and the first key's time
    var theKeys = {
        keys: [],
        firstSelectedKeyTime: null,
        lastSelectedKeyTime: null
    };
    var selLayers = theComp.selectedLayers;

    //drill down to get to the keys:
    for (var i = 0; i < selLayers.length; i++) {
        var selectedProps = selLayers[i].selectedProperties;
        for (var j = 0; j < selectedProps.length; j++) {
            var selectedKeyframes = selectedProps[j].selectedKeys;
            if (selectedKeyframes) {
                for (var k = 0; k < selectedKeyframes.length; k++) {
                    //get the attributes of the selected key - note that the key list is 1-indexed WTF adobe?
                    var theAttributes = getKeyAttributes(selectedProps[j], selectedKeyframes[k]);
                    if (theKeys.firstSelectedKeyTime === null || theAttributes.keyTime < theKeys.firstSelectedKeyTime) {
                        theKeys.firstSelectedKeyTime = theAttributes.keyTime;
                    }
                    if (theKeys.lastSelectedKeyTime === null || theAttributes.keyTime > theKeys.lastSelectedKeyTime) {
                        theKeys.lastSelectedKeyTime = theAttributes.keyTime;
                    }
                    //add a new object to the array of keys:
                    theKeys.keys.push({layerIndex: selLayers[i].index, prop: selectedProps[j], attributes: theAttributes});
                }
            }
        }
    }
    return theKeys;
};

thisScript.copyTimeSlice = function(theComp) {
    var theProps = [];
    var theVals = [];
    theComp = defaultFor(theComp, app.project.activeItem, true);
    var selLayers = theComp.selectedLayers;
    for (var layer = 0; layer < selLayers.length; layer++) {
        var theLayer = selLayers[layer];
        var selProps = getIndividualProperties(theLayer.selectedProperties);
        for (var p = 0; p < selProps.length; p++) {
            theProps.push(selProps[p]);
        }
    }
    for (var prop = 0; prop < theProps.length; prop++) {
        theVals.push({"prop": theProps[prop], "val": theProps[prop].value});
    }
    return theVals;
};

thisScript.pasteTimeSlice = function(theVals, theComp) {
    app.beginUndoGroup("paste Time Slice");
    thisScript.theComp = defaultFor(theComp, app.project.activeItem, true);
    for (var i = 0; i < theVals.length; i++) {
        theVals[i].prop.setValueAtTime(theComp.time, theVals[i].val);
    }
    app.endUndoGroup();
};

thisScript.run();
