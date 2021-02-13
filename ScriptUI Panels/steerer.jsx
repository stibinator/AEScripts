// @target aftereffects
// @includepath  "../(lib)"
// @include "defaultFor.jsx"
// @include "timeconversions.jsx"
// @include "spacetransforms.jsx"
// @include "vectormaths.jsx"
// @include "getproperties.jsx"
// @include "copyproperties-makekey.jsx"

this.version = 0.9;
scriptName = "steerer";

buildGUI(this);

function autoOrientSelectedLayer(numSamples, sampleDist, prePost, headingOffset, additive) {
  app.beginUndoGroup(scriptName);
    var proj = app.project;
    if (proj) {
        if (app.project.activeItem) {
            var movingBodies = app.project.activeItem.selectedLayers;
            if (movingBodies.length > 0 ) {
                autoOrient(movingBodies, numSamples, sampleDist, prePost, headingOffset, additive);
            } else {
                alert("select at least one moving layer");
            }
        } else {
            alert("Please select a comp to use this script", scriptName);
        }
    } else {
        alert("Please open a project first to use this script, you silly rabbit", scriptName);
    }
    app.endUndoGroup();
}

function dealWithCurrentKeyframes(theBody, additive) {
    var rot8n =theBody.property("rotation");
    var startFrame = getStartFrame(theBody);
    var endFrame = getEndFrame(theBody);
    alert(endFrame);
    if (additive) {
        //make keyframes for every frame using the existing keyed value
        for (var i = startFrame; i <= endFrame ; i++) {
            rot8n.setValueAtTime(frames2Time(i), rot8n.valueAtTime(frames2Time(i), true));
        }
    } else {
        //remove all the rotation keys and reset
        var initialValue = rot8n.valueAtTime(frames2Time(startFrame), true);
        while( rot8n.numKeys > 0){
            rot8n.removeKey(1);
        }
        rot8n.setValue(initialValue);
    }
    // body...
}

function getStartFrame(theBody) {
    var posn = theBody.property("position");
    if (posn.expressionEnabled | posn.numKeys === 0){
        return time2Frames(theBody.inPoint);
    } else {
        var firstPosKeyTime = posn.keyTime(1);
        return (theBody.inPoint < firstPosKeyTime)? time2Frames(theBody.inPoint):  time2Frames(firstPosKeyTime);
    }
}
function getEndFrame(theBody) {
    var posn = theBody.property("position");
    if (posn.expressionEnabled | posn.numKeys === 0){
        return time2Frames(theBody.outPoint);
    } else {
        var lastPosKeyTime = posn.keyTime(posn.numKeys);
        return (theBody.outPoint > lastPosKeyTime)? time2Frames(theBody.outPoint): time2Frames(lastPosKeyTime);
    }
}

