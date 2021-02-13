// @target aftereffects
function addNormaliseExpression(theLayer, theCamera) {if (proj instanceof Project)
  var camName;
  camName = theCamera.name;
  if (theLayer.Scale.canSetExpression){
    theLayer.Scale.expression = 'scaleFactor = 1 / thisComp.layer("'+ camName + '").cameraOption.zoom;transform.scale * scaleFactor * length(thisComp.layer("Camera 1").transform.position, transform.position);'
  }
}

function addNormaliseExpressionToLayers()
{
  var proj = app.project;
  var scriptName = "Add 3D scale Normaliser expression";

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
            addNormaliseExpression(theLayers[i], theCamera);
          }
        }
      }
      app.endUndoGroup();
    } else {
      alert("Please select some layers to use this script", scriptName);
    }
  } else {
    alert("Please open a project first to use this script.", scriptName);
  }
}


addNormaliseExpressionToLayers();
