//:::target aftereffects
var thisScript = this;
thisScript.name = "syncExpressions";
thisScript.sourceSet = thisScript.targetSet = false;
thisScript.expressionID = 0;

thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisScript.pal = (thisObj instanceof Panel)?
    thisObj: 
        new Window("palette", thisObj.scriptTitle, undefined, { resizeable: true });
    thisScript.pal.preferredSize.height = 120;
    // ----------------------- UI Elements here ---------------------
    thisScript.setExpTargetBtn = thisScript.pal.add("button", [undefined, undefined, 180, 22], "Set Expression Targets");
    thisScript.addExpTargetBtn = thisScript.pal.add("button", [undefined, undefined, 180, 22], "Add Expression Targets");
    thisScript.idText = thisScript.pal.add("staticText", [undefined, undefined, 180, 22], "No expression set");
    // thisScript.expressionText = thisScript.pal.add("edittext", [undefined, undefined, 180, 128], "No expression set", { multiline: true });
    // thisScript.expressionText.onChanged = function () {
    //     thisScript.expressionID = "internalEditor";
    //     thisScript.sourceExp = thisScript.expressionText.text;
    // }
    thisScript.synchExpressionsBtn = thisScript.pal.add("button", [undefined, undefined, 180, 22], "Update Targets");
    thisScript.synchExpressionsBtn.enabled = false;
    
    thisScript.setExpSourceBtn.onClick = function () {
        thisScript.setExpSource();
        thisScript.synchExpressionsBtn.enabled = (thisScript.sourceSet && thisScript.targetSet);
        thisScript.idText.text = "source Expression ID: " + thisScript.expressionID;
        // thisScript.expressionText.text = thisScript.sourceExp;
    };
    
    thisScript.setExpTargetBtn.onClick = function () {
        thisScript.setTargets();
        thisScript.synchExpressionsBtn.enabled = (thisScript.sourceSet && thisScript.targetSet)
    };

    thisScript.addExpTargetBtn.onClick = function () {
        thisScript.addTargets();
        thisScript.synchExpressionsBtn.enabled = (thisScript.sourceSet && thisScript.targetSet)
    };
    
    thisScript.synchExpressionsBtn.onClick = function () {
        // thisScript.sourceExp = thisScript.expressionText.text;
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
    if (thisScript.pal instanceof Window) {
        thisScript.pal.center();
        thisScript.pal.show();
    } else{
        thisScript.pal.layout.layout(true);
    }
}

//---------------------------- functions n shit ---------------------
thisScript.setExpSource = function(){
    var theComp = app.project.activeItem;
    thisScript.sourceSet = false;
    if (theComp ){
        if (theComp.selectedProperties.length) {
            var i = 0;
            while (theComp.selectedProperties[i] && (!thisScript.sourceSet)) {
                var thisProp = theComp.selectedProperties[i];
                //check to see if there's an ID set
                var expTxt = "" + thisProp.expression;
                thisPropID =expTxt.match(/\/\/:::XPRESSIONID([0-9]+):::/)             
                if (thisProp.expressionEnabled) {
                    if (thisPropID) {
                        thisScript.expressionID = thisPropID[1];
                    }else {
                        thisScript.expressionID++;
                        thisProp.expression = thisProp.expression.replace(/\n\/\/:::XPRESSIONID[0-9]+:::/g, "") + "\n//:::XPRESSIONID" + thisScript.expressionID + ":::";
                    }
                    thisScript.sourceExp = thisProp.expression;
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
        for (var i = 1; i <= theComp.numLayers; i++){
            var theProps = getPropertiesWithExpressionsFromLayer(theComp.layer(i));
            for (var p = 0; p < theProps.length; p++){
                var thisProp = theProps[p];
                if (thisProp.selected) {
                    var expTxt = "" + thisProp.expression;
                    thisProp.expression =  expTxt.replace(/\n\/\/:::XPRESSIONSRC[0-9]+:::/g, "") + "\n//:::XPRESSIONSRC" + thisScript.expressionID + ":::";
                } else {
                    //delete the link for unselected properties
                    var expTxt = "" + thisProp.expression;
                    var srcID = expTxt.match(/^\/\/:::XPRESSIONSRC([0-9]+):::/);

                    if (srcID && srcID[1] === thisScript.expressionID){
                        thisProp.expression = expTxt.replace(/\n\/\/:::XPRESSIONSRC[0-9]+:::/g, "");
                    }
                }
            }
        }
        thisScript.targetSet = true;
    }
}

thisScript.addTargets = function(){
    var theComp = app.project.activeItem;
    if (theComp) {
        for (var i = 1; i <= theComp.numLayers; i++){
            var theProps = theComp.selectedProperties;
            for (var p = 0; p < theProps.length; p++){
                var thisProp = theProps[p];
                var expTxt = "" + thisProp.expression;
                if (expTxt) {                    
                    thisProp.expression =  expTxt.replace(/\n\/\/:::XPRESSION(SRC|ID)[0-9]+:::/g, "") + "\n//:::XPRESSIONSRC" + thisScript.expressionID + ":::";
                } 
            }
        }
        thisScript.targetSet = true;
    }
}

thisScript.synchExpressions = function (theLayers) {
    app.beginUndoGroup(thisScript.name);
    var pat = new RegExp(":::XPRESSIONID" + thisScript.expressionID+":::");
    for (var i = 0; i < theLayers.length; i++){
        var theProps = getPropertiesWithExpressionsFromLayer(theLayers[i], false);
        // alert(theProps.length);
        //update the scripts source expression
        for (var p = 0; p < theProps.length; p++) {
            var thisProp = theProps[p];
            var expTxt = "" + thisProp.expression;
            if (expTxt.match(pat)) {
                thisScript.sourceExp = thisProp.expression;
            }
        }
        for (var p = 0; p < theProps.length; p++){
            var thisProp = theProps[p];
            if (thisProp.expressionEnabled) {
                var expTxt = "" + thisProp.expression;
                thisPropID = expTxt.match(/:::XPRESSIONSRC([0-9]+):::/);
                if (thisPropID && thisPropID[1] == thisScript.expressionID) {
                    thisProp.expression =  thisScript.sourceExp.replace(pat, ":::XPRESSIONSRC" + thisScript.expressionID + ":::");
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


//--------------------- go ahead and run ----------------------
thisScript.buildGUI(this);
