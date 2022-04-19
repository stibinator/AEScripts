// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

/* global app, Panel, writeLn */
// regexp find and replace for expressions

//global vars
var findNReplace = {
    FindNReplaceText: "Find-N-Replace",
    findNReplaceUndoGrpLabel: "Find-N-Replace",
    globalLabel: "Global",
    includeLockedLabel: 'Include locked layers',
    insensitiveLabel: "Case-insensitive",
    layersLabel: "Layer names",
    modeLabel: "Use regex",
    multiLineLabel: "Multi Line",
    noSelectedLayersText: "No layers selected, silly rabbit",
    propsLabel: "Property names",
    regexPanelLabel: "Regex Flags",
    scriptName: "Find-n-Replace",
    selectedOnlyLabel: '… on selected layers only',
    selectedPropsOnlyLabel: '… on selected properties only',
    targetsPanelLabel: "Targets",
    textLabel: "Text layer content",
    xpPanelLabel: "Search Patterns",
    xpressionsLabel: "Expressions",
    jsSearchStrPanelLabel: "JS search pattern",
    layerOptsPanelLabel: "Target options",
    fixExpressionsLabel: "Auto fix expressions for layer names"
}
findNReplace.escapeRegexChars = function(theString) {
    return theString.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    // escape the plain text. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
}

findNReplace.getPropertiesAndGroupsFromLayer = function(theLayer, selectedOnly) {
    var props = [];
    //only return selected properties. Kinda trivial but here for ease of use
    if (selectedOnly) {
        for (var j = 0; j < theLayer.selectedProperties.length; j++) {
            props.push(theLayer.selectedProperties[j]);
        }
    } else {
        //walk the whole property tree
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                props.push(theLayer.property(p));
                var propertyGroup = theLayer.property(p);
                var newProps = findNReplace.traversePropertyGroups(propertyGroup, true);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        props.push(newProps[i]);
                    }
                }
            }
        }
    }
    return props;
}

