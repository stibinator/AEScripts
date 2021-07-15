// @target aftereffects
//freeze expressions at first frame
//freezes expressions on layers

function freezeExpression(theProperty){
    if (theProperty.expression){
		theProperty.setValue(theProperty.valueAtTime(0, false));
		theProperty.expressionEnabled = false;
	}
}

function traverseProperties(propertyGroup){
	if (propertyGroup){
        //alert(propertyGroup.numProperties);
		if (propertyGroup.numProperties ){ 
			for(var pp=1; pp<= propertyGroup.numProperties; pp++){
				traverseProperties(propertyGroup.property(pp));
				freezeExpression(propertyGroup);
			}
		} else { 
            freezeExpression(propertyGroup);
		}
	}
}

function freezeAllExpressions()
{
  var proj = app.project;
  var scriptName = "Freeze Expressions";

  // change this to true if you want to leave locked layers untouched.
  var unlockedOnly = false;
  if (proj) {
    var theLayers = app.project.activeItem.selectedLayers;
    if (theLayers==null) {
         theLayers = app.project.activeItem.layers
        }
    if (theLayers !== null)  {
		app.beginUndoGroup(scriptName);
		var total_number = theLayers.length;
		for (var i=0; i<total_number; i++){

			if (! (unlockedOnly && theLayers[i].locked)){
				for(var p=1; p<= theLayers[i].numProperties; p++){
					if (theLayers[i].property(p)){
						propertyGroup = theLayers[i].property(p);
						traverseProperties(propertyGroup)
					}
				}
			}
		}
      app.endUndoGroup();
    } else {
      alert("Please select a comp to use this script", scriptName);
    }
  } else {
    alert("Please open a project first to use this script, you silly rabbit", scriptName);
  }
}


freezeAllExpressions ();
