// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* global app */
(function () {
    var IN = true;
    var OUT = false;

    function alignSource(theLayer, theTime, inOrOut) {
        if (inOrOut === IN) {
            theLayer.startTime = theTime;
        } else {
            theLayer.startTime = theTime - theLayer.source.duration;
        }
    }
    var lyrs = app.project.activeItem.selectedLayers;
    for (var i = 0; i < lyrs.length; i++) {
        alignSource(lyrs[i], app.project.activeItem.time, OUT);
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
