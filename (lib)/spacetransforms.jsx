// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
//@includepath "lib"
//@include defaultFor.jsx
//@include vectormaths.jsx

function toWorldPos(fromLayer, fromPoint, t, thePosNull) {//eslint-disable-line no-unused-vars
  //return the world space co-ordinates of a given point in layer space
  //an extendscript implementation of the expressions function
  var toWorld;
  if (fromLayer instanceof Layer) {
    theTime = defaultFor(t, app.project.activeItem.time);
    if (thePosNull) {
      posNull = thePosNull;
    } else {
      posNull = app.project.activeItem.layers.addNull();
      posNull.name = 'TWP-temp-delete';
    }
    //oldExpression = posNull.transform.position.expression;
    posNull.transform.position.expression = "thisComp.layer('" + fromLayer.name + "').toWorld([" + fromPoint[0] + ', ' + fromPoint[1] + ', ' + fromPoint[2] + '], t = ' + theTime + ')';
    toWorld = posNull.transform.position.valueAtTime(theTime, false);
    // remove the expression
    //posNull.transform.position.expression = oldExpression;
    // remove the null if we created it
    if (thePosNull === null) {
      posNull.remove();
    }
    return toWorld;
  }
  return false;
}

function toWorldRotation(theLayer, t) {//eslint-disable-line no-unused-vars
  //return the world rotation of a layer relative to layer space
  //an extendscript implementation of the expressions function
  var theRotation;
  theTime = defaultFor(t, app.project.activeItem.time);
  if (theLayer.threeDLayer) {
    theRotation = [
      theLayer.transform.xRotation.valueAtTime(theTime, false),
      theLayer.transform.yRotation.valueAtTime(theTime, false),
      theLayer.transform.zRotation.valueAtTime(theTime, false)
    ];
  } else {
    theRotation = theLayer.transform.rotation.valueAtTime(theTime, false);
    //walk up the parent stack and add up rotations
  }
  if (theLayer.parent === null) {
    return theRotation;
  }
  //rotation is additive
  return theRotation + toWorldRotation(theLayer.parent, theTime);
}

function toWorldOrientation(theLayer, t) { //eslint-disable-line no-unused-vars
  //return the world rotation of a layer relative to layer space
  //an extendscript implementation of the expressions function
  var theOrientation;
  var theTime = defaultFor(t, app.project.activeItem.time);
  if (theLayer.threeDLayer) {
    theOrientation = theLayer.transform.Orientation.valueAtTime(theTime, false);
  } else {
    theOrientation = theLayer.transform.Orientation.valueAtTime(theTime, false);
    //walk up the parent stack and add up Orientations
  }
  if (theLayer.parent === null) {
    return theOrientation;
  }
  //Orientation is additive
  return theOrientation + toWorldOrientation(theLayer.parent, theTime);
}

function toWorldScale(theLayer, t) { //eslint-disable-line no-unused-vars
  //return the world scale of a layer relative to layer space
  //an extendscript implementation of the expressions function
  var theTime = defaultFor(t, app.project.activeItem.time);
  var thescale = theLayer.transform.scale.valueAtTime(theTime, false);
  var i;
  //walk up the parent stack and add up scales
  if (theLayer.parent === null) {
    return thescale;
  }
  //rotation is multiplicative <--is that a word?
  var toWS = toWorldScale(theLayer.parent, theTime);
  for (i = 0; i < 3; i++) {
    thescale[i] *= toWS[i] / 100;
  }
  return thescale;
}

function fromWorldPos(theLayer, worldPoint, t, tempEffect) { //eslint-disable-line no-unused-vars
  var theTime = defaultFor(t, app.project.activeItem.time);
  worldPoint[2] = defaultFor(worldPoint[2], 0);
  var fromWorldPosition;
  if (tempEffect) {
    posEffect = tempEffect;
    tempEffect.property('3D Point').expression = 'thisLayer.fromWorld([' + worldPoint[0] + ',' + worldPoint[1] + ',' + worldPoint[2] + ']);';
  } else {
    posEffect = theLayer.Effects.addProperty('3D Point Control');
    posEffect.name = 'temp-delete';
    posEffect.property('3D Point').expression = 'thisLayer.fromWorld([' + worldPoint[0] + ',' + worldPoint[1] + ',' + worldPoint[2] + ']);';
  }
  fromWorldPosition = posEffect.property('3D Point').valueAtTime(theTime, false);
  if (tempEffect === null) {
    posEffect.remove();
  }
  return fromWorldPosition;
}

function fromWorldRotation(theLayer, worldRotation, t) { //eslint-disable-line no-unused-vars
  //returns the layer space value of a world rotation
  //trivial, but included for completeness
  return worldRotation - toWorldRotation(theLayer, t);
}

function fromWorldScale(theLayer, worldScale, t) { //eslint-disable-line no-unused-vars
  var theTime = defaultFor(t, app.project.activeItem.time);
  return 100 * [
    worldScale[0] / toWorldScale(theLayer,  theTime)[0],
    worldScale[1] / toWorldScale(theLayer,  theTime)[1]
  ];
}

function makeTempNull(theComp) { //eslint-disable-line no-unused-vars
  //utility function to create a temp null
  var posNull = theComp.layers.addNull();
  posNull.name = 'TWP-temp-null-delete';
  return posNull;
}

function removeTempNull(posNull) { //eslint-disable-line no-unused-vars
  //utitlity function to remove it
  if (posNull.name === 'TWP-temp-null-delete') {
    posNull.remove();
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
