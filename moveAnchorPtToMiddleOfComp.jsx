// @target aftereffects
//this is where the hoo-hah happens
function setAnchorPointToCenterOfComp(comp, theLayer)
{
	var compCenter=[comp.width/2, comp.height/2, 0];
	//compCenter is the center point of a comp - assuming that 0 on the z axis is the center
		{
			var pos=theLayers[i].position.value;
			var ap=theLayers[i].anchorPoint.value;
			var sc=theLayers[i].scale.value/100;
			var topFrontLeft = Array(3); //the position in comp space of the top, front, left corner of a layer
			var newAP = [0,0,0]; //the new anchor point
			
//~ 			var tfl=comp.layers.addNull();
				
			for (var j=0; j<3; j++){
				topFrontLeft[j] = 0-(pos[j] - (ap[j]* sc[j])-compCenter[j])/sc[j];
				//actually I'm not sure about how that works, but it does
				newAP[j] = (topFrontLeft[j]-compCenter[j] )/sc[j];
			}
//~ 			tfl.position.setValue(topFrontLeft);
			theLayers[i].anchorPoint.setValue(topFrontLeft);
			theLayers[i].position.setValue(compCenter);
			
			}
}

//the main hoo-hah
app.beginUndoGroup("moveAnchorToMiddleOfComp"); 
var curItem = app.project.activeItem;
//check that some layers have been selected
if (curItem == null || !(curItem instanceof CompItem)){
	alert("Please choose at least one layer and run the script again");
} else{
	theLayers=curItem.selectedLayers;
	if (theLayers.length == 0) {
		alert("Please choose at least one layer and run the script again");
	} else {
		for (var i=0; i<theLayers.length; i++)
		{
				setAnchorPointToCenterOfComp(curItem, theLayers[i])
		}
	}
}
app.endUndoGroup()
