//@target aftereffects
/* includepath  "lib" */
/* include defaultFor.jsx */
/* include vectormaths.jsx */
/* global app, defaultFor */

// eslint-disable-next-line no-unused-vars
function toWorldPos(fromLayer, fromPoint, t, posNull) {
    //return the world space co-ordinates of a given point in layer space
    //an extendscript implementation of the expressions function
    if (fromLayer) {
        t = defaultFor(t, app.project.activeItem.time);
        if (posNull === undefined) {
            posNull = app.project.activeItem.layers.addNull();
            posNull.name = "TWP-temp-delete";
        }
        var oldExpression = posNull.transform.position.expression;
        posNull.transform.position.expression = "thisComp.layer('" + fromLayer.name + "').toWorld([" + fromPoint[0] + ", " + fromPoint[1] + ", " + fromPoint[2] + "], t = " + t + ")";
        var toWorld = posNull.transform.position.valueAtTime(t, false);
        // remove the expression
        posNull.transform.position.expression = oldExpression;
        // remove the null if we created it
        if (posNull.name === "TWP-temp-delete"){ posNull.remove();}
        return toWorld;
    } else {
        return false;
    }
}

function toWorldRotation(theLayer, t) {
    //return the world rotation of a layer relative to layer space
    //an extendscript implementation of the expressions function
    t = defaultFor(t, app.project.activeItem.time);
    var theRotation = theLayer.transform.rotation.valueAtTime(t, false);
    //walk up the parent stack and add up rotations
    if (theLayer.parent === null) {
        return theRotation;
    } else {
        //rotation is additive
        return theRotation + toWorldRotation(theLayer.parent, t);
    }
}

function toWorldScale(theLayer, t) {
    //return the world scale of a layer relative to layer space
    //an extendscript implementation of the expressions function
    t = defaultFor(t, app.project.activeItem.time);
    var thescale = theLayer.transform.scale.valueAtTime(t, false);
    //walk up the parent stack and add up scales
    if (theLayer.parent === null) {
        return thescale;
    } else {
        //rotation is multiplicative <--is that a word?
        var toWS =toWorldScale(theLayer.parent, t);
        for (var i=0; i<3; i++){thescale[i] *= toWS[i]/100;}
        return thescale;
    }
}

// eslint-disable-next-line no-unused-vars
function fromWorldPos(theLayer, worldPoint, t) {
    t = defaultFor(t, app.project.activeItem.time);
    worldPoint[2] = defaultFor(worldPoint[2], 0);
    var posEffect = theLayer.Effects.addProperty("3D Point Control");
    posEffect.name = "temp-delete";
    posEffect.property("3D Point").expression = "thisLayer.fromWorld([" + worldPoint[0] + "," + worldPoint[1] + "," + worldPoint[2] + "]);";
    var fromWorldPosition = posEffect.property("3D Point").valueAtTime(t, false);
    posEffect.remove();
    return fromWorldPosition;
}

// eslint-disable-next-line no-unused-vars
function fromWorldRotation(theLayer, worldRotation, t){
    //returns the layer space value of a world rotation
    //trivial, but included for completeness
    return worldRotation - toWorldRotation(theLayer, t);
}

// eslint-disable-next-line no-unused-vars
function fromWorldScale(theLayer, worldScale, t) {
    t = defaultFor(t, app.project.activeItem.time);
    return 100* [worldScale[0]/toWorldScale(theLayer, t)[0], worldScale[1]/toWorldScale(theLayer, t)[1]];
}

// eslint-disable-next-line no-unused-vars
function makeTempNull(theComp){
  //utility function to create a temp null
  var posNull = theComp.layers.addNull();
  posNull.name = "TWP-temp-null-delete";
  return posNull;
}

// eslint-disable-next-line no-unused-vars
function removeTempNull(posNull){
  //utitlity function to remove it
  if (posNull.name === "TWP-temp-null-delete"){ posNull.remove();}
}
