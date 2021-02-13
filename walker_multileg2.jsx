// @target aftereffects
/* jshint ignore:start */
// Code here will be ignored by JSHint.
#includepath "(lib)"
#include "defaultFor.jsx"
#include "timeconversions.jsx"
#include "spacetransforms.jsx"
#include "vectormaths.jsx"
#include "getproperties.jsx"
#include "copyproperties-makekey.jsx"
/* jshint ignore:end */

var scriptName = "walker";
app.beginUndoGroup(scriptName);
walker();
app.endUndoGroup();

function walker() {
    var proj = app.project;
    if (proj) {
        if (app.project.activeItem) {
            var legs = app.project.activeItem.selectedLayers;
            var body = null;
            for (var i = 0; i < legs.length; i++) {
                if (legs[i].parent) {
                    body = legs[i].parent;
                    legs[i] = makeWorldController(legs[i]);
                }
            }
            if (legs.length > 0) {
                if (body){
                    walk(legs, body);
                } else {
                    //alert("leg layers must have a parent");
                    //assume that the first selected layer is the body
                    body = legs.shift();
                    walk(legs, body);
                    }
                
            } else {
                alert("select keyframes from at least one leg layer");
            }
        } else {
            alert("Please select a comp to use this script", scriptName);
        }
    } else {
        alert("Please open a project first to use this script, you silly rabbit", scriptName);
    }
}

function makeWorldController(theLayer, doPos, doRot) { //, doScale
    //makes a non-parented null and sets the expressions of the layer to its world position
    doPos = defaultFor(doPos, true);
    doRot = defaultFor(doRot, true);
    // doScale = defaultFor(doScale, true);
    var theCtrlNull = theLayer.containingComp.layers.addNull();
    theCtrlNull.name = "World_Ctrl_" + theLayer.name;
    if (doPos) {
        //copy all the existing keyframes to the controll null
        var p = theLayer.transform.position;
        for (var i = 1; i <= p.numKeys; i++) {
            var t = p.keyTime(i);
            var wp = toWorldPos(theLayer, theLayer.transform.anchorPoint.valueAtTime(t, true), t);
            theCtrlNull.transform.position.setValueAtTime(t, wp);
        }
        if(theLayer.parent){
            theLayer.transform.position.expression = "n=thisComp.layer(\"" + theCtrlNull.name + "\"); parent.fromWorld(n.toWorld(n.transform.anchorPoint))";
         } else { 
             theLayer.transform.position.expression = "n=thisComp.layer(\"" + theCtrlNull.name + "\"); fromWorld(n.toWorld(n.transform.anchorPoint))";
             }
    }
    for (i=1; i<=theCtrlNull.transform.position.numKeys; i++){
        theCtrlNull.transform.position.setSelectedAtKey(i, true)
     }
    if (doRot) {

        //copy all the existing keyframes to the controll null
        var r = theLayer.transform.rotation;
        for (var j = 1; j <= r.numKeys; j++) {
            var rt = r.keyTime(j);
            var wr = toWorldRotation(theLayer, rt);
            theCtrlNull.transform.rotation.setValueAtTime(rt, wr);
            theCtrlNull.transform.rotation.setSelectedAtKey(i, true)
        }
        theLayer.transform.rotation.expression = "n=thisComp.layer(\"" + theCtrlNull.name + "\"); unitVec = parent.fromWorldVec(n.toWorldVec([1,0,0])); radiansToDegrees(Math.atan2(unitVec[1], unitVec[0]))";
    }
    // if (doScale) {
    //
    //     //copy all the existing keyframes to the controll null
    //     var s = theLayer.transform.rotation;
    //     for (var k = 1; k <= s.numKeys; k++) {
    //         var st = s.keyTime(k);
    //         var ws = toWorldScale(theLayer, st);
    //         theCtrlNull.transform.rotation.setValueAtTime(st, ws);
    //     }
    //     theLayer.transform.scale.expression = "n=thisComp.layer(\"" + theCtrlNull.name + "\"); unitVec = n.fromWorldVec([1,1,1]);unitVec*100;";
    // }
    return theCtrlNull;
}

