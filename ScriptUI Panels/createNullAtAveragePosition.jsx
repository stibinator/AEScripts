// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
//Creates a parented 2D or 3D null in the average positions of selected 2D or 3D layers.
// If you have small 2d or 3d layers scattered in one corner of comp, select those layers and click "Create Null".

(function () {
    //_____________________________________buildUI
    function buildUI(thisObj) {
        var myPanel =
            thisObj instanceof Panel
                ? thisObj
                : new Window("palette", "ParenNull", undefined, {
                      resizable: true,
                  });

        myPanel.nullButton = myPanel.add(
            "button",
            [0, 0, 100, 30],
            "Create Avg Null"
        ); //Create Null

        myPanel.nullButton.onClick = function () {
            app.beginUndoGroup("create Null at Avg pos");
            mySelectedLayers = app.project.activeItem.selectedLayers;
            //check there are selected layers to avoid divide-by-zero error
            if (mySelectedLayers.length) {
                var totalPos = [0, 0, 0];
                var avgPos;

                //Find Average Postion of selected layers
                for (var i = 0; i < mySelectedLayers.length; i++) {
                    totalPos += mySelectedLayers[i]
                        .property("Transform")
                        .property("Position").value;
                }
                alert(totalPos);
                avgPos = totalPos / mySelectedLayers.length;
                alert(avgPos);
                // Create null using new avg positions.
                var myNull = app.project.activeItem.layers.addNull();
                myNull.name = "Mum";
                myNull
                    .property("Transform")
                    .property("Anchor Point")
                    .setValue([50, 50, 0]);
                myNull
                    .property("Transform")
                    .property("Position")
                    .setValue(avgPos);

                //Parent selected layers to new null
                for (var k = 0; k < mySelectedLayers.length; k++) {
                    mySelectedLayers[k].parent = myNull;
                }
            } else {
                alert("select some layers to find the average position");
            }
            app.endUndoGroup();
        };

        //--------------------- HelpButton
        myPanel.helpButton = myPanel.add("button", [105, 0, 135, 30], "?"); //helpButton
        myPanel.helpButton.onClick = function () {
            alert(
                "This Script is Created By Manjunath" +
                    "\r" +
                    "\r" +
                    "Select Any 2Dlayers or 3D layers \r and click create null button." +
                    "\r" +
                    "\r " +
                    "This script creates Null on average position \r of selected 2D or 3D layers."
            );
        };

        return myPanel;
    }

    var myToolsPanel = buildUI(this);
})();

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
