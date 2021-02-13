// @target aftereffects
if (app.project && app.project.activeItem){
    var theComp = app.project.activeItem;
    var selectedMattes = app.project.activeItem.selectedLayers;
    for (var i =0; i< selectedMattes.length; i++){
        var matteLayer = selectedMattes[i];
        if (matteLayer.isTrackMatte){
            var targetLayer = theComp.layer(matteLayer.index+1);
            matteLayer.source.width = targetLayer.width;
            matteLayer.source.height = targetLayer.height;
            matteLayer.setParentWithJump(targetLayer);
            matteLayer.property("Transform").property("Position").setValue(targetLayer.property("Transform").property("Anchor Point").value);
            matteLayer.inPoint = targetLayer.inPoint;
            matteLayer.outPoint =targetLayer.outPoint;
        }
    }
}
