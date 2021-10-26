// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
//Align selected keyframes to current time
//considerably less trivial than it seems, given the glaring lack of a Keyframe object in AE.
if (app.project && app.project.activeItem){
    app.beginUndoGroup("Align selected keyframes to current time")
    var theComp = app.project.activeItem;
    var selectedKeys = alignSelectedKeys(theComp, app.project.activeItem.time);
    app.endUndoGroup();
}

function alignSelectedKeys(theComp, theTime) {
    theComp.originalSelectedLayers = theComp.selectedLayers;
    // drill down to get to the keys. 
    // We can't do any adding or deleting in the first loop,
    // because this will disturb the selection and key indices
    for (var i = 0; i <  theComp.originalSelectedLayers.length; i++) {
        var selectedProps =  theComp.originalSelectedLayers[i].selectedProperties;
        theComp.originalSelectedLayers[i].originallySelectedProps = selectedProps; //hot-glue the original layer selection state on to the comp object
        for (var j = 0; j < selectedProps.length; j++) {
            var theKeys = [];
            var theProp = selectedProps[j];
            var selectedKeyframes = theProp.selectedKeys;
            if (selectedKeyframes.length){
                theProp.originallySelectedKey = selectedKeyframes[0]; //hot-glue the original selection on to the property object
                theProp.originallySelectedKeyAttributes = getKeyAttributes(theProp, theProp.originallySelectedKey); //and the key attributes
            }
        }
    }
    // delete original keys, and make new ones
    for (var i = 0; i <  theComp.originalSelectedLayers.length; i++) {
        var selectedProps =  theComp.originalSelectedLayers[i].originallySelectedProps;
        for (var j = 0; j < selectedProps.length; j++) {
            var theProp = selectedProps[j];
            if (theProp.originallySelectedKey){
                theProp.removeKey(theProp.originallySelectedKey);
                theProp.newKey = makeKeyWithAttributes(theProp.originallySelectedKeyAttributes, theTime);
            }
        }
    }
    // clean up and select the new keys, because I'm fussy
    for (var i = 0; i <  theComp.originalSelectedLayers.length; i++) {
        var selectedProps =  theComp.originalSelectedLayers[i].originallySelectedProps;
        for (var j = 0; j < selectedProps.length; j++) {
            var theProp = selectedProps[j];
            if (theProp.newKey){
                theProp.setSelectedAtKey(theProp.newKey, true);
                // scrape off all the custom properties we've hot-glued on
                theProp.newKey = null;
                theProp.originallySelectedKey = null; 
                theProp.originallySelectedKeyAttributes = null;
            }
        }
        theComp.originalSelectedLayers[i].originallySelectedProps = null;
    }
    theComp.originalSelectedLayers = null;
    
}

function makeKeyWithAttributes(keyAttributes, keyTime, theProperty) {
    if (! theProperty){
        var theProperty = keyAttributes.property;
    }
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

function getKeyAttributes(theProperty, keyIndex) {
    //in lieu of a proper keyframe object this returns all the details of a keyframe, given a property and key index.
    var theAttributes = {
        property: theProperty
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
    // only get spatial tangent attributes for spatial properties
    theAttributes.isSpatial = theProperty.isSpatial && (theProperty.propertyValueType == PropertyValueType.ThreeD_SPATIAL || theProperty.propertyValueType == PropertyValueType.TwoD_SPATIAL );
    
    if (theAttributes.isSpatial ) {
        theAttributes.keyInSpatialTangent = theProperty.keyInSpatialTangent(keyIndex);
        theAttributes.keyOutSpatialTangent = theProperty.keyOutSpatialTangent(keyIndex);
    }
    return theAttributes;
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
