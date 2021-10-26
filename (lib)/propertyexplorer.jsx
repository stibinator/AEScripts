// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var a = app.project.activeItem.selectedLayers[0];
var propertyArr = [];
for (var i=1; i <= a.numProperties; i++){
    propertyArr.push( exploreProperty(a.property(i)));
}
propertyArr

function exploreProperty(theProp){
    var resultArr = [];
    for (var i=1; i <= theProp.numProperties; i++){
        var b = theProp.property(i);
        if (b.numProperties > 1){
            resultArr.push( exploreProperty (b));
        } else {
            resultArr.push( b.name);
        }
    }
    return resultArr
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
