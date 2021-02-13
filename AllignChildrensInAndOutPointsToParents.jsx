// @target aftereffects
//if no layers are selected do them all, a'la lightwave
var theLayers = app.project.activeItem.selectedLayers
if (theLayers.length === 0) {
  theLayers = app.project.activeItem.layers;
}
var i;

for (i = 1; i < theLayers.length; i++) {
  if (!theLayers[i].locked) {
    if (theLayers[i].parent) {
      theLayers[i].inPoint = theLayers[i].parent.inPoint;
      theLayers[i].outPoint = theLayers[i].parent.outPoint;
    }
  }
}
