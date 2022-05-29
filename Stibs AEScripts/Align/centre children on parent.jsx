// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
//if no layers are selected do them all, a'la lightwave
(function () {
  var theLayers = app.project.activeItem.selectedLayers
  if (theLayers.length === 0) {
    theLayers = app.project.activeItem.layers;
  }

  for (i = 0; i < theLayers.length; i++) {
    if (theLayers[i].parent) {
      theLayers[i].position.value = [theLayers[i].parent.width / 2, theLayers[i].parent.height / 2, 0]
    }
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
