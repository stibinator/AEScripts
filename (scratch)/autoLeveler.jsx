// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var theLayer = app.project.activeItem.selectedLayers[0];
if (! theLayer) {alert ("select a layer")}
var highlights = makeSamplePoint(theLayer, "Highlights");
var mids = makeSamplePoint(theLayer, "Mids");
var lows = makeSamplePoint(theLayer, "Lows");
calculateValuesFromSample(lows, 10, theLayer)

function calculateValuesFromSample(thePoint, radius, theLayer){
    var indx = theLayer.index;
    var ptNm = thePoint.name;
    var tempSlider = theLayer.property("ADBE Effect Parade").addProperty("Slider Control");
    var theXpression = "var theSample = thisComp.layer(" + indx + ").sampleImage(effect(\""+ptNm + "\")(\"Point\"), radius = [" + radius + "," + radius + "], postEffect = false, t= time);\nrgbToHsl(theSample)[2]"
    tempSlider("Slider").expression = theXpression;
    theSamples = [];
    for (var i = 0; i < theLayer.duration; i++){
        
    }
}



function makeSamplePoint(theLayer, pointName){
    if (! pointName){ pointName = "sample point"}
    var thePoint = theLayer.property("ADBE Effect Parade").addProperty("Point Control");
    thePoint.name = pointName;
    return thePoint;
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
