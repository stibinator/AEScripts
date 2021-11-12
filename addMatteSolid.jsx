// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// @include "./(lib)/findBoundingBox.jsx"
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
