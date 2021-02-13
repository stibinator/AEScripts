// @target aftereffects

/* global app, Panel, getPropertiesWithExpressionsFromLayer,getPropertiesAndGroupsFromLayer, writeLn */
// regexp find and replace for expressions

//global vars
var FindNReplaceText = "Find-N-Replace"
var findNReplaceUndoGrpLabel = "Find-N-Replace";
var globalLabel = "Global";
var includeLockedLabel = 'Include locked layers';
var insensitiveLabel = "Case-insensitive";
var layersLabel = "Layer names";
var modeLabel = "Use regex"
var multiLineLabel = "Multi Line";
var newLineSpaceLabel = "'.' matches newline";
var noSelectedLayersText = "No layers selected, silly rabbit";
var propsLabel = "Property names";
var regexPanelLabel = "Regex Flags";
var scriptName = "Find-n-Replace";
var selectedOnlyLabel = '…on selected layers only';
var selectedPropsOnlyLabel = '…on selected properties only';
var targetsPanelLabel = "Targets";
var textLabel = "Text layer content";
var xpPanelLabel = "Search Patterns";
var xpressionsLabel = "Expressions";

function escapeRegexChars(theString) {
    return theString.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    // escape the plain text. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
}

function buildUI(thisObj) {
    if (thisObj instanceof Panel) {
        var pal = thisObj;
    } else {
        pal = new Window("palette", scriptName, undefined, {
            resizeable: true
        });
    }
    if (pal !== null) {
        var prefs = new myPrefs(
            [{
                    name: "layersChkBx",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "propsChkBx",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "xpressionsChkBx",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "textChkBx",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "patternEditText",
                    factoryDefault: "search pattern",
                    prefType: "string"
                },
                {
                    name: "replaceEditText",
                    factoryDefault: "replacement pattern",
                    prefType: "string"
                },
                {
                    name: "gChkBx",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "iChkBx",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "mChkBx",
                    factoryDefault: false,
                    prefType: "bool"
                },
                {
                    name: "sChkBx",
                    factoryDefault: false,
                    prefType: "bool"
                },
                {
                    name: "selectedOnlyCheckbox",
                    factoryDefault: false,
                    prefType: "bool"
                },
                {
                    name: "selectedPropsOnlyCheckbox",
                    factoryDefault: false,
                    prefType: "bool"
                },
                {
                    name: "includeLockedCheckBox",
                    factoryDefault: false,
                    prefType: "bool"
                },
            ]
        )

        var targetsPanel = pal.add('panel', undefined, targetsPanelLabel);
        targetsPanel.orientation = 'column';
        targetsPanel.alignChildren = 'left';
        targetsPanel.size = {
            width: 180,
            height: undefined
        };

        var layersChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], layersLabel);
        layersChkBx.name = "layersChkBx";
        layersChkBx.value = prefs.prefs[layersChkBx.name];
        var propsChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], propsLabel);
        propsChkBx.name = "propsChkBx";
        propsChkBx.value = prefs.prefs[propsChkBx.name];
        var xpressionsChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], xpressionsLabel);
        xpressionsChkBx.name = "xpressionsChkBx";
        xpressionsChkBx.value = prefs.prefs[xpressionsChkBx.name];
        var textChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], textLabel);
        textChkBx.name = "textChkBx";
        textChkBx.value = prefs.prefs[textChkBx.name];

        var xpPanel = pal.add('panel', undefined, xpPanelLabel);
        xpPanel.orientation = 'column';
        xpPanel.alignChildren = 'left';
        xpPanel.size = {
            width: 180,
            height: undefined
        };

        var patternEditText = xpPanel.add("edittext", [
            undefined, undefined, 200, 22
        ], "search pattern");
        patternEditText.name = "patternEditText";
        patternEditText.text = prefs.prefs[patternEditText.name];

        var replaceEditText = xpPanel.add("edittext", [
            undefined, undefined, 200, 22
        ], "replacement text");
        replaceEditText.name = "replaceEditText";
        replaceEditText.text = prefs.prefs[replaceEditText.name];

        var iChkBx = xpPanel.add("checkbox", [
            undefined, undefined, 164, 22
        ], insensitiveLabel);
        iChkBx.name = "iChkBx";
        iChkBx.value = prefs.prefs[iChkBx.name];

        var useRegexChkBx = xpPanel.add("checkbox", [
            undefined, undefined, 164, 22
        ], modeLabel);
        useRegexChkBx.name = "modeChkBx";
        useRegexChkBx.value = prefs.prefs[useRegexChkBx.name];

        var regexPanel = xpPanel.add('panel', undefined, regexPanelLabel);
        regexPanel.orientation = 'column';
        regexPanel.alignChildren = 'left';
        regexPanel.size = {
            width: 160,
            height: undefined
        };

        var gChkBx = regexPanel.add("checkbox", [
            undefined, undefined, 164, 22
        ], globalLabel);
        gChkBx.name = "gChkBx";
        gChkBx.value = prefs.prefs[gChkBx.name];

        var mChkBx = regexPanel.add("checkbox", [
            undefined, undefined, 164, 22
        ], multiLineLabel);
        mChkBx.name = "mChkBx";
        mChkBx.value = prefs.prefs[mChkBx.name];
        var sChkBx = regexPanel.add("checkbox", [
            undefined, undefined, 164, 22
        ], newLineSpaceLabel);
        sChkBx.name = "sChkBx";
        sChkBx.value = prefs.prefs[sChkBx.name];

        mChkBx.enabled =
            gChkBx.enabled =
            sChkBx.enabled = useRegexChkBx.value;

        var findNReplaceBtn = pal.add("button", [
            undefined, undefined, 200, 22
        ], FindNReplaceText);

        var selectedOnlyCheckbox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], selectedOnlyLabel);
        selectedOnlyCheckbox.name = "selectedOnlyCheckbox";
        selectedOnlyCheckbox.value = prefs.prefs[selectedOnlyCheckbox.name];
        selectedOnlyCheckbox.oldValue = selectedOnlyCheckbox.value;
        selectedOnlyCheckbox.updatePrefs = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
        }

        var selectedPropsOnlyCheckbox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], selectedPropsOnlyLabel);
        selectedPropsOnlyCheckbox.name = "selectedPropsOnlyCheckbox";
        selectedPropsOnlyCheckbox.value = prefs.prefs[selectedPropsOnlyCheckbox.name];
        selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
        selectedPropsOnlyCheckbox.updatePrefs = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
        }

        var includeLockedCheckBox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], includeLockedLabel);
        includeLockedCheckBox.name = "includeLockedCheckBox";
        includeLockedCheckBox.value = prefs.prefs[includeLockedCheckBox.name];
        includeLockedCheckBox.oldValue = includeLockedCheckBox.value; // see below
        includeLockedCheckBox.updatePrefs = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
        }

        sChkBx.onClick =
            mChkBx.onClick =
            iChkBx.onClick =
            gChkBx.onClick =
            textChkBx.onClick =
            xpressionsChkBx.onClick =
            propsChkBx.onClick =
            layersChkBx.onClick = function() {
                prefs.writePrefs({
                    name: this.name,
                    value: this.value
                })
            };

        useRegexChkBx.onClick = function() {
            mChkBx.enabled =
                gChkBx.enabled =
                sChkBx.enabled = useRegexChkBx.value;
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
        }

        selectedOnlyCheckbox.onClick = function() {
            // turn off "include locked layers" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (selectedOnlyCheckbox.value) {
                // remember the value so it can be reinstated when I uncheck the "selected only" checkbox
                includeLockedCheckBox.oldValue = includeLockedCheckBox.value;
                includeLockedCheckBox.enabled = false;
                includeLockedCheckBox.value = false; // uncheck it so that it's unambiguous
                selectedPropsOnlyCheckbox.enabled = true;
                selectedPropsOnlyCheckbox.value = selectedPropsOnlyCheckbox.oldValue;
            } else {
                includeLockedCheckBox.enabled = true;
                // reinstate the "include locked layers" value
                includeLockedCheckBox.value = includeLockedCheckBox.oldValue;
                selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
                //turn off the selected properties only checkbox
                selectedPropsOnlyCheckbox.enabled = false;
                selectedPropsOnlyCheckbox.value = false;
            }
            selectedOnlyCheckbox.updatePrefs();
            selectedPropsOnlyCheckbox.updatePrefs();
            includeLockedCheckBox.updatePrefs();
        };
        selectedPropsOnlyCheckbox.onClick = function() {
            // turn off "include locked layers" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (selectedPropsOnlyCheckbox.value) {
                // remember the value so it can be reinstated when I uncheck the "selected only" checkbox
                includeLockedCheckBox.oldValue = includeLockedCheckBox.value;
                includeLockedCheckBox.enabled = false;
                includeLockedCheckBox.value = false; // uncheck it so that it's unambiguous
                selectedOnlyCheckbox.value = true; //check the selected layers checkbox
            } else {
                includeLockedCheckBox.enabled = true;
                // reinstate the "include locked layers" value
                includeLockedCheckBox.value = includeLockedCheckBox.oldValue;
            }
            selectedOnlyCheckbox.updatePrefs();
            selectedPropsOnlyCheckbox.updatePrefs();
            includeLockedCheckBox.updatePrefs();
        };

        includeLockedCheckBox.onClick = function() {
            // turn off "selected" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (includeLockedCheckBox.value) {
                // remember the value so it can be reinstated when I uncheck the "include locked" checkbox
                selectedOnlyCheckbox.oldValue = selectedOnlyCheckbox.value;
                selectedOnlyCheckbox.enabled = false;
                selectedOnlyCheckbox.value = false; // uncheck it so that it's unambiguous
                //turn off the selected properties only checkbox, remembering its value
                selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
                selectedPropsOnlyCheckbox.enabled = false;
                selectedPropsOnlyCheckbox.value = false;
            } else {
                selectedOnlyCheckbox.enabled = true;
                // reinstate the "selected only" value
                selectedOnlyCheckbox.value = selectedOnlyCheckbox.oldValue;
                //and the selected props checkbox
                selectedPropsOnlyCheckbox.enabled = true;
                selectedPropsOnlyCheckbox.value = selectedPropsOnlyCheckbox.oldValue;
            }
            selectedOnlyCheckbox.updatePrefs();
            selectedPropsOnlyCheckbox.updatePrefs();
            includeLockedCheckBox.updatePrefs();
        };

        patternEditText.onChange = function() {
            findNReplaceBtn.enabled = ((patternEditText.text.length > 0) && (layersChkBx || propsChkBx || xpressionsChkBx || textChkBx));
            prefs.writePrefs({
                name: this.name,
                value: this.text
            })
        }
        replaceEditText.onChange = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.text
            })
        }

        findNReplaceBtn.onClick = function() {
            app.beginUndoGroup(findNReplaceUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value, includeLockedCheckBox.value);

            var theFlags = "";
            if (iChkBx.value) {
                theFlags += "i";
            }
            if (useRegexChkBx.value) {
                if (gChkBx.value) {
                    theFlags += "g";
                }
                if (mChkBx.value) {
                    theFlags += "m";
                }
                if (sChkBx.value) {
                    theFlags += "s";
                }
            }

            var escapedRegexp = escapeRegexChars(patternEditText.text);

            var theSearchPattern = (useRegexChkBx.value) ?
                new RegExp(patternEditText.text, theFlags) :
                new RegExp(escapedRegexp, theFlags);

            var changedLayerNames = [];
            for (var i = 0; i < theLayers.length; i++) {
                var theLayer = theLayers[i];
                var wasLocked = theLayer.locked;
                theLayer.locked = false;
                if (xpressionsChkBx.value) {
                    // alert("finding expressions");
                    findNReplaceInExpressions(
                        theLayer,
                        selectedPropsOnlyCheckbox.value,
                        theSearchPattern,
                        replaceEditText.text
                    );
                }
                if (layersChkBx.value) {
                    var layerNameResult = findNReplaceInLayerNames(
                        theLayer,
                        theSearchPattern,
                        replaceEditText.text
                    );
                    if (layerNameResult) {
                        changedLayerNames.push(layerNameResult);
                    }
                }
                if (propsChkBx.value) {
                    findNReplaceInProperties(
                        theLayer,
                        selectedPropsOnlyCheckbox.value,
                        theSearchPattern,
                        replaceEditText.text
                    );
                }
                if (textChkBx.value) {
                    findNReplaceInTextLayers(
                        theLayer,
                        theSearchPattern,
                        replaceEditText.text
                    );
                }
                theLayer.locked = wasLocked;
            }
            if (changedLayerNames.length) {
                var currentComp = app.project.activeItem;
                // replace all references to this layer
                for (var n = 0; n < changedLayerNames.length; n++) {
                    var theOldNameEscd = escapeRegexChars(changedLayerNames[n][0]);
                    var theNewNameEscd = escapeRegexChars(changedLayerNames[n][1]);
                    // search in current comp for thisComp.layer(<old Layer Name>)
                    var theSearchText = "(thisComp\\.layer\\s*\\(\\s*[\"'])" + theOldNameEscd + "([\"']\\s*\\))";
                    var theSearchPattern = new RegExp(theSearchText, "g");
                    var theReplaceText = "$1" + theNewNameEscd  + "$2";
                    for (var lyr = 1; lyr <= currentComp.numLayers; lyr++) {
                        theLayer = currentComp.layer(lyr);
                        findNReplaceInExpressions(theLayer, false, theSearchPattern,theReplaceText);
                    }
                    var theCompNameEscd = escapeRegexChars(currentComp.name);
                    // var theSearchText = "(((thisComp|comp\\(\\s*[\"']" + activeCompName + "[\"']\\s*\\)))\\.layer\\s*\\([\"'])" + theChangedName + "([\"']\\s*\\))"
                    theSearchText = "(comp\\(\\s*[\"']" + theCompNameEscd + "[\"']\\s*\\)\\.layer\\s*\\([\"'])" + theOldNameEscd + "([\"']\\s*\\))";
                    theSearchPattern = new RegExp(theSearchText, "g");
                    var theReplaceText = "$1" + theNewNameEscd + "$2";
                    for (var c = 1; c <= app.project.numItems; c++) {
                        if (app.project.item(c).typeName === "Composition") {
                            var theComp = app.project.item(c);
                            for (var lyr = 1; lyr <= theComp.numLayers; lyr++) {
                                theLayer = theComp.layer(lyr);
                                findNReplaceInExpressions(
                                    theLayer,
                                    false,
                                    theSearchPattern,
                                    theReplaceText
                                );
                            }
                        }
                    }
                }
            }
            app.endUndoGroup();
        };
    }
    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }

}

