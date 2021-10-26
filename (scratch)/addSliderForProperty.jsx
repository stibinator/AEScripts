// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function makeSlider(theComp, sliderSize, thePropName) {
  var theHandle = new Shape();
  var theSlide =  new Shape();
  var theLabel = (thePropName) ?
    theComp.addText(thePropName) :
    theComp.addText('Slider');
  var theSize = (sliderSize) ? [sliderSize[0] / 2, sliderSize[1] / 2] : [100, 20];
  var top = 0 - theSize[1];
  var left = 0 - theSize[0];
  var bot = theSize[1];
  var right = theSize[0];
  theHandle.vertices = [[left, left], [right, left], [right, right], [left, left]];
  theSlide.vertices = [[left, top], [left, bot], [left, s0], [right, s0], [right, top], [right, bot]];

  theLabel.position.setValue(bot * 2);
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
