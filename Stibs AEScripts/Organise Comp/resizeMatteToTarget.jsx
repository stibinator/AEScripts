// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    if (app.project && app.project.activeItem) {
        var theComp = app.project.activeItem;
        var selectedMattes = app.project.activeItem.selectedLayers;
        for (var i = 0; i < selectedMattes.length; i++) {
            var matteLayer = selectedMattes[i];
            if (matteLayer.isTrackMatte) {
                var targetLayer = theComp.layer(matteLayer.index + 1);
                matteLayer.source.width = targetLayer.width;
                matteLayer.source.height = targetLayer.height;
                matteLayer.setParentWithJump(targetLayer);
                matteLayer.property("Transform").property("Position").setValue(targetLayer.property("Transform").property("Anchor Point").value);
                matteLayer.inPoint = targetLayer.inPoint;
                matteLayer.outPoint = targetLayer.outPoint;
            }
        }
    }
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
