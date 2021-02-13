var sampleTime = theComp.frameDuration / 100 ;

var theComp = app.project.activeItem;
if (theComp){
    app.beginUndoGroup("extend animation");
    var theProps = theComp.selectedProperties;
    for (var p = 0; p < theProps.length; p++){
        var prop = theProps[p];
        extendMotion(theProps[p])
    }
    app.endUndoGroup();
}

function extendMotion(prop){
    if (prop.numKeys){
        var lastkeyTime = prop.keyTime(prop.numKeys);
        var firstKeyTime = prop.keyTime(1);
        if (theComp.duration > lastkeyTime){
            var lastKFVal = prop.keyValue(prop.numKeys);
            var prevVal = prop.valueAtTime(lastkeyTime - sampleTime, true)
            var lastKeySpeed = (lastKFVal - prevVal) / sampleTime;
            prop.setValueAtTime(theComp.duration, lastKFVal + lastKeySpeed * (theComp.duration - lastkeyTime));
        }
        if (firstKeyTime > 0){
            var firstKFVal = prop.keyValue(1);
            var postVal = prop.valueAtTime(firstKeyTime + sampleTime, true)
            var firstKeySpeed = (postVal - firstKFVal) / sampleTime ;
            prop.setValueAtTime(0, firstKFVal + firstKeySpeed * (0 - firstKeyTime));
        }
    }
    
}