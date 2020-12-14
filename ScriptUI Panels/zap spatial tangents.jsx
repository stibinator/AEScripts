// @target aftereffects
// @script "zap spatial tangents"
// @includepath "../(lib)/"
// @include "getproperties.jsx" 
// @include "jsextras.jsx"
/* global app, Panel, KeyframeInterpolationType, getIndividualProperties,PropertyValueType, contains */

var thisScript = this;
thisScript.scriptTitle = 'copyMultiLayer';
//var theComp = app.project.activeItem;

thisScript.run = function () {
  // thisScript.prefs = new PrefsFile(thisScript.scriptTitle);
  this.buildGUI(thisScript);
};

thisScript.buildGUI = function (thisObj) {
  //thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
  thisObj.w = (thisObj instanceof Panel)
    ? thisObj
    : new Window('palette', thisObj.scriptTitle, undefined, {resizeable: true});
  thisObj.w.alignChildren = ['left', 'top'];
  //thisObj.text = "vers. 0.1";
  var row1 = thisObj
    .w
    .add("group{orientation:'row', alignment: ['fill','fill'], alignChildren: ['left','fil" +
        "l']}");
  var linearIn = row1.add('iconbutton', {
    'x': undefined,
    'y': undefined,
    'width': 33,
    'height': 24
  }, new File('spatial_tangents/LinearIn.png'));
  var linearOut = row1.add('iconbutton', {
    'x': undefined,
    'y': undefined,
    'width': 35,
    'height': 24
  }, new File('spatial_tangents/LinearOut.png'));
  // var bezierInOut = row2.add("iconbutton", undefined, new
  // File("spatial_tangents/bezierInOut.png"));
  var linearInOut = row1.add('iconbutton', {
    'x': undefined,
    'y': undefined,
    'width': 32,
    'height': 24
  }, new File('spatial_tangents/LinearInOut.png'));
  var linearPair = row1.add('iconbutton', {
    'x': undefined,
    'y': undefined,
    'width': 50,
    'height': 24
  }, new File('spatial_tangents/LinearPair.png'));

  linearIn.helpTip = 'Linear In';
  linearOut.helpTip = 'Linear Out';
  linearInOut.helpTip = 'Linear In and Out';
  linearPair.helpTip = 'Linear Between adjacent keyframes';
  // bezierInOut.helpTip = "Bèzier In and Out";

  linearIn.onClick = function () {
    var theProps = app.project.activeItem.selectedProperties;
    if (theProps.length > 0) {
      app.beginUndoGroup('linear In');
      setKeyFrameInterp(theProps, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.BEZIER);
      app.endUndoGroup();
    }
    linearIn.active = false;
  };
  linearOut.onClick = function () {
    var theProps = app.project.activeItem.selectedProperties;
    if (theProps.length > 0) {
      app.beginUndoGroup('linear Out');
      setKeyFrameInterp(theProps, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.LINEAR);
      app.endUndoGroup();
    }
    linearOut.active = false;
  };
  linearInOut.onClick = function () {
    var theProps = app.project.activeItem.selectedProperties;
    if (theProps.length > 0) {
      app.beginUndoGroup('linear In-n-out');
      setKeyFrameInterp(theProps, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
      app.endUndoGroup();
    }
    linearInOut.active = false;
  };

  linearPair.onClick = function () {
    var theProps = app.project.activeItem.selectedProperties;
    if (theProps.length > 0) {
      app.beginUndoGroup('linear Pair');
      //using undefined just feels WRONG. JS sux dogs balls
      setKeyFrameInterp(theProps, undefined, undefined, true);
      app.endUndoGroup();
    }
    linearPair.active = false;
  };
  // bezierInOut.onClick = function() {     var theProps =
  // app.project.activeItem.selectedProperties;     if (theProps.length > 0) {
  //     app.beginUndoGroup("linear In");
  // thisScript.setKeyFrameInterp(theProps, KeyframeInterpolationType.BEZIER,
  // KeyframeInterpolationType.BEZIER);         app.endUndoGroup();     } };
  // -------end of the buttons, build the GUI-----------------------
  if (thisObj.w instanceof Window) {
    thisObj
      .w
      .center();
    thisObj
      .w
      .show();
  } else {
    thisObj
      .w
      .layout
      .layout(true);
  }
};
//--------------------now for the real hoo-ha------------------

function setKeyFrameInterp (theProps, interpIn, interpOut, multiple) {
  var theIndividualProps = getIndividualProperties(theProps);
  for (var p = 0; p < theIndividualProps.length; p++) {
    var theKeys = theIndividualProps[p].selectedKeys;
    var spatialTangentIn;
    var spatialTangentOut;
    if (theKeys.length > 0 && (theIndividualProps[p].propertyValueType === PropertyValueType.ThreeD_SPATIAL) || (theIndividualProps[p].propertyValueType === PropertyValueType.TwoD_SPATIAL)) {
      // ***************IMPORTANT**** theKeys is a list of indices, not keyframe
      // objects because there are no keyframe objects
      for (var k = 0; k < theKeys.length; k++) {
        //if we're looking for chains of keys to zap
        if (multiple) {
          if (contains(theKeys, theKeys[k] - 1)) {
            spatialTangentIn = [0, 0, 0];
          } else {
            //set the handles to [0,0,0] for linear keyframes
            spatialTangentIn = (interpIn === KeyframeInterpolationType.LINEAR)
              ? [0, 0, 0]
              : theIndividualProps[p].keyInSpatialTangent(theKeys[k]);
          }
          if (contains(theKeys, theKeys[k] + 1)) {
            spatialTangentOut = [0, 0, 0];
          } else {
            spatialTangentOut = (interpOut === KeyframeInterpolationType.LINEAR)
              ? [0, 0, 0]
              : theIndividualProps[p].keyOutSpatialTangent(theKeys[k]);
          }
        } else {
          spatialTangentIn = (interpIn === KeyframeInterpolationType.LINEAR)
            ? [0, 0, 0]
            : theIndividualProps[p].keyInSpatialTangent(theKeys[k]);
          spatialTangentOut = (interpOut === KeyframeInterpolationType.LINEAR)
            ? [0, 0, 0]
            : theIndividualProps[p].keyOutSpatialTangent(theKeys[k]);
        }
        theIndividualProps[p].setSpatialTangentsAtKey(theKeys[k], spatialTangentIn, spatialTangentOut);
      }
    }
  }
}

thisScript.run();
