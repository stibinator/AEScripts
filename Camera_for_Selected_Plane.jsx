// @target aftereffects
/*
Camera_for_Selected_Plane.jsx
Version 1
After Effects JavaScript by Christopher R. Green
(the guy who runs crgreen.com)
Places a camera in comp pointed at selected layer
*/

var activeItem = app.project.activeItem;

if ( (activeItem == null) || !(activeItem instanceof CompItem) ) {
	
} else {
	var selectedLayers = activeItem.selectedLayers;
	var selNum = activeItem.selectedLayers.length;
	if (!(selNum == 1)) {
		if (selNum == 0) {selNum = "No"} 
		alert(selNum + " layers selected. You need to select one layer.");
	} else {
		mainPlane = selectedLayers[0];
		origMainPlane = null;
		planesParent=mainPlane.parent;
		
		if (!mainPlane.threeDLayer) {
			alert("Not a 3D Layer.");
		}else{
			
			planeName = mainPlane.name;
			///////////////////////////////////////////////////////
			app.beginUndoGroup("Place Camera");
			if (planesParent != null) {
				// swicheroo
				origMainPlane = mainPlane;
				mainPlane = ( mainPlane.duplicate() );
				// 'bake' parented values:
				mainPlane.parent = null;
			}
			
			startPos = mainPlane.position.value;
			ori=mainPlane.property("orientation").value;
			rots=[mainPlane.property("X Rotation").value, mainPlane.property("Y Rotation").value, mainPlane.property("Z Rotation").value];
			// there is undoubtedly a formula to calculate the best distance, but for now, do rough back-off ...
			scFctrX=mainPlane.property("Scale").value[0]*.01;
			scFctrY=mainPlane.property("Scale").value[1]*.01;
			// based on size (scale factored in) of plane
			zAdj=( (mainPlane.width*scFctrX)+(mainPlane.height*scFctrY) )/2;
			if (planesParent != null) {
				// switcheroo backeroo
				doomedLayer = mainPlane;
				mainPlane=origMainPlane;
				doomedLayer.remove();
			}
			
			///////////////////////////////////////////////////////
			newName=(planeName.substr(0,27));//truncate for new object's name
			newCam=activeItem.layers.addCamera((newName + "_cam"), [activeItem.width/2, activeItem.height/2]);
			newCam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
			// light gets positioned at plane's point in space, but backed off a bit in z
			newCam.property("position").setValue([startPos[0], startPos[1], (startPos[2]-zAdj)]);
			
			tempNull = activeItem.layers.addNull();
			tempNull.threeDLayer=true;
			// i don't think this makes any diff, but it's aesthetically pleasing to me (i'm insane)
			tempNull.property("Anchor Point").setValue([50, 50, 0]);
			
			// tempNull is placed at plane's point in space
			tempNull.property("position").setValue(startPos);
			// make tempNull light's parent
			newCam.parent = tempNull;
			
			// shake
			
			// rotate tempNull so that light is oriented correctly
			tempNull.property("orientation").setValue(ori);
			tempNull.property("X Rotation").setValue(rots[0]);
			tempNull.property("Y Rotation").setValue(rots[1]);
			tempNull.property("Z Rotation").setValue(rots[2]);
			
			// and bake
			
			doomedNullSrc=tempNull.source;
			//note: must delete layer first, then source in order to 'bake' parented values (cannot just remove source)
			newCam.parent=null;
			tempNull.remove();
			doomedNullSrc.remove();
			newCam.selected = true;
			newCam.selected = true;
			app.endUndoGroup();
			///////////////////////////////////////////////////////
		}
	}
}
