// @target aftereffects
var activeItem = app.project.activeItem;
makeCompHandle(activeItem);

function makeCompHandle(activeItem)
{
    if ((activeItem === null) || !(activeItem instanceof CompItem)) {
        alert("Please select or open a composition first.", scriptName);
    } else {
        var activeComp = activeItem;

        // By bracketing the operations with begin/end undo group, we can
        // undo the whole script with one undo operation.
        app.beginUndoGroup("Make Comp Handle");

        // Create a null 3D layer.
        var null3DLayer = activeItem.layers.addNull();
        null3DLayer.threeDLayer = true;
        null3DLayer.name = "comp handle";

        // Set its position to (0,0,0).
        null3DLayer.position.setValue([activeItem.width/2,activeItem.height/2,0]);

        // Set null3DLayer as parent of all layers that don't have parents.
        makeParentLayerOfAllUnparented(activeComp, null3DLayer);

        app.endUndoGroup();
    }
}
// Sets newParent as the parent of all layers in theComp that don't have parents.
// This includes 2D/3D lights, camera, av, text, etc.
//
function makeParentLayerOfAllUnparented(theComp, newParent)
{
    for (var i = 1; i <= theComp.numLayers; i++) {
        var curLayer = theComp.layer(i);
        if (curLayer != newParent && curLayer.parent === null) {
            if (curLayer.locked){
                curLayer.locked=false;
                curLayer.parent = newParent;
                curLayer.locked=true;
            } else {
                curLayer.parent = newParent;
            }
        }
    }
}
