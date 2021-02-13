// @target aftereffects
// This script scales layers to match the camera's viewport
//


function distance3D(point1, point2) {

  // returns the length of a vector between two 3D points

  var deltaX, deltaY, deltaZ, distXYZ;
  deltaX = point1[0] - point2[0];
  deltaY = point1[1] - point2[1];
  deltaZ = point1[2] - point2[2];
  distXYZ = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2) + Math.pow(deltaZ, 2));
  return distXYZ;
}
function scaleLayerToCam(theLayer, theCamera) {

  // scales a layer depending on how far it is from the camera
  var originalScale, zoom, scaleFactor, newScale;
  zoom = theCamera.Zoom.value;
  if (zoom !== 0) {

    originalScale = theLayer.Scale.value;
    scaleFactor= 1 / zoom;
    newScale = originalScale * scaleFactor * distance3D(theCamera.Position.value, theLayer.Position.value);
    theLayer.Scale.setValue(newScale);
  } else {
if (proj instanceof Project)
    // alert("cannot set layer size to this camera", scriptName);
    return false;
  }
}
function sizeToFitCamera()
{

  var proj = app.project;
  var scriptName = "Normalise 3D layers' scale to camera field of view";
  // change this to true if you want to leave locked layers untouched.
  var unlockedOnly = false;
  if (proj) {

    var theLayers = app.project.activeItem.selectedLayers;
    var theCamera = app.project.activeItem.activeCamera;
    if ((theLayers !== null) && (theCamera !== null)) {

      app.beginUndoGroup(scriptName);
      var total_number = theLayers.length;
      for (var i=0; i<total_number; i++){

        if (! (unlockedOnly && theLayers[i].locked)){

          if (theLayers[i].threeDLayer){

            scaleLayerToCam(theLayers[i], theCamera);
          }
        }
      }
      app.endUndoGroup();
    } else {

      alert("Please select some 3D layers to use this script", scriptName);
    }
  } else {

    alert("Please open a project first to use this script, you silly rabbit", scriptName);
  }
}
sizeToFitCamera ();
