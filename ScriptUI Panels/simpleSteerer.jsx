// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

//@include '../(lib)/defaultFor.jsx';
//@include '../(lib)/timeconversions.jsx';
//@include '../(lib)/spacetransforms.jsx';
//@include '../(lib)/vectormaths.jsx';
//@include '../(lib)/getproperties.jsx';
//@include '../(lib)/copyproperties-makekey.jsx';

this.version = 0.9;
scriptName = 'steerer';

buildGUI(this);
//autoOrientSelectedLayers(0.32,90,false);

function autoOrientSelectedLayers(lookAhead, lookBehind, headingOffset, additive) {
  var proj = app.project;
  app.beginUndoGroup(scriptName);
  if (proj instanceof Project) {
    if (app.project.activeItem) {
      var movingBodies = app.project.activeItem.selectedLayers;
      if (movingBodies.length > 0) {
        autoOrient(movingBodies, lookAhead, headingOffset, additive);
      } else {
        alert('select at least one moving layer');
      }
    } else {
      alert('Please select a comp to use this script', scriptName);
    }
  } else {
    alert('Please open a project first to use this script, you silly rabbit', scriptName);
  }
  app.endUndoGroup();
}

function dealWithCurrentKeyframes(theBody, additive) {
  var rot8n = theBody.property('rotation');
  var startFrame = getStartFrame(theBody);
  var endFrame = getEndFrame(theBody);

  if (additive) {
    //make keyframes for every frame using the existing keyed value
    for (var i = startFrame; i <= endFrame; i++) {
      rot8n.setValueAtTime(frames2Time(i), rot8n.valueAtTime(frames2Time(i), true));
    }
  } else {
    //remove all the rotation keys and reset
    var initialValue = rot8n.valueAtTime(frames2Time(startFrame), true);
    while (rot8n.numKeys > 0) {
      rot8n.removeKey(1);
    }
    rot8n.setValue(initialValue);
  }
  // body...
}

function getStartFrame(theBody) {
  var posn = theBody.property('position');
  if (posn.expressionEnabled || posn.numKeys === 0) {
    return time2Frames(theBody.inPoint);
  }
  var firstPosKeyTime = posn.keyTime(1);
  return (theBody.inPoint > firstPosKeyTime) ? time2Frames(theBody.inPoint) : time2Frames(firstPosKeyTime);
}
function getEndFrame(theBody) {
  var posn = theBody.property('position');
  if (posn.expressionEnabled || posn.numKeys === 0) {
    return time2Frames(theBody.outPoint);
  }
  var lastPosKeyTime = posn.keyTime(posn.numKeys);
  return (theBody.outPoint < lastPosKeyTime) ? time2Frames(theBody.outPoint) : time2Frames(lastPosKeyTime);
}

function autoOrient(movingBodies, lookAhead, lookBehind, headingOffset, additive) {
  // var prevNull = app.project.activeItem.layers.addNull();
  // prevNull.name= "prev";
  // var nextNull = app.project.activeItem.layers.addNull();
  // nextNull.name= "next";
  var prevPos;
  var nextPos;
  var heading;
  var currentRot8n;
  var frameTime;
  var startFrame;
  var endFrame;
  var posn;
  var rot8n;
  var lastRot8Val;
  var dif = [];
  var i;
  for ( i = 0; i < movingBodies.length; i++) {
    var theBody = movingBodies[i];

    dealWithCurrentKeyframes(theBody, additive);

    //look for dynamic steering control on the layer
    // var dynamicSamples = theBody.property("Effects") !== null &&  theBody.property("Effects").property("steerer_smoothness")!== null && theBody.property("Effects").property("steerer_smoothness").property("Slider") !== null;
    // var dynamicSteering = theBody.property("Effects")!== null && theBody.property("Effects").property("steerer_oversteer")!== null &&  theBody.property("Effects").property("steerer_oversteer").property("Slider") !== null;

    startFrame = getStartFrame(theBody);
    endFrame = getEndFrame(theBody);
    keepGoing = true;
    posn = theBody.property('Position');
    rot8n = theBody.property('Rotation');
    lastRot8Val = rot8n.valueAtTime(frames2Time(startFrame), false);
    //todo - trim work area to first and last keys
    for (var theFrame = startFrame; theFrame <= endFrame; theFrame++) {
      //make initial samples at current time-1 and current time
      frameTime = frames2Time(theFrame);

      // var backwardSampleFrame = theFrame;
      // var forwardSampleFrame = theFrame;

      prevPos = posn.valueAtTime(frameTime - lookBehind, false);

      nextPos = posn.valueAtTime(frameTime + lookAhead, false);

      // prevNull.property("Position").setValueAtTime(frames2Time(theFrame), prevPos);
      // nextNull.property("Position").setValueAtTime(frames2Time(theFrame), nextPos);
      dif = [
        nextPos[0] - prevPos[0],
        nextPos[1] - prevPos[1]
      ];

      heading = radiansToDegrees(Math.atan2(dif[1], dif[0]));
      if (additive) {
        currentRot8n = rot8n.valueAtTime(fframeTime, false);
        heading = currentRot8n + heading + headingOffset;
      } else {
        heading = heading + headingOffset;
      }
      //deal with the problem that atan2 will return values with a 360 degree difference between adjacent frames where the rotation is close to 180deg
      var headingDiff = lastRot8Val - heading;
      while (Math.abs(headingDiff) > Math.abs(headingDiff + 360)) {
        heading -= 360;
        headingDiff = lastRot8Val - heading;
      }
      while (Math.abs(headingDiff) > Math.abs(headingDiff - 360)) {
        heading += 360;
        headingDiff = lastRot8Val - heading;
      }
      rot8n.setValueAtTime(frameTime, heading);
      lastRot8Val = heading;
    }
  }
}

