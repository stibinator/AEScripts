//  @target "aftereffects"
/* global system, app*/

var sourceFile = app.project.item(1).mainSource.file;
var ffpOutput = system.callSystem("ffmpeg.exe -i \"" + sourceFile.fsName + "\"   C:\\Users\\sdixon\\test.mp4");
// alert(ffpOutput);