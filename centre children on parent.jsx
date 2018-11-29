//if no layers are selected do them all, a'la lightwave
var theLayers = app.project.activeItem.selectedLayers
if (theLayers.length === 0) {
  theLayers = app.project.activeItem.layers;
}

for (i = 0; i < theLayers.length; i++) {
  if (theLayers[i].parent) {
    theLayers[i].position.value = [theLayers[i].parent.width / 2, theLayers[i].parent.height / 2, 0]
  }
}
