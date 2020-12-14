/* @target aftereffects */
/* includepath  "../(lib)" */
/* include getproperties.jsx */
/* global app, Panel, getPropertiesWithExpressionsFromLayer */

//set the message that gets appended to expressons to denote that they're paused
//the message will be made into a comment, so it won't affect the expression
var pausedTag = "#paused#"; //you can change this if you want, but you've probably go better things to do - when did you last ring your mum?

var pauseAllText = "Pause";
var resumePausedText = "Resume paused";
var startAllText = "Force start All";
var removeAllText = "Remove All";
var noSelectedLayersText = "No layers selected, silly rabbit";

//global vars
pausedTag = "//" + pausedTag; //make it a comment
var tagLength = 0 - pausedTag.length; //used for splicing the expression strings. Equates to a negative number
var pauseState = false; //start off assuming that we haven't paused yet
var scriptName = "Pause Expressions";

function buildUI(thisObj){
    var pal = thisObj;
    if (! (pal instanceof Panel)){
        pal= new Window("palette", scriptName, undefined, {resizeable:true});
    }
    if (pal !== null)
    {
        pal.add("statictext", [undefined,undefined,200,22], "Expressions:");
        var pauseExpressionsBtn = pal.add("button", [undefined,undefined,200,22], pauseAllText);
        var startExpressionsBtn = pal.add("button", [undefined,undefined,200,22], startAllText);
        var removeExpressionsBtn = pal.add("button", [undefined,undefined,200,22], removeAllText);
        var selectedOnlyCheckbox = pal.add("checkbox", [undefined,undefined,200,22], ' …on selected layers only');
        selectedOnlyCheckbox.value = false;
        var includeLockedCheckBox = pal.add("checkbox", [undefined,undefined,200,22], ' Include locked layers');
        includeLockedCheckBox.value = false;
        includeLockedCheckBox.oldValue = false; // see below
        selectedOnlyCheckbox.onClick = function () {
            // turn off "include locked layers" checkbox, because it doesn't make sense with the "selected only" checkbox on.
            if (selectedOnlyCheckbox.value) {
                // remember the value so it can be reinstated when I uncheck the "selected only" checkbox
                includeLockedCheckBox.oldValue = includeLockedCheckBox.value;
                includeLockedCheckBox.enabled = false;
                includeLockedCheckBox.value = false; // uncheck it so that it's unambiguous
            } else {
                includeLockedCheckBox.enabled = true;
                // reinstate the "include locked layers" value
                includeLockedCheckBox.value = includeLockedCheckBox.oldValue;
            }
        };

        pauseExpressionsBtn.onClick = function () {
            // do the hoo-hah
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0){
                toggleExpressionsOnLayers(theLayers, includeLockedCheckBox.value);
                if (pauseState){
                    //toggle the button labels as we toggle the pause state
                    pauseExpressionsBtn.text = pauseAllText;
                } else {
                    pauseExpressionsBtn.text = resumePausedText;
                }
                pauseState =  ! pauseState;
            }
        };

        startExpressionsBtn.onClick = function () {
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0){
                startSelected(theLayers, includeLockedCheckBox.value);
                pauseState =  false;
            }
        };

        removeExpressionsBtn.onClick = function() {
            app.beginUndoGroup("remove all expressions");
            var theLayers = getTheLayers(selectedOnlyCheckbox.value);
            if (theLayers.length > 0){
                removeSelected(theLayers, includeLockedCheckBox.value);
                pauseState =  false;
            }
            app.endUndoGroup();
        };

    }
    if (pal instanceof Window ){
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }
}

// actually build the UI
buildUI(this);

function getTheLayers(selectedOnly){
    var theLayersList = [];
    if (selectedOnly){
        if (app.project.activeItem.selectedLayers.length > 0){
            theLayersList = app.project.activeItem.selectedLayers;
        } else {
            alert(noSelectedLayersText);
        }
    } else {
        for (var i=1; i<=app.project.activeItem.layers.length; i++){theLayersList.push(app.project.activeItem.layers[i]);}
    }
    return theLayersList;
}

function toggleExpressionsOnLayers(theLayers, includeLockedCheckBox){
    var expressionProps = getExpressions(theLayers, includeLockedCheckBox);
    toggleExpressions(expressionProps);
}

function startSelected(theLayers, includeLockedCheckBox){
    var expressionProps = getExpressions(theLayers, includeLockedCheckBox) ;
    startExpressions(expressionProps);
}

function removeSelected(theLayers, includeLockedCheckBox){
    var expressionProps = getExpressions(theLayers, includeLockedCheckBox) ;
    removeProps(expressionProps);
}

//here comes the real hoo-hah
function toggleExpressions(expressionProps){
    // pause and resume active expressions
    if (pauseState){ // paused is true so we resume the expression
        // loop through all the properties with expressions
        for (var i = 0; i < expressionProps.length; i++){
            //tagLength is a negative number so this is like expression.substr(-5) or whatevs
            if (expressionProps[i].expression.substr(tagLength) === pausedTag){
                // slice off the "//#paused#" comment
                expressionProps[i].expression = expressionProps[i].expression.slice(0, tagLength);
                //turn the expression back on
                expressionProps[i].expressionEnabled = true;
            }
        }
    } else { // paused is false so pause the expression
        for (i = 0; i < expressionProps.length; i++){
            //only pause expressions that are actually running, to avoid turning on disabled expressions later
            if (expressionProps[i].expressionEnabled === true){
                //check to make sure we haven't paused it already
                if (expressionProps[i].expression.substr(tagLength) !== pausedTag){
                    //add a tag to denote that this script is paused
                    expressionProps[i].expression = expressionProps[i].expression + pausedTag;
                }
                // if it has the tag or if we just added it, we turn it off now
                expressionProps[i].expressionEnabled = false;
            }
        }
    }
}

function startExpressions(expressionProps){
    // start ALL inactive expressions, including paused ones
    for (var i = 0; i < expressionProps.length; i++){
        if (expressionProps[i].expression.substr(tagLength) === pausedTag){
            // remove any tags the script may have previously added
            expressionProps[i].expression = expressionProps[i].expression.slice(0, tagLength);
        }
        expressionProps[i].expressionEnabled = true;
    }
}

function getExpressions(theLayers, includeLockedCheckBox){
    var theProps = [];
    // var theExpressions = [];
    var newProps;
    for (var i = 0; i < theLayers.length; i++){
        //check to see if the layer is locked if neccessary
        if (theLayers[i].locked === false || includeLockedCheckBox){
            newProps = getPropertiesWithExpressionsFromLayer(theLayers[i]);
            for (var j=0; j<newProps.length; j++){theProps.push(newProps[j]);}
        }
    }
    return theProps;
}

function removeProps(expressionProps){
    // start ALL inactive expressions, including paused ones
    for (var i = 0; i < expressionProps.length; i++){
        expressionProps[i].expression = "";
        expressionProps[i].expressionEnabled = false;
    }
}
