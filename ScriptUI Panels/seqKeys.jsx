//In-n-out by stib
//©2016 Stephen Dixon
//sequences layers in a variety of ways
//@target aftereffects


var fnList = [
  'linear',
  'exponential',
  'sigmoid',
  'random',
  '-',
  'align footge Start times',
  'align footage end times',
  '-',
  '-'
]; // the two dashes at the end are because of UI bug in 2015.3
var orderList = [
  'index',
  'reverse index',
  'random',
  'selection',
  'reverse selection',
  'current order',
  'reverse current order',
  'alphabetical',
  'reverse alphabetical',
  '-',
  '-',
  '-',
  '-'
]; // the two dashes at the end are because of UI bug in 2015.3

function buildGUI(thisObj) {
  var theComp = app.project.activeItem;
  //we need a comp for things like the sliders which are set based on the duration,
  //and for the frameDuration, so we'll set up a dummy object
  if (!theComp) {
    thecomp = {
      "duration": 60,
      "frameDuration": 1 / 25,
      "time": 0
    };
  }
  /* jshint ignore:start */
  // JSHint hates ternaries over a couple of lines
  var theWindow = (thisObj instanceof Panel)
    ? thisObj
    : new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
  /* jshint ignore:end */
  theWindow.preferredSize = "width: -1, height: -1";
  theWindow.alignChildren = ["left", "top"];
  theWindow.margins = [10, 10, 10, 10];

  var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']}");

  mainGroup.add("staticText", undefined, "Sequence order");
  var orderDropDown = mainGroup.add('dropDownList', [
    undefined, undefined, 150, undefined
  ], orderList);
  orderDropDown.selection = 0;

  var firstTxtGrp = mainGroup.add('group{orientation: "row"}');
  firstTxtGrp.add("staticText", undefined, "first in-point (% of comp length)");
  var firstBttn = firstTxtGrp.add("button", undefined, "set to current");
  var firstGrp = mainGroup.add("group{orientation:'row'}");
  var firstSlider = firstGrp.add("slider", undefined, 0, 0, 100);
  firstSlider.size = {
    'width': 170,
    'height': 10
  };
  var firstHmsfText = firstGrp.add("editText", [
    undefined, undefined, 76, 28
  ], percentToHMSF(firstSlider.value, theComp));

  var lastTxtGrp = mainGroup.add('group{orientation: "row"}');
  lastTxtGrp.add("staticText", undefined, "last in-point (% of comp length)");
  var lastBttn = lastTxtGrp.add("button", undefined, "set to current");
  var lastGrp = mainGroup.add("group{orientation:'row'}");
  var lastSlider = lastGrp.add("slider", undefined, 100, 0, 100);
  lastSlider.size = {
    'width': 170,
    'height': 10
  };
  var lastHmsfText = lastGrp.add("editText", [
    undefined, undefined, 76, 28
  ], percentToHMSF(lastSlider.value, theComp));

  mainGroup.add("staticText", undefined, "easing type");
  var fnTypeDropDown = mainGroup.add('dropDownList', [
    undefined, undefined, 150, undefined
  ], fnList);
  fnTypeDropDown.selection = 1;
  mainGroup.add("staticText", undefined, "ease amount");
  var pwrGrp = mainGroup.add("group{orientation:'row'}");
  var pwrSlider = pwrGrp.add("slider", undefined, 4, 0, 8);
  pwrSlider.size = {
    'width': 200,
    'height': 10
  };

  mainGroup.add("staticText", undefined, "regularity");
  var regularityGrp = mainGroup.add("group{orientation:'row'}");
  var regularitySlider = regularityGrp.add("slider", undefined, 100, 0, 100);
  regularitySlider.size = {
    'width': 200,
    'height': 10
  };

  var inOrOut = mainGroup.add("group{orientation:'row'}");
  var inChckBox = inOrOut.add('checkbox', undefined, "inPoints");
  var outChckBox = inOrOut.add('checkbox', undefined, "outPoints");
  inChckBox.value = true;
  outChckBox.value = false;

  var timescaleOrMove = mainGroup.add("group{orientation:'row'}");
  var moveChckBox = timescaleOrMove.add('checkbox', undefined, "move");
  var timescaleChckBox = timescaleOrMove.add('checkbox', undefined, "timescale");
  timescaleChckBox.value = false;
  moveChckBox.value = true;

  var doTheStuff = mainGroup.add('button', undefined, 'Sequence layers');

  firstSlider.onChanging = function() {
    //update the edit box,
    firstHmsfText.text = percentToHMSF(firstSlider.value, theComp);
    //and the other sliders
    lastSlider.value = Math.max(firstSlider.value, lastSlider.value);
    //propogate to the edittext box
    lastHmsfText.text = percentToHMSF(lastSlider.value, theComp);
  };

  firstHmsfText.onChange = function() {
    //parse the user input
    parsedTime = currentFormatToTime(firstHmsfText.text, 1 / theComp.frameDuration);
    //propogate it to the slider
    firstSlider.value = parsedTime / theComp.duration * 100;
    //update the other slider if there are conflicts
    lastSlider.value = Math.max(firstSlider.value, lastSlider.value);
    //normalise the value back to the editbox
    firstHmsfText.text = percentToHMSF(firstSlider.value);
  };

  lastSlider.onChanging = function() {
    //update the edit box,
    lastHmsfText.text = percentToHMSF(lastSlider.value, theComp);
    //and the other sliders
    firstSlider.value = Math.min(firstSlider.value, lastSlider.value);
    //propogate to the edittext box
    firstHmsfText.text = percentToHMSF(firstSlider.value, theComp);
  };

  // lastHmsfText.addEventListener('focus', function() {
  //     var currText = lastHmsfText.text;
  //     lastHmsfText.text = '';
  //     lastHmsfText.textselection = currText;
  // }); //this didn't work

  lastHmsfText.onChange = function() {
    //parse the user input
    parsedTime = currentFormatToTime(lastHmsfText.text, 1 / theComp.frameDuration);
    //propogate it to the slider
    lastSlider.value = parsedTime / theComp.duration * 100;
    //update the other slider if there are conflicts
    firstSlider.value = Math.min(firstSlider.value, lastSlider.value);
    //normalise the value back to the editbox
    lastHmsfText.text = percentToHMSF(lastSlider.value);
  };

  firstBttn.onClick = function() {
    theComp = app.project.activeItem;
    if (!theComp) {
      alert("no comp is active");
    } else {
      //propogate it to the slider
      firstSlider.value = theComp.time / theComp.duration * 100;
      //update the other slider if there are conflicts
      lastSlider.value = Math.max(firstSlider.value, lastSlider.value);
      //propogate the value to the editbox
      firstHmsfText.text = percentToHMSF(firstSlider.value);
    }
  };

  lastBttn.onClick = function() {
    theComp = app.project.activeItem;
    if (!theComp) {
      alert("no comp is active");
    } else {
      //propogate it to the slider
      lastSlider.value = theComp.time / theComp.duration * 100;
      //update the other slider if there are conflicts
      firstSlider.value = Math.min(firstSlider.value, lastSlider.value);
      //propogate the value to the editbox
      lastHmsfText.text = percentToHMSF(lastSlider.value);
    }
  };
  fnTypeDropDown.onChange = function() {
    var fn = 0;
    fnsel = fnTypeDropDown.selection.text;
    for (var i = 0; i < fnList.length; i++) {
      if (fnList[i] == fnsel) {
        fn = i;
      }
    }
    pwrSlider.enabled = (fn !== 0); //disable for linear
    pwrEdit.enabled = (fn !== 0);
  };

  inChckBox.onClick = function() {
    outChckBox.value = !inChckBox.value;
  };

  outChckBox.onClick = function() {
    inChckBox.value = !outChckBox.value;
  };

  timescaleChckBox.onClick = function() {
    moveChckBox.value = !timescaleChckBox.value;
  };

  moveChckBox.onClick = function() {
    timescaleChckBox.value = !moveChckBox.value;
  };

  doTheStuff.onClick = function() {
    theComp = app.project.activeItem;
    if (!theComp) {
      alert("no comp is active");
    } else {
      app.beginUndoGroup('sequence layers plus');
      var order = orderDropDown.selection.text;
      var startTime = theComp.duration * firstSlider.value / 100;
      var endTime = theComp.duration * lastSlider.value / 100;
      var ease = fnTypeDropDown.selection.text;
      var easePower = Math.pow(pwrSlider.value / 8, 4) * 8;
      var regularity = regularitySlider.value / 100;
      var doInPoints = inChckBox.value;
      var scaleNotTrim = moveChckBox.value;
      sequenceLayers(order, startTime, endTime, ease, easePower, regularity, doInPoints, theComp, scaleNotTrim); //, randozCheckbox.value);
      app.endUndoGroup();
    }
  };

  if (theWindow instanceof Window) {
    theWindow.center();
    theWindow.show();
  } else {
    theWindow.layout.layout(true);
  }
}
buildGUI(this);

//here comes the hoo-ha
function sequenceLayers(order, startTime, endTime, ease, easePower, regularity, doInPoints, theComp, scaleNotTrim) { //}, randoz) {
  if (!theComp.selectedLayers) {
    alert("choose some properties in a comp");
  } else {
    for (var i = 0; i < theComp.selectedLayers.length; i++) {
      theLayer = theComp.selectedLayers[i];
      var theProperties = theLayer.selectedProperties;
      if (theProperties.length < 2) {
        alert("choose at least 2 properties");
        //////////////////////////////////////////////////////////////////////////
      } else {
        if (order == 'index') {
          theProperties.sort(function(a, b) {
            return (a.index > b.index);
          });
        } else if (order == 'reverse index') {
          theProperties.sort(function(a, b) {
            return (a.index < b.index);
          });
        } else if (order == 'random') {
          theProperties.sort(function(a, b) {
            return (Math.random() > 0.5);
          });
        } else if (order == 'reverse selection') {
          theProperties.sort(function(a, b) {
            return (false);
          });
        } else if (order == 'current order') {
          theProperties.sort(function(a, b) {
            return (a.inPoint > b.inPoint);
          });
        } else if (order == 'reverse current order') {
          theProperties.sort(function(a, b) {
            return (a.inPoint < b.inPoint);
          });
        } else if (order == 'alphabetical') {
          theProperties.sort(function(a, b) {
            return (a.name > b.name);
          });
        } else if (order == 'reverse alphabetical') {
          theProperties.sort(function(a, b) {
            return (a.name < b.name);
          });
        }

        var fDur = theComp.frameDuration;
        compLength = theComp.duration;
        var timeSpan = endTime - startTime;
        var startOffset,
          outOffset; //the offset between the layer's start time and its in-point, and its active duration
        numLayers = theProperties.length;
        var randoz = 1 - regularity;
        var myTime = 0;
        var layerIndex = 0;
        for (var i = 0; i < numLayers; i++) {
          layerIndex = i;
          if (regularity < 1 && i > 0 && i < (numLayers - 1)) { //always make the first and last keyframe on time
            //although we're using the layer index as the input it doesn't have to be integral. This adds some irregularity
            var n = numLayers - 1; //just for readability
            //this took a while:
            layerIndex = i + Math.random() * ((n - 1) / n) - (n - i) / (n - 1); //randomise layers so they can start at any
            //time between when the last layer could start and the next might, but make sure the first and last layers start on time
            //this should be simple, but we have to make sure that there isn't always a gap after the first layer or before the last
            //this spreads the randomness. Trust me, I worked it out on paper.

          }
          if (ease == 'linear') {
            myTime = startTime + timeSpan * layerIndex / numLayers;
          } else if (ease == 'exponential') {
            myTime = startTime + timeSpan * exponential(layerIndex / numLayers, easePower);
          } else if (ease == 'sigmoid') {
            myTime = startTime + timeSpan * sigmoid(layerIndex / numLayers, easePower);
          } else if (ease == 'align Start Time') {
            myTime = startTime + theProperties[i].inpoint - theProperties[i].startTime;
            doInPoints = true;
          } else if (ease == 'align end Time') {
            myTime = endTime - theProperties[i].duration + theProperties[i].inPoint;
            doInPoints = false;
          } else { //kompletely randoz
            myTime = startTime + timeSpan * Math.random();
          }
          if (scaleNotTrim) { //move the layer
            if (doInPoints) {
              startOffset = theProperties[i].inPoint - theProperties[i].startTime;
              theProperties[i].startTime = Math.round(myTime / fDur) * fDur - startOffset; //round it to the nearest frame boundary
            } else {
              outOffset = theProperties[i].outPoint - theProperties[i].startTime;
              theProperties[i].startTime = Math.round(myTime / fDur) * fDur - outOffset; //round it to the nearest frame boundary
            }
          } else { //timescale the in or out point
            if (doInPoints) {
              theProperties[i].inPoint = Math.round(myTime / fDur) * fDur;
            } else {
              theProperties[i].outPoint = Math.round(myTime / fDur) * fDur;
            }
          }

        }

      }
    }
  }
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
    g = function(n) {
      return (Math.pow(1 / n, p));
    };
    return g(1 - x) / (g(x) + g(1 - x));
  } else {
    return 1;
  }
}

//-------------------------------------- timeconversions------------------------------

function time2Frames(time, comp) {
  comp = defaultFor(comp, app.project.activeItem);
  return time / comp.frameDuration;
}

function frames2Time(frame, comp) {
  comp = defaultFor(comp, app.project.activeItem);
  return frame * comp.frameDuration;
}

function percentToframes(percent, comp) {
  comp = defaultFor(comp, app.project.activeItem);
  return (comp.duration * percent / (100 * comp.frameDuration));
}

function percentToHMSF(percent, comp) {
  comp = defaultFor(comp, app.project.activeItem);
  if (comp) {
    return timeToCurrentFormat(percent * comp.duration / 100, 1 / comp.frameDuration);
  }
  return false;
}
function zeroPad(digits, num, pad) {
  pad = defaultFor(pad, "0");
  for (var i = 0; i < digits; i++) {
    pad += "0";
  }
  return (pad + num).slice(0 - digits);
}

function defaultFor(arg, val, replaceNullandEmptyVals) {
  if (replaceNullandEmptyVals) {
    /* jshint ignore:start */
    return ((typeof(arg) !== 'undefined') | (arg === null) | (arg === []))
      ? val
      : arg;
  } else {
    return (typeof(arg) !== 'undefined')
      ? arg
      : val;
    /* jshint ignore:end */

  }
}
