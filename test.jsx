// @target aftereffects
var theLayer = app.project.activeItem.selectedLayers[0];
theLayer.newProperty = "hello";
theLayer.selected = false;
alert(theLayer.newProperty);