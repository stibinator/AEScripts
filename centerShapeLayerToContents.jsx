app.beginUndoGroup("Center shape layer")
var theComp = app.project.activeItem;
var selectedLayers = theComp.selectedLayers;

for (var i= 0; i< selectedLayers.length; i++){
    var pathElements = [];
    var theContents = selectedLayers[i].property("ADBE Root Vectors Group"); //Contents of the layer
    for (var p=1, len=theContents.numProperties; p <= len ; p++) {
        var shapeContents = theContents.property(p).property("ADBE Vectors Group"); //individual shapes in the content
        var isPath = false;

            for (var q = 1; q <= shapeContents.numProperties; q++){
                // shape contents have fill, stroke, etc. properties
                if (isValid(shapeContents.property(q).property("ADBE Vector Shape"))){ //the shape path
                    thePropertyIndex = shapeContents.property(q).propertyIndex;
                    isPath = true;
                    pathElements.push(p);
                }
            }      
            if (isPath){
                // the only way to get the bounds of a vector path seems to be to make a copy of the layer
                // containing just that shape and and get the sourceRectAtTime of it.
                theDupe = selectedLayers[i].duplicate();
                var theDupeContents = theDupe.property("ADBE Root Vectors Group");
                for (var dp=p+1; dp <= theDupeContents.numProperties ; dp++) {
                var theDupeContents = theDupe.property("ADBE Root Vectors Group");
                    theDupeContents.property(dp).remove(); //individual shapes in the content
                }
                for (var dp=1; dp < theDupeContents.numProperties ; dp++) {
                    theDupeContents.property(dp).remove(); //individual shapes in the content
                }
                theBounds = theDupe.sourceRectAtTime(theComp.time, true);
                theDupe.remove();
                var center = [ theBounds.left + theBounds.width /2, theBounds.height/2 + theBounds.top];
                theContents.property(p).property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue(center);
                theContents.property(p).property("ADBE Vector Transform Group").property("ADBE Vector Anchor").setValue(center);
            }
               
    };

    
    var theBounds = selectedLayers[i].sourceRectAtTime(theComp.time, true);
    var positionOffset = [theBounds.left +  theBounds.width/2, theBounds.top + theBounds.height /2 ];
    for (var p=1, len=theContents.numProperties; p <= len ; p++) {
        if (! pathElements.indexOf(p)<0){
            var shape = theContents.property(p);
            var oldShapePos = shape.property("Transform")("Position").value;
            shape.property("Transform")("Position").setValue(oldShapePos - positionOffset);
        }
    }
    var oldAP = selectedLayers[i].property("Transform")("Anchor Point").value; 
    var oldPos = selectedLayers[i].property("Transform")("Position").value; 
    selectedLayers[i].property("Transform")("Position").setValue(oldPos + positionOffset);
    selectedLayers[i].property("Transform")("Anchor Point").setValue(oldAP + positionOffset);
}
app.endUndoGroup();