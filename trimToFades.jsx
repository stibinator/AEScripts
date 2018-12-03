{
	// trimToFades.jsx
    // this script trims surplus off layers where the opacity is zero.
	//
	
	function trimLayersToFades(thisObj)
	{
		var proj = app.project;
		var scriptName = "Sort Layers by In Point";
		
		
		function trimToFades(theLayer, frameDuration) {
			var opac = theLayer.opacity;
            var i = 1;
            if (opac.expressionEnabled){
                while (theLayer.inPoint < theLayer.outPoint && opac.valueAtTime(theLayer.inPoint, false) === 0)
                {
                    theLayer.inPoint += frameDuration;
                }
                    
                while (theLayer.outPoint > theLayer.inPoint && opac.valueAtTime(theLayer.outPoint, false) === 0)
                {
                    theLayer.outPoint -= frameDuration;
                }
                    
            } else {
                while (i < opac.numKeys){
                    if (opac.valueAtTime(opac.keyTime(i), true) === 0){
                        theLayer.inPoint = opac.keyTime(i);
                    }
                    if (opac.valueAtTime(opac.keyTime(opac.numKeys + 1 - i), true) === 0){
                        theLayer.outPoint = opac.keyTime(opac.numKeys + 1 - i);
                    }
                    i++;
                }
            }
        }
        
        // change this to true if you want to leave locked layers untouched.
        var unlockedOnly = false;
        if (proj) {
            var activeItem = app.project.activeItem;
            var frameDuration = 1 / activeItem.frameRate;
            if (activeItem != null && (activeItem instanceof CompItem)) {
                app.beginUndoGroup(scriptName);
                var theLayer;
                for (var index = 1; index <= activeItem.numLayers; index ++){
                    theLayer = activeItem.layer(index);
                    if ((! unlockedOnly)||(! theLayer.locked)){
                        trimToFades(theLayer, frameDuration);
                    }
                }
                app.endUndoGroup();
            } else {
                alert("Please select an active comp to use this script", scriptName);
            }
        } else {
            alert("Please open a project first to use this script.", scriptName);
        }
    }
    
    
    trimLayersToFades(this);
}
