// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    var scriptName = "precomp with link";
    app.beginUndoGroup(scriptName);
    var theComp = app.project.activeItem;
    if (theComp) {
        if (theComp.selectedLayers.length) {
            var newCompName = theComp.selectedLayers[0].name + " precomp";
            var indices = [];
            for (var i = 0; i < theComp.selectedLayers.length; i++) {
                theComp.selectedLayers[i].wasSelected = true;
            }

            for (var i = 1; i <= theComp.numLayers; i++) {
                if (theComp.layer(i).wasSelected) {
                    theLayer = theComp.layer(i);
                    $.writeln(theLayer.name);
                    if (theLayer.parent) {
                        indices.push(theLayer.index);
                        var linkNull = theComp.layers.addNull();
                        linkNull.moveToEnd();
                        linkNull.setParentWithJump(theLayer.parent);
                        linkNull.position.setValue([0, 0, 0]);
                        linkNull.name = theLayer.name + "_link";
                        theLayer.parent = linkNull;
                        indices.push(linkNull.index);
                        linkNull.position.expression =
                            "let parentLayer = comp('" +
                            theComp.name +
                            "').layer('" +
                            linkNull.parent.name +
                            "');\nparentLayer.toComp(parentLayer.anchorPoint);";
                        linkNull.rotation.expression =
                            "let parentLayer = comp('" +
                            theComp.name +
                            "').layer('" +
                            linkNull.parent.name +
                            "');\nlet unitVec = parentLayer.toCompVec([0,1]);\n0 - radiansToDegrees(Math.atan2(unitVec[0], unitVec[1]));";
                        linkNull.scale.expression =
                            "let parentLayer = comp('" +
                            theComp.name +
                            "').layer('" +
                            linkNull.parent.name +
                            "');let parentScale = value;\nwhile(parentLayer){\n  for (i = 0; i < 2; i++){\n    parentScale[i] *= parentLayer.scale[i]/100;\n  }\n  parentLayer = (parentLayer.hasParent)? parentLayer.parent: null;\n}\nparentScale;";
                    }
                }
            }
            var newComp = theComp.layers.precompose(indices, newCompName, true);
        }
    }
    app.endUndoGroup();
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
