// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app, getKeyAttributes, makeKeyWithAttributes*/
// an initial attemp at a key reduction script
// this is a WIP
(function () {
	function getKeyAttributes(theProperty, keyIndex) {
		//in lieu of a proper keyframe object this returns all the details of a keyframe, given a property and key index.
		var theAttributes = {
		};
		theAttributes.keyTime = theProperty.keyTime(keyIndex);
		theAttributes.keyVal = theProperty.keyValue(keyIndex);
		theAttributes.canInterp = theProperty.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER) ||

			theProperty.isInterpolationTypeValid(KeyframeInterpolationType.HOLD) ||

			theProperty.isInterpolationTypeValid(KeyframeInterpolationType.LINEAR);
		if (theAttributes.canInterp) {
			theAttributes.keyInInterpolationType = theProperty.keyInInterpolationType(keyIndex);
			theAttributes.keyOutInterpolationType = theProperty.keyOutInterpolationType(keyIndex);
			if (theAttributes.keyInInterpolationType) {
				theAttributes.keyInTemporalEase = theProperty.keyInTemporalEase(keyIndex);
				theAttributes.keyOutTemporalEase = theProperty.keyOutTemporalEase(keyIndex);
			}
		}
		//ignore spatial tangents for things like masks
		theAttributes.isSpatial = theProperty.isSpatial && (theProperty.propertyValueType == PropertyValueType.ThreeD_SPATIAL || theProperty.propertyValueType == PropertyValueType.TwoD_SPATIAL);

		if (theAttributes.isSpatial) {
			theAttributes.keyInSpatialTangent = theProperty.keyInSpatialTangent(keyIndex);
			theAttributes.keyOutSpatialTangent = theProperty.keyOutSpatialTangent(keyIndex);
		}
		return theAttributes;
	}
	function makeKeyWithAttributes(theProperty, keyAttributes, keyTime) {
		//turns theAttributes from getKeyAttributes into a new keyframe
		if (theProperty.canVaryOverTime) {
			try {
				theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
				var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class

				if (keyAttributes.canInterp) {
					theProperty.setTemporalEaseAtKey(newKeyIndex, keyAttributes.keyInTemporalEase, keyAttributes.keyOutTemporalEase);
					//important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
					theProperty.setInterpolationTypeAtKey(newKeyIndex, keyAttributes.keyInInterpolationType, keyAttributes.keyOutInterpolationType);
				}

				//theProperty.setInterpolationTypeAtKey(theAttributes.keyInInterpolationType-6412, theAttributes.keyOutInterpolationType-6412); //WTF Javascript?
				if (keyAttributes.isSpatial) {
					theProperty.setSpatialTangentsAtKey(newKeyIndex, keyAttributes.keyInSpatialTangent, keyAttributes.keyOutSpatialTangent);
				}
				return newKeyIndex;
			} catch (e) {
				writeln(e);
				return false;
			}
		} else {
			return false;
		}
	}

	app.beginUndoGroup("remove redundant keys");
	var tolerance = 0;
	var selectedProps = app.project.activeItem.selectedProperties;

	for (var p in selectedProps) {
		var kfs = selectedProps[p].selectedKeys;
		for (var k = kfs.length - 2; k > 0; k--) {
			if (kfs.length > k & k > 1) {
				if (keyIsredundant(selectedProps[p], k, tolerance, true, false)) { //} & selectedProps[p].keyValue(k) === selectedProps[p].keyValue(k + 1)) {
					selectedProps[p].removeKey(k);
				}
			}
		}
	}
	app.endUndoGroup();

	function keyIsredundant(theProperty, keyIndex, tolerance, deepsearch, preExpression) {
		try {
			var prevkeyVal = theProperty.keyValue(keyIndex - 1);
			var currentKey = theProperty.keyValue(keyIndex);
			var nextKeyVal = theProperty.keyValue(keyIndex + 1);
		} catch (e) {
			return false; //mainly to catch array keyIndex errors
		}
		alert("" + nextKeyVal + "vs" + currentKey);
		return (vMag(nextKeyVal + prevkeyVal / 2 - currentKey) < tolerance) ?
			true : // returns true if the keys are the same or in a linear progression
			(deepsearch) ?
				testkeyIsRedundant(theProperty, keyIndex, tolerance, preExpression)
				: false;
	}

	function testkeyIsRedundant(theProperty, keyIndex, tolerance, preExpression) {
		var theKey = getKeyAttributes(theProperty, keyIndex);
		theProperty.removeKey(keyIndex);
		var theValue = theProperty.valueAtTime(theKey.keyTime, preExpression);
		makeKeyWithAttributes(theProperty, theKey, theKey.keyTime);
		return vMag(theValue - theKey.keyVal) < tolerance
	}

	function vMag(vector) {
		//returns magnitude of vectors of variable length
		if (vector.length) {
			var s = 0;
			for (var i = 0; i < vector.length; i++) {
				s += Math.pow(vector[i], 2);
			}
			return Math.sqrt(s);
		} else {
			return Math.abs(vector);
		}
	}
})()
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
