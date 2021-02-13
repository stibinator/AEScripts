// @target aftereffects
{
	// trimToFades.jsx
    // this script trims surplus off layers where the opacity is zero.
	//
	// @target aftereffects
    // @includepath ./(lib)/
    // @include compExtras.jsx
	
    function trimLayersToFades(thisObj)
	{
		var proj = app.project;
		var scriptName = "Trim To Fades";
		
		
		function trimToFades(theLayer, frameDuration, doLengthen) {
			var opac = theLayer.opacity;
            
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
                var i = 1;
                while (i < opac.numKeys && opac.valueAtTime(opac.keyTime(i), true) === 0){
                    if (doLengthen||theLayer.inPoint<opac.keyTime(i)){
                        theLayer.inPoint = opac.keyTime(i);
                    }
                    i++;
                }
                i = opac.numKeys;
                
                while (i > 1 && opac.valueAtTime(opac.keyTime(i), true) === 0){
                    if (doLengthen||theLayer.outPoint>opac.keyTime(i)){
                        theLayer.outPoint = opac.keyTime(i);
                    }
                    i--;
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
                var theLayers = (activeItem.selectedLayers.length > 0)? activeItem.selectedLayers: getCompLayers(activeItem, unlockedOnly);
                for (var i = 0; i < theLayers.length; i ++){
                    theLayer = theLayers[i];
                    if ((! unlockedOnly)||(! theLayer.locked)){
                        trimToFades(theLayer, frameDuration, true);
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
