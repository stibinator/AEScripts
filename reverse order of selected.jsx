/* global app*/


		// Sort Layers by In Point.jsx
	//
	// This script reorders layers in the active comp, sorted by inPoint.
	//
	
function indexCompare(layerObject, anotherLayerObject){
	return layerObject.index - anotherLayerObject.index;
}

function reverseOrder(thelayers) {
	var total_number = thelayers.length;
	thelayers.sort(indexCompare);
	for (var i=0; i<total_number-1; i++){
		thelayers[i].moveAfter(thelayers[total_number-1]);
	}
}
function reverseOrderOfSelected(theLayers)
{

	// change this to true if you want to leave locked layers untouched.
	var unlockedOnly = false;
	if (theLayers != null) {
		app.beginUndoGroup("reverse layer order");
		reverseOrder(theLayers, unlockedOnly);
		app.endUndoGroup();
	} else {
		alert("Please select some layers to use this script", "Reverse layer order");
	}
}
	
	
reverseOrderOfSelected(app.project.activeItem.selectedLayers);
