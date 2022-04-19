// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

function findBoundingBox(theComp, theLayers, useMotion) {
    // returns the left, right, top and bottom most point of a layer or set of layers in comp space
    // if motion is enabled it goes through all the frames looking for the bounding box containing all the motion.
    // note that this it calculates the value for the whole layer, even transparent parts.
    var boundingBox = { left: null, right: null, bottom: null, top: null };
    for (var i = 0; i < theLayers.length; i++) {
        var lyr = theLayers[i];
        var ptCtrlTL = lyr.property("Effects").addProperty("ADBE Point Control");
        ptCtrlTL.name = "temp_Top_Left_ToComp";
        ptCtrlTL.property("point").expression = "let sr = thisLayer.sourceRectAtTime(time); thisLayer.toComp([sr.left, sr.top])";
        var ptCtrlBR = lyr.property("Effects").addProperty("ADBE Point Control");
        ptCtrlBR.name = "temp_Bottom_Right_ToComp";
        ptCtrlBR.property("point").expression = "let sr = thisLayer.sourceRectAtTime(time); thisLayer.toComp([sr.width, sr.height]+[sr.left, sr.top]) ";
        var currTime = theComp.time;
        if (useMotion) {
            startTime = lyr.inPoint > 0 ? lyr.inPoint : 0;
            endTime =
                lyr.outPoint < theComp.duration
                    ? lyr.outPoint
                    : theComp.duration;
        } else {
            startTime = endTime = currTime;
        }
        for (t = startTime; t <= endTime; t += theComp.frameDuration) {
            theComp.time = t;
            var leftTop = lyr.property("Effects").property("temp_Top_Left_ToComp").property("Point").valueAtTime(t, false);
            var rightBot = lyr.property("Effects").property("temp_Bottom_Right_ToComp").property("Point").valueAtTime(t, false);
            if (null === boundingBox.left | boundingBox.left > leftTop[0]){boundingBox.left = leftTop[0]}
            if (null === boundingBox.right | boundingBox.right < rightBot[0]){boundingBox.right = rightBot[0]}
            if (null === boundingBox.top | boundingBox.top > leftTop[1]){boundingBox.top = leftTop[1]}
            if (null === boundingBox.bottom | boundingBox.bottom < rightBot[1]){boundingBox.bottom = rightBot[1]}
        }
        theComp.time = currTime;
        lyr.property("Effects").property("temp_Top_Left_ToComp").remove();
        lyr.property("Effects").property("temp_Bottom_Right_ToComp").remove();
    }
    return boundingBox;
}

(function () {
    app.beginUndoGroup("add matte layer");
    if (app.project) {
        var theComp = app.project.activeItem;
        if (theComp) {
            var theLayers = theComp.selectedLayers;
            if (theLayers.length > 0) {
                var bounds = [];
                for (var i = 0; i < theLayers.length; i++) {
                    theLayers[i].originalIndex = i;
                    // var theLayer = [theLayers[i]];
                    // bounds.push({"bbox": findBoundingBox(theComp, theLayer, false), "name": theLayers[i].name});
                    bounds.push({ "bbox": { "width": theLayers[i].width, "height": theLayers[i].height }, "name": theLayers[i].name });
                }
                for (var n = 0; n < bounds.length; n++) {
                    // var width = Math.round(bounds[n].bbox.right - bounds[n].bbox.left);
                    // var height = Math.round(bounds[n].bbox.bottom - bounds[n].bbox.top);
                    var width = Math.round(bounds[n].bbox.width);
                    var height = Math.round(bounds[n].bbox.height);
                    newSolid = theComp.layers.addSolid([0.5, 0.5, 0.5], bounds[n].name + "_matte", width, height, theComp.pixelAspect);
                    newSolid.targetLayer = n;
                }
                for (var i = 0; i < bounds.length; i++) {
                    var lyr = 1;
                    while (lyr <= theComp.numLayers && (theComp.layer(lyr).originalIndex !== i)) {
                        lyr++
                    }
                    var matte = 1;
                    while (matte <= theComp.numLayers && (theComp.layer(matte).targetLayer !== i)) {
                        matte++
                    }
                
                    if (lyr <= theComp.numLayers && matte <= theComp.numLayers) {
                        var matteLayer = theComp.layer(matte);
                        var originalLayer = theComp.layer(lyr);
                        matteLayer.setParentWithJump(originalLayer);
                        matteLayer.property("Transform").property("Position").setValue(originalLayer.property("Transform").property("Anchor Point").value);
                        originalLayer.trackMatteType = TrackMatteType.ALPHA;
                    
                        targetLayer = originalLayer;
                        matteLayer.moveBefore(originalLayer);
                        matteLayer.inPoint = originalLayer.inPoint;
                        matteLayer.outPoint = originalLayer.outPoint;
                        matteLayer.enabled = false;
                        targetLayer.originalIndex = null;
                        matteLayer.targetLayer = null;
                    }
                }
            }
        }
    }
    app.endUndoGroup();
})()
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