// actually build the UI
buildUI(this);

//here comes the real hoo-hah
function getTheLayers(selectedOnly, includeLocked) {
    var theLayersList = [];
    if (selectedOnly) {
        if (app.project.activeItem.selectedLayers.length > 0) {
            theLayersList = app.project.activeItem.selectedLayers;
        } else {
            alert(noSelectedLayersText);
        }
    } else {
        for (var i = 1; i <= app.project.activeItem.layers.length; i++) {
            if (!app.project.activeItem.layers[i].locked || includeLocked) {
                theLayersList.push(app.project.activeItem.layers[i]);
            }
        }
    }
    return theLayersList;
}

function findNReplaceInExpressions(
    theLayer,
    onlySelectedProps,
    theSearchPattern,
    replaceString
) {
    var expressionProps = getExpressions(theLayer, onlySelectedProps);
    for (var i = 0; i < expressionProps.length; i++) {
        // alert(expressionProps[i].expression + "\n" + theSearchPattern.toString() + "\n" + expressionProps[i].expression.replace(theSearchPattern, replaceString))
        expressionProps[i].expression = expressionProps[i].expression.replace(theSearchPattern, replaceString);
    }
}

function findNReplaceInLayerNames(
    theLayer,
    theSearchPattern,
    replaceString
) {
    if (theLayer.name.match(theSearchPattern)) { //only change the name if it matches
        //even if the result is the same, setting it sets theLayer.isNameFromSource to false
        //which may not be wanted
        var oldLayerName = theLayer.name;
        theLayer.name = theLayer.name.replace(theSearchPattern, replaceString);
        return ([oldLayerName, theLayer.name]);
    }
    return (false);
}

