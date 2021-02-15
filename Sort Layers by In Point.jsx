// @target aftereffects
{
	// Sort Layers by In Point.jsx
	//
	// This script reorders layers in the active comp, sorted by inPoint.
	//
	
	function SortLayersByInPoint(thisObj)
	{
		var proj = app.project;
		var scriptName = "Sort Layers by In Point";
		
		
		function trimToFades(theLayer) {
			var opac = theLayer.opacity;
			
				var i = 1;
			while (i < opac.numKeys){
				if (opac.valueAtTime(opac.keyTime(i)) === 0){
					theLayer.inPoint = opac.keyTime(i);
				}
				if (opac.valueAtTime(opac.keyTime(opac.numkeys + 1 - i)) === 0){
					theLayer.outPoint = opac.keyTime(opac.numkeys + 1 - i);
				}
				i++;
			}
		}
		
		// change this to true if you want to leave locked layers untouched.
		var unlockedOnly = false;
		if (proj) {
			var activeItem = app.project.activeItem;
			if (activeItem != null && (activeItem instanceof CompItem)) {
				app.beginUndoGroup(scriptName);
				var theLayer;
				for (var index = 1; index <= activeItem.numLayers; index ++){
					theLayer = activeItem.layer(index);
					if ((! unlockedOnly)||(! theLayer.locked)){
						trimToFades(activeCompLayers);
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
	
	
	SortLayersByInPoint(this);
}