function walk(legs, bodyLayer, stepStartDist, stepEndDist, firstStep, startCalculationF, endCalculationF, posNull) {
    var comp = app.project.activeItem;
    firstStep = defaultFor(firstStep, 0);
    startCalculationF = defaultFor(startCalculationF, 0);
    stepEndDist = defaultFor(stepEndDist, []);
    stepStartDist = defaultFor(stepStartDist, []);
    //calculate until the last keyframe
    endCalculationF = defaultFor(endCalculationF, time2Frames(bodyLayer.position.keyTime(bodyLayer.position.numKeys)));

    var lastKeyTime = [];
    var movingKeys = [];
    var frame = startCalculationF;
    //    var leg = firstStep;
    var lengthTravelled;
    var averageLegPosition = [];
    var legNull = [];
    var travelDistanceThisFrame = 0;
    var lengthMultiplier = [];
    //find other keyframes to include
    var keyList = getKeyFrames(legs, frames2Time(startCalculationF), frames2Time(endCalculationF), body = bodyLayer);
    //find the length of travel for the body. Position key1 and position key 2 set this.

    var totalStepLength = calculateLengthOfTravel(bodyLayer, time2Frames(bodyLayer.position.keyTime(1)), time2Frames(bodyLayer.position.keyTime(2)));
    //var stepVector = calculateTravelvector(bodyLayer, startCalculationF, time2Frames(bodyLayer.position.keyTime(2)));
    // keyList = scaleKeyFrames(stepVector, keyList);

    for (var theLeg = 0; theLeg < keyList.length; theLeg++) {
        stepEndDist[theLeg] = keyList[theLeg].lastKeyTravel;
        stepStartDist[theLeg] = keyList[theLeg].firstKeyTravel;
        //make an initial key frame for each of the properties we're modifying
        for (var theKey = 0; theKey < keyList[theLeg].keyframes.length; theKey++) {
            var theProp = keyList[theLeg].keyframes[theKey].prop;

            var propStartVal = legs[theLeg].property(theProp).valueAtTime(frames2Time(frame), false);
            //remove existing keys for the properties we're animating
            var numKeys = legs[theLeg].property(theProp).numKeys;
            for (kf = 1; kf <= numKeys; kf++) {
                legs[theLeg].property(theProp).removeKey(1);
            }
        }
    }

    //make a null for use by helper functions
    if (posNull === undefined) {
        posNull = app.project.activeItem.layers.addNull();
        posNull.name = "temp-delete";
    }
    // now walk the talk
    frame = startCalculationF;
    lengthTravelled = 0;
    while (frame <= endCalculationF) {

        travelDistanceThisFrame = calculateLengthOfTravel(bodyLayer, frame, frame + 1);
        for (var leg = 0; leg < keyList.length; leg++) {
            lastKeyTime[leg] = frames2Time(frame - 1);
            //if there was a moving key created during the last frame, use it as our last key
            lastKeyTime[leg] = (movingKeys[leg] > lastKeyTime[leg])?
              movingKeys[leg]:
              lastKeyTime[leg];
            // check to see if it's time to swing the leg

            // here's the tricky logic.
            // If the current frame is not INSIDE a step make a static keyframe
            if (lengthTravelled <= stepStartDist[leg] || lengthTravelled > stepEndDist[leg]) {
                //makeStaticKeyframeForLayer(legs[leg], lastKeyTime[leg], frames2Time(frame), posNull);
            }
            // if a step starts or continues during this frame
            if (((lengthTravelled <= stepStartDist[leg]) && ((lengthTravelled + travelDistanceThisFrame) >= stepStartDist[leg])) || ((lengthTravelled >= stepStartDist[leg]) && (lengthTravelled <= stepEndDist[leg]))) {
                movingKeys[leg] = makeSwingingLegKeyframes(legs[leg], keyList[leg], lengthTravelled, travelDistanceThisFrame, frame, totalStepLength);

            }

        }
        frame++;
        //lengthTravelled = ( lengthTravelled + travelDistanceThisFrame) % totalStepLength;
        lengthTravelled = lengthTravelled + travelDistanceThisFrame;
        lengthTravelled = (lengthTravelled > totalStepLength)?
          0:
          lengthTravelled;
    }

    posNull.remove();
}

