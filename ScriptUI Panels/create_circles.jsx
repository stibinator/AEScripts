// @target aftereffects
var fnList = ['linear', 'exponential', 'sigmoid', 'random', '-'];
function buildUI(thisObj) {
  var theComp = getCurrentCompOrMakeOne();
  var myPanel = (thisObj instanceof Panel)
    ? thisObj
    : new Window('palette', 'createshapes', undefined, {resizable: true});
  writeLn(myPanel);
  var numCircles = myPanel.add('slider', undefined, value = 100, minvalue = 1, maxvalue = 10000, 'number of circles');
  var left = myPanel.add('slider', undefined, value = 0, minvalue = 0, maxvalue = theComp.width, 'left');
  var right = myPanel.add('slider', undefined, value = theComp.width, minvalue = 0, maxvalue = theComp.width, 'right');
  var top = myPanel.add('slider', undefined, value = 0, minvalue = 0, maxvalue = theComp.height, 'top');
  var bottom = myPanel.add('slider', undefined, value = theComp.height, minvalue = 0, maxvalue = theComp.height, 'bottom');
  var hue = myPanel.add('slider', undefined, value = 180, minvalue = 0, maxvalue = 360, 'hue');
  var hueSpread = myPanel.add('slider', undefined, value = theComp.height, minvalue = 0, maxvalue = theComp.height, 'hue Spread');
  var sat = myPanel.add('slider', undefined, value = 50, minvalue = 0, maxvalue = 100, 'sat');
  var satSpread = myPanel.add('slider', undefined, value = theComp.height, minvalue = 0, maxvalue = theComp.height, 'sat Spread');
  var val = myPanel.add('slider', undefined, value = 50, minvalue = 0, maxvalue = 100, 'val');
  var valSpread = myPanel.add('slider', undefined, value = theComp.height, minvalue = 0, maxvalue = theComp.height, 'val Spread');
  var sizeMin = myPanel.add('slider', undefined, value = 10, minvalue = 0, maxvalue = theComp.width, 'min size');
  var sizeMax = myPanel.add('slider', undefined, value = 100, minvalue = 0, maxvalue = theComp.width, 'max size');
  var firstStart = myPanel.add('slider', undefined, value = 0, minvalue = 0, maxvalue = theComp.duration, 'firstStart');
  var lastStart = myPanel.add('slider', undefined, value = theComp.duration, minvalue = 0, maxvalue = theComp.duration, 'lastStart');
  myPanel.add('staticText', undefined, 'easing type');
  var fn = myPanel.add('dropDownList', [
    undefined, undefined, 150, undefined
  ], fnList);
  fn.selection = 1;
  var pwrSlider = myPanel.add('slider', undefined, value = 4, minvalue = 0, maxvalue = 8, 'easing');
  var gaussOn = myPanel.add('checkbox', undefined, false, 'guassian');
  var startButton = myPanel.add('button', undefined, 'start'); //Create Null

  numCircles.onChange = function () {
    varwriteLn(numCircles.value);
  }

  startButton.onClick = function () {
    app.beginUndoGroup('create shape layer');
    drawLotsaCircles(getCurrentCompOrMakeOne(),
			numCircles.value,
			left.value,
			right.value,
			top.value,
			bottom.value,
			hue.value,
			hueSpread.value,
			sat.value,
			satSpread.value,
			val.value,
			valSpread.value,
			sizeMin.value,
			sizeMax.value,
			firstStart.value,
			lastStart.value,
			fn.value,
			pwrSlider.value,
			gaussOn.value
		);
    app.endUndoGroup();
  }
  if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
  } else {
    myPanel.layout.layout(true);
  }
}

buildUI(this);

function drawLotsaCircles(currentComp, numCircles, left, right, top, bottom, hue, hueSpread, sat, satSpread, val, valSpread, sizeMin, sizeMax, firstStart, endTime) {
  // Adding shape layer for the circles
  var shapeLayer = currentComp.layers.addShape();
  //put it at the top Right
  var theEllipse;
  var easeIn;
  var easeOut
  // Adding circle shapes group
  var shapeGroup = shapeLayer.property('Contents').addProperty('ADBE Vector Group');
  var fillCol = hslToRgb(hue / 360 + Math.random() * hueSpread / 360, sat / 100 + Math.random() * satSpread / 100, val / 100 + Math.random() * valSpread / 100);
  var circleSize = sizeMin + Math.random() * (sizeMax - sizeMin)
  // Adding circle shapes
  shapeLayer.property('Transform').property('Position').setValue([left, top])
  theEllipse = createEllipse(shapeGroup, circleSize, false, fillCol, false, 0);

  //create the keyframeEase objects
  easeIn = new KeyframeEase(4000, 0.1);
  startSpeed = 10 + Math.random() * 80;
  easeOut = new KeyframeEase(startSpeed, 100);

  //create the keyframes and ease them
  theEllipse.property('Size').setValueAtTime(startTime, [4440, 4440]);
  theEllipse.property('Size').setTemporalEaseAtKey(1, [easeIn, easeIn], [easeOut, easeOut]);
  //use the same ease for both keyframes
  theEllipse.property('Size').setValueAtTime(startTime + random() * (endTime - startTime), [0, 0]);
  theEllipse.property('Size').setTemporalEaseAtKey(2, [easeIn, easeIn], [easeOut, easeOut]);
  //theEllipse.property('Size').expression = '[value[1], value[1]]';
  //theEllipse.property('Size').expressionEnabled = true;
}

function createEllipse(shapeGroup, size, pos, fill, stroke, strokewidth) {
  var ellipse = shapeGroup.property('Contents').addProperty('ADBE Vector Shape - Ellipse');
  ellipse.property('Size').setValue([size, size]);
  if (pos) {
    ellipse.property('Position').setValue(pos);
  }
  if (fill) {
    shapeGroup.property('Contents').addProperty('ADBE Vector Graphic - Fill').property('Color').setValue(fill)
  }
  if (stroke) {
    shapeGroup.property('Contents').addProperty('ADBE Vector Graphic - Stroke').property('Color').setValue(stroke)
    if (strokewidth) {
      shapeGroup.property('Contents').property('ADBE Vector Graphic - Stroke').property('Stroke Width').setValue(strokewidth)
    }
  }
  return ellipse;
}

function getCurrentCompOrMakeOne(compSettings, defaultCompName) {
  var cs = compSettings || [1920, 1080, 1, 10, 25];

  var currentProject = (app.project)
    ? app.project
    : app.newProject();
  var currentComp = (currentProject.activeItem)
    ? currentProject.activeItem
    : currentProject.items.addComp(defaultCompName || 'Demo', cs[0], cs[1], cs[2], cs[3], cs[4]);
  currentComp.openInViewer();
  return currentComp;
}

// //var myToolsPanel = buildUI(this);
// app.beginUndoGroup('create shape layer');
// for (var i = 0; i < 300; i++) {
//   drawLotsaCircles(getCurrentCompOrMakeOne());
// }
// app.endUndoGroup();

function hslToRgb(h, s, l) {
  /**
	* Converts an HSL color value to RGB. Conversion formula
	* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	* Assumes h, s, and l are contained in the set [0, 1] and
	* returns r, g, and b in the set [0, 1].
	*
	* @param   Number  h       The hue
	* @param   Number  s       The saturation
	* @param   Number  l       The lightness
	* @return  Array           The RGB representation
	*/
  var r,
    g,
    b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0)
        t += 1;
      if (t > 1)
        t -= 1;
      if (t < 1 / 6)
        return p + (q - p) * 6 * t;
      if (t < 1 / 2)
        return q;
      if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5
      ? l * (1 + s)
      : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b]
  //[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
//------------------------------------ maths fun --------------------------------
function exponential(x, p) {
  //return a value 0-1 based on the exponential function, of order p
  if (x <= 0) {
    return 0;
  }
  if (x >= 1) {
    return 1;
  }
  return Math.pow(x, p);
}

function sigmoid(x, p) {
  //sigmoid function for 0<=x<=1 returns a variable s-shaped slope where 0<=y<=1, and that always passes through [0,0] and [1,1]
  //took a while to figure out
  //see https://www.desmos.com/calculator/40sqnfw8hf

  if (x <= 0) {
    return 0;
  }
  if (x >= 1) {
    return 1;
  }
  if (p > 0) {
    g = function (n) {
      return (Math.pow(1 / n, p));
    };
    return g(1 - x) / (g(x) + g(1 - x));
  } else {
    return 1;
  }
}