function add90Deg(theLayers) {
  if (theLayers.length !== 0) {
    for (var i = 0; i < theLayers.length; i++) {
      var thisLayer = theLayers[i];
      var rot8n = thisLayer.property('Rotation');
      for (var k = 1; k <= rot8n.numKeys; k++) {
        rot8n.setValueAtKey(k, rot8n.keyValue(k) + 90);
      }
    }
  } else {
    alert('select at least one layer');
  }
}

function buildGUI(thisObj) {
  var theWindow = (thisObj instanceof Panel) ? thisObj
    : new Window('palette', thisObj.scriptTitle, undefined, {resizeable: true});
  theWindow.preferredSize = 'width: -1, height: -1';
  theWindow.alignChildren = ['left', 'top'];
  theWindow.margins = [10, 10, 10, 10];

  var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']}");

  mainGroup.add('staticText', undefined, 'look ahead (frames)');
  var lookAheadGrp = mainGroup.add("group{orientation:'row'}");
  var lookAheadSlider = lookAheadGrp.add('slider', undefined, 1, 0, 15);
  lookAheadSlider.size = 'width: 150, height: 10';
  var lookAheadEdit = lookAheadGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
  lookAheadEdit.text = '' + Math.round(lookAheadSlider.value);

  mainGroup.add('staticText', undefined, 'look behind (frames)');
  var lookBehindGrp = mainGroup.add("group{orientation:'row'}");
  var lookBehindSlider = lookBehindGrp.add('slider', undefined, 1, 0, 15);
  lookBehindSlider.size = 'width: 150, height: 10';
  var lookBehindEdit = lookBehindGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
  lookBehindEdit.text = '' + Math.round(lookBehindSlider.value);

  mainGroup.add('staticText', undefined, 'heading offset');
  var headingOffsetGrp = mainGroup.add("group{orientation:'row'}");
  var headingOffsetSlider = headingOffsetGrp.add('slider', undefined, 0, -180, 180);
  headingOffsetSlider.size = 'width: 150, height: 10';
  var headingOffsetEdit = headingOffsetGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
  headingOffsetEdit.text = '' + Math.round(headingOffsetSlider.value);

  lookAheadSlider.onChanging = function () {
    lookAheadEdit.text = '' + Math.round(lookAheadSlider.value);
  };

  lookAheadEdit.onChange = function () {
    if (lookAheadSlider.maxValue < parseInt(lookAheadEdit.text, 10)) {
      lookAheadSlider.maxValue = parseInt(lookAheadEdit.text, 10);
    }
    lookAheadSlider.value = parseInt(lookAheadEdit.text, 10);
  };

  lookBehindSlider.onChanging = function () {
    lookBehindEdit.text = '' + Math.round(lookBehindSlider.value);
  };

  lookBehindEdit.onChange = function () {
    if (lookBehindSlider.maxValue < parseInt(lookBehindEdit.text, 10)) {
      lookBehindSlider.maxValue = parseInt(lookBehindEdit.text, 10);
    }
    lookBehindSlider.value = parseInt(lookBehindEdit.text, 10);
  };

  headingOffsetSlider.onChanging = function () {
    headingOffsetEdit.text = '' + Math.round(headingOffsetSlider.value);
  };

  headingOffsetEdit.onChange = function () {
    headingOffsetSlider.value = parseInt(headingOffsetEdit.text, 10);
  };

  var buttonsGrp = mainGroup.add("group{orientation:'row'}");
  var doItButton = buttonsGrp.add("button{text:'Process'}");
  var add90Button = buttonsGrp.add("button{text:'Add 90°'}");

  var additiveGrp = mainGroup.add("group{orientation:'row'}");
  var additiveChkbx = additiveGrp.add("checkbox{text:'Add to current value', value: 0}");

  doItButton.onClick = function () {
    autoOrientSelectedLayers(frames2Time(lookAheadSlider.value), frames2Time(lookAheadSlider.value), headingOffsetSlider.value, additiveChkbx.value);
  };
  add90Button.onClick = function () {
    add90Deg(app.project.activeItem.selectedLayers);
  };

  if (theWindow instanceof Window) {
    theWindow.center();
    theWindow.show();
  } else {
    theWindow.layout.layout(true);
  }
}

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
