// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// @include "./LST-master/LST.js"

function findBoundingBox(theComp, theLayers, useMotion) {
    // returns the left, right, top and bottom most point of a layer or set of layers in comp space
    // if motion is enabled it goes through all the frames looking for the bounding box containing all the motion.
    // note that this it calculates the value for the whole layer, even transparent parts.
    var boundingBox = { left: null, right: null, bottom: null, top: null };
    for (var i = 0; i < theLayers.length; i++) {
        var lyr = theLayers[i];
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
            var corners = [
                [0, 0],
                [lyr.width, 0],
                [lyr.width, lyr.height],
                [0, lyr.height],
            ];
            for (c = 0; c < 4; c++) {
                var corner = LST.toComp(lyr, corners[c]);
                if (boundingBox.left === null) {
                    //first point, initialise boundingBox
                    boundingBox.left = boundingBox.right = corner[0];
                    boundingBox.top = boundingBox.bottom = corner[1];
                } else {
                    if (corner[0] < boundingBox.left) {
                        boundingBox.left = corner[0];
                    }
                    if (corner[0] > boundingBox.right) {
                        boundingBox.right = corner[0];
                    }
                    if (corner[1] < boundingBox.top) {
                        boundingBox.top = corner[1];
                    }
                    if (corner[1] > boundingBox.bottom) {
                        boundingBox.bottom = corner[1];
                    }
                }
            }
        }
        theComp.time = currTime;
    }

    return boundingBox;
}

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