function autoOrient(movingBodies, numSamples, sampleDist, prePost, headingOffset, additive){
    var posNull = app.project.activeItem.layers.addNull();
    posNull.name = "temp-delete";
    // var prevNull = app.project.activeItem.layers.addNull();
    // prevNull.name= "prev";
    // var nextNull = app.project.activeItem.layers.addNull();
    // nextNull.name= "next";
    var prevPos, nextPos, preSamples, postSamples;
    //
    for (var i=0; i < movingBodies.length; i++){
        var theBody = movingBodies[i];

        dealWithCurrentKeyframes(theBody, additive);

        //look for dynamic steering control on the layer
        // var dynamicSamples = theBody.property("Effects") !== null &&  theBody.property("Effects").property("steerer_smoothness")!== null && theBody.property("Effects").property("steerer_smoothness").property("Slider") !== null;
        // var dynamicSteering = theBody.property("Effects")!== null && theBody.property("Effects").property("steerer_oversteer")!== null &&  theBody.property("Effects").property("steerer_oversteer").property("Slider") !== null;

        var startFrame = getStartFrame(theBody);
        var endFrame = getEndFrame(theBody);
        var positionAr= [];
        var keepGoing = true;
        var posn = theBody.property("Position");
        var rot8n =  theBody.property("Rotation");
        var lastRot8Val = rot8n.valueAtTime(frames2Time(startFrame), false);
        //todo - trim work area to first and last keys
        for (var theFrame = startFrame; theFrame <= endFrame; theFrame++) {
            //make initial samples at current time-1 and current time
            var backwardSample;
            var forwardSample;

            // var backwardSampleFrame = theFrame;
            // var forwardSampleFrame = theFrame;
            var currentSample = posn.valueAtTime(frames2Time(theFrame), false);

            prevPos = currentSample;
            var backwardSampleCount = 1;

            nextPos = currentSample;
            var forwardSampleCount = 1;

            // set up dynamic steering if the applropriate controls have been applied
            // if (dynamicSamples){
            //     numSamples = theBody.property("Effects").property("steerer_smoothness").property("Slider").valueAtTime(frames2Time(theFrame), false);
            // }
            // if (dynamicSteering){
            //     prePost = theBody.property("Effects").property("steerer_oversteer").property("Slider").valueAtTime(frames2Time(theFrame), false);
            // }
            //pre and post samples should go from 1 to numSamples -1
            preSamples = 1+Math.round((numSamples) * (Math.clamp(prePost/100, 0, 1)));
            postSamples = 1+Math.round((numSamples) * (1-Math.clamp(prePost/100, 0, 1)));
            preSamples += sampleDist;
            postSamples += sampleDist;


            var backwardSampleFrame;
            for ( backwardSampleFrame = sampleDist; backwardSampleFrame < preSamples; backwardSampleFrame++) {
                backwardSample = posn.valueAtTime(frames2Time(theFrame - backwardSampleFrame), false);
                prevPos += backwardSample;
                backwardSampleCount++;
            }
            currentSample = backwardSample;
            //track backwards when there are static periods, as far as the beginning and a bit
            while ((vectorLength(backwardSample, currentSample)=== 0) && ((theFrame - backwardSampleFrame) >= (startFrame - preSamples))){
                backwardSampleFrame++;
                backwardSample = posn.valueAtTime(frames2Time(theFrame - backwardSampleFrame), false);
            }
            //add the last sample
            backwardSampleCount++;
            prevPos += backwardSample;


            var forwardSampleFrame;
            for ( forwardSampleFrame = sampleDist; forwardSampleFrame < postSamples; forwardSampleFrame++) {
                forwardSample = posn.valueAtTime(frames2Time(theFrame + forwardSampleFrame), false);
                nextPos += forwardSample;
                forwardSampleCount++;
            }

            currentSample = forwardSample;
            //track forwards when there are static periods, as far as the beginning and a bit
            while ((vectorLength(forwardSample, currentSample)=== 0) && ((theFrame + forwardSampleFrame) <= (endFrame + postSamples))){
                forwardSampleFrame++;
                forwardSample = posn.valueAtTime(frames2Time(theFrame + forwardSampleFrame), false);
            }
            // add the last sample
            forwardSampleCount++;
            nextPos += forwardSample;

            prevPos /= backwardSampleCount;
            nextPos /= forwardSampleCount;
            // prevNull.property("Position").setValueAtTime(frames2Time(theFrame), prevPos);
            // nextNull.property("Position").setValueAtTime(frames2Time(theFrame), nextPos);

            var heading = radiansToDegrees(Math.atan2((nextPos - prevPos)[1], (nextPos - prevPos)[0]));
            if (additive) {
                var currentRot8n = rot8n.valueAtTime(frames2Time(theFrame), false);
                heading = currentRot8n + heading + headingOffset;
            } else {
                heading = heading + headingOffset;
            }
            //deal with the problem that atan2 will return values with a 360 degree difference between adjacent frames where the rotation is close to 180deg
            if (Math.abs(lastRot8Val - heading) > Math.abs(lastRot8Val - (heading - 360))) { heading -= 360;}
            if (Math.abs(lastRot8Val - heading) > Math.abs(lastRot8Val - (heading + 360))) { heading += 360;}
            rot8n.setValueAtTime(frames2Time(theFrame),heading);
            lastRot8Val = heading;
        }
    }
    posNull.remove();
}

function add90Deg(theLayers){
    if (theLayers.length !== 0) {
        for (var i=0; i < theLayers.length; i++){
            var thisLayer = theLayers[i];
            var rot8n =thisLayer.property("Rotation");
            for (var k = 1; k<=rot8n.numKeys; k++){
                rot8n.setValueAtKey(k, rot8n.keyValue(k) + 90);
            }
        }
    } else {
        alert("select at least one layer");
    }
}



function buildGUI(thisObj){

    var theWindow = (thisObj instanceof Panel) ? thisObj : new Window("palette", thisObj.scriptTitle, undefined, {resizeable:true});
    theWindow.preferredSize = "width: -1, height: -1";
    theWindow.alignChildren = ["left", "top"];
    theWindow.margins = [10,10,10,10];

    var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']}");

    mainGroup.add("staticText", undefined, "number of samples");
    var sampleGrp = mainGroup.add("group{orientation:'row'}");
    var numSlider = sampleGrp.add("slider", undefined, 3, 1, 15);
    numSlider.size = 'width: 150, height: 10';
    var numEdit = sampleGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
    numEdit.text = numSlider.value;

    mainGroup.add("staticText", undefined, "minimum offset (frames)");
    var distGrp = mainGroup.add("group{orientation:'row'}");
    var distSlider = distGrp.add("slider", undefined, 1, 0, 15);
    distSlider.size = 'width: 150, height: 10';
    var distEdit = distGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
    distEdit.text = distSlider.value;

    mainGroup.add("staticText", undefined, "pre <-> post");
    var prePostGrp = mainGroup.add("group{orientation:'row'}");
    var prePostSlider = prePostGrp.add("slider", undefined, 50, 0, 100);
    prePostSlider.size = 'width: 150, height: 10';
    var prePostEdit = prePostGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
    prePostEdit.text = prePostSlider.value;

    mainGroup.add("staticText", undefined, "heading offset");
    var headingOffsetGrp = mainGroup.add("group{orientation:'row'}");
    var headingOffsetSlider = headingOffsetGrp.add("slider", undefined, 0, -180, 180);
    headingOffsetSlider.size = 'width: 150, height: 10';
    var headingOffsetEdit = headingOffsetGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
    headingOffsetEdit.text = headingOffsetSlider.value;

    numSlider.onChanging = function () {numEdit.text = parseInt(numSlider.value);};
    distSlider.onChanging = function () {distEdit.text = parseInt(distSlider.value);};
    prePostSlider.onChanging = function () {prePostEdit.text = parseInt(prePostSlider.value);};
    headingOffsetSlider.onChanging = function () {headingOffsetEdit.text = parseInt(headingOffsetSlider.value);};

    numEdit.onChange = function () {
        if (numSlider.maxValue < parseInt(numEdit.text)){ numSlider.maxValue = parseInt(numEdit.text);}
        numSlider.value = parseInt(numEdit.text);
    };
    distEdit.onChange = function () {
        if (distSlider.maxValue < parseInt(distEdit.text)){ distSlider.maxValue = parseInt(distEdit.text);}
        distSlider.value = parseInt(distEdit.text);
    };
    prePostEdit.onChange = function () {prePostSlider.value = parseInt(prePostEdit.text);};
    headingOffsetEdit.onChange = function () {headingOffsetSlider.value = parseInt(headingOffsetEdit.text);};

    var buttonsGrp = mainGroup.add("group{orientation:'row'}");
    var doItButton = buttonsGrp.add("button{text:'Process'}");
    var add90Button = buttonsGrp.add("button{text:'Add 90°'}");

    var additiveGrp = mainGroup.add("group{orientation:'row'}");
    var additiveChkbx = additiveGrp.add("checkbox{text:'Add to current value', value: 0}");


    doItButton.onClick = function(){autoOrientSelectedLayer(numSlider.value, distSlider.value, prePostSlider.value, headingOffsetSlider.value, additiveChkbx.value);};
    add90Button.onClick = function(){add90Deg(app.project.activeItem.selectedLayers);};

    if (theWindow instanceof Window){
        theWindow.center();
        theWindow.show();
    }

    else theWindow.layout.layout(true);
}


Object.prototype.setFG = function(colorArray) {
    if (typeof colorArray != 'undefined' && colorArray.length >=3) {
        this.graphics.foregroundColor = this.graphics.newPen(this.graphics.PenType.SOLID_COLOR, colorArray, 1);
    }
    return this;
};

Object.prototype.setBG = function (colorArray) {
    if (typeof colorArray != 'undefined' && colorArray.length >=3) {
        this.graphics.backgroundColor = this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, colorArray);
    }
    return this;
};
