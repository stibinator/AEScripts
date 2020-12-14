// @includepath "../(lib)"
// @include  "getproperties.jsx"

/* global app, Panel, getPropertiesWithExpressionsFromLayer */

//set the message that gets appended to expressons to denote that they're paused
//the message will be made into a comment, so it won't affect the expression
var pausedTag = "#paused#"; //you can change this if you want, 
// but you've probably go better things to do - when did you last ring your mum?
var pauseAllText = "Pause";
var resumePausedText = "Resume paused Xps";
var startAllText = "Start disabled Xps";
var removeAllText = "Remove Xps";
var freezeText = "Freeze Xps at current value";
var freezeAtKFText = "Freeze Xps at KeyFrames";
var selectedOnlyLabel = '..on selected layers only';
var selectedPropsOnlyLabel = '..on selected properties only';
var includeLockedLabel = ' Include locked layers';
var removeExpUndoGrpLabel = "remove all expressions";
var freezeExpressionsUndoGrpLabel = "freeze all expressions";
var freezeExpressionsAtKFUndoGrpLabel = "freeze expressions at keyframes"
var startExpressionsUndoGrpLabel = "start all disabled expressions";
var convertText = "Xps > Keyframes"
var convertExpressionsUndoGrpLabel = "Convert all expressions to KFs"
var noSelectedLayersText = "No layers selected, silly rabbit";

//global vars
pausedTag = "//" + pausedTag; //make it a comment
var tagLength = 0 - pausedTag.length; //used for splicing the expression strings. Equates to a negative number
var pauseState = false; //start off assuming that we haven't paused yet
var scriptName = "Pause Expressions";

function buildUI(thisObj) {
    if (thisObj instanceof Panel) {
        var pal = thisObj;
    } else {
        pal = new Window("palette", scriptName, undefined, {resizeable: true});
    }
    if (pal !== null) {
        var xpPanel = pal.add('panel', undefined, "Expressions:");
        xpPanel.orientation = 'column';
        xpPanel.alignChildren = 'left';
        xpPanel.size = {width: 180, height: undefined};
        var pauseExpressionsBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], pauseAllText);

        var startExpressionsBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], startAllText);

        var removeExpressionsBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], removeAllText);

        var freezeExpressionsBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], freezeText);
        var freezeExpressionsAtKFBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], freezeAtKFText);

        var convertAllExpressionsBtn = xpPanel.add("button", [
            undefined, undefined, 200, 22
        ], convertText);
        //
        // freezeKeyframeCheckbox = pal.add("checkbox", [
        //     undefined, undefined, 200, 22
        // ], 'Freeze creates keyframe');

        var selectedOnlyCheckbox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], selectedOnlyLabel);

        selectedOnlyCheckbox.value = false;
        selectedOnlyCheckbox.oldValue = false;
        var selectedPropsOnlyCheckbox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], selectedPropsOnlyLabel);

        selectedPropsOnlyCheckbox.value = false;
        selectedPropsOnlyCheckbox.oldValue = false;
        var includeLockedCheckBox = pal.add("checkbox", [
            undefined, undefined, 200, 22
        ], includeLockedLabel);

        includeLockedCheckBox.value = false;
        includeLockedCheckBox.oldValue = false; // see below

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
        };

        pauseExpressionsBtn.onClick = function() {
            // do the hoo-hah
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0) {
                toggleExpressionsOnLayers(theLayers, includeLockedCheckBox.value, selectedPropsOnlyCheckbox.value);
                if (pauseState) {
                    //toggle the button labels as we toggle the pause state
                    pauseExpressionsBtn.text = pauseAllText;
                } else {
                    pauseExpressionsBtn.text = resumePausedText;
                }
                pauseState = !pauseState;
            }
        };

        startExpressionsBtn.onClick = function() {
            app.beginUndoGroup(startExpressionsUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0) {
                startSelected(theLayers, includeLockedCheckBox.value, selectedPropsOnlyCheckbox.value);
                pauseState = false;
            }
            app.endUndoGroup();
        };

        removeExpressionsBtn.onClick = function() {
            app.beginUndoGroup(removeExpUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0) {
                removeSelected(theLayers, includeLockedCheckBox.value, selectedPropsOnlyCheckbox.value);
                pauseState = false;
            }
            app.endUndoGroup();
        };

        freezeExpressionsBtn.onClick = function() {
            app.beginUndoGroup(freezeExpressionsUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0) {
                freezeExpressions(theLayers, includeLockedCheckBox.value, selectedPropsOnlyCheckbox.value);
            }
            app.endUndoGroup();
        };

        freezeExpressionsAtKFBtn.onClick = function() {
            app.beginUndoGroup(freezeExpressionsAtKFUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0) {
                freezeExpressionsAtKFs(theLayers, includeLockedCheckBox.value, selectedPropsOnlyCheckbox.value);
            }
            app.endUndoGroup();
        };

        convertAllExpressionsBtn.onClick = function() {
            app.beginUndoGroup(convertExpressionsUndoGrpLabel);
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0) {
                convertExpressions(theLayers, includeLockedCheckBox.value, selectedPropsOnlyCheckbox.value);
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
function getTheLayers(selectedOnly) {
    var theLayersList = [];
    if (selectedOnly) {
        if (app.project.activeItem.selectedLayers.length > 0) {
            theLayersList = app.project.activeItem.selectedLayers;
        } else {
            alert(noSelectedLayersText);
        }
    } else {
        for (var i = 1; i <= app.project.activeItem.layers.length; i++) {
            theLayersList.push(app.project.activeItem.layers[i]);
        }
    }
    return theLayersList;
}

function toggleExpressionsOnLayers(theLayers, includeLocked, onlySelectedProps) {
    var expressionProps = getExpressions(theLayers, includeLocked, onlySelectedProps);
    // pause and resume active expressions
    if (pauseState) { // paused is true so we resume the expression
        // loop through all the properties with expressions
        for (var i = 0; i < expressionProps.length; i++) {
            //tagLength is a negative number so this is like expression.substr(-5) or whatevs
            if (expressionProps[i].expression.substr(tagLength) === pausedTag) {
                // slice off the "//#paused#" comment
                expressionProps[i].expression = expressionProps[i].expression.slice(0, tagLength);
                //turn the expression back on
                expressionProps[i].expressionEnabled = true;
            }
        }
    } else { // paused is false so pause the expression
        for (var j = 0; j < expressionProps.length; j++) {
            //only pause expressions that are actually running, to avoid turning on disabled expressions later
            if (expressionProps[j].expressionEnabled === true) {
                //check to make sure we haven't paused it already
                if (expressionProps[j].expression.substr(tagLength) !== pausedTag) {
                    //add a tag to denote that this script is paused
                    expressionProps[j].expression = expressionProps[j].expression + pausedTag;
                }
                // if it has the tag or if we just added it, we turn it off now
                expressionProps[j].expressionEnabled = false;
            }
        }
    }
}

function startSelected(theLayers, includeLocked, onlySelectedProps) {
    var expressionProps = getExpressions(theLayers, includeLocked, onlySelectedProps);
    // start ALL inactive expressions, including paused ones
    for (var i = 0; i < expressionProps.length; i++) {
        if (expressionProps[i].expression.substr(tagLength) === pausedTag) {
            // remove any tags the script may have previously added
            expressionProps[i].expression = expressionProps[i].expression.slice(0, tagLength);
        }
        expressionProps[i].expressionEnabled = true;
    }
}

function removeSelected(theLayers, includeLocked, onlySelectedProps) {
    var expressionProps = getExpressions(theLayers, includeLocked, onlySelectedProps);
    for (var i = 0; i < expressionProps.length; i++) {
        expressionProps[i].expression = "";
        expressionProps[i].expressionEnabled = false;
    }
}

function freezeExpressions(theLayers, includeLocked, onlySelectedProps) {
    var expressionProps = getExpressions(theLayers, includeLocked, onlySelectedProps);
    for (var i = 0; i < expressionProps.length; i++) {
        //create keyframes from our expression - if the property already has KFs then we need to add a new keyframe
        if (expressionProps[i].numKeys > 0) {
            expressionProps[i].setValueAtTime(app.project.activeItem.time, expressionProps[i].valueAtTime(app.project.activeItem.time, false));
        } else {
            //set the static value of the property
            expressionProps[i].setValue(expressionProps[i].valueAtTime(app.project.activeItem.time, false));
        }
        expressionProps[i].expressionEnabled = false;
    }
}

function freezeExpressionsAtKFs(theLayers, includeLocked, onlySelectedProps) {
    var expressionProps = getExpressions(theLayers, includeLocked, onlySelectedProps);

    for (var i = 0; i < expressionProps.length; i++) {
        //create keyframes from our expression - if the property already has KFs then we need to add a new keyframe
        if (expressionProps[i].numKeys > 0) {
                            
            for (var k = 1; k <= expressionProps[i].numKeys; k++){

                expressionProps[i].setValueAtTime(expressionProps[i].keyTime(k), expressionProps[i].valueAtTime(expressionProps[i].keyTime(k), false));
            }
        } else {
            //set the static value of the property
            expressionProps[i].setValue(expressionProps[i].valueAtTime(app.project.activeItem.time, false));
        }
        expressionProps[i].expressionEnabled = false;
    }
}

function convertExpressions(theLayers, includeLocked, onlySelectedProps) {
    for (var lyr = 0; lyr < theLayers.length; lyr++){
        var expressionProps = getExpressions(theLayers[lyr], includeLocked, onlySelectedProps);
        var startPt = (theLayers[lyr].inPoint > 0)? 
            theLayers[lyr].inPoint: 
            0.0;
        var stopPt = (theLayers[lyr].outPoint < theLayers[lyr].containingComp.duration)? 
            theLayers[lyr].outPoint: 
            theLayers[lyr].containingComp.duration;
        var frameDur = theLayers[lyr].containingComp.frameDuration;
        var n = 0;
        for (var i = 0; i < expressionProps.length; i++) {
            var newKeys = [];
            for (var curTime  = startPt; curTime  < stopPt; curTime += frameDur) {
                //create keyframes from our expression - if the property already has KFs then we need to add a new keyframe
                newKeys[n] = {keyTime: curTime, keyVal: expressionProps[i].valueAtTime(curTime, false)};
                 n++;
            }
            
                theLayers[lyr].comment = theLayers[lyr].comment + "keyframeInfo:" + expressionProps[i].name
            for (var keyNum = 1; keyNum <= expressionProps[i].numKeys; keyNum++){
                theLayers[lyr].comment = theLayers[lyr].comment + "key#" + i + "@" + expressionProps[i].keyTime(i) + "=" + expressionProps[i].keyValue(i) + "\n"
            }

            expressionProps[i].expressionEnabled = false;
            while(n > 0 ) {
                n--;
                //create keyframes from our expression - if the property already has KFs then we need to add a new keyframe
                expressionProps[i].setValueAtTime(newKeys[n].keyTime, newKeys[n].keyVal)
            }
        }
    }
}


function getExpressions(theLayers, includeLocked, onlySelectedProps) {
    var theProps = [];
    var newProps;
    for (var i = 0; i < theLayers.length; i++) {
        //check to see if the layer is locked if neccessary
        if (theLayers[i].locked === false || includeLocked) {
            newProps = getPropertiesWithExpressionsFromLayer(theLayers[i], onlySelectedProps);
            for (var j = 0; j < newProps.length; j++) {
                theProps.push(newProps[j]);
            }
        }
    }
    return theProps;
}
