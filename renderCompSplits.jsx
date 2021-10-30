// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function(){
    this.name = "renderCompSplits";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        var theMarkers = theComp.markerProperty;
        // matrkers are 1 indexed, because Adobe
        for (var i = 0; i <= theMarkers.numKeys; i++){
            var newRQitem = app.project.renderQueue.items.add(theComp);
            var startTime = (i === 0) ? 0 : theMarkers.keyTime(i);
            var duration = (i === theMarkers.numKeys)? theComp.duration - startTime: theMarkers.keyTime(i + 1) - startTime;
            var settings = {
                "Time Span Duration": "" + duration,
                "Time Span Start": "" + startTime
            }
            newRQitem.setSettings(settings);
            var om = newRQitem.outputModule(1)
            var newName = om.file.name.replace(/([_\[#\]]*\.\w+$)/, "_" + pad(i+1, 3) + "$1");
            var omSettings = om.getSettings();
            om.setSettings({ "Output File Info": { "File Name": newName, "Base Path": omSettings["Output File Info"]["Base Path"] } }); 
        }
    }
    app.endUndoGroup();

    function pad ( num, size ) {
        if (num.toString().length >= size) return num;
            return ( Math.pow( 10, size ) + Math.floor(num) ).toString().substring( 1 );
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
