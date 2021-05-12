//@target aftereffects
var thisScript = this;
thisScript.name = "test";
thisScript.sourceSet = thisScript.targetSet = false;

thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisObj.pal = (thisObj instanceof Panel)?
    thisObj: 
    new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    // ----------------------- UI Elements here ---------------------
    pal.setExpTargetBtn = thisObj.pal.add("button", [undefined, undefined, 180, 22], "Set Expression Targets");
    pal.setExpSourceBtn = thisObj.pal.add("button", [undefined, undefined, 180, 22], "Set Expression Source");
    pal.expressionText = thisObj.pal.add("edittext", [undefined, undefined, 180, 128], "No expression set", { multiline: true } );
    pal.synchExpressionsBtn = thisObj.pal.add("button", [undefined, undefined, 180, 22], "Update Targets");
    pal.synchExpressionsBtn.enabled = false;
    
    pal.setExpSourceBtn.onClick = function () {
        thisScript.setExpSource();
        pal.synchExpressionsBtn.enabled = (thisScript.sourceSet && thisScript.targetSet);
        pal.expressionText.text = thisScript.sourceExp;
    };
    
    pal.setExpTargetBtn.onClick = function () {
        thisScript.setTargets();
        pal.synchExpressionsBtn.enabled = (thisScript.sourceSet && thisScript.targetSet)
    };
    
    pal.synchExpressionsBtn.onClick = function () {
        thisScript.sourceExp = pal.expressionText.text;
        var theLayers = app.project.activeItem.selectedLayers;
        if (theLayers.length === 0) {
            var compLayers = app.project.activeItem.layers;
            for (var i = 1; i <= compLayers.length; i++){
                theLayers.push(compLayers[i]);
            }
        }
        // alert(theLayers.length);
        thisScript.synchExpressions(theLayers)
    };
    
    //------------------------ build the GUI ------------------------
    if (thisObj.pal instanceof Window) {
        thisObj.pal.center();
        thisObj.pal.show();
    } else{
        thisObj.pal.layout.layout(true);
    }
}

//---------------------------- functions n shit ---------------------
thisScript.setExpSource = function(){
    var theComp = app.project.activeItem;
    thisScript.sourceSet = false;
    if (theComp ){
        if (theComp.selectedProperties.length) {
            var i = 0;
            while (theComp.selectedProperties[i] && (! thisScript.sourceSet)){
                if (theComp.selectedProperties[i].expressionEnabled){
                    thisScript.sourceExp = theComp.selectedProperties[i].expression;
                    thisScript.sourceSet = true;
                }
                i++;
            }
        } 
    }
}

thisScript.setTargets = function(){
    thisScript.targetSet = false;
    var theComp = app.project.activeItem;
    if (theComp) {
        var theProps = theComp.selectedProperties;
        if (theProps.length > 0) {
            for (var i = 0; i < theProps.length; i++){
                if (theProps[i].expressionEnabled) {
                    expressionText = "" + theProps[i].expression;
                    theProps[i].expression = "//#SynchTarget#\n" + expressionText.replace(/\/\/#SynchTarget#\r\n/, "")
                }
            }
            thisScript.targetSet = true;
        } 
    }
}

thisScript.synchExpressions = function (theLayers) {
    app.beginUndoGroup(thisScript.name);
    for (var i = 0; i < theLayers.length; i++){
        var theProps = getPropertiesWithExpressionsFromLayer(theLayers[i], false);
        // alert(theProps.length);
        for (var p = 0; p < theProps.length; p++){
            if (theProps[p].expressionEnabled){
                if (theProps[p].expression.match(/\/\/#SynchTarget#/)) {
                    theProps[p].expression = "//#SynchTarget#\r\n" + thisScript.sourceExp;
                }
            }
        }
    }
    app.endUndoGroup;
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
                        if (newProps[i].expressionEnabled) {
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


//---------------------------- ui prefs -----------------------------
thisScript.Preferences = function(scriptName) {
    // look for preferences for this object
    // provide a setPref function to allow values to be stored in AE's preferences
    // scriptName sets the section of the preference file they are saved in.
    this.prefsName = scriptName;
    alert ( this.prefsName);
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
        var currentVal;
        if (anObject.name){
            if(anObject.hasOwnProperty('value')){
                currentVal = anObject.value;
            } else if (anObject instanceof EditText){
                currentVal = anObject.text;
            } else {
                throw("objects must have a 'text' or 'value' property to set preferences")
            }
            
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
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "float");   
                } else if (anObject instanceof Checkbox || anObject instanceof Radiobutton){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "bool");
                } else if (anObject instanceof EditText ){
                    anObject.text = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "string");
                } else {
                    // objects can use specified pref types with the type of the returned result determined by a preftype property
                    // otherwise the default is a string
                    anObject.value = anObject.savedPref = anObject.parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), anObject.prefType); 
                }
            }
        } else {
            throw("objects must have a name to be given prefs.");
        }
        
    }
    
    return this;
}

//--------------------- go ahead and run ----------------------
thisScript.buildGUI(this);