function findNReplaceInProperties(
    theLayer,
    onlySelectedProps,
    theSearchPattern,
    replaceString
) {
    var theProps = getProps(theLayer, onlySelectedProps);
    var errors = 0;
    for (var i = 0; i < theProps.length; i++) {
        // if (theProps[i].propertyGroup().propertyType === PropertyType.INDEXED_GROUP) {
        try {
            var newName = theProps[i].name.replace(theSearchPattern, replaceString);
            theProps[i].name = newName;
        } catch (x_x) {
            errors++;
        }
        writeLn(errors)
    }
}

function findNReplaceInTextLayers(
    theLayer,
    theSearchPattern,
    replaceString
) {
    if (theLayer.matchName === "ADBE Text Layer") {
        var oldText = theLayer.property("Text").property("Source Text").value;
        var newText = oldText.text.replace(theSearchPattern, replaceString);
        alert(newText);
        theLayer.property("Text").property("Source Text").setValue(newText);
    }
}


function getExpressions(theLayer, onlySelectedProps) {
    var theProps = [];
    var newProps;
    newProps = getPropertiesWithExpressionsFromLayer(theLayer, onlySelectedProps);
    for (var j = 0; j < newProps.length; j++) {
        theProps.push(newProps[j]);
    }

    return theProps;
}

