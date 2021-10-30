// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
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

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
