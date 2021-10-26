// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function buildUI(thisObj) {
    if (thisObj instanceof Panel) {
      var myPanel = thisObj;
   } else {
      var myPanel = new Window('palette', 'createshapes', undefined);//, {resizable: true})
        var  newWindow = true;
   }
  myPanel.orientation = "row";
  labelGrp = myPanel.add('group', undefined);
  labelGrp.orientation = "column";
  labelGrp.alignChildren = ["left", "top"]

  sliderGrp = myPanel.add('group', undefined);
  sliderGrp.orientation = "column";

  textGrp = myPanel.add('group', undefined);
  textGrp.orientation = "column";

  butnGrp = myPanel.add('group', undefined);
  butnGrp.orientation = "column";
  butnGrp.alignChildren = ["left", "top"]

  labelGrp.add("statictext", undefined, "number");
  numberSlider = sliderGrp.add('slider',undefined, value=100, minvalue=1, maxvalue=500);
  numberBox = textGrp.add('edittext',undefined, "100");

  labelGrp.add("statictext", undefined, "max speed");
  maxSpeed = sliderGrp.add('slider',undefined, value=100, minvalue=1, maxvalue=1000);
  speedBox = textGrp.add('edittext',undefined, maxSpeed.value);

  labelGrp.add("statictext", undefined, "max angle");
  maxAngle = sliderGrp.add('slider',undefined, value=45, minvalue=0, maxvalue=90);
  angleBox = textGrp.add('edittext',undefined, maxAngle.value);

  newLayersBtn = butnGrp.add('checkbox', undefined, "create layers");
  startButton= butnGrp.add('button', undefined, 'start');

  numberSlider.onChange = function(){
    numberBox.text = String(Math.round(numberSlider.value));
  }

  numberBox.onChange = function(){
    if (numberBox.text*1 | numberBox.text == "0" ){
      numberSlider.value = parseFloat(numberBox.text);
    } else{
        numberBox.text="0";
        numberSlider.value = numberBox.text*1;
        }
  }
  maxSpeed.onChange = function(){
    speedBox.text = String(Math.round(maxSpeed.value));
  }
  speedBox.onChange = function(){
    if (speedBox.text*1 | speedBox.text == "0" ){
      maxSpeed.value = parseFloat(speedBox.text);
    } else{
        speedBox.text="0";
        maxSpeed.value = speedBox.text*1;
        }
  }
  maxAngle.onChange = function(){
    angleBox.text = String(Math.round(maxAngle.value));
  }
  angleBox.onChange = function(){
    if (angleBox.text*1 | angleBox.text == "0" ){
      maxAngle.value = parseFloat(angleBox.text);
    } else{
        angleBox.text="0";
        maxAngle.value = angleBox.text*1;
        }
  }

  startButton.onClick = function () {
    makeLotsaCircles( numberSlider.value, newLayersBtn.value, maxSpeed.value, maxAngle.value );
  }
 if (newWindow){myPanel.show();}
  return myPanel
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
