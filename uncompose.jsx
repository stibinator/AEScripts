// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au 
(function(){
    this.name = "uncompose";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        while(theComp.selectedLayers.length){
            theLayer = theComp.selectedLayers[0];
            if (theLayer.source.typeName === 'Composition'){
                theLayer.toUncomp = true;   
            }
            theLayer.selected = false;
        }   
        for(var i =1; i <= theComp.numLayers; i++){
            theLayer = theComp.layer(i);
            if (theLayer.toUncomp){
                var targetIndex = theLayer.index;
                theSource = theLayer.source;
                for(var n =  theSource.numLayers; n > 0;  n--){
                    theSource.layer(n).copyToComp(theComp);
                    // the copied layer goes at the top, so the original layer index will have been shifted down one
                    targetIndex++;
                    // Apply the transforms from the precomposed layer to the comp contents
                    theComp.layer(1).setParentWithJump(theComp.layer(targetIndex));
                    // now set the parenting if it exists
                    theComp.layer(1).parent = theComp.layer(targetIndex).parent;
                    theComp.layer(1).moveAfter(theComp.layer(targetIndex));
                    // the target has now moved up one layer because the copied layer has moved off the top
                    targetIndex--;
                }
                theComp.layer(targetIndex).remove();
            }
        }
    }
    app.endUndoGroup();
})()

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
