// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app, PREFType, CompItem */

// this script automatically colourises the bones created by DUIK
// to match the label colour of the layer they're on
function asciiToRGB(str) {  
    var base = 20;
    var arr = [0, 0, 0];  
    var hexArr = [0, 0, 0];
    for (var i = 1, l = str.length; i < l; i ++) {  
        var hex = Number(str.charCodeAt(i)).toString(base);  
        hexArr[i-1] = hex;
        var theRGB = parseInt(hex, 16)/255;
        arr[i-1] = theRGB;  
    }  
    // alert(hexArr);
    return arr;  
} 

function getLabelColour(theLayer){
    var label = theLayer.label;

    var sect = "Label Preference Color Section 5";  
    var key = "Label Color ID 2 # " + label.toString();  
    var prefType = PREFType.PREF_Type_MACHINE_INDEPENDENT
    var thePref = app.preferences.getPrefAsString(sect,key, prefType);  
    // alert(asciiToRGB(thePref));
    return  asciiToRGB(thePref);

 }

app.beginUndoGroup('Label colours to DUIK Bones');
var theComp = app.project.activeItem;
if (theComp instanceof CompItem){
    var theLayers = theComp.selectedLayers;
    for (var i =0; i < theLayers.length; i++){
        if(theLayers[i]("Effects")("Bone")){
            theLayers[i]("Effects")("Bone")("Color").setValue(getLabelColour(theLayers[i]));
        }
    }
}
app.endUndoGroup();

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
