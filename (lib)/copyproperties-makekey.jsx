/* global KeyframeInterpolationType, PropertyValueType, writeln */
// eslint-disable-next-line no-unused-vars
function getKeyAttributes(theProperty, keyIndex) {
	//in lieu of a proper keyframe object this returns all the details of a keyframe, given a property and key index.
	var theAttributes = {
	} ;
	theAttributes.keyTime = theProperty.keyTime(keyIndex);
	theAttributes.keyVal = theProperty.keyValue(keyIndex);
	theAttributes.canInterp = theProperty.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER) ||

	theProperty.isInterpolationTypeValid(KeyframeInterpolationType.HOLD) ||

	theProperty.isInterpolationTypeValid(KeyframeInterpolationType.LINEAR);
	if (theAttributes.canInterp){
		theAttributes.keyInInterpolationType = theProperty.keyInInterpolationType(keyIndex);
		theAttributes.keyOutInterpolationType = theProperty.keyOutInterpolationType(keyIndex);
		if (theAttributes.keyInInterpolationType) {
			theAttributes.keyInTemporalEase = theProperty.keyInTemporalEase(keyIndex);
			theAttributes.keyOutTemporalEase = theProperty.keyOutTemporalEase(keyIndex);
		}
	}
    //ignore spatial tangents for things like masks
    theAttributes.isSpatial = theProperty.isSpatial && (theProperty.propertyValueType == PropertyValueType.ThreeD_SPATIAL || theProperty.propertyValueType == PropertyValueType.TwoD_SPATIAL );

    if (theAttributes.isSpatial ) {
		theAttributes.keyInSpatialTangent = theProperty.keyInSpatialTangent(keyIndex);
		theAttributes.keyOutSpatialTangent = theProperty.keyOutSpatialTangent(keyIndex);
	}
	return theAttributes;
}

// eslint-disable-next-line no-unused-vars
function makeKeyWithAttributes(theProperty, keyAttributes, keyTime) {
	//turns theAttributes from getKeyAttributes into a new keyframe
	if (theProperty.canVaryOverTime){
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

//make key but don't set attributes
// eslint-disable-next-line no-unused-vars
function makeKeyAtTime(theProperty, keyAttributes, keyTime) {
  theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
}

//set attributes
// eslint-disable-next-line no-unused-vars
function setKeyAttributes(theProperty, keyAttributes, keyTime){
  var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class
  if (keyAttributes.canInterp) {
    theProperty.setTemporalEaseAtKey(newKeyIndex, keyAttributes.keyInTemporalEase, keyAttributes.keyOutTemporalEase);
    //important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
    theProperty.setInterpolationTypeAtKey(newKeyIndex, keyAttributes.keyInInterpolationType, keyAttributes.keyOutInterpolationType);
  }

  if (keyAttributes.isSpatial) {
  theProperty.setSpatialTangentsAtKey(newKeyIndex, keyAttributes.keyInSpatialTangent, keyAttributes.keyOutSpatialTangent);
  }
  return newKeyIndex;
}

//set attribute in reverse
// eslint-disable-next-line no-unused-vars
function setKeyAttributesReversed(theProperty, keyAttributes, keyTime){
  var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class
  if (keyAttributes.canInterp) {
    theProperty.setTemporalEaseAtKey(newKeyIndex, keyAttributes.keyOutTemporalEase, keyAttributes.keyInTemporalEase);
    //important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
    theProperty.setInterpolationTypeAtKey(newKeyIndex, keyAttributes.keyOutInterpolationType, keyAttributes.keyInInterpolationType);
  }

  if (keyAttributes.isSpatial) {
    theProperty.setSpatialTangentsAtKey(newKeyIndex, keyAttributes.keyOutSpatialTangent, keyAttributes.keyInSpatialTangent);
  }
  return newKeyIndex;
}
