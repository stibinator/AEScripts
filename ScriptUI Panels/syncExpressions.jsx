//@target aftereffects
(function (thisObj) {
    var scriptName = "syncExpressions";
    var versionNum = 0.1;
    var expressionID = "My Expression";
    
    function buildGUI (thisObj) {
        pal = (thisObj instanceof Panel) ?
        thisObj :
        new Window("palette", thisObj.scriptTitle, undefined, { resizeable: true });
        pal.preferredSize.height = 120;
        // ----------------------- UI Elements here ---------------------
        var idGrp = pal.add("group");
        idGrp.orientation = "row";
        var expressionIDText = idGrp.add("editText", [undefined, undefined, 150, 22], expressionID);
        var incrementBtn = idGrp.add("button", [undefined, undefined, 20, 22], "+");
        var setExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Set Expression Targets");
        var addExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Add Expression Targets");
        var removeExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Remove Expression Targets");
        var msgGrp = pal.add("group");
        msgGrp.orientation = "column";
        msgGrp.spacing = 0;
        thisObj.idText1 = msgGrp.add("staticText",  [undefined, undefined, 180, 16], scriptName + " V" + versionNum);
        thisObj.idText2 = msgGrp.add("staticText",  [undefined, undefined, 180, 16], "No target set");
        
        expressionIDText.onChange = function () {
            expressionID = expressionIDText.text;
        }
        synchExpressionsBtn = pal.add("button", [undefined, undefined, 180, 22], "Update Targets");
        synchExpressionsBtn.enabled = false;
        
        setExpTargetBtn.onClick = function () {
            thisObj.targetsSet = setTargets();
            synchExpressionsBtn.enabled =  thisObj.targetsSet;
            if (targetsSet){msg("" +  thisObj.targetsSet + " target" + (( thisObj.targetsSet >1)? "s ": " ")+ "set.\nSelect source expression to synch")}
        }
        
        
        addExpTargetBtn.onClick = function () {
            thisObj.targetsSet += addTargets();
            synchExpressionsBtn.enabled = (sourceSet && targetsSet)
        };
        
        incrementBtn.onClick = function () {
            var serialNum = 1;
            var numericalSuffix = expressionID.match(/.*[^\d](\d+)/);
            if (numericalSuffix) {
                serialNum = parseInt(numericalSuffix[1], 10);
                expressionID = expressionID.replace(/(.*[^\d])(\d+)/, "$1" + (serialNum + 1));
            } else {
                expressionID = expressionID + " " + serialNum;
            }
            expressionIDText.text = expressionID;
        };
        
        synchExpressionsBtn.onClick = function () {
            var sourceProp = app.project.activeItem.selectedProperties;
            if (sourceProp.length === 1) {
                synchExpressions(sourceProp);
            } else {
                msg("Select 1 property only\nto synch to the target propert" + ((thisObj.targetsSet > 1)?"ies.": "y.")); //details
            }
            // alert(theLayers.length);
        };
        
        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    }
    
    //---------------------------- functions n shit ---------------------
    
    
    
    function setTargets () {
        var targetsSet = 0;
        var theComp = app.project.activeItem;
        if (theComp && theComp.selectedProperties.length) {
            for (var i = 1; i <= theComp.numLayers; i++) {
                //we have to go through all properties, to un-target any that aren't selected.
                var theProps = getPropertiesThatCanHaveExpressionsFromLayer(theComp.layer(i));
                for (var p = 0; p < theProps.length; p++){
                    var thisProp = theProps[p];
                    if (thisProp.selected) {
                        thisProp.expressionID = expressionID;
                        targetsSet++; 
                    } else {
                        //nuke any unselected props that have the current ID
                        if (thisProp.expressionID === expressionID) {
                            thisProp.expressionID = null;
                        }
                    }
                }
            }
        } else {
            msg("⚠ Select properties to target ⚠")
        }
        return targetsSet;
    }
    
    function addTargets () {
        var theComp = app.project.activeItem;
        if (theComp) {
            for (var i = 1; i <= theComp.numLayers; i++) {
                var theProps = theComp.selectedProperties;
                for (var p = 0; p < theProps.length; p++) {
                    var thisProp = theProps[p];
                    var expTxt = "" + thisProp.expression;
                    if (expTxt) {
                        thisProp.expression = expTxt.replace(/\n\/\/:::XPRESSION(SRC|ID)[0-9]+:::/g, "") + "\n//:::XPRESSIONSRC" + expressionID + ":::";
                    }
                }
            }
            targetsSet = true;
        }
    }
    
    function synchExpressions(sourceProperty) {
        alert(sourceProperty.expression);
        app.beginUndoGroup(scriptName);
        for (var i = 0; i < theLayers.length; i++) {
            var theProps = getPropertiesThatCanHaveExpressionsFromLayer(theLayers[i], false);
            // alert(theProps.length);
            //update the script's source expression
            for (var p = 0; p < theProps.length; p++) {
                var thisProp = theProps[p];
                
                if (thisProp.expressionID = expressionID) {
                    thisProp.expression = sourceProperty.expression;       
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
    
    function getPropertiesThatCanHaveExpressionsFromLayer(theLayer, selectedOnly) {
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
                            if (newProps[i].canSetExpression) {
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
    
    function msg(msgText) {
        thisObj.idText1.text = msgText.replace(/\n.*/, "");
        thisObj.idText2.text = msgText.replace(/[^\n]*\n+/, "");
        
    }
    
    //--------------------- go ahead and run ----------------------
    buildGUI(thisObj);
})(this)