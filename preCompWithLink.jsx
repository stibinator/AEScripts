// @target aftereffects
// (function(){
var scriptName = "precomp with link";
app.beginUndoGroup(scriptName);
var theComp = app.project.activeItem;
if (theComp ){
    if (theComp.selectedLayers.length){
        var newCompName = theComp.selectedLayers[0].name + " precomp";
        var indices = [];
        for (var i  = 0; i < theComp.selectedLayers.length; i++){
            theComp.selectedLayers[i].wasSelected = true;
        }
        
        for (var i = 1; i <= theComp.numLayers; i++){
            if (theComp.layer(i).wasSelected){
                theLayer = theComp.layer(i);
                $.writeln(theLayer.name);
                if (theLayer.parent){
                    indices.push(theLayer.index);
                    var linkNull = theComp.layers.addNull();
                    linkNull.moveToEnd();
                    linkNull.setParentWithJump(theLayer.parent);
                    linkNull.position.setValue([0,0,0]);
                    linkNull.name = theLayer.name + "_link";
                    theLayer.parent = linkNull;
                    indices.push(linkNull.index);
                    linkNull.position.expression = "let parentLayer = comp('" + theComp.name + "').layer('" + linkNull.parent.name + "');\nparentLayer.toComp(parentLayer.anchorPoint);"
                    linkNull.rotation.expression = "let parentLayer = comp('" + theComp.name + "').layer('" + linkNull.parent.name + "');\nlet unitVec = parentLayer.toCompVec([0,1]);\n0 - radiansToDegrees(Math.atan2(unitVec[0], unitVec[1]));"
                    linkNull.scale.expression = "let parentLayer = comp('" + theComp.name + "').layer('" + linkNull.parent.name + "');let parentScale = value;\nwhile(parentLayer){\n  for (i = 0; i < 2; i++){\n    parentScale[i] *= parentLayer.scale[i]/100;\n  }\n  parentLayer = (parentLayer.hasParent)? parentLayer.parent: null;\n}\nparentScale;"
                }
            }
        }
        var newComp = theComp.layers.precompose(indices, newCompName, true);
    }
}
app.endUndoGroup();
// })()
