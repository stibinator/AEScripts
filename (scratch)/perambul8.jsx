// @target aftereffects
// @includepath "../(lib)"
/* global Panel */

var scriptName = "perambul8";
var legs = [];
var body = null;

function buildUI(thisObj) {
    var pal;
    if (thisObj instanceof Panel) {
        pal = thisObj;
    } else {
        pal = new Window("palette", scriptName, undefined, {resizeable: true});
    }
    if (pal !== null) {
        var setBodyBttn = pal.add("button", [
            undefined, undefined, 220, 22
        ], 'Set Body layer');

        var setOthersBttn = pal.add("button", [
            undefined, undefined, 220, 22
        ], 'Set other walk layers (optional)');

        var setLegsBttn = pal.add("button", [
            undefined, undefined, 220, 22
        ], 'Set leg keyframes');
        setLegsBttn.enabled = false;



        // var setDirectionDDn = pal.add("panel", [0,0,160,84], "walk Direction");
        //
        // setDirectionDDn.alignCenterRb = setDirectionDDn.add("radiobutton", [60, 12, 160, 32], "Up");
        // setDirectionDDn.alignLeftRb = setDirectionDDn.add("radiobutton", [0, 34, 80, 54], "Left");
        // setDirectionDDn.alignRightRb = setDirectionDDn.add("radiobutton",[110,34,160,54], "Right");
        // setDirectionDDn.alignRightRb = setDirectionDDn.add("radiobutton", [60, 56, 160, 78], "Down");
        // setDirectionDDn.alignCenterRb.value = true;

        // var setMinBttn = pal.add("button", [
        //     undefined, undefined, 220, 22
        // ], 'Set minimum extension');
        // setMinBttn.enabled = false;
        // setMinBttn.clicked = false;
        //
        // var setMidBttn = pal.add("button", [
        //     undefined, undefined, 220, 22
        // ], 'Set mid (passing) pos');
        // setMidBttn.enabled = false;
        // setMidBttn.clicked = false;
        //
        // var setMaxBttn = pal.add("button", [
        //     undefined, undefined, 220, 22
        // ], 'Set maximum extension');
        // setMaxBttn.enabled = false;
        // setMaxBttn.clicked = false;

        walkBttn = pal.add("button", [
            undefined, undefined, 220, 22
        ], 'walk the talk');
        walkBttn.enabled = false;

        //        useSelected.onclick = function () {useSelected.value =  ! useSelected.value};
        setLegsBttn.onClick = function() {
            if (setLegKeyframes()) {
                // setMinBttn.enabled = true;
                // setMidBttn.enabled = true;
                // setMaxBttn.enabled = true;
                walkBttn.enabled = true;
            }
        };

        // setMinBttn.onClick = function() {
        //     setMinBttn.clicked = true;
        //     setMinPos(legs);
        //     if (setMaxBttn.clicked && setBodyBttn.clicked) {
        //         walkBttn.enabled = true;
        //     }
        // };
        // setMidBttn.onClick = function() {
        //     setMidBttn.clicked = true;
        //     setMidPos(legs);
        // };
        // setMaxBttn.onClick = function() {
        //     setMaxBttn.clicked = true;
        //     setMaxPos(legs);
        //     if (setMinBttn.clicked && setBodyBttn.clicked) {
        //         walkBttn.enabled = true;
        //     }
        // };
        setBodyBttn.onClick = function() {
            if (setBody()) {
                setLegsBttn.enabled = true;
            }
        };

        walkBttn.onClick = function() {
            walkTheTalk();
            //reset the UI
            setMinBttn.clicked = false;
            setMinBttn.enabled = false;
            setMidBttn.clicked = false;
            setMidBttn.enabled = false;
            setMaxBttn.clicked = false;
            setMaxBttn.enabled = false;
            setBodyBttn.clicked = false;
            walkBttn.enabled = false;
            setLegsBttn.enabled = false;
        };
    }
    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }
}

function setLegKeyframes() {
    var selectedLegs = app.project.activeItem.selectedLayers;
    for (var theLeg = 0; theLeg < selectedLegs.length; theLeg++) {
        if (selectedLegs[theLeg].comment != "perambul8_Body") {
            selectedLegs[theLeg].comment = "perambul8_Leg" + legs.length;
            var legControl = createControl(selectedLegs[theLeg], body);
            theKFs = getScalePosAndRotationKeyframes(legControl);
            stepData = analyseStep(legControl);
            legs.push({"leg": legControl, "keyframes": theKFs, "stepData": stepData});
        }
    }
    return (legs.length > 0);
}

function setBody() {
    var bodyLayer = app.project.activeItem.selectedLayers;
    if (bodyLayer.length != 1) {
        alert("please chose exactly 1 body layer");
        return false;
    } else {
        body = bodyLayer[0];
        body.comment = "perambul8_Body";
        return true;
    }
}
//
// function setMinPos(legs) {}
//
// function setMidPos(legs) {}
//
// function setMaxPos(legs) {}


function createControl(legLayer, bodyLayer, theComp){
    //walk hierarchy to see if the leg is below the bodyLayer
    var bodyIsAboveLegLayer = isLayerAnAncestor(legLayer, bodyLayer);
    //create a control layer above the body in the hierarchy
    var theControl = theComp.layers.addNull();
    if (bodyIsAboveLegLayer && body.parent !== null){
            theControl.parent = body.parent;
    }
    //copy the keyframes from the leg to the layer space of the control

    //set expressions for pos and rotation on the leg layer and lock it

    //return the new control
}

function isLayerAnAncestor(theLayer, ancestor){
    var oldestAncestor = theLayer;
    if (theLayer === ancestor) {
        return true;
    } else {
        if (theLayer.parent === null) {
            return false;
        } else {
            return isLayerAnAncestor(theLayer.parent, ancestor);
        }
    }
}

function getScalePosAndRotationKeyframes(legLayer){
    //get the Scale pos and rotation keyframes from a leg layer to define the forward step
    var kfs ={};

    //return a keyframe collection

}

function analyseStep(legLayer) {
    //find the first and last keyframes

    //find the vector length of the step

    //normalise

    //return first, last and vector
}

function walkTheTalk() {
    alert(legs.length);

}

buildUI(this);
