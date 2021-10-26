// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// duplicates the source of a layer
// usage duplicateLayerSource(layerObject)
// layerObject is a comp layer
// returns the newly created projectItem
// e.g. duplicateLayerSource(app.project.activeItem.layers[18]);

function duplicateLayerSource(theLayer){
    //first deselect all the layers
    var oldLayerSelection = [];
    var theComp = theLayer.containingComp;
    for (i = 1; i<+ theComp.numLayers; i++){
        if (theComp.layers[i].selected){
            oldLayerSelection.push (i);
            theComp.layers[i].selected = false;
        }
    }
    //now deselect all the project items
//    var sel = app.project.selection;
//    var oldSel = []
//    for (var i = 0; i < sel.length; i++){
//        oldSel.push(sel[i].dynamicLinkGUID)
//        sel[i].selected = false;
//        }
       
    // select the layer we want to dupe the source for
    theLayer.selected = true;
    // so kludgy, but it's the only way
    app.executeCommand(app.findMenuCommandId("Reveal Layer Source in Project"));
    app.executeCommand(app.findMenuCommandId("Duplicate"));
    // when we duplicate an item it will be selected
    var newItem = app.project.selection[0];
    
    // now put all the selection back to how we found it
    // first in the project
 //   for (var i = 1; i <= app.project.items.length; i++){
    //    if (oldSel.indexOf(app.project.items[i].dynamicLinkGUID )>= 0){
       //     app.project.items[i].selected = true;
          //  }
        //}
    // now in the comp
    for (var i = 1; i < oldLayerSelection.length; i++){
        theComp.layer(oldLayerSelection[i]).selected = true;
        }
    return (newItem);
}

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
