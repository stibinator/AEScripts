//@target aftereffects
/* includepath "../(lib)" */
/* include "defaultFor.jsx" */
/* include "getproperties.jsx" */
// @script "getSelectedKeys"
/* global app, defaultFor, getKeyAttributes,getIndividualProperties */

// eslint-disable-next-line no-unused-vars
function getSelectedKeys(thecomp) {
    //the object this function will return: an array of keys and the first key's time
    var theKeys = {
        keys: [],
        firstSelectedKeyTime: null,
        lastSelectedKeyTime: null
    };
    var theComp = defaultFor(theComp, app.project.activeItem, true);
    var selLayers = theComp.selectedLayers;

    //drill down to get to the keys:
    for (var i = 0; i < selLayers.length; i++) {
        var selectedProps = selLayers[i].selectedProperties;
        for (var j = 0; j < selectedProps.length; j++) {
            var selectedKeyframes = selectedProps[j].selectedKeys;
            for (var k = 0; k < selectedKeyframes.length; k++) {
                //get the attributes of the selected key - note that the key list is 1-indexed WTF adobe?
                var theAttributes = getKeyAttributes(selectedProps[j], selectedKeyframes[k]);
                if (theKeys.firstSelectedKeyTime === null || theAttributes.keyTime < theKeys.firstSelectedKeyTime) {
                    theKeys.firstSelectedKeyTime = theAttributes.keyTime;
                }
                if (theKeys.lastSelectedKeyTime === null || theAttributes.keyTime > theKeys.lastSelectedKeyTime) {
                    theKeys.lastSelectedKeyTime = theAttributes.keyTime;
                }
                //add a new object to the array of keys:
                theKeys.keys.push({layerIndex: selLayers[i].index, prop: selectedProps[j], attributes: theAttributes});
            }
        }
    }
    return theKeys;
}

// eslint-disable-next-line no-unused-vars
function copyTimeSlice(theComp){
  var theProps = [];
  var theVals = [];
  theComp = defaultFor(theComp, app.project.activeItem, true);
  var selLayers = theComp.selectedLayers;
  for (var layer = 0; layer < selLayers.length; layer++) {
    var theLayer = selLayers[layer];
      theProps.push = theLayer.selectedProperties;
  }
  var individualProps = getIndividualProperties(theProps);
  for (var prop = 0; prop < individualProps.length; prop++) {
    theVals.push({"prop":individualProps[prop], "val":individualProps[prop].value});
  }
  return theVals;
}

// eslint-disable-next-line no-unused-vars
function pasteTimeSlice(theVals, theComp){
  theComp = defaultFor(theComp, app.project.activeItem, true);
  for (var i = 0; i < theVals.length; i++) {
    theVals[i].prop.setValueAtTime(theComp.time, theVals[i].val);
  }
}
