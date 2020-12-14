var theComp = app.project.activeItem;
var theLayers = theComp.layers;
for (i=0; i < theLayers.length ; i++){
    theLayer = theLayers[i+1];
    var opac  = theLayer.opacity;
    opac.setValueAtTime(theLayer.inPoint, 0);
        opac.setValueAtTime(theLayer.inPoint + theComp.frameDuration * 12, 100);
        opac.setValueAtTime(theLayer.outPoint, 0);
        opac.setValueAtTime(theLayer.outPoint - theComp.frameDuration * 16, 100);
    
 }