// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app, TextLayer, makeUniqueCompName */


app.beginUndoGroup("preCompText");
var currentComp = app.project.activeItem;
var currentTextLayers = currentComp.selectedLayers;
for (var i =0; i < currentTextLayers.length; i++){
    if (currentTextLayers[i] instanceof TextLayer){
        var theText = currentTextLayers[i];
        var dimensions = theText.sourceRectAtTime(0, false);
        var theName = makeUniqueCompName(theText, '', '_precomp');
        var newComp = app.project.items.addComp(theName, Math.round(dimensions.width), Math.round(dimensions.height), currentComp.pixelAspect, currentComp.duration, currentComp.frameRate);
        var newTextLayer = newComp.layers.addText(theText.sourceText.value);

        newTextLayer.transform.position.setValue([newComp.width-theText.sourceText.value.baselineLocs[2], newComp.height]);
       newComp.openInViewer();
       app.executeCommand(app.findMenuCommandId("Fit to Comp Width"));
       currentComp.layers.add(newComp);
       
    }
}
app.endUndoGroup();

function makeUniqueCompName(oldSource, prefix, suffix){
    if (oldSource.name){
        if (! suffix) {suffix = ''}
        if (! prefix) {prefix = ''}
        // Create a unique name, given a layer
        // find a serialnumber suffix if one exists e.g. mypic.jpg_1 
        // everyone stand back… 
        // the RE matches any string that doesn't
        // end in a number, followed by a number. eg foo99bar_9 will match
        // (foo99bar_)(9)
        var re = /(.*[^\d])*(\d*)$/;

        var m = oldSource.name.match(re);
        var oldSourceSerial = m[2];
        var oldSourceBaseName = m[1];

        //default serial number
        var newSourceSerial = 1;

        // if no match, then the source doesn't have a serial number. One of these
        // should catch it
        if (typeof(oldSourceSerial) === 'undefined' || oldSourceSerial === '' || isNaN(parseInt(oldSourceSerial, 10))) {
            // since there was no serial we add a separator onto the base name so that it
            // becomes basename_1 etc
            oldSourceBaseName = oldSource.name;
        } else {
            //there was a serial number, so increment it
            newSourceSerial = 1 + parseInt(oldSourceSerial, 10);
        }

        if (!oldSourceBaseName) {
            oldSourceBaseName = oldSource.name;
        } //shouldn't happen, but you know, regex..
        // we need to check to see if a source layer with the new serial number exists,
        // and if it does we keep incrementing the serial until it doesn't
        while (findDuplicateSourceItems('' + oldSourceBaseName + newSourceSerial)) {
            newSourceSerial++;
        }

        return prefix + oldSourceBaseName + suffix + '_' + newSourceSerial;
    } else {
        return false;
    }
}

function findDuplicateSourceItems(theName) {
  var allItems = app.project.items;
  var j;
  for (j = 1; j <= allItems.length; j++) {
    if (app.project.items[j].name === theName) {
      return true;
    }
  }

  return false;
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
