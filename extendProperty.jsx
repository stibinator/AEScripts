// @target aftereffects
var h = 0.004; //se https://blob.pureandapplied.com.au/planck-limit-for-ae/
function extendProps(theProps, inTime, outTime){

    for (var p=0, len=theProps.length; p < len ; p++) {
        var theProp = theProps[p];
        if (theProp.numKeys){
            //keys number from 1 because WTF Adobe
            firstKeyTime = theProp.keyTime(1);
            firstKeySpeed = (theProp.valueAtTime(firstKeyTime + h, false) - theProp.valueAtTime(firstKeyTime, false)) / h
            lastKeyTime = theProp.keyTime(theProp.numKeys);
            lastKeySpeed = (theProp.valueAtTime(lastKeyTime, false) - theProp.valueAtTime(lastKeyTime-h, false)) / h
            valueAtIn = theProp.valueAtTime(firstKeyTime, false) - firstKeySpeed * (firstKeyTime - inTime);
            theProp.setValueAtTime(inTime, valueAtIn);
            valueAtOut =theProp.valueAtTime(lastKeyTime, false) + lastKeySpeed * ( outTime - lastKeyTime);
            theProp.setValueAtTime(outTime, valueAtOut);
        }
    }
}
app.beginUndoGroup("Extend Property");
if (app.project.activeItem){
    var theLayers = app.project.activeItem.selectedLayers;
    for (var i=0; i < theLayers.length; i++){
        theProps = theLayers[i].selectedProperties;
        extendProps(theProps, theLayers[i].inPoint, theLayers[i].outPoint)
    }
} else {
    alert("choose a property to extend, silly rabbit")
}
app.endUndoGroup();
