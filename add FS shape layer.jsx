// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function () {
    app.beginUndoGroup("Add new shape layer");
    var curComp = app.project.activeItem;
    if (curComp) {
        var shapeLayer = curComp.layers.addShape();
        var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
        var myRect = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
        // myRect.property("ADBE Vector Star Type").setValue(2);
        // myRect.property("ADBE Vector Star Points").setValue(6);
        var size = myRect.property("ADBE Vector Rect Size");
        size.setValue([curComp.width, curComp.height]);
        var rectFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        rectFill.property("Color").setValue([Math.random(), Math.random(), Math.random(), 1])
        // var rectStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
        // rectStroke.property("Color").setValue([Math.random(), Math.random(), Math.random(), 1])
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
