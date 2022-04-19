// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function (thisObj) {
    var scriptName = "syncExpressions";
    
    var versionNum = 0.1;
    var tag = "// @" + scriptName + " ID: "
    function buildGUI (thisObj) {
        pal = (thisObj instanceof Panel) ?
        thisObj :
        new Window("palette", thisObj.scriptTitle, undefined, { resizeable: true });
        pal.preferredSize.height = 120;
        // ----------------------- UI Elements here ---------------------
        var expressionsDropDown = pal.add("dropdownlist", [undefined, undefined, 180, 22], ["Expression 1", "2", "-", "foo"]);
        var idGrp = pal.add("group");
        idGrp.orientation = "row";
        var expressionIDText = idGrp.add("editText", [undefined, undefined, 120, 22], "Expression 1");
        var incrementBtn = idGrp.add("button", [undefined, undefined, 20, 22], "+");
        var pickBtn = idGrp.add("button", [undefined, undefined, 20, 22], "☟");
        pal.add("panel", [undefined, undefined, 180, 0]);
        var setExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Set Expression Targets");
        var addExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Add Expression Targets");
        var removeExpTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Remove Expression Targets");
        pal.add("panel", [undefined, undefined, 180, 0]);
        var selectTargetBtn = pal.add("button", [undefined, undefined, 180, 22], "Select Expression Targets");
        var msgGrp = pal.add("group");
        msgGrp.orientation = "column";
        msgGrp.spacing = 0;
        thisObj.idText1 = msgGrp.add("staticText",  [undefined, undefined, 180, 16], scriptName + " V" + versionNum);
        thisObj.idText2 = msgGrp.add("staticText",  [undefined, undefined, 180, 16], "No target set");
        synchExpressionsBtn = pal.add("button", [undefined, undefined, 180, 22], "Update Targets");
        synchExpressionsBtn.enabled = false;
        
        expressionsDropDown.onActivate = function () {
            var lst = getAllExpressionIDs(this.items);
            this.items = lst;
        }
        
        expressionIDText.onChange = function () {
            this.text = trim(this.text); // String.trim() doesn't seem to be available
            if (this.text === ""){
                synchExpressionsBtn.enabled = false;
                setExpTargetBtn.enabled = false;
                msg("⚠ Invalid Expression ID ⚠\nCannot be blank.");
            } else {
                setExpTargetBtn.enabled = true;
                addItemToList(expressionsDropDown.items, this.text)
            };
        }
        
        setExpTargetBtn.onClick = function () {
            app.beginUndoGroup(this.text);
            var targetsSet = setTargets(expressionIDText.text);
            synchExpressionsBtn.enabled =  targetsSet;
            if (targetsSet){msg("" +  targetsSet + " target" + (( targetsSet >1)? "s ": " ")+ "set.\nSelect source expression to synch")}
            app.endUndoGroup();
        }
        
        addExpTargetBtn.onClick = function () {
            app.beginUndoGroup(this.text);
            var targetsSet = addTargets(expressionIDText.text);
            var totalTargets = getTargets(expressionIDText.text, false);
            msg("added " + targetsSet + "targets,\n" + totalTargets + " targets set")
            synchExpressionsBtn.enabled = (totalTargets > 0);
            app.endUndoGroup();
        };
        
        selectTargetBtn.onClick = function () {
            var totalTargets = getTargets(expressionIDText.text, true);
            msg("" + totalTargets + " targets set\n" + (totalTargets > 0) ? "Select source expression to synch" : "Select targets to synch");
            synchExpressionsBtn.enabled = (totalTargets > 0);
        };
        
        pickBtn.onClick = function () {
            var id = false;
            var theProp = null;
            var selected = app.project.activeItem.selectedProperties;
            if (selected.length > 0){
                for (var p = 0; p < selected.length && (!theProp); p++){
                    if (selected[p].expression) {
                        theProp = selected[p];
                    }
                }
            }
            if (theProp) {
                id = getExpressionID(theProp);
            }
            if (id) {
                expressionIDText.text = id;
                msg("Found an expression ID")
            } else {
                msg("no properties with a valid\nExpression ID selected.")
            }
            
        }
        
        removeExpTargetBtn.onClick = function () {
            app.beginUndoGroup(this.text);
            removeTargets();
            var targetsSet = getTargets(expressionIDText.text, false);
            synchExpressionsBtn.enabled = targetsSet  > 0;
            msg("" + targetsSet + " target" + ((targetsSet > 1) ? "s " : " ") + "set.\n" + (targetsSet > 0)?"Select source expression to synch": "Select targets to synch");
            app.endUndoGroup();
        }
        
        
        
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
        }
        
        synchExpressionsBtn.onClick = function () {
            app.beginUndoGroup(this.text);
            var sourceProps = app.project.activeItem.selectedProperties;
            var sourceProp = false;
            for (var p = 0; p < sourceProps.length; p++){
                //sometimes selecting a property like a path selects a couple of properties. This keeps going untill it finds a valid property
                if (sourceProps[p] instanceof Property) {
                    if (! sourceProp){
                        sourceProp = sourceProps[p];
                    } else {
                        msg("Select 1 property only\nto synch to the target properties.")
                    }
                }
            }
            if (sourceProp) {
                setExpressionID(sourceProp, expressionIDText.text); //add the tag to the source expression too
                //do the hoo-hah
                msg(synchExpressions(sourceProp, expressionIDText.text));
            }
            app.endUndoGroup();
        }
        
        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    }
    
    //---------------------------- functions n shit ---------------------
    function trim(str) {
        return str.replace(/^\s*/, "").replace(/\s*$/, "");
    }
    
    function getExpressionID(thisProp) {
        if (thisProp.canSetExpression && thisProp.expression) {
            var expressionText = thisProp.expression;
            // search for // @synchExpressions ID: anything
            var pat = new RegExp(tag + "(.*)");
            var hasID = expressionText.match(pat)
            if (hasID) {
                return trim(hasID[1]);
            }
        }
        return null;
    }
    
    function setExpressionID(thisProp, expressionID) {
        if (thisProp.canSetExpression) {
            var IDTag = (expressionID !== null) ?
            "\n\n" + tag + expressionID :
            "";
            if (thisProp.expression) {
                var expressionText = thisProp.expression;
                var pat = new RegExp("[\n\r]+" + tag + "(.*)","gm");
                var hasID = expressionText.match(pat)
                if (hasID) {
                    expressionText = expressionText.replace(pat, IDTag);
                } else {
                    expressionText = expressionText + IDTag
                }
            } else { //no existing expression
                expressionText = "value\n\n" + IDTag; //insert dummy expression
            }
            thisProp.expression = expressionText;
            return true;
        } else {
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
            msg("⚠ Select properties to target ⚠\n ")
        }
        return targetsSet;
    }
    
    function addItemToList(item, theArr) {
        inList = false;
        for (id = 0; id < theArr.length && ! inList; id++){
            if (theArr[id] === item) {
                inList = true;
            }
        }
        if (!inList) {
            theArr[theArr.length] = item;
        }
    }
    
    function getAllExpressionIDs (idList) {
        var theComp = app.project.activeItem;
        for (var i = 1; i <= theComp.numLayers; i++) {
            //we have to go through all properties, to un-target any that aren't selected.
            var theProps = getPropertiesThatCanHaveExpressionsFromLayer(theComp.layer(i));
            for (var p = 0; p < theProps.length; p++){
                var newID = getExpressionID(theProps[p]);
                if (newID) {
                    addItemToList(newID, idList);
                }
            }
        }
        return idList;
    }
    
    function removeTargets (expressionID) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var theProps = theComp.selectedProperties;
            if (theProps.length === 0) {
                //no props selected, remove all
                // theProps = [];
                for (var i = 1; i <= theComp.numLayers; i++) {
                    //we have to go through all properties, to un-target any that aren't selected.
                    theProps = theProps.concat(getPropertiesWithExpressionsFromLayer(theComp.layer(i)));
                }
            }
            for (var p = 0; p < theProps.length; p++){
                var thisProp = theProps[p];
                if (getExpressionID(thisProp)) {
                    setExpressionID(thisProp, null);
                }
            }
        } else {
            msg("⚠ Select a comp ⚠\n ")
        }
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
            msg("⚠ Can't add targets ⚠\nSelect some properties in a comp first")
        }
        return propsAdded;
    }
    
    function synchExpressions(sourceProperty, expressionID) {
        var updateCount = 0;
        var theLayers = app.project.activeItem.layers;
        for (var i = 1; i <= theLayers.length; i++) {
            var theProps = getPropertiesWithExpressionsFromLayer(theLayers[i]);
            for (var p = 0; p < theProps.length; p++) {
                var thisProp = theProps[p];                
                if (getExpressionID(thisProp) === expressionID) {
                    thisProp.expression = sourceProperty.expression;
                    updateCount++;
                }
            }
        }
        return ("updated " + updateCount + " expression" + ((updateCount !== 1) ? "s." : ".\nwith "+expressionID));
    }
    
    function getTargets(expressionID, selectProps) {        
        var updateCount = 0;
        var theLayers = app.project.activeItem.layers;
        for (var i = 1; i <= theLayers.length; i++) {
            var theProps = getPropertiesWithExpressionsFromLayer(theLayers[i]);
            for (var p = 0; p < theProps.length; p++) {
                var thisProp = theProps[p];                
                if (getExpressionID(thisProp) === expressionID) {
                    if (selectProps) {
                        thisProp.selected = true;
                    }
                    updateCount++;
                } else {
                    if (selectProps) {
                        thisProp.selected = false;
                    }
                }
            }
        }
        app.endUndoGroup;
        return updateCount;        
    }
    
    function getPropertiesWithExpressionsFromLayer(theLayer) {
        var props = [];
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
        return props;
    }
    
    function getPropertiesThatCanHaveExpressionsFromLayer(theLayer) {
        var props = [];
        //only return selected properties. Kinda trivial but here for ease of use
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
        thisObj.idText2.text = (msgText.split("\n").length > 1) ?
        msgText.replace(/[^\n]*\n+/, "") :
        "";
    }
    
    //--------------------- go ahead and run ----------------------
    buildGUI(thisObj);
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
