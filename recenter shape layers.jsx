/* @target AfterEffects */
// centers the anchor point of a shape layer in the middle of the contents of the layer
/* global app, CompItem */
app.beginUndoGroup("Center shape layer anchor");
var theComp = app.project.activeItem;
if (theComp instanceof CompItem){
    var selected = theComp.selectedLayers;
    for (var layer = 0; layer < selected.length; layer++){
        var theLayer = selected[layer];
        var shapeContents = theLayer.property("Contents");
        var shapePositions = [0, 0];
        for (var i = 1; i <= shapeContents.numProperties; i++){
            shapePositions += (shapeContents.property(i).property("transform").property("position").value);
        }
        shapePositions /= shapeContents.numProperties;
        for (i = 1; i <= shapeContents.numProperties; i++){
            var contentPos = shapeContents.property(i).property("transform").property("position");
            contentPos.setValue(contentPos.value - shapePositions);
        }
        // alert(shapePositions);
        theLayer.position.setValue(theLayer.position.value + shapePositions);
    }
}
app.endUndoGroup();