// @target aftereffects
app.beginUndoGroup("here-n-there");
distribut3d(app.project.activeItem.selectedLayers);
app.endUndoGroup();

function distribut3d(theLayers) {
  if (theLayers.length) {
    var initialValue = theLayers[0].property("Transform").property("Position").value;
    var min = [initialValue[0], initialValue[1], initialValue[2]];
    var max = [initialValue[0], initialValue[1], initialValue[2]];
    for (var i = 1; i < theLayers.length; i++) {
      var layerPos = theLayers[i].property("Transform").property("Position").value;
      min[0] = (layerPos[0] < min[0])
        ? layerPos[0]
        : min[0];
      max[0]= (layerPos[0] > max[0])
        ? layerPos[0]
        : max[0];
      min[1] = (layerPos[1] < min[1])
        ? layerPos[1]
        : min[1];
      max[1] = (layerPos[1] > max[1])
        ? layerPos[1]
        : max[1];
      min[2] = (layerPos[2] < min[2])
        ? layerPos[2]
        : min[2];
      max[2] = (layerPos[2] > max[2])
        ? layerPos[2]
        : max[2];
    }
    
    for (var i = 0; i < theLayers.length; i++) {
      var newValue = min + i * (max - min) / (theLayers.length - 1);
      theLayers[i].property("Transform").property("Position").setValue(newValue);
    }
  }
}
