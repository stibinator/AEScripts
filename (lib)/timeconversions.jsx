// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* jshint ignore:start */
// Code here will be ignored by JSHint.
//@include "defaultFor.jsx"
/* jshint ignore:end */
function time2Frames(time, theComp) { //eslint-disable-line no-unused-vars
  comp = defaultFor(theComp, app.project.activeItem);
  return time / comp.frameDuration;
}

function frames2Time(frame, theComp) { //eslint-disable-line no-unused-vars
  comp = defaultFor(theComp, app.project.activeItem);
  return frame * comp.frameDuration;
}

function percentToframes(percent, theComp) { //eslint-disable-line no-unused-vars
  comp = defaultFor(theComp, app.project.activeItem);
  return (comp.duration * percent / (100 * comp.frameDuration));
}

function timeToHMSF(inputTime, theComp) { //eslint-disable-line no-unused-vars
  // I Wrote this when I didn't know about the global
  //timeToCurrentFormat() function
  //it's just here for legacy reasons
    //convert theTime in seconds to h:MM:SS:FF string
  comp = defaultFor(theComp, app.project.activeItem);
  // theTime = inputTime;
  // if (comp) {
  //   var hr = 3600;
  //   var min = 60;
  //   var sec = 1;
  //   var hrs = Math.floor(theTime / hr);
  //   theTime = theTime % hr;
  //   var mins = Math.floor(theTime / min);
  //   theTime = theTime % min;
  //   var secs = Math.floor(theTime / sec);
  //   theTime = theTime % 1;
  //   var frames = Math.round(theTime / comp.frameDuration);
    // return '' + hrs + ':' + zeroPad(2, mins) + ':' + zeroPad(2, secs) + ':' + zeroPad(2, frames);
  // }
  return timeToCurrentFormat(inputTime, comp.frameRate);
}

function framesToHMSF(frames, comp) { //eslint-disable-line no-unused-vars
  return timeToCurrentFormat(frames2Time(frames, comp), comp.frameRate);
}

function percentToHMSF(percent, theComp) { //eslint-disable-line no-unused-vars
  comp = defaultFor(theComp, app.project.activeItem);
  if (comp instanceof CompItem) {
    return framesToHMSF(percentToframes(percent, comp), comp);
  }
  return false;
}
function zeroPad(digits, num, pad) { //eslint-disable-line no-unused-vars
  pad = defaultFor(pad, '0');
  for (var i = 0; i < digits; i++) {
    pad += '0';
  }
  return (pad + num).slice(0 - digits);
}

function parseTimeString(theString, comp) { //eslint-disable-line no-unused-vars
  comp = defaultFor(comp, app.project.activeItem);
  if (comp instanceof CompItem) {
    theString = '' + theString;
        //this took ages to work out
        //allows user to lazily enter timecode, eg to enter 1 minute you type 1.. rather than 0:1:0:0
    var hrsStr = theString.match(/(\d+)\D\d*\D\d*\D\d*$/); //matches  "0:1:2:3" and "0..." and returns '0'
    var minStr = theString.match(/(\d+)\D\d*\D\d*$/); //matches "0:1:2:3" , "1,2.3" and "1.." and returns 1
    var secStr = theString.match(/(\d+)\D\d*$/); //and so on..
    var frmStr = theString.match(/(\d+)$/);
        //return the result in seconds
        /* jshint ignore:start */
        // Code here will be ignored by JSHint.
    var hrs = hrsStr
            ? parseInt(hrsStr)
            : 0;
    var min = minStr
            ? parseInt(minStr)
            : 0;
    var sec = secStr
            ? parseInt(secStr)
            : 0;
    var frm = frmStr
            ? parseInt(frmStr)
            : 0;
        /* jshint ignore:end */
    return 3600 * hrs + 60 * min + sec + comp.frameDuration * frm;
  }
  return false;
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
