// @target aftereffects

//@includepath '../stib/(lib)'
//@include 'vectormaths.jsx'
//useful js vector and matrix library
//@include 'sylvester.src.jsx'

var scriptName = 'walker 3';


function normalise(vec, a, mag) {
  return vec.rotateZ(a.angleFromXaroundZ).rotateY(a.angleFromXaroundY).scale([mag, 1, 1]);
}

function defineSteps(theLegs) {
  var theKFs = [];
  var leg;
  var maxOffset = [];
  var stepOrigin = [];
  var kDiffVec = [];
  var inHandleVec = [];
  var outHandleVec = [];
  var temporalEaseIn = [];
  var temporalEaseOut = [];
  var stepData = {legKFs: []};
  var totalMaxOffset = Vector.create([0, 0, 0]);
  var averageMaxOffset;
  var normAngle;
  var normMag;
  // var theKeyTime;

  for (leg = 0; leg < theLegs.length; leg++) {
    theKFs[leg] = theLegs[leg].position.selectedKeys;
    kDiffVec[leg] = [];
    inHandleVec[leg] = [];
    outHandleVec[leg] = [];
    temporalEaseIn[leg] = [];
    temporalEaseOut[leg] = [];

    if (theLegs[leg].position.numKeys < 2) {
      throw new Error('more than one keyframe must be selected to define a step');
    }
    stepOrigin[leg] = Vector.create(theLegs[leg].position.keyValue(theKFs[leg][0]));
    // alert(stepOrigin[leg].inspect())
    maxOffset[leg] = Vector.create([0, 0, 0]);
    for (k = 0; k < theKFs[leg].length; k++) { //go through the keyframes on each leg to find the furthest one
      keyIndex = theKFs[leg][k]; //the index of the keyframe
        // alert(theLegs[leg].position.keyInSpatialTangent(keyIndex));
      kDiffVec[leg][k] = Vector.create(theLegs[leg].position.keyValue(keyIndex)).subtract(stepOrigin[leg]);
      inHandleVec[leg][k] = Vector.create(theLegs[leg].position.keyInSpatialTangent(keyIndex));
      outHandleVec[leg][k] = Vector.create(theLegs[leg].position.keyOutSpatialTangent(keyIndex));
      temporalEaseIn[leg][k] = theLegs[leg].position.keyInTemporalEase(keyIndex);
      temporalEaseOut[leg][k] = theLegs[leg].position.keyOutTemporalEase(keyIndex);
      maxOffset[leg] = ( kDiffVec[leg][k].magnitude() > maxOffset[leg].magnitude()) ? kDiffVec[leg][k] : maxOffset[leg];
    }
    totalMaxOffset = totalMaxOffset.add(maxOffset[leg]);
  }
  averageMaxOffset = totalMaxOffset.divide(theLegs.length);

    // normalise the keyframes for each leg so that they all match up
    // and compute their position orthoganal to the step vector
    // then store it.
    // normalise the step and all the keyframes to the positive X axis, and make all the steps the same length
    // this makes it much easier and my brain a lot less sore than using the vector as-is.
  stepData.stepMag = averageMaxOffset.magnitude();
  for (leg = 0; leg < theLegs.length; leg++) {
      //work out how much we have to rotate and scale the step to normalise it
    normAngle = maxOffset[leg].componentAngle();
    normMag = stepData.stepMag / maxOffset[leg].magnitude();
    stepData.legKFs[leg] = [];

    for (k = 0; k < theKFs[leg].length; k++) {
      theKeyTime = theLegs[leg].position.keyTime(theKFs[leg][k]); //Don't think we need this
        // now rotate and scale the keyframes and their handles.
        // After effects has no keyframe object so...

      stepData.legKFs[leg][k] = {
        //time: theKeyTime,
        vec: normalise(kDiffVec[leg][k], normAngle, normMag),
          // calculate the handles relative in <p,r> space too
        inHandleVec: normalise(inHandleVec[leg][k], normAngle, normMag),
        outHandleVec: normalise(outHandleVec[leg][k], normAngle, normMag),
          // chuck in the temporalEaseIn/Out, for completeness
        kfTemporalEaseIn: temporalEaseIn[leg][k],
        kfTemporalEaseOut: temporalEaseOut[leg][k]
      };
        //set the initial leg keyframes **remove this, because the KFs have to be rotated to match the body rotation

      // theLegs[leg].position.setValueAtTime(
      //     theKeyTime,
      //     stepOrigin[leg].add(stepData.legKFs[leg][k].vec).toArray() //rmember that all our kfs are relative to the start of the step
      //   );
      // theLegs[leg].position.setSpatialTangentsAtKey(
      //     theKFs[leg][k],
      //     stepData.legKFs[leg][k].inHandleVec.toArray(),
      //     stepData.legKFs[leg][k].outHandleVec.toArray()
      //   );
    }
  }
  // } catch (e) {
  //   alert(e.name + '->' + e.message);
  // }

  // now define how far along the step each keyframe occurs
  stepdata.legLayers = theLegs;
  return stepData;
}

