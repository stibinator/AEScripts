app.beginUndoGroup("Add new shape layer");
var curComp = app.project.activeItem;
if(curComp){ 
    var shapeLayer = curComp.layers.addShape();
    var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
    var myRect = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    // myRect.property("ADBE Vector Star Type").setValue(2);
    // myRect.property("ADBE Vector Star Points").setValue(6);
    var size = myRect.property("ADBE Vector Rect Size");
    size.setValue([curComp.width, curComp.height]);
    var rectFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    rectFill.property("Color").setValue([Math.random(), Math.random(), Math.random(), 1])
    // var rectStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    // rectStroke.property("Color").setValue([Math.random(), Math.random(), Math.random(), 1])
}
app.endUndoGroup();