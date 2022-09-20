function newShape(
    theLayer, //target shape layer, create with someComp.layers.addShape()
    shapeName, // user readable name
    shapeSizeArr, // [width, height] for regular (not bezier) shapes
    fillColour,
    strokeColour,
    shapeOpac,
    shapeType, // int, where 0 = rect, 1 = ellipse, 2 = polygon, 3 = star, 4 bezier
    shapePoints, // number of points for polygons and stars, or an array of points for bezier shapes
    shapeInTangents, 
    shapeOutTangents,
    shapeIsClosed
) {
    var shapeStr = [" - Rect", " - Ellipse", " - Star", " - Star", ""];
    var newGroup = theLayer
        .property("Contents")
        .addProperty("ADBE Vector Group");
    newGroup.name = shapeName;
    var newShapeItem;
    newShapeItem = newGroup.content.addProperty(
        "ADBE Vector Shape" + shapeStr[shapeType]
    )


    if (shapeType === 0 || shapeType === 1) {
        newShapeItem
            .property("ADBE Vector " + shapeStr[shapeType] + " Size")
            .setValue(shapeSizeArr);
    } else if (shapeType === 2 || shapeType === 3) {
        newShapeItem.property("ADBE Vector Star Type").setValue(2);
        newShapeItem
            .property("ADBE Vector Star Points")
            .setValue(shapePoints);
        newShapeItem
            .property("ADBE Vector Star Outer Radius")
            .setValue(shapeSizeArr[0]);
        if (shapeType > 2) {
            newShapeItem.property("ADBE Vector Star Type").setValue(1);
            newShapeItem
                .property("ADBE Vector Star Inner Radius")
                .setValue(shapeSizeArr[1]);
        } else {
            newShapeItem.vertices = shapePoints;
            newShapeItem.inTangents = shapeInTangents;
            newShapeItem.shapeOutTangents = shapeOutTangents;
            newShapeItem.closed = shapeIsClosed;
        }
    }
    if (fillColour) {
        var newFill = newGroup.content.addProperty(
            "ADBE Vector Graphic - Fill"
        );
        newFill.property("ADBE Vector Fill Color").setValue(fillColour);
        newFill.property("ADBE Vector Fill Opacity").setValue(shapeOpac);
    }

    if (strokeColour) {
        var newStroke = newGroup.content.addProperty(
            "ADBE Vector Graphic - Stroke"
        );
        newStroke
            .property("ADBE Vector Stroke Color")
            .setValue(strokeColour);
        newStroke
            .property("ADBE Vector Stroke Opacity")
            .setValue(shapeOpac);
    }
    return newShapeItem;
}
var theLayer = app.project.activeItem.layers.addShape();
var myShape = newShape(
    theLayer,
    "Shapey mcShapeFace",
    [],
    [1, 0.5, 0.1],
    [],
    100,
    4,
    [[0, 0], [100, 0], [123, 456], [0, 345]],
    [],
    [],
    true
)