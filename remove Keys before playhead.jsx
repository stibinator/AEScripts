var BEFORE = true;
var AFTER = false;

function removeKeys(theProps, theTime, beforeOrAfter){

    for (var p=0, len=theProps.length; p < len ; p++) {
        var theProp = theProps[p];
        var i = 1;
        while (i <= theProp.numKeys ) {
            if ((theProp.keyTime(i) > theTime) & (beforeOrAfter === AFTER)){
                theProp.removeKey(i);
            } else if ((theProp.keyTime(i) < theTime) & (beforeOrAfter === BEFORE)){
                theProp.removeKey(i);
            } else {
                i++;
            }
        };
    }
}

app.beginUndoGroup("remove keys after playhead");
var theComp = app.project.activeItem;
if (theComp instanceof CompItem){
    removeKeys(theComp.selectedProperties, theComp.time, BEFORE);
}
app.endUndoGroup();