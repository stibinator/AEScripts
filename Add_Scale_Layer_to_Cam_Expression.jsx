// @target aftereffects
(function(){
  this.addNormaliseExpression = function(theLayer, camName) {
    var wasLocked = theLayer.locked;
    theLayer.locked = false;
    if (theLayer.Scale.canSetExpression){
      theLayer.Scale.expression = 'let scaleFactor = 1 / thisComp.layer("'+ camName + '").cameraOption.zoom;\ntransform.scale * scaleFactor * length(thisComp.layer("Camera 1").transform.position, transform.position);'
    }
    theLayer.locked = wasLocked;
  }
  
  this.addNormaliseExpressionToLayers = function()
  {
    var proj = app.project;
    var scriptName = "Add 3D scale Normaliser expression";
    
    // change this to true if you want to leave locked layers untouched.
    var unlockedOnly = false;
    if (proj && proj.activeItem) {
      var theLayers = proj.activeItem.selectedLayers;
      var theCamera = proj.activeItem.activeCamera;
      
      if ((theLayers !== null) && (theCamera !== null)) {
        var camName = theCamera.name;
        app.beginUndoGroup(scriptName);
        var total_number = theLayers.length;
        for (var i=0; i<total_number; i++){
          
          if (! (unlockedOnly && theLayers[i].locked)){
            if (theLayers[i].threeDLayer){
              addNormaliseExpression(theLayers[i], camName);
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
  this.addNormaliseExpressionToLayers()
})()