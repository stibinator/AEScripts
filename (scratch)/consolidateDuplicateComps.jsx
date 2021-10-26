// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function(){
    this.name = "consolidateDuplicateComps";
    app.beginUndoGroup(this.name);
    var theProj = app.project;
    if (theProj ){
        for(var i = 1; i <= theProj.numItems; i++){
            theComp = theProj.item(i);
            for (var j = i; j <= theProj.numItems; j++) {
                if (theComp.name === theProj.item(j).name) {
                    try theComp.replace(theProj.)
                }
            }
            
        }
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