findNReplace.traversePropertyGroups = function(pGroup, inclusive) {
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
                var newProps = findNReplace.traversePropertyGroups(pGroup.property(pp), inclusive);
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

findNReplace.buildUI = function(thisObj) {
    if (thisObj instanceof Panel) {
        var pal = thisObj;
    } else {
        pal = new Window("palette", findNReplace.scriptName, undefined, {
            resizeable: true
        });
    }
    if (pal !== null) {
        var prefs = new findNReplace.myPrefs(
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
            {
                name: "fixExpressionsCheckBox",
                factoryDefault: true,
                prefType: "bool"
            }
        ])
        //=========================================== UI Elements and Layout =====================================
        
        // ======================= targetsPanel =============================
        var targetsPanel = pal.add('panel', undefined, findNReplace.targetsPanelLabel);
        targetsPanel.orientation = 'column';
        targetsPanel.alignChildren = 'left';
        targetsPanel.preferredSize = {
            width: 180,
            height: undefined
        };
        targetsPanel.spacing = 0;
        targetsPanel.margins = [16, 12, 16, 0]
        // ======================= layersChkBx =============================
        var layersChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.layersLabel);
        layersChkBx.name = "layersChkBx";
        layersChkBx.value = prefs.prefs[layersChkBx.name];
        // ======================= propsChkBx =============================
        var propsChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.propsLabel);
        propsChkBx.name = "propsChkBx";
        propsChkBx.value = prefs.prefs[propsChkBx.name];
        // ======================= xpressionsChkBx =============================
        var xpressionsChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.xpressionsLabel);
        xpressionsChkBx.name = "xpressionsChkBx";
        xpressionsChkBx.value = prefs.prefs[xpressionsChkBx.name];
        // ======================= textChkBx =============================
        var textChkBx = targetsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.textLabel);
        textChkBx.name = "textChkBx";
        textChkBx.value = prefs.prefs[textChkBx.name];
        
        // ======================= targetsPanel =============================
        var layerOptsPanel = pal.add('panel', undefined, findNReplace.layerOptsPanelLabel);
        layerOptsPanel.orientation = 'column';
        layerOptsPanel.alignChildren = 'left';
        layerOptsPanel.preferredSize = {
            width: 180,
            height: undefined
        };
        layerOptsPanel.spacing = 0;
        layerOptsPanel.margins = [16, 12, 16, 0]
        // ================= selectedOnlyCheckbox =================
        var selectedOnlyCheckbox = layerOptsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.selectedOnlyLabel);
        selectedOnlyCheckbox.name = "selectedOnlyCheckbox";
        selectedOnlyCheckbox.value = prefs.prefs[selectedOnlyCheckbox.name];
        selectedOnlyCheckbox.oldValue = selectedOnlyCheckbox.value;
        
        // ================= selectedPropsOnlyCheckbox =================
        var selectedPropsOnlyCheckbox = layerOptsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.selectedPropsOnlyLabel);
        selectedPropsOnlyCheckbox.name = "selectedPropsOnlyCheckbox";
        selectedPropsOnlyCheckbox.value = prefs.prefs[selectedPropsOnlyCheckbox.name];
        selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
        
        // ================= includeLockedCheckBox =================
        var includeLockedCheckBox = layerOptsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.includeLockedLabel);
        includeLockedCheckBox.name = "includeLockedCheckBox";
        includeLockedCheckBox.value = prefs.prefs[includeLockedCheckBox.name];
        includeLockedCheckBox.oldValue = includeLockedCheckBox.value; // see below
        // ================= fixExpressionsCheckBox =================
        var fixExpressionsCheckBox = layerOptsPanel.add("checkbox", [
            undefined, undefined, 200, 22
        ], findNReplace.fixExpressionsLabel);
        fixExpressionsCheckBox.name = "fixExpressionsCheckBox";
        fixExpressionsCheckBox.value = prefs.prefs[fixExpressionsCheckBox.name];
        // ======================= xpPanel =============================
        var xpPanel = pal.add('panel', undefined, findNReplace.xpPanelLabel);
        xpPanel.orientation = 'column';
        xpPanel.alignChildren = 'left';
        xpPanel.preferredSize = {
            width: 180,
            height: undefined
        };
        
        // ======================= patternEditText =============================
        var patternEditText = xpPanel.add("edittext", [
            undefined, undefined, 200, 22
        ], "search pattern");
        patternEditText.name = "patternEditText";
        patternEditText.text = prefs.prefs[patternEditText.name];
        
        // ======================= replaceEditText =============================
        var replaceEditText = xpPanel.add("edittext", [
            undefined, undefined, 200, 22
        ], "replacement text");
        replaceEditText.name = "replaceEditText";
        replaceEditText.text = prefs.prefs[replaceEditText.name];
        
        // ======================= jsSearchStrPanel =============================
        var jsSearchStrPanel = xpPanel.add('panel', undefined, findNReplace.jsSearchStrPanelLabel);
        jsSearchStrPanel.orientation = 'column';
        jsSearchStrPanel.alignChildren = 'left';
        jsSearchStrPanel.margins = [10, 12, 16, 0];
        // ======================= regexText =============================
        var regexText = jsSearchStrPanel.add("statictext", undefined, undefined);
        regexText.preferredSize.width = 164;
        
        // ================== settingsGrp ==============
        var settingsGrp = xpPanel.add('group', undefined);
        settingsGrp.orientation = 'column';
        settingsGrp.alignChildren = 'left';
        settingsGrp.spacing = 0;
        settingsGrp.margins = [0, 0, 0, 0];
        
        // ======================= iChkBx =============================
        var iChkBx = settingsGrp.add("checkbox", [
            undefined, undefined, 164, 22
        ], findNReplace.insensitiveLabel);
        iChkBx.name = "iChkBx";
        iChkBx.value = prefs.prefs[iChkBx.name];
        
        // ======================= useRegexChkBx =============================
        var useRegexChkBx = settingsGrp.add("checkbox", [
            undefined, undefined, 164, 22
        ], findNReplace.modeLabel);
        useRegexChkBx.name = "modeChkBx";
        useRegexChkBx.value = prefs.prefs[useRegexChkBx.name];
        
        // ======================= regexPanel =============================
        var regexPanel = settingsGrp.add('panel', undefined, findNReplace.regexPanelLabel);
        regexPanel.orientation = 'column';
        regexPanel.alignChildren = 'left';
        regexPanel.preferredSize = {
            width: 160,
            height: undefined
        };
        regexPanel.spacing = 0;
        regexPanel.margins = [16, 12, 16, 0];
        
        // ======================= gChkBx =============================
        var gChkBx = regexPanel.add("checkbox", [
            undefined, undefined, 150, 22
        ], findNReplace.globalLabel);
        gChkBx.name = "gChkBx";
        gChkBx.value = prefs.prefs[gChkBx.name];
        
        // ======================= mChkBx =============================
        var mChkBx = regexPanel.add("checkbox", [
            undefined, undefined, 150, 22
        ], findNReplace.multiLineLabel);
        mChkBx.name = "mChkBx";
        
        
        // ================= findNReplaceBtn =================
        var btnPanel = pal.add("panel");
        btnPanel.orientation = 'column';
        btnPanel.spacing = 0;
        btnPanel.margins = [16, 12, 16, 0];
        var findNReplaceBtn = btnPanel.add("button", [
            undefined, undefined, 200, 22
        ], findNReplace.FindNReplaceText);
        
        var statusText = btnPanel.add("statictext", undefined, undefined);
        statusText.preferredSize = { "width": 200, "height": 22 };
        statusText.text = "Find-N-Replace";
        
        
        //=========================================================================================================
        
        //======================= updaters =============================
        getFlags = function () {
            var theFlags = (iChkBx.value) ? "i" : "";
            if (useRegexChkBx.value){
                theFlags += (gChkBx.value) ? "g" : "";
                theFlags += (mChkBx.value) ? "m" : "";
            }
            return( theFlags);
        }
        
        regexText.update = function () {
            var pattrn = (useRegexChkBx.value) ? patternEditText.text : findNReplace.escapeRegexChars(patternEditText.text);
            this.text = new RegExp( pattrn, getFlags());
        }
        regexText.update();
        
        selectedOnlyCheckbox.updatePrefs =
        selectedPropsOnlyCheckbox.updatePrefs =
        includeLockedCheckBox.updatePrefs = function () {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
        }
        
        findNReplaceBtn.update = function (msg) {
            var validSearchPattern = (patternEditText.text.length > 0);
            var validTargets = (layersChkBx.value || propsChkBx.value || xpressionsChkBx.value || textChkBx.value);
            var ok2Go =  validSearchPattern && validTargets;
            findNReplaceBtn.enabled = ok2Go;
            if (!validSearchPattern) {
                statusText.text = "⚠ enter a valid search pattern";
            }
            if (!validTargets) {
                statusText.text = "⚠ set some targets";
            }
            if (ok2Go) {
                statusText.text = msg || "ready to replace";
            }
        }
        
        // ==================== enable stuff ============================
        mChkBx.enabled =
        gChkBx.enabled = useRegexChkBx.value;
        selectedPropsOnlyCheckbox.enabled = propsChkBx.value;
        
        findNReplaceBtn.update();
        // =================== Callback functions =================================================================================================
        mChkBx.onClick =
        iChkBx.onClick =
        textChkBx.onClick =
        xpressionsChkBx.onClick =
        layersChkBx.onClick = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
            regexText.update();
            findNReplaceBtn.update();
        };
        
        propsChkBx.onClick = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
            if (propsChkBx.value) {
                selectedPropsOnlyCheckbox.value = selectedPropsOnlyCheckbox.oldValue;
            } else {
                selectedPropsOnlyCheckbox.oldValue = selectedPropsOnlyCheckbox.value;
                selectedPropsOnlyCheckbox.value = false;
            }
            selectedPropsOnlyCheckbox.enabled = propsChkBx.value;
            findNReplaceBtn.update();
        };
        
        useRegexChkBx.onClick = function() {
            mChkBx.enabled =
            gChkBx.enabled =
            useRegexChkBx.value;
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
            regexText.update();
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
        
        
        patternEditText.onChange = function () {
            findNReplaceBtn.update();
            prefs.writePrefs({
                name: this.name,
                value: this.text
            })
            findNReplaceBtn.update();
            regexText.update();
        }
        
        replaceEditText.onChange = function() {
            prefs.writePrefs({
                name: this.name,
                value: this.text
            })
            findNReplaceBtn.update();
        }
        
        findNReplaceBtn.onClick = function () {
            app.beginUndoGroup(findNReplace.findNReplaceUndoGrpLabel);
            var theLayers = findNReplace.getTheLayers(selectedOnlyCheckbox.value, includeLockedCheckBox.value);
            
            var theSearchPattern = (useRegexChkBx.value) ?
            new RegExp(patternEditText.text, getFlags()) :
            new RegExp(findNReplace.escapeRegexChars(patternEditText.text), getFlags());
            
            var changedLayerNames = [];
            for (var i = 0; i < theLayers.length; i++) {
                var theLayer = theLayers[i];
                var wasLocked = theLayer.locked;
                theLayer.locked = false;

                //------------- find n replace expressions -------------
                if (xpressionsChkBx.value) {
                    // alert("finding expressions");
                    findNReplace.findNReplaceInExpressions(theLayer, selectedPropsOnlyCheckbox.value, theSearchPattern, replaceEditText.text);
                }

                //------------- find n replace layers -------------
                if (layersChkBx.value) {
                    var layerNameResult = findNReplace.findNReplaceInLayerNames(theLayer, theSearchPattern, replaceEditText.text, fixExpressionsCheckBox.value);
                    if (layerNameResult) {
                        changedLayerNames.push(layerNameResult);
                    }
                }
                
                //------------- find n replace props -------------
                if (propsChkBx.value) {
                    findNReplace.findNReplaceInProperties(theLayer, selectedPropsOnlyCheckbox.value, theSearchPattern, replaceEditText.text);
                }
                
                //------------- find n replace text -------------
                if (textChkBx.value) {
                    findNReplace.findNReplaceInTextLayers(theLayer, theSearchPattern, replaceEditText.text);
                }
                theLayer.locked = wasLocked;
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


//here comes the real hoo-hah
findNReplace.getTheLayers = function(selectedOnly, includeLocked) {
    var theLayersList = [];
    if (selectedOnly) {
        if (app.project.activeItem.selectedLayers.length > 0) {
            theLayersList = app.project.activeItem.selectedLayers;
        } else {
            alert(findNReplace.noSelectedLayersText);
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

findNReplace.findNReplaceInExpressions = function(theLayer, onlySelectedProps, theSearchPattern, replaceString) {
    var expressionProps = findNReplace.getExpressions(theLayer, onlySelectedProps);
    for (var i = 0; i < expressionProps.length; i++) {
        // alert(expressionProps[i].expression + "\n" + theSearchPattern.toString() + "\n" + expressionProps[i].expression.replace(theSearchPattern, replaceString))
        expressionProps[i].expression = expressionProps[i].expression.replace(theSearchPattern, replaceString);
    }
}

findNReplace.findNReplaceInLayerNames = function(theLayer, theSearchPattern, replaceString, autoFixExpressions) {
    if (theLayer.name.match(theSearchPattern)) { //only change the name if it matches
        //even if the result is the same, setting it sets theLayer.isNameFromSource to false
        //which may not be wanted
        var oldLayerName = theLayer.name;
        theLayer.name = theLayer.name.replace(theSearchPattern, replaceString);
        if (autoFixExpressions){ app.project.autoFixExpressions(oldLayerName, theLayer.name)}
    }
    return (false);
}

findNReplace.findNReplaceInProperties = function(theLayer, onlySelectedProps, theSearchPattern, replaceString) {
    var theProps = findNReplace.getProps(theLayer, onlySelectedProps);
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

findNReplace.findNReplaceInTextLayers = function(theLayer, theSearchPattern, replaceString) {
    if (theLayer.matchName === "ADBE Text Layer") {
        var oldText = theLayer.property("Text").property("Source Text").value;
        var newText = oldText.text.replace(theSearchPattern, replaceString);
        theLayer.property("Text").property("Source Text").setValue(newText);
    }
}


findNReplace.getExpressions = function(theLayer, onlySelectedProps) {
    var theProps = [];
    var newProps;
    newProps = findNReplace.getPropertiesWithExpressionsFromLayer(theLayer, onlySelectedProps);
    for (var j = 0; j < newProps.length; j++) {
        theProps.push(newProps[j]);
    }
    
    return theProps;
}

findNReplace.getProps = function(theLayer, onlySelectedProps) {
    var theProps = [];
    var newProps;
    newProps = findNReplace.getPropertiesAndGroupsFromLayer(theLayer, onlySelectedProps);
    for (var j = 0; j < newProps.length; j++) {
        theProps.push(newProps[j]);
    }
    return theProps;
}

findNReplace.myPrefs = function(prefList) {
    
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
        if (app.settings.haveSetting(findNReplace.scriptName, preference.name)) {
            this.prefs[preference.name] = this.parsePref(app.settings.getSetting(findNReplace.scriptName, preference.name), preference.prefType);
        } else {
            this.prefs[preference.name] = preference.factoryDefault;
        }
    }
    
    this.writePrefs = function(preference) {
        if (this.prefs[preference.name] !== preference.value) {
            app.settings.saveSetting(findNReplace.scriptName, preference.name, preference.value)
        }
        this.prefs[preference.name] = preference.value;
    }
    
    this.prefs = {};
    for (var p in prefList) {
        this.getPref(prefList[p]);
    }
}

// eslint-disable-next-line no-unused-vars
findNReplace.getPropertiesWithExpressionsFromLayer = function(theLayer, selectedOnly) {
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
                var newProps = findNReplace.traversePropertyGroups(propertyGroup, false);
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

findNReplace.traversePropertyGroups = function(pGroup, inclusive) {
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
                var newProps = findNReplace.traversePropertyGroups(pGroup.property(pp), inclusive);
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

// actually build the UI
findNReplace.buildUI(this);
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