function calculateLegPosition(nextBodyPos, currBodyPos, legOffset) {
  var stepMovement = nectBodyPos.subtract(currBodyPos);
  var stepDirection = componentAngle(stepMovement);
  return currBodyPos.add(legOffset.rotateZ(stepMovement.angleFromXaroundZ).rotateY(stepMovement.angleFromXaroundY));
}

function walkinate(theBody, theStepData, stepOverlap) {
  var stepData = theStepData;
  var theComp = app.project.activeItem;
  var frameLen = theComp.frameDuration;
  var startTime = Math.max(theBody.inPoint, 0);
  var endTime = Math.min(theBody.outPoint, theBody.position.keyTime(theBody.position.numKeys), theComp.duration);
  var t;
  var leg;
  var travelVec; // vector the offset for the body with each frame
  var lengthTraveled = 0; // scalar - the max length traveled by any leg
  var currLegPosn = []; // vector for each leg, the point orthagonal to the step vector
  var legOffset = []; // scalar for each leg - the distance orthagonal to the body
  var numLegs = stepData.legLayers.length;
  var totalStepLength = stepData.stepMag * (1 - stepOverlap / 100) / thelegs.length; // scalar - the length of a total step Cycle
  // calculate the first position for each leg
  for (leg = 0; leg < numLegs; leg++) {
    legOffset[leg] = stepData.legKFs[leg][0].elements[0]; // how far from the body the leg sticks out. Based on the first keyframe
    travelVec = calculateTravelVec(theBody, t, frameLen); //find out where the body goes this frame
    currLegPosn[leg] = calculateLegPosition(travelVec, legOffset); //
    for (k = 0; k < stepData.legKFs[leg].length; k++) {
      //this is the point at which the leg starts moving forward - i.e. where KF 0 goes
      stepData.legKFs[leg][k].startOffset = stepData.legKFs[leg][k].vec.magnitude() + leg * totalStepLength / numLegs;
    }
  }
  //calc the length travelled this frame
  for (t = startTime; t <= endTime; t += frameLen) {
    lengthTraveledThisFrame = 0;
    currBodyPos.set(theBody.position.valueAtTime(t, false));
    nextBodyPos.set(theBody.position.valueAtTime(t + frameLen, false));
    for (leg = 0; leg < stepData.thelegs.length; leg++) {
      nextLegPosn = calculateLegPosition(nextBodyPos, currBodyPos, legOffset);
      lengthTraveledThisFrame = Math.max(nextLegPosn.subtract(currLegPosn).magnitude, lengthTraveledThisFrame);
    }
    for (leg = 0; leg < stepData.thelegs.length; leg++) {
      for (k = 0; k < stepData.legKFs[leg].length; k++) {
        stepPhase = lengthTraveled % totalStepLength;
        //is it time to make a kf?
        if ( stepPhase < stepData.legKFs[leg][k].startOffset &
          stepData.legKFs[leg][k].startOffset < stepPhase + lengthTraveledThisFrame  ) {
          // make a keyframe based on the travel this frame of the leg
          makeKF(stepData, currLegPosn, nextLegPosn, leg);
        }
      }
    }
    lengthTraveled += lengthTraveledThisFrame;
  }
}

function buildUI(thisObj) {
  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window('palette', scriptName, undefined, {resizeable: true});
  }
  var stepData;
  var theBody;
  var defineStepBttn = pal.add('button', undefined, 'define step');
  var defineBodyBttn = pal.add('button', undefined, 'define Body');
  var stepOverlapBttn = pal.add('slider', undefined, 10, 0, 100);
  var walkBttn =  pal.add('button', undefined, 'walk');

  //define and normalise the steps
  defineStepBttn.onClick = function () {
    app.beginUndoGroup('define step and normalise');
    // try {
    var theComp = app.project.activeItem;
    if (!theComp) {
      throw new Error('choose a comp');
    }

    var theLegs = theComp.selectedLayers;
    if (!theLegs) {
      throw new Error('choose the keyframes that define a step');
    }
    stepData = defineSteps(theLegs);
    app.endUndoGroup();
  };

  defineBodyBttn.onClick = function () {
    var theComp = app.project.activeItem;
    if (!theComp) {
      throw new Error('choose a layer in a comp to be the body');
    }

    theBody = theComp.selectedLayers;
    if (!theBody || theBody.length > 1) {
      theBody = null;
      throw new Error('choose a single layer to be the body');
    }
  };

  walkBttn.onClick = function () {
    walkinate(theComp, theBody, stepData, stepOverlapBttn.value);
  };

  //actually build the GUI
  if (pal instanceof Window) {
    pal.center();
    pal.show();
  } else {
    pal.layout.layout(true);
  }
}

buildUI(this);
