// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function getCompLayers(theComp, skipLocked){
    var theLayers = [];
    for (var i =1; i <= theComp.numLayers; i++){
        if ((!skipLocked)||(! theComp.layer(i).locked)){
        theLayers.push(theComp.layer(i));
        }
    }
    return theLayers
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
