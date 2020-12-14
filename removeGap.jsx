app.beginUndoGroup("removeGap");
var curComp = app.project.activeItem;
var curTime = curComp.time;
var theLayers= curComp.layers;
var afterGapLayers = [];
var lastOutPointBeforeGap = 0;
var firstInPointAfterGap = curComp.duration;
for (i=1; i<= theLayers.length; i++){
    if (theLayers[i].inPoint > curTime){
        afterGapLayers.push(theLayers[i]);
        if (theLayers[i].inPoint < firstInPointAfterGap){
            firstInPointAfterGap = theLayers[i].inPoint;
        }
     } else {
         if (theLayers[i].outPoint > lastOutPointBeforeGap){
             lastOutPointBeforeGap = theLayers[i].outPoint;
         }
     }
 }
var gapLength = firstInPointAfterGap - lastOutPointBeforeGap;
if (gapLength > 0){
    for (i=0; i < afterGapLayers.length; i++){
            afterGapLayers[i].startTime = afterGapLayers[i].startTime - gapLength;
    }
    curComp.duration = curComp.duration - gapLength;
} else {
    alert("No gap found!\nPlace the playhead in a gap before running this script.");
    }

curComp.time=lastOutPointBeforeGap;
app.endUndoGroup();  