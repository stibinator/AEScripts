// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var h = 0.004; //see https://blob.pureandapplied.com.au/planck-limit-for-ae/
function extendProps(theProps, inTime, outTime){

    for (var p=0, len=theProps.length; p < len ; p++) {
        var theProp = theProps[p];
        if (theProp.numKeys){
            //keys number from 1 because WTF Adobe
            firstKeyTime = theProp.keyTime(1);
            firstKeySpeed = (theProp.valueAtTime(firstKeyTime + h, false) - theProp.valueAtTime(firstKeyTime, false)) / h
            lastKeyTime = theProp.keyTime(theProp.numKeys);
            lastKeySpeed = (theProp.valueAtTime(lastKeyTime, false) - theProp.valueAtTime(lastKeyTime-h, false)) / h
            valueAtIn = theProp.valueAtTime(firstKeyTime, false) - firstKeySpeed * (firstKeyTime - inTime);
            theProp.setValueAtTime(inTime, valueAtIn);
            valueAtOut =theProp.valueAtTime(lastKeyTime, false) + lastKeySpeed * ( outTime - lastKeyTime);
            theProp.setValueAtTime(outTime, valueAtOut);
        }
    }
}
app.beginUndoGroup("Extend Property");
if (app.project.activeItem){
    var theLayers = app.project.activeItem.selectedLayers;
    for (var i=0; i < theLayers.length; i++){
        theProps = theLayers[i].selectedProperties;
        extendProps(theProps, theLayers[i].inPoint, theLayers[i].outPoint)
    }
} else {
    alert("choose a property to extend, silly rabbit")
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
