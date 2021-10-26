// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function include(includePath){$.evalFile(new File($.fileName).path + "/lib/" + includePath);}
include("defaultFor.jsx");
include("timeconversions.jsx");
include("spacetransforms.jsx");
include("vectormaths.jsx");

function calculateLengthOfTravel(theLayer, startFrame, endFrame) {
	startFrame= defaultFor(startFrame, 0);
	endFrame = defaultFor(endFrame, time2Frames(app.project.activeItem.duration));
	var pos1 = theLayer.property("Transform").property("Position").valueAtTime(frames2Time(startFrame), false);
	var lengthOfTravel = 0;
	for (var t = startFrame; t <= endFrame; t++) {
		var pos2 = theLayer.property("Transform").property("Position").valueAtTime(frames2Time(t), false);
		lengthOfTravel += vectorLength(pos1, pos2);
		pos1 = pos2;
	}
	return lengthOfTravel;
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
