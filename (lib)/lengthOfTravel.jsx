// @target aftereffects
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
