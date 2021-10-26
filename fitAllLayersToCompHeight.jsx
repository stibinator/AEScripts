// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app */
// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var theSelectedComps = app.project.selection;
app.beginUndoGroup('Fit all layers to selected comp width');
var n = 0;
try{
    if (! theSelectedComps.length){throw ("no comps selected. Silly rabbit.");}
    for(var i = 0; i < theSelectedComps.length; i++){
        var theComp = theSelectedComps[i];
        var theLayers = theComp.layers;
        for (var j=1; j <= theLayers.length; j++){ //stupid itemCollections and their 1-based indexing
            var lyr = theLayers[j];
            if(lyr.height){ //sound layers have 0 height, this just checks for them.
                var newScale = 100 * theComp.height / lyr.height;
                lyr.transform.scale.setValue([newScale, newScale, newScale]);
                // layers' anchor points may not be in the middle, hence the complicated hoo-hah below
                var newX = (newScale / 100) * (lyr.transform.anchorPoint.value[0] - lyr.width / 2) + theComp.width / 2;
                var newY = (newScale / 100) * (lyr.transform.anchorPoint.value[1] - lyr.height / 2) + theComp.height / 2;
                lyr.transform.position.setValue( [newX, newY, 0]);
                //mimic what the fit to comp height command does, zero any rotation
                lyr.transform.rotation.setValue(0);
                n++
            }
        }
    }
    // comment out this next line (add // to the start) if the alerts get too annoying
    alert ("fitted " + n + "layers to their comps' heights"); 
}
catch (er) {
    alert("error: " + er)
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
