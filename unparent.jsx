// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* jshint ignore:start */
// Code here will be ignored by JSHint.
/* includepath "./(lib)" */
/* include "vectormaths.jsx" */
/* jshint ignore:end */
/* global app, makeTempNull, removeTempNull, toWorldPos, toWorldRotation, toWorldScale*/

(function () {
    var recurseParents = false; //true;
    var bakeAllMotion = false;
    app.beginUndoGroup("unparent");
    var theComp = app.project.activeItem;
    var theLayers = theComp.selectedLayers;
    var posNull = makeTempNull(app.project.activeItem);
    var currTime = app.project.activeItem.time;

    for (var i = 0; i < theLayers.length; i++) {
        var currLayer = theLayers[i];
        var pos = currLayer.transform.position;
        //if the unparenting isn't happening on a keyframe we need to make a new keyframe
        var posKeys = [];
        var rot = currLayer.transform.rotation;
        var rotKeys = [];
        var scale = currLayer.transform.scale;
        var scaleKeys = [];

        var theParent = currLayer.parent;
        //find theParent
        if (theParent) {
            var currPos = toWorldPos(
                currLayer,
                currLayer.transform.anchorPoint.valueAtTime(currTime, true),
                currTime,
                posNull
            );
            var currRot = toWorldRotation(currLayer, currTime);
            var currScale = toWorldScale(currLayer, currTime);
            //there may be a grandparent
            var theGrandParent = theParent.parent;
            //get the world transforms of the layer at each keyframe
            var nearestFrameToIn =
                Math.floor(currLayer.inPoint / theComp.frameDuration) *
                theComp.frameDuration;
            var t, k, worldPos, worldRot, worldScale;

            if (bakeAllMotion) {
                for (
                    t = nearestFrameToIn;
                    t <= currLayer.outPoint;
                    t += theComp.frameDuration
                ) {
                    worldPos = toWorldPos(
                        currLayer,
                        currLayer.transform.anchorPoint.valueAtTime(t, true),
                        t,
                        posNull
                    );
                    posKeys.push(worldPos);
                    worldRot = toWorldRotation(currLayer, t);
                    rotKeys.push(worldRot);
                    worldScale = toWorldScale(currLayer, t);
                    scaleKeys.push(worldScale);
                }
            } else {
                for (k = 1; k <= pos.numKeys; k++) {
                    t = pos.keyTime(k);
                    worldPos = toWorldPos(
                        currLayer,
                        currLayer.transform.anchorPoint.valueAtTime(t, true),
                        t,
                        posNull
                    );
                    posKeys.push(worldPos);
                }
                for (k = 1; k <= rot.numKeys; k++) {
                    t = rot.keyTime(k);
                    worldRot = toWorldRotation(currLayer, t);
                    rotKeys.push(worldRot);
                }
                for (k = 1; k <= scale.numKeys; k++) {
                    t = scale.keyTime(k);
                    worldScale = toWorldScale(currLayer, t);
                    scaleKeys.push(worldScale);
                }
            }

            //goodby mum and dad
            currLayer.parent =
                theGrandParent && recurseParents ? theGrandParent : null;
            //now set the transforms for the new setup
            //pos
            for (k = 0; k < posKeys.length; k++) {
                //k+1 to deal with adobe's weird 1-based indexing
                t = pos.keyTime(k + 1);
                pos.setValueAtTime(t, posKeys[k]);
            }
            //make an additional keyframe if the playhead isn't currently on a keyframe
            //or set the value if no keyframes are set for this property
            if (posKeys.length > 0) {
                pos.setValueAtTime(currTime, currPos);
            } else {
                pos.setValue(currPos);
            }
            //rot
            for (k = 0; k < rotKeys.length; k++) {
                t = rot.keyTime(k + 1);
                rot.setValueAtTime(t, rotKeys[k]);
            }
            //make an additional keyframe if the playhead isn't currently on a keyframe
            //or set the value if no keyframes are set for this property
            if (rotKeys.length > 0) {
                rot.setValueAtTime(currTime, currRot);
            } else {
                rot.setValue(currRot);
            }
            //scale
            for (k = 0; k < scaleKeys.length; k++) {
                t = scale.keyTime(k + 1);
                scale.setValueAtTime(t, scaleKeys[k]);
            }
            //make an additional keyframe if the playhead isn't currently on a keyframe
            //or set the value if no keyframes are set for this property
            if (scaleKeys.length > 0) {
                scale.setValueAtTime(currTime, currScale);
            } else {
                scale.setValue(currScale);
            }
        }
    }

    function defaultFor(arg, val, replaceNullandEmptyVals) {
        //eslint-disable-line no-unused-vars
        if (replaceNullandEmptyVals) {
            return typeof arg !== "undefined" || arg === null || arg === []
                ? val
                : arg;
        }
        return typeof arg !== "undefined" ? arg : val;
    }

    function toWorldPos(fromLayer, fromPoint, t, thePosNull) {
        //eslint-disable-line no-unused-vars
        //return the world space co-ordinates of a given point in layer space
        //an extendscript implementation of the expressions function
        var toWorld;
        if (fromLayer instanceof Layer) {
            theTime = defaultFor(t, app.project.activeItem.time);
            if (thePosNull) {
                posNull = thePosNull;
            } else {
                posNull = app.project.activeItem.layers.addNull();
                posNull.name = "TWP-temp-delete";
            }
            //oldExpression = posNull.transform.position.expression;
            posNull.transform.position.expression =
                "thisComp.layer('" +
                fromLayer.name +
                "').toWorld([" +
                fromPoint[0] +
                ", " +
                fromPoint[1] +
                ", " +
                fromPoint[2] +
                "], t = " +
                theTime +
                ")";
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

    function toWorldRotation(theLayer, t) {
        //eslint-disable-line no-unused-vars
        //return the world rotation of a layer relative to layer space
        //an extendscript implementation of the expressions function
        var theRotation;
        theTime = defaultFor(t, app.project.activeItem.time);
        if (theLayer.threeDLayer) {
            theRotation = [
                theLayer.transform.xRotation.valueAtTime(theTime, false),
                theLayer.transform.yRotation.valueAtTime(theTime, false),
                theLayer.transform.zRotation.valueAtTime(theTime, false),
            ];
        } else {
            theRotation = theLayer.transform.rotation.valueAtTime(
                theTime,
                false
            );
            //walk up the parent stack and add up rotations
        }
        if (theLayer.parent === null) {
            return theRotation;
        }
        //rotation is additive
        return theRotation + toWorldRotation(theLayer.parent, theTime);
    }

    function toWorldOrientation(theLayer, t) {
        //eslint-disable-line no-unused-vars
        //return the world rotation of a layer relative to layer space
        //an extendscript implementation of the expressions function
        var theOrientation;
        var theTime = defaultFor(t, app.project.activeItem.time);
        if (theLayer.threeDLayer) {
            theOrientation = theLayer.transform.Orientation.valueAtTime(
                theTime,
                false
            );
        } else {
            theOrientation = theLayer.transform.Orientation.valueAtTime(
                theTime,
                false
            );
            //walk up the parent stack and add up Orientations
        }
        if (theLayer.parent === null) {
            return theOrientation;
        }
        //Orientation is additive
        return theOrientation + toWorldOrientation(theLayer.parent, theTime);
    }

    function toWorldScale(theLayer, t) {
        //eslint-disable-line no-unused-vars
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

    function fromWorldPos(theLayer, worldPoint, t, tempEffect) {
        //eslint-disable-line no-unused-vars
        var theTime = defaultFor(t, app.project.activeItem.time);
        worldPoint[2] = defaultFor(worldPoint[2], 0);
        var fromWorldPosition;
        if (tempEffect) {
            posEffect = tempEffect;
            tempEffect.property("3D Point").expression =
                "thisLayer.fromWorld([" +
                worldPoint[0] +
                "," +
                worldPoint[1] +
                "," +
                worldPoint[2] +
                "]);";
        } else {
            posEffect = theLayer.Effects.addProperty("3D Point Control");
            posEffect.name = "temp-delete";
            posEffect.property("3D Point").expression =
                "thisLayer.fromWorld([" +
                worldPoint[0] +
                "," +
                worldPoint[1] +
                "," +
                worldPoint[2] +
                "]);";
        }
        fromWorldPosition = posEffect
            .property("3D Point")
            .valueAtTime(theTime, false);
        if (tempEffect === null) {
            posEffect.remove();
        }
        return fromWorldPosition;
    }

    function fromWorldRotation(theLayer, worldRotation, t) {
        //eslint-disable-line no-unused-vars
        //returns the layer space value of a world rotation
        //trivial, but included for completeness
        return worldRotation - toWorldRotation(theLayer, t);
    }

    function fromWorldScale(theLayer, worldScale, t) {
        //eslint-disable-line no-unused-vars
        var theTime = defaultFor(t, app.project.activeItem.time);
        return (
            100 *
            [
                worldScale[0] / toWorldScale(theLayer, theTime)[0],
                worldScale[1] / toWorldScale(theLayer, theTime)[1],
            ]
        );
    }

    function makeTempNull(theComp) {
        //eslint-disable-line no-unused-vars
        //utility function to create a temp null
        var posNull = theComp.layers.addNull();
        posNull.name = "TWP-temp-null-delete";
        return posNull;
    }

    function removeTempNull(posNull) {
        //eslint-disable-line no-unused-vars
        //utitlity function to remove it
        if (posNull.name === "TWP-temp-null-delete") {
            posNull.remove();
        }
    }
    function makeArray(num, arrLen, padding) {
        var newArr;
        var i;
        if (num) {
            //check that there is a num
            if (Object.prototype.toString.call(num) === "[object Array]") {
                newArr = num; //it's an array all good
            } else {
                if (isNaN(num))
                    throw new Error(
                        "in vectorMaths makeArray: one of those numbers aint a number"
                    );
                newArr = [num];
            }
        } else {
            newArr = [0];
        }
        if (arrLen) {
            //fill up the array with padding or zeroes
            for (i = 0; i < arrLen; i++) {
                newArr[i] = newArr[i] || padding;
            }
        }
        return newArr;
    }

    function vDiff(a, b) {
        //eslint-disable-line no-unused-vars
        var i;
        var d = [];
        var vec1 = makeArray(a);
        var vec2 = makeArray(b);
        var dims = Math.max(vec1.length, vec2.length);
        for (i = 0; i < dims; i++) {
            vec1[i] = vec1[i] || 0;
            vec2[i] = vec2[i] || 0;
            d[i] = vec1[i] - vec2[i];
        }
        return d;
    }

    function vSum(a, b) {
        //eslint-disable-line no-unused-vars
        var i;
        var sum = [];
        var vec1 = makeArray(a);
        var vec2 = makeArray(b);
        var dims = Math.max(vec1.length, vec2.length);
        for (i = 0; i < dims; i++) {
            vec1[i] = vec1[i] || 0;
            vec2[i] = vec2[i] || 0;
            sum[i] = vec1[i] + vec2[i];
        }
        return sum;
    }

    function vSMult(a, b) {
        //eslint-disable-line no-unused-vars
        //takes two objects, one of which is a scalar and multiplies them, returning a vector
        var vec = [];
        var scal;
        var i;
        if (Object.prototype.toString.call(a) === "[object Number]") {
            scal = a;
            vec = makeArray(b);
        } else if (Object.prototype.toString.call(b) === "[object Number]") {
            scal = b;
            vec = makeArray(a);
        } else {
            throw new Error("at least one input to vMult must be a scalar");
        }
        for (i = 0; i < vec.length; i++) {
            vec[i] *= scal;
        }
        return vec;
    }

    function vScale(a, b) {
        //eslint-disable-line no-unused-vars
        //scales a vector [a1, a2,..] by [s1, s2, ..]
        // to return [a1*s1, a2 * s2, ...]
        // if an array value is missing then it gets scaled by 0. Harsh, but fair.
        var vec1 = makeArray(a);
        var vec2 = makeArray(b);
        var dims = Math.max(vec1.length, vec2.length);
        var scaledVec = [];
        for (i = 0; i < dims; i++) {
            vec1[i] = vec1[i] || 0;
            vec2[i] = vec2[i] || 0;
            scaledVec[i] = vec1[i] * vec2[i];
        }
        return scaledVec;
    }

    function vDiv(a, b) {
        //eslint-disable-line no-unused-vars
        // divides a vector [a1, a2,..] by [s1, s2, ..]
        // to return [a1/s1, a2/s2, ...]
        // if an array value is missing in the denominator then it truncates the length of the output.
        var vec1 = makeArray(a);
        var vec2 = makeArray(b);
        var dims = vec2.length; //the length of the divisor determines the length of the output array
        var scaledVec = [];
        for (i = 0; i < dims; i++) {
            vec1[i] = vec1[i] || 0;
            vec2[i] = vec2[i] || 1;
            scaledVec[i] = vec1[i] / vec2[i];
        }
        return scaledVec;
    }

    function vSDiv(a, b) {
        //eslint-disable-line no-unused-vars
        // takes two objects, one of which is a scalar and divides them, returning a vector
        // Because order is important with division,
        // if the divisor  is a scalar it returns [v[0]/s, v[1]/s... v[length]/s]
        // if the divisor is a vector it returns [s/v[0], s/[v1]... s/v[length]]
        var vec = [];
        var scalar;
        var i;
        if (Object.prototype.toString.call(a) === "[object Number]") {
            scalar = a;
            vec = makeArray(b);
            for (i = 0; i < vec.length; i++) {
                if (scalar === 0)
                    throw new Error("Divide by zero error in vSDiv"); //I just learned how to throw errors, can you tell?
                vec[i] = scalar / vec[i];
            }
        } else if (Object.prototype.toString.call(b) === "[object Number]") {
            scalar = b;
            vec = makeArray(a);
            for (i = 0; i < vec.length; i++) {
                if (scalar === 0)
                    throw new Error("Divide by zero error in vSDiv");
                vec[i] /= scalar;
            }
        } else {
            throw new Error("at least one input to vMult must be a scalar");
        }
        return vec;
    }

    function vLen(a, b) {
        ///returns the magnitude of the length between two objects, either of which can be a scalar, or multidimensional vector
        var d = [];
        var vec2 = [];
        var vec1 = [];
        var sqrSum = 0;
        if (!a)
            throw new Error(
                "vLen needs a vector or two. Or at least a scalar, anything? even 0 will do"
            );
        vec1 = makeArray(a);
        vec2 = makeArray(b);
        d = vDiff(vec1, vec2);
        sqrSum = 0;
        while (d.length) {
            sqrSum += Math.pow(d.pop(), 2); //sum the squares
        }
        return Math.sqrt(sqrSum);
    }

    function vectorLength(a, b) {
        //eslint-disable-line no-unused-vars
        //I wrote an older not-as-good version of vlen and some scripts may come looking for it here
        return vLen(a, b);
    }

    function radiansToDegrees(rad) {
        //eslint-disable-line no-unused-vars
        return (rad / Math.PI) * 180.0;
    }

    function degreesToRadians(deg) {
        //eslint-disable-line no-unused-vars
        return (deg / 180.0) * Math.PI;
    }
    removeTempNull(posNull);
    app.endUndoGroup();
})();
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