function makeSwingingLegKeyframes(freeLeg, legKeyList, lengthTravelled, travelDistanceThisFrame, currentFrame, totalStepLength) {
    //lengthMultiplier = defaultFor(lengthMultiplier, 1);
    var frameDelta;
    var newKeyTime;
    var frameEndDist = lengthTravelled + travelDistanceThisFrame;
    var lastSwingingKeyTime = 0;
    var frameStartDist = lengthTravelled;

    // deal with the body  reaching the end of the step during this frame
    while (frameEndDist > 0) {
        for (var k = 0; k < legKeyList.keyframes.length; k++) {
            //don't put the first key in, because that will be the last hold keyframe
            if (k != legKeyList.firstKey) {
                var newKeyAttributes = legKeyList.keyframes[k].keyAttributes;
                var thisKeyDist = legKeyList.keyframes[k].travelDistance;

                //check to see if the key happens during this frame
                if (thisKeyDist >= frameStartDist && thisKeyDist < frameEndDist) {
                    frameDelta = thisKeyDist - frameStartDist;
                    if (travelDistanceThisFrame === 0) {
                        frameFraction = 1;
                    } else {
                        frameFraction = frameDelta / travelDistanceThisFrame;
                    }
                    var newProp = freeLeg.property(legKeyList.keyframes[k].prop);
                    //create a copy of each key at the offset time ktime + t
                    newKeyTime = frames2Time(currentFrame + frameFraction);
                    lastSwingingKeyTime = (newKeyTime > lastSwingingKeyTime)?
                      newKeyTime :
                      lastSwingingKeyTime;
                    makeKeyWithAttributes(newProp, newKeyAttributes, newKeyTime);
                }
            }
        }
        // if the frame finishes during the start of the next step repeat with a whole step offset
        frameEndDist -= totalStepLength;
        frameStartDist -= totalStepLength;
    }

    return lastSwingingKeyTime;
}

function makeStaticKeyframeForLayer(theLayer, startTime, frameTime, posNull) {
    //if (theLayer.parent){

    if (posNull === undefined) {
        var theLayers = theLayer.containingComp.layers;
        posNull = theLayers.addNull();
        posNull.name = "MSKL-temp-delete";
    }

    var startPos = theLayer.transform.position.valueAtTime(startTime, false);
    var worldPos = toWorldPos(theLayer.parent, startPos, startTime, posNull);
    var worldRotation = toWorldRotation(theLayer.parent, startTime);
    var worldScale = toWorldScale(theLayer.parent, startTime);

    // posNull.transform.position.setValue(worldPos);
    // posNull.transform.rotation.setValue(worldRotation);
    // posNull.transform.scale.setValue(worldScale);

    theLayer.transform.position.setValueAtTime(frameTime, fromWorldPos(theLayer.parent, worldPos, frameTime));
    theLayer.transform.rotation.setValueAtTime(frameTime, fromWorldRotation(theLayer.parent, worldRotation, startTime));
    theLayer.transform.scale.setValueAtTime(frameTime, fromWorldScale(theLayer.parent, worldScale, startTime));

    if (posNull.name == "MSKL-temp-delete") {
        posNull.remove();
    }
    //}
}

function getKeyFrames(legs, startCalculationT, endCalculationT, body) {
    //returns an object with properties and keyframes);
    var keyList = [];
    for (var kLeg = 0; kLeg < legs.length; kLeg++) {
        startCalculationT = defaultFor(startCalculationT, legs[kLeg].inPoint);
        endCalculationT = defaultFor(endCalculationT, legs[kLeg].outPoint);
        var lengthTravelled = 0;
        keyList[kLeg] = {};
        keyList[kLeg].keyframes = [];
        var propList = [legs[kLeg].transform.position];
        for (var p = 0; p < propList.length; p++) {
            var theProp = propList[p];
            for (var k = 1; k <= theProp.numKeys; k++) { //keys are indexed from 1. WTF Adobe?
                var thepropKeytime = theProp.keyTime(k);
                if (theProp.keyTime(k) >= startCalculationT && theProp.keyTime(k) <= endCalculationT) {
                    var theKeyAttributes = copyKeyAttributes(theProp, k);
                    //find the distance the body has travelled at the point this key occurs.
                    keyList[kLeg].keyframes.push({"prop": theProp.name, "keyAttributes": theKeyAttributes});
                }
            }
        }
        //weird how javascript lets you hot-glue properties on to an array like this
        var lastKey = 0;
        var firstKey = keyList[kLeg].keyframes.length - 1;

        //find the first and last keys in the list
        for (var i = 0; i < keyList[kLeg].keyframes.length; i++) {
            lastKey = (keyList[kLeg].keyframes[i].keyAttributes.keyTime > keyList[kLeg].keyframes[lastKey].keyAttributes.keyTime)?
              i :
              lastKey;
            firstKey = (keyList[kLeg].keyframes[i].keyAttributes.keyTime < keyList[kLeg].keyframes[firstKey].keyAttributes.keyTime)?
              i :
              firstKey;
        }
        keyList[kLeg].lastKey = lastKey;
        keyList[kLeg].firstKey = firstKey;
        keyList[kLeg].firstKeyTime = keyList[kLeg].keyframes[firstKey].keyAttributes.keyTime;
        keyList[kLeg].lastKeyTime = keyList[kLeg].keyframes[lastKey].keyAttributes.keyTime;

        for (i = 0; i < keyList[kLeg].keyframes.length; i++) {
            //calculate how far the parent has moved when this key is set
            keyList[kLeg].keyframes[i].travelDistance = calculateLengthOfTravel(body, time2Frames(startCalculationT), time2Frames(keyList[kLeg].keyframes[i].keyAttributes.keyTime));
        }
        keyList[kLeg].lastKeyTravel = keyList[kLeg].keyframes[lastKey].travelDistance;
        keyList[kLeg].firstKeyTravel = keyList[kLeg].keyframes[firstKey].travelDistance;
        //keyList looks like
        // [ leg { keyframes [{}, {}], firstKeyTime, lastKeyTime}, leg {keyframes[{}, {}], firstKeyTime, lastKeyTime} etc]
    }
    return keyList;
}
//
// function  scaleKeyFrames(stepVector, keyList){
//     for (var leg = 0; leg < keyList.length; leg++){
//         var channels = [];
//         var theProp;
//         var propNum;
//         var firstKeyPos;
//         var lastKeyPos;
//         var legVector = [];
//         for (var kf = 0; kf < keyList[leg].keyframes.length; kf++){
//             if (keyList[leg].keyframes[kf].keyAttributes.isSpatial === true){
//                 theProp = keyList[leg].keyframes[kf].prop;
//                 if (theProp in channels){
//                     if (keyList[leg].keyframes[kf].keyAttributes.keyTime < keyList[leg].keyframes[channels.theProp.firstPosKey].keyAttributes.keyTime ){ channels.theProp.firstPosKey = kf}
//                     if (keyList[leg].keyframes[kf].keyAttributes.keyTime  > keyList[leg].keyframes[channels.theProp.lastPosKey].keyAttributes.keyTime ){ channels.theProp.lastPosKey = kf}
//                 } else {
//                     channels.push(theProp);
//                     channels[channels.length-1] =  {"prop": theProp, "firstPosKey": kf, "lastPosKey": kf}
//                 }
//             }
//         }
//         for (var ch = 0; ch < channels.length; ch++){
//             firstKeyPos =  keyList[leg].keyframes[channels[ch].firstPosKey].keyAttributes.keyVal;
//             lastKeyPos =  keyList[leg].keyframes[channels[ch].lastPosKey].keyAttributes.keyVal;
//             legVector[ch] = lastKeyPos - firstKeyPos;
//
//             for (d=0; d < stepVector.length; d++){ //repeat for each dimension
//                 legVector[ch][d] = defaultFor(legVector[d], 0); //make sure there are enough dimensions
//                 if (legVector[ch][d] === 0) { //avoid DBZ errors. We can't scale a zero sized value so we have to add to it
//                     scaleVector[ch].additive = true;
//                 } else {
//                     scaleVector[ch][d].additive = false;
//                     scaleVector[ch][d].val = stepVector[d] / legVector;
//                 }
//             }
//         }
//
//         for (kf = 0; kf < keyList[leg].keyframes.length; kf++){
//             foo=1;
//         }
//     }
// }

function calculateLengthOfTravel(bodyLayer, startFrame, endFrame) {
    var pos1 = bodyLayer.property("Transform").property("Position").valueAtTime(frames2Time(startFrame), false);
    var lengthOfTravel = 0;
    for (var t = startFrame; t <= endFrame; t++) {
        var pos2 = bodyLayer.property("Transform").property("Position").valueAtTime(frames2Time(t), false);
        lengthOfTravel += vectorLength(pos1, pos2);
        pos1 = pos2;
    }
    return lengthOfTravel;
}

// function calculateTravelvector(bodyLayer, startFrame, endFrame) {
//     var pos1 = bodyLayer.property("Transform").property("Position").valueAtTime(frames2Time(startFrame), false);
//     var pos2 = bodyLayer.property("Transform").property("Position").valueAtTime(frames2Time(endFrame), false);
//
//     return pos2 - pos1;
// }
