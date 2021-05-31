//@target aftereffects
(function (thisObj) {
    var scriptName = "syncExpressions";
    var versionNum = 0.1;
    
    function buildGUI (thisObj) {
        pal = (thisObj instanceof Panel) ?
        thisObj :
        new Window("palette", thisObj.scriptTitle, undefined, { resizeable: true });
        pal.preferredSize.height = 120;
        // ----------------------- UI Elements here ---------------------
        var idGrp = pal.add("group");
        idGrp.orientation = "row";
        var expressionIDText = idGrp.add("editText", [undefined, undefined, 150, 22], "Expression 1");
        var incrementBtn = idGrp.add("button", [undefined, undefined, 20, 22], "+");
        var setExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Set Expression Targets");
        var addExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Add Expression Targets");
        var removeExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Remove Expression Targets");
        var msgGrp = pal.add("group");
        msgGrp.orientation = "column";
        msgGrp.spacing = 0;
        thisObj.idText1 = msgGrp.add("staticText",  [undefined, undefined, 180, 16], scriptName + " V" + versionNum);
        thisObj.idText2 = msgGrp.add("staticText",  [undefined, undefined, 180, 16], "No target set");
        synchExpressionsBtn = pal.add("button", [undefined, undefined, 180, 22], "Update Targets");
        synchExpressionsBtn.enabled = false;
        
        expressionIDText.onChange = function () {
            if (expressionIDText.text.trim() === ""){
                synchExpressionsBtn.enabled = false;
                setExpTargetBtn.enabled = false;
                msg("⚠ Invalid Expression ID ⚠");
            } else {
                setExpTargetBtn.enabled = true;
            };
        }
        
        setExpTargetBtn.onClick = function () {
            thisObj.targetsSet = setTargets(expressionIDText.text);
            synchExpressionsBtn.enabled =  thisObj.targetsSet;
            if (targetsSet){msg("" +  thisObj.targetsSet + " target" + (( thisObj.targetsSet >1)? "s ": " ")+ "set.\nSelect source expression to synch")}
        }
        
        
        addExpTargetBtn.onClick = function () {
            thisObj.targetsSet += addTargets(expressionIDText.text);
            synchExpressionsBtn.enabled = (sourceSet && targetsSet)
        };
        
        incrementBtn.onClick = function () {
            var expressionID = expressionIDText.text;
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
            var sourceProps = app.project.activeItem.selectedProperties;
            var sourceProp = false;
            for (var p = 0; p < sourceProps.length; p++){
                if (sourceProps[p] instanceof Property) {
                    if (! sourceProp){
                        sourceProp = sourceProps[p];
                    } else {
                        msg("Select 1 property only\nto synch to the target propert" + ((thisObj.targetsSet !== 1)?"ies.": "y.")); //details
                    }
                }
            }
            if (sourceProp){    
                msg(synchExpressions(sourceProp, expressionIDText.text));
            }
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
    
    function getExpressionID(thisProp) {
        if (thisProp.canSetExpression && thisProp.expression) {
            var expressionText = thisProp.expression;
            // search for // @synchExpressions ID: anything
            var pat = new RegExp("\/\/ @" + scriptName + " ID: (.*)");
            hasID = expressionText.match(pat)
            if (hasID) {
                return hasID[1].strip();
            }
        }
        return null;
    }
    
    
    function setExpressionID(thisProp, expressionID) {
        if (thisProp.canSetExpression) {
            var IDTag = "// @" + scriptName + "ID: " + expressionID;
            if (thisProp.expression) {
                var expressionText = thisProp.expression;
                var pat = new RegExp("\/\/ @" + scriptName + " ID: (.*)");
                hasID = expressionText.match(pat)
                if (hasID) {
                    expressionText = expressionText.replace(pat, IDTag);
                } else {
                    expressionText = expressionText + "\n\n" + IDTag
                }
            } else { //no existing expression
                thisProp.expression = "value\n\n" + IDTag;
            }
            return true;
        } else {
            msg("can't set expression on " + thisProp.name);
            return false
        }
    }
    
    function setTargets (expressionID) {
        var targetsSet = 0;
        var theComp = app.project.activeItem;
        if (theComp && theComp.selectedProperties.length) {
            for (var i = 1; i <= theComp.numLayers; i++) {
                //we have to go through all properties, to un-target any that aren't selected.
                var theProps = getPropertiesThatCanHaveExpressionsFromLayer(theComp.layer(i));
                for (var p = 0; p < theProps.length; p++){
                    var thisProp = theProps[p];
                    if (thisProp.selected) {
                        if (setExpressionID(thisProp, expressionID)){
                            targetsSet++;
                        }
                    } else {
                        //nuke any unselected props that have the current ID
                        if (getExpressionID(thisProp) === expressionID) {
                            setExpressionID(thisProp, null);
                        }
                    }
                }
            }
        } else {
            msg("⚠ Select properties to target ⚠")
        }
        return targetsSet;
    }
    
    function addTargets (expressionID) {
        var theComp = app.project.activeItem;
        var propsAdded = 0;
        if (theComp && theComp.selectedProperties.length) {
            var theProps = theComp.selectedProperties;
            for (var p = 0; p < theProps.length; p++) {
                if (setExpressionID(theProps[p], expressionID)) {
                    propsAdded++
                };
            }
        } else {
            msg("⚠ Select some properties in a comp first ⚠")
        }
        return propsAdded;
    }
    
    function synchExpressions(sourceProperty, expressionID) {
        var updateCount = 0;
        // alert(expressionID);
        app.beginUndoGroup(scriptName);
        var theLayers = app.project.activeItem.layers;
        for (var i = 1; i <= theLayers.length; i++) {
            var theProps = findTargetProperties(theLayers[i]);
            // alert(theProps.length);
            //update the script's source expression
            for (var p = 0; p < theProps.length; p++) {
                var thisProp = theProps[p];                
                if (getExpressionID(thisProp) === expressionID) {
                    thisProp.expression = sourceProperty.expression;
                    updateCount++;
                }
            }
        }
        app.endUndoGroup;
        return ("updated " + updateCount + "expression" + ((updateCount !== 1) ? "s." : "."));
    }
    
    function findTargetProperties(theLayer) {
        var props = [];
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        if (newProps[i].expressionID) {
                            props.push(newProps[i]);
                        }
                    }
                }
            }
        }
        return (props);
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