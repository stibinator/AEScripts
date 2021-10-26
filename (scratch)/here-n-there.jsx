// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
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
