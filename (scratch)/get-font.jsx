// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var lyr1 = app.project.activeItem.selectedLayers[0];
theText = lyr1.sourceText.value;
var font = theText.font;
// theText.fontFamily = "Yu Gothic";
theText.font = "YuGothic-Bold";

theText.text=font;
lyr1.sourceText.setValue(theText);
lyr1.sourceText.value.font 
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