function getProps(theLayer, onlySelectedProps) {
    var theProps = [];
    var newProps;
    newProps = getPropertiesAndGroupsFromLayer(theLayer, onlySelectedProps);
    for (var j = 0; j < newProps.length; j++) {
        theProps.push(newProps[j]);
    }
    return theProps;
}

function myPrefs(prefList) {

    this.parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
                return parseInt(val, 10);
            case "float":
                return parseFloat(val);
            case "bool":
                return (val === "true")
            default:
                return val
        }
    }

    this.getPref = function(preference) {
        if (app.settings.haveSetting(scriptName, preference.name)) {
            this.prefs[preference.name] = this.parsePref(app.settings.getSetting(scriptName, preference.name), preference.prefType);
        } else {
            this.prefs[preference.name] = preference.factoryDefault;
        }
    }

    this.writePrefs = function(preference) {
        if (this.prefs[preference.name] !== preference.value) {
            app.settings.saveSetting(scriptName, preference.name, preference.value)
        }
        this.prefs[preference.name] = preference.value;
    }

    this.prefs = {};
    for (var p in prefList) {
        this.getPref(prefList[p]);
    }
}

// eslint-disable-next-line no-unused-vars
function getPropertiesWithExpressionsFromLayer(theLayer, selectedOnly) {
    var props = [];
    //only return selected properties. Kinda trivial but here for ease of use
    if (selectedOnly) {
        for (var j = 0; j < theLayer.selectedProperties.length; j++) {
            if (theLayer.selectedProperties[j].expression) {
                props.push(theLayer.selectedProperties[j]);
            }
        }
    } else {
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        if (newProps[i].expression) {
                            props.push(newProps[i]);
                        }
                    }
                }
            }
        }
    }
    return props;
}

function traversePropertyGroups(pGroup, inclusive) {
    // walks through property groups, returning properties
    // if inclusive is true, returns property groups as well
    if (pGroup) {
        var props = [];
        //alert(pGroup.numProperties);
        if (typeof pGroup.numProperties !== 'undefined') {
            if (inclusive) {
                props.push(pGroup)
            }
            for (var pp = 1; pp <= pGroup.numProperties; pp++) {
                var newProps = traversePropertyGroups(pGroup.property(pp), inclusive);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        props.push(newProps[i]);
                    }
                }
            }
        } else {
            props.push(pGroup);
        }
        return props;
    }
}