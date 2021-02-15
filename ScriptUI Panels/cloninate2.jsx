// @target aftereffects
var scriptName = "Cloninate 2";
// buildCloninateUI(this);
app.beginUndoGroup("test");
cloninateLayer(app.project.activeItem.selectedLayers[0], -1, recurseFootageToo = true, replaceOriginal = true, replaceExpressionUse = true );
app.endUndoGroup();

function cloninateLayer(originalLayer, recursionDepth, recurseFootageToo, replaceOriginal, replaceExpressionUse) {
    var newSource;
    var oldSource;
    var otherLayers;
    var i;
    var wasLocked;
    var ol;
    // recursionLevel < 0 means infinite. 
    
    if (recursionDepth < 0 || recursionDepth > 0) {
        oldSource = originalLayer.source;
        var theComp = originalLayer.containingComp;
        otherLayers = theComp.layers;
        for (i = 1; i <= otherLayers.length; i++){
            otherLayers[i].wasSelected = otherLayers[i].selected;
        }
        if (!isValid(oldSource)) {
            // shape and text layers have no source - no point duplicating them in nested comps but
            // we will duplicate them in this comp if the user wants to say, duplicate all
            // the layers selected
            if (recursionDepth === 0 && !replaceOriginal) {
                var newLayer = originalLayer.duplicate();
                var newName = newLayer.name;
            } else {
                newName = originalLayer.name;
            }
            
        } else {
            var newName = makeUniqueName(oldSource);
            if (oldSource.typeName === 'Composition') {
                //easy peasy, the source is a comp
                newSource = oldSource.duplicate();
                if (recurseFootageToo) {
                    for (i = 1; i <= newSource.layers.length; i++) {
                        //cloninateLayer, recursing, with footage, replacing
                        cloninateLayer(newSource.layers[i],recursionDepth - 1, recurseFootageToo, true, true);
                    }
                } 
            } else {
                // not a composition
                // the layer is a footage layer - but it could be a solid
                
                if (!(oldSource.mainSource.file)) { //looks like we got a solid layer or a camera
                    //This next bit is a bit hacky: make a new solid
                    newLayer = app.project.activeItem.layers.addSolid(oldSource.mainSource.color, oldSource.name, oldSource.width, oldSource.height, oldSource.pixelAspect);
                    
                    //set newSource to the source of that solid
                    newSource = newLayer.source;
                    
                    // delete the solid from the comp - which doesn't delete it from the project. So
                    // when we duplicate the layer we can replace its source with the new solid
                    // thus keeping all the attributes of the duplicated layer, but creating a new
                    // source
                    app.project.activeItem.layer(newLayer.index).remove();
                } else {
                    //the source is a footage item, but not a solid so duplicate the source
                    newSource = duplicateLayerSource(originalLayer);
                }
            }
            newSource.name = newName;
            wasLocked = originalLayer.locked;
            //now back to the comp. Duplicate the layer
            newLayer = originalLayer.duplicate();
            //and set the source of that layer to the newly created project source item
            newLayer.replaceSource(newSource, fixExpressions = true);
            
            if (replaceExpressionUse){
                // replace all references to this layer
                replaceExpressionReferencesToLayer(originalLayer, newLayer)
            }
            
            //replacing the original layer means duplicating and deleting
            if (replaceOriginal) {
                originalLayer.locked = false;
                //we're killing the parent, so we need the replacement to adopt its children
                for (ol = 1; ol <= otherLayers.length; ol++) {
                    if (otherLayers[ol].parent === originalLayer) {
                        otherLayers[ol].parent = newLayer;
                    }
                }
                if (originalLayer.hasTrackMatte){newLayer.moveBefore(originalLayer)}
                //delete
                originalLayer.remove();
            }
            
            if (wasLocked) { //close the gate behind us
                newLayer.locked = true;
            }
            //clean up selection
            for (i = 1; i<= theComp.numLayers; i++){
                theComp.layer(i).selected = theComp.layer(i).wasSelected === true;
                theComp.layer(i).wasSelected = null;
            }
            newLayer.selected = true;
        }
    }
}
function escapeRegexChars(theString) {
    return theString.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    // escape the plain text. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
}

function replaceExpressionReferencesToLayer(originalLayer, newLayer){
    var theNewNameEscd = escapeRegexChars(newLayer.name);
    var theOldNameEscd = escapeRegexChars(originalLayer.name);
    var theComp = originalLayer.containingComp;
    var theCompNameEscd = escapeRegexChars(theComp.name);
    var theSearchText = "(thisComp\\.layer\\s*\\(\\s*[\"'])" + theOldNameEscd + "([\"']\\s*\\))";
    var theSearchPattern = new RegExp(theSearchText, "g");
    var theReplaceText = "$1" + theNewNameEscd  + "$2";
    // search in current comp for thisComp.layer(<old Layer Name>)
    for (var lyr = 1; lyr <= theComp.numLayers; lyr++) {
        theLayer = theComp.layer(lyr);
        findNReplaceInExpressions(theLayer, false, theSearchPattern,theReplaceText);
    }
    // search for comp(<this comp name>).layer(<old layer name>)
    theSearchText = "(comp\\(\\s*[\"']" + theCompNameEscd + "[\"']\\s*\\)\\.layer\\s*\\([\"'])" + theOldNameEscd + "([\"']\\s*\\))";
    theSearchPattern = new RegExp(theSearchText, "g");
    for (var c = 1; c <= app.project.numItems; c++) {
        if (app.project.item(c).typeName === "Composition") {
            var aComp = app.project.item(c);
            for (var lyr = 1; lyr <= aComp.numLayers; lyr++) {
                theLayer = aComp.layer(lyr);
                findNReplaceInExpressions(theLayer, false, theSearchPattern,theReplaceText);
            }
        }
    }
}

function duplicateLayerSource(theLayer){
    //first deselect all the layers
    var oldLayerSelection = [];
    var theComp = theLayer.containingComp;
    for (var i = 1; i<= theComp.numLayers; i++){
        theComp.layers[i].wasSelected = theComp.layers[i].selected;
        theComp.layers[i].selected = false;
    }
    // select the layer we want to dupe the source for
    theLayer.selected = true;
    // so kludgy, but it's the only way
    app.executeCommand(app.findMenuCommandId("Reveal Layer Source in Project"));
    app.executeCommand(app.findMenuCommandId("Duplicate"));
    // when we duplicate an item it will be selected
    var newItem = app.project.selection[0];
    // reset the selectionState
    for (i = 1; i<= theComp.numLayers; i++){
        theComp.layer(i).selected = (theComp.layer(i).wasSelected === true)
        theComp.layer(i).wasSelected = null ;
    }
    return (newItem);
}

// @target aftereffects
/* global app */

// eslint-disable-next-line no-unused-vars
function makeUniqueName(oldSource, prefix, suffix){
    var divider = "_";
    if (oldSource.name){
        if (! suffix) {suffix = ''}
        if (! prefix) {prefix = ''}
        // Create a unique name, given a layer
        // find a serialnumber suffix if one exists e.g. mypic.jpg_1 
        // everyone stand back… 
        //anything that's not a number, followed by a number
        var re = /(.*[^\d])(\d*)$/;
        
        var m = oldSource.name.match(re);
        if(m){
            var oldSourceBaseName = m[1];
            var oldSourceSerial = m[2];
        }
        if (oldSourceBaseName) {
            var hasDivider = oldSourceBaseName.match( /(.*)([-_\s])$/);
            if (hasDivider){
                oldSourceBaseName = hasDivider[1];
                divider = hasDivider[2];
            }
        } else {
            oldSourceBaseName = oldSource.name;
        }
        //default serial number
        var newSourceSerial = 1;
        
        // if no match, then the source doesn't have a serial number. One of these
        // should catch it
        if (typeof(oldSourceSerial) === 'undefined' || oldSourceSerial === '' || isNaN(parseInt(oldSourceSerial, 10))) {
            // since there was no serial we add a separator onto the base name so that it
            // becomes basename_1 etc
            oldSourceBaseName = oldSource.name;
        } else {
            //there was a serial number, so increment it
            newSourceSerial = 1 + parseInt(oldSourceSerial, 10);
        }
        
        var newName = '' + prefix + oldSourceBaseName + suffix + divider + newSourceSerial;
        //shouldn't happen, but you know, regex..
        // we need to check to see if a source layer with the new serial number exists,
        // and if it does we keep incrementing the serial until it doesn't
        while (findDuplicateSourceItems(newName)) {
            newSourceSerial++;
            newName = '' + prefix + oldSourceBaseName + suffix + divider + newSourceSerial;
        }
        return newName;
    } else {
        return false;
    }
}

function findDuplicateSourceItems(theName) {
    var allItems = app.project.items;
    var j;
    for (j = 1; j <= allItems.length; j++) {
        if (app.project.items[j].name === theName) {
            return true;
        }
    }
    
    return false;
}

// ====================================== UI ==================================
function buildCloninateUI(thisObj) {
    var prefs = preferences(scriptName);
    var cloninateUI;
    if (thisObj instanceof Panel) {
        cloninateUI = thisObj;
    } else {
        cloninateUI = new Window('palette', scriptName, undefined, {resizeable: true});
    }
    // CLONINATE
    // =========
    
    cloninateUI.orientation = "column"; 
    cloninateUI.alignChildren = ["left","top"]; 
    cloninateUI.spacing = 10; 
    cloninateUI.margins = 16; 
    cloninateUI.preferredSize.height = 200;
    
    // MAINGRP
    // =======
    var mainGrp = cloninateUI.add("group", undefined, {name: "mainGrp"}); 
    mainGrp.orientation = "column"; 
    mainGrp.alignChildren = ["center","center"]; 
    mainGrp.spacing = 10; 
    mainGrp.margins = 0; 
    
    var cloninateBtn = mainGrp.add("button", undefined, undefined, {name: "cloninateBtn"}); 
    cloninateBtn.text = "Cloninate"; 
    cloninateBtn.preferredSize.width = 180; 
    
    var replacinateBtn = mainGrp.add("button", undefined, undefined, {name: "replacinateBtn"}); 
    replacinateBtn.text = "Replacinate"; 
    replacinateBtn.preferredSize.width = 180; 
    
    // PANEL1
    // ======
    var panel1 = mainGrp.add("panel", undefined, undefined, {name: "panel1"}); 
    panel1.text = "Recursion"; 
    panel1.preferredSize.width = 180; 
    panel1.orientation = "column"; 
    panel1.alignChildren = ["left","top"]; 
    panel1.spacing = 8; 
    panel1.margins = [8,14,8,8]; 
    
    var recursionChkBx = panel1.add("checkbox", undefined, undefined, {}); 
    recursionChkBx.name =  "recursionChkBx";
    recursionChkBx.text = "Recurse into comps"; 
    recursionChkBx.value = true;
    prefs.getPref(recursionChkBx);
    
    // GROUP1
    // ======
    var group1 = panel1.add("group", undefined, {name: "group1"}); 
    group1.orientation = "column"; 
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 0; 
    group1.margins = 0; 
    
    var slidrTxt = group1.add("statictext", undefined, undefined, {name: "slidrTxt"}); 
    slidrTxt.text = "Max depth ( 0 = ∞ )"; 
    
    // SLIDRGRP
    // ========
    var slidrgrp = group1.add("group", undefined, {name: "slidrgrp"}); 
    slidrgrp.orientation = "row"; 
    slidrgrp.alignChildren = ["left","center"]; 
    slidrgrp.spacing = 6; 
    slidrgrp.margins = 0; 
    
    var recursionSlidr = slidrgrp.add("slider", undefined, undefined, undefined, undefined, {}); 
    recursionSlidr.name =  "recursionSlidr";
    recursionSlidr.value = 10; 
    prefs.getPref(recursionSlidr);
    recursionSlidr.minvalue = 0; 
    recursionSlidr.preferredSize.width = 126; 
    recursionSlidr.preferredSize.height = 12; 
    recursionSlidr.maxvalue = Math.max(recursionSlidr.value, 10); 
    
    var recursionTxt = slidrgrp.add('edittext {properties: {}}'); 
    recursionTxt.name =  "recursionTxt";
    recursionTxt.preferredSize.width = 28; 
    recursionTxt.text = (recursionSlidr.value === 0)? "∞" : recursionSlidr.value;
    
    recursionSlidr.textBx = recursionTxt;
    recursionTxt.slidr = recursionSlidr;
    slidrTxt.enabled =
    slidrgrp.enabled = recursionChkBx.value;
    
    //============ UI callbacks ============
    recursionChkBx.onClick = function (){
        slidrTxt.enabled =
        slidrgrp.enabled = recursionChkBx.value;
        prefs.setPref(recursionChkBx);
    }
    
    recursionSlidr.onChanging = function(){
        this.value = Math.round(this.value);
        this.textBx.text = (this.value === 0)? "∞" : this.value;
    }
    
    recursionSlidr.onChange = function (){
        prefs.setPref(recursionSlidr);
    }
    
    recursionTxt.onChange = function(){
        var parsedVal;
        if (this.text === "∞") {
            parsedVal = 0;
        } else {
            parsedVal = parseFloat(this.text);
            if (isNaN(parsedVal)){
                parsedVal = Math.round(this.slidr.value);
            } 
        }
        parsedVal = Math.round(parsedVal);
        //allows the text box to set a new max value
        this.slidr.maxvalue = Math.max(parsedVal, this.slidr.maxvalue);
        this.slidr.value = parsedVal;
        this.text = parsedVal; // replace non-integers with ints
        if (parsedVal === 0){ this.text = "∞"}
    }
    
    if (cloninateUI instanceof Window) {
        cloninateUI.center();
        cloninateUI.show();
    } else {
        cloninateUI.layout.layout(true);
    }
}


function findNReplaceInExpressions(
    theLayer,
    onlySelectedProps,
    theSearchPattern,
    replaceString
    ) {
        var expressionProps = getPropertiesWithExpressionsFromLayer(theLayer, onlySelectedProps);
        for (var i = 0; i < expressionProps.length; i++) {
            expressionProps[i].expression = expressionProps[i].expression.replace(theSearchPattern, replaceString);
        }
    }
    
    
    function traversePropertyGroups(pGroup, inclusive) {
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
    // ================================= Preferences =========================================
    
    function preferences(scriptName) {
        // setPref(object) stores AE preferences for a UI or other object
        // getPref(object) retrieves the preference and sets the object's value (or text) property
        // scriptName sets the section of the preference file the prefs are saved in.
        this.prefsName = scriptName;
        parsePref = function(val, prefType) {
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
        
        this.setPref = function(anObject) {
            $.writeln(anObject.name);
            var currentVal;
            if (anObject.name){
                if(anObject.hasOwnProperty('value')){
                    currentVal = anObject.value;
                } else if (anObject instanceof EditText){
                    currentVal = anObject.text;
                } else {
                    throw("objects must have a 'text' or 'value' property to set preferences")
                }
                $.writeln(anObject.name + " currentVal = " + currentVal + "saved = " + anObject.savedPref);
                if (anObject.savedPref !== currentVal) {
                    anObject.savedPref = currentVal;
                    app.settings.saveSetting(this.scriptName, anObject.name, currentVal);
                }
            }
        }
        
        this.getPref = function(anObject){
            // constructor
            if (anObject.name ){
                if (app.settings.haveSetting(this.scriptName, anObject.name)) {
                    // get prefs for UI control     
                    if (anObject instanceof Slider){
                        anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(this.prefsName, anObject.name), "float");   
                    } else if (anObject instanceof Checkbox || anObject instanceof Radiobutton){
                        anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(this.prefsName, anObject.name), "bool");
                    } else if (anObject instanceof EditText ){
                        anObject.text = anObject.savedPref = parsePref(app.settings.getSetting(this.prefsName, anObject.name), "string");
                    } else {
                        // objects can use specified pref types with the type of the returned result determined by a preftype property
                        // otherwise the default is a string
                        anObject.value = anObject.savedPref = anObject.parsePref(app.settings.getSetting(this.prefsName, anObject.name), anObject.prefType); 
                        return anObject.value;
                    }
                }
            } else {
                throw("objects must have a name to be given prefs.");
            }
            
        }
        
        return this;
    }
    
    
    
