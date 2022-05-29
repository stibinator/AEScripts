// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
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
              var wasLocked = theLayers[i].locked;
              this.addNormaliseExpression(theLayers[i], camName);
              theLayers[i].locked = wasLocked;
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
