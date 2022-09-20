
(function () { // iife wrapper
    if (app.project) { // make sure there's a project open
        var projItems = app.project.items; //all the project items
        // flag that this is the beginning of an 
        // undo group, so that everything can be undone in one step
        app.beginUndoGroup("Delete all cameras");
        var cameraCount = 0;
        for (var i = 1; i <= projItems.length; i++) {
            // loop through all the project items looking for comps
            if (projItems[i] instanceof CompItem) {
                // found a comp, 
                var theLayers = projItems[i].layers;
                for (j = theLayers.length; j > 0; j--) {
                    // now loop through the layers looking for cameras
                    // we go backwards because deleting a layer would make our count out of order
                    if (theLayers[j] instanceof CameraLayer) {
                        // found a camera, now delete it
                        theLayers[j].remove();
                        cameraCount++;
                    }
                }
            }
        }
        app.endUndoGroup();
        alert("deleted " + cameraCount + " camera" + ((cameraCount>1)?"s.": "."));
    }
})()