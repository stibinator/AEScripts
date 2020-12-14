/* global app */
/* @target aftereffects */
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
                var newScale = 100 * theComp.width / lyr.width;
                lyr.transform.scale.setValue([newScale, newScale, newScale]);
                // layers' anchor points may not be in the middle, hence the complicated hoo-hah below
                var newX = (newScale / 100) * (lyr.transform.anchorPoint.value[0] - lyr.width / 2) + theComp.width / 2;
                var newY = (newScale / 100) * (lyr.transform.anchorPoint.value[1] - lyr.height / 2) + theComp.height / 2;
                lyr.transform.position.setValue( [newX, newY, 0]);
                //mimic what the fit to comp width command does, zero any rotation
                lyr.transform.rotation.setValue(0);
                n++
            }
        }
    }
    alert ("fitted " + n + "layers to their comps' widths");
}
catch (er) {
    alert("error: " + er)
}
app.endUndoGroup();