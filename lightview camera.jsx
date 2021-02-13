// @target aftereffects
var theComp = app.project.activeItem;
var noLightSelected =true;
if (theComp instanceof CompItem){
    app.beginUndoGroup("Add LightView camera")
    var theLights = theComp.selectedLayers;
    for (i=0; i < theLights.length; i++){
        var theLight = theLights[i];
        if (theLight instanceof LightLayer){
            if ( theLight.lightType === LightType.SPOT || theLight.lightType === LightType.PARALLEL){
                noLightSelected = false;
                // do the things
                theCam = theComp.layers.addCamera("LightView_" + theLight.name, [0,0]);
                

                // so that we don't have to do layer space transforms, 
                // splice the camera into the light's parenting hierarchy
                if (theLight.parent){
                    theCam.parent = theLight.parent;
                    
                    }
                
                // sync the cam to the light
                theCam.position.setValue(theLight.transform.position.value);
                theCam.transform.pointOfInterest.setValue(theLight.transform.pointOfInterest.value);
                
                theCam.cameraOption.zoom.expression = 'Math.abs((thisComp.width/2) / Math.tan(degreesToRadians(thisComp.layer("'+ theLight.name + '").lightOption.coneAngle/2)))';
                // parent the light to the cam
                theLight.parent = theCam;
                theLight.transform.pointOfInterest.expression = '[0, 0, length(thisComp.layer("' + theCam.name + '").transform.position, thisComp.layer("' + theCam.name + '").transform.pointOfInterest)]';
                
            }
        } 
    }
    app.endUndoGroup();
}
if (noLightSelected){
    alert("choose a distant or spot light before running this script");
}
