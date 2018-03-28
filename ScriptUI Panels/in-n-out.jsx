// In-n-out by stib ©2016 Stephen Dixon sequences layers in a variety of ways
// @target aftereffects
// @includepath ../(lib)/
// @include jsextras.jsx

var fnList = [
  'linear',
  'exponential',
  'sigmoid',
  'random',
  '-',
  'align footage start times',
  'align footage end times' //,
  // '-',
  // '-'
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
  'reverse alphabetical' //,
  // '-',
  // '-',
  // '-',
  // '-'
]; // the two dashes at the end are because of UI bug in 2015.3

// ----------------- maths fun -----------------------------
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
  // sigmoid function for 0<=x<=1 returns a variable s-shaped slope where 0<=y<=1,
  // and that always passes through [0,0] and [1,1] took a while to figure out
  // see https://www.desmos.com/calculator/40sqnfw8hf

  if (x <= 0) {
    return 0;
  }
  if (x >= 1) {
    return 1;
  }
  try {
    if (p > 0) {
      g = function(n) {
        return (Math.pow(1 / n, p));
      };
      return g(1 - x) / (g(x) + g(1 - x));
    }
    return 1;

  } catch (e) {
    alert(e);
  }
}

// ----------- useful ------------------------
function defaultFor(arg, val, replaceNullandEmptyVals) {
  if (replaceNullandEmptyVals) {
    return ((typeof(arg) !== 'undefined') | (arg === null) | (arg === []))
      ? val
      : arg;
  }
  return (typeof(arg) !== 'undefined')
    ? arg
    : val;
}

// ----------- timeconversions--------------------
function percentToHMSF(percent, comp) {
  var thecomp = defaultFor(comp, app.project.activeItem);
  if (thecomp) {
    return timeToCurrentFormat(percent * thecomp.duration / 100, 1 / thecomp.frameDuration);
  }
  return false;
}

//here comes the hoo-ha
function sequenceLayers(order, firstStartTime, endTime, ease, easePower, regularity, doInPoints, theComp, moveNotTrim, quantise, noneEqualsAll) { //}, randoz) {
  var shouldDoInPoints = doInPoints;
  var i;
  if (!theComp) {
    alert('choose some layers in a comp');
  } else {
    var theLayers = theComp.selectedLayers;
    // if no layers are selected do all of them, lightwave style.
    if ((theLayers.length === 0) && noneEqualsAll) {
      theLayers = [];
      // what were Adobe thinking when they didn't make comp.layers a proper array?
      for (i = 0; i < theComp.layers.length; i++) {
        theLayers[i] = theComp.layer(i+1);
      }
    }

        if (theLayers.length < 2) {
      alert('choose at least 2 layers in a comp');
    } else {
      if (order === 'index') {
        theLayers.sort(function(a, b) {
          return (a.index - b.index);
        });
      } else if (order === 'reverse index') {
        theLayers.sort(function(a, b) {
          return (b.index - a.index);
        });
      } else if (order === 'random') {
        theLayers.sort(function() {
          return (1 - Math.random() * 2);
        });
        // sort by selection is unneccesary - that's the order they're already in
      } else if (order === 'reverse selection') {
        theLayers.sort(function() {
          return (1);
        });
      } else if (order === 'current order') {
        theLayers.sort(function(a, b) {
          return (a.inPoint - b.inPoint);
        });
      } else if (order === 'reverse current order') {
        theLayers.sort(function(a, b) {
          return (b.inPoint - a.inPoint);
        });
      } else if (order === 'alphabetical') {
        theLayers.sort(function(a, b) {
          if (a.name === b.name) {
            return 0;
          }
          return (a.name > b.name)
            ? -1
            : 1;
        });
      } else if (order === 'reverse alphabetical') {
        theLayers.sort(function(a, b) {
          return (a.name < b.name);
        });
      }


      var fDur = theComp.frameDuration;
      // rounds to nearest frame boundary if quantisation is on
      roundToFrame = function(t) {
        if (quantise) {
          return Math.round(t / fDur) * fDur;
        } else {
          return t;
        }
      };

      var timeSpan = endTime - firstStartTime;
      var startOffset;
      var outOffset; //the offset between the layer's start time and its in-point, and its active duration
      compLength = theComp.duration;
      numLayers = theLayers.length;

      // var theFammilies = makeFamilies(theLayers);

      // var randoz = 1 - regularity;
      var myTime = 0;
      var layerIndex = 0;
      for (i = 0; i < numLayers; i++) {
        layerIndex = i;
        currentLayer = theLayers[i];
        if (regularity < 1 && i > 0 && i < (numLayers - 1)) { //always make the first and last keyframe on time
          //although we're using the layer index as the input it doesn't have to be integral. This adds some irregularity
          var n = numLayers - 1; //just for readability
          //this took a while:
          layerIndex = i + Math.random() * (1 - regularity) * (((n - 1) / n) - (n - i) / (n - 1)); //randomise layers so they can start at any
          // time between when the last layer could start and the next might, but make
          // sure the first and last layers start on time this should be simple, but we
          // have to make sure that there isn't always a gap after the first layer or
          // before the last this spreads the randomness. Trust me, I worked it out on
          // paper.
        }
        startOffset = currentLayer.inPoint - currentLayer.startTime;
        endOffset = currentLayer.outPoint - currentLayer.startTime;

        if (ease === 'linear') {
          myTime = firstStartTime + timeSpan * layerIndex / (numLayers - 1);
        } else if (ease === 'exponential') {
          myTime = firstStartTime + timeSpan * exponential(layerIndex / (numLayers - 1), Math.pow(easePower, 3) * 8);
        } else if (ease === 'sigmoid') {

          if (easePower < 0.5) {
            myTime = firstStartTime + timeSpan * sigmoid(layerIndex / (numLayers - 1), easePower * 2);
          } else {
            myTime = firstStartTime + timeSpan * sigmoid(layerIndex / (numLayers - 1), Math.pow(easePower * 2, 3));
          }
        } else if (ease === 'align footage start times') {
          myTime = firstStartTime + currentLayer.inPoint - currentLayer.startTime;
          shouldDoInPoints = true;
        } else if (ease === 'align footage end times') {
          myTime = endTime - currentLayer.source.duration + endOffset;
          shouldDoInPoints = false;
        } else { //kompletlely randoz
          myTime = firstStartTime + timeSpan * Math.random();
        }

        if (moveNotTrim) { //move the layer
          if (shouldDoInPoints) {
            currentLayer.startTime = roundToFrame(myTime) - startOffset; //round it to the nearest frame boundary
          } else {
            currentLayer.startTime = roundToFrame(myTime) - endOffset; //round it to the nearest frame boundary
          }
        } else { //trim the in or out point
          if (shouldDoInPoints) {
            currentLayer.inPoint = roundToFrame(myTime);
          } else {
            currentLayer.outPoint = roundToFrame(myTime);
          }
        }
      }
    }
  }
}

// function makeFamilies(theLayers){
//   var i;
//   var families = [];
//   for ( i = 0; i < theLayers.length; i++) {
//     if (contains(theLayers, theLayers[i].parent)){
//
//     }
//   }
// }

function buildGUI(thisObj) {
  var theComp = (app.project.activeItem || {
    duration: 60,
    frameDuration: 1 / 25,
    time: 0
  });
  var theWindow = (thisObj instanceof Panel)
    ? thisObj
    : new Window('palette', thisObj.scriptTitle, undefined, {resizeable: true});

  // we need a comp for things like the sliders which are set based on the
  // duration, and for the frameDuration, so we'll set up a dummy object

  var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['center','top']}");

  var doTheStuff = mainGroup.add('button', undefined, 'Sequence layers');

  var seqOrderPnl = mainGroup.add('panel{orientation: "column", text:"Sequence order"}');
  var orderDropDown = seqOrderPnl.add('dropDownList', undefined, orderList);

  var firstPnl = mainGroup.add('panel{orientation: "column", text:"first in-point"}');
  var firstSlider = firstPnl.add('slider', undefined, 0, 0, 100);
  var firstBtnGrp = firstPnl.add('group{orientation: "row"}');
  var firstHmsfText = firstBtnGrp.add('editText', [
    undefined, undefined, 76, 28
  ], percentToHMSF(firstSlider.value, theComp));
  var firstBttn = firstBtnGrp.add('button', undefined, 'current time');

  var lastPnl = mainGroup.add('panel{orientation: "column", text:"last in-point"}');
  var lastSlider = lastPnl.add('slider', undefined, 100, 0, 100);
  var lastBtnGrp = lastPnl.add('group{orientation: "row"}');
  var lastHmsfText = lastBtnGrp.add('editText', [
    undefined, undefined, 76, 28
  ], percentToHMSF(lastSlider.value, theComp));
  var lastBttn = lastBtnGrp.add('button', undefined, 'current time');

  var easePnl = mainGroup.add('panel{orientation: "column", text:  "easing"}');
  var fnTypeDropDown = easePnl.add('dropDownList', undefined, fnList);
  var pwrSlider = easePnl.add('slider', undefined, 0.7, 0, 1, 'text:"ease amount"');

  var regPnl = mainGroup.add('panel{orientation: "column", text:"regularity"}');
  var regularitySlider = regPnl.add('slider', undefined, 100, -200, 100);

  var switchPanel = mainGroup.add('panel{orientation: "column", text:  "settings", alignChildren:["left", "top"]}');
  var inOrOut = switchPanel.add("group{orientation:'row'}");
  var inChckBox = inOrOut.add('radiobutton', undefined, 'in-points');
  var outChckBox = inOrOut.add('radiobutton', undefined, 'out-points');

  var trimOrMove = switchPanel.add("group{orientation:'row'}");
  var moveChckBox = trimOrMove.add('radiobutton', undefined, 'move');
  var trimChckBox = trimOrMove.add('radiobutton', undefined, 'trim');

  var quantizeChkBox = switchPanel.add('checkbox', undefined, 'quantise to frames');
  var noneEqualsAllChkBx = switchPanel.add('checkbox', undefined, 'none selected = do all');

  fnTypeDropDown.selection = 1;

  inChckBox.value = true;
  moveChckBox.value = true;
  quantizeChkBox.value = true;
  noneEqualsAllChkBx.value = true;

  inChckBox.onClick = outChckBox.onClick = function() {
    // alert((inChckBox.value)? "first in-point": "first out-point");
    firstPnl.text = (inChckBox.value)
      ? "first in-point"
      : "first out-point";
    lastPnl.text = (inChckBox.value)
      ? "last in-point"
      : "last out-point";
  };

  theWindow.preferredSize = 'width: 200, height: 800';
  theWindow.alignChildren = ['left', 'top'];
  theWindow.margins = [10, 10, 10, 10];
  orderDropDown.selection = 0;

  doTheStuff.size = {
    width: 170,
    height: 30
  };

  orderDropDown.size = fnTypeDropDown.size = {
    width: 170,
    height: 16
  };

  inChckBox.size = outChckBox.size = trimChckBox.size = moveChckBox.size = {
    width: 85,
    height: 16
  };

  sliderSize = {
    width: 170,
    height: 10
  };
  firstSlider.size = lastSlider.size = pwrSlider.size = regularitySlider.size = sliderSize;

  firstSlider.onChanging = function() {
    //update the edit box,
    firstHmsfText.text = percentToHMSF(firstSlider.value, theComp);

    //and the other sliders
    lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

    //propogate to the edittext box
    lastHmsfText.text = percentToHMSF(lastSlider.value, theComp);
  };

  firstHmsfText.onChanging = function() {
    //parse the user input
    try {
      parsedTime = currentFormatToTime(firstHmsfText.text, theComp.frameRate);
    } catch (e) {
      alert(e.name, e.message);
      parsedTime = 0;
    }
    //propogate it to the slider
    firstSlider.value = parsedTime / theComp.duration * 100;

    //update the other slider if there are conflicts
    lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

    //normalise the value back to the editbox
    firstHmsfText.text = timeToCurrentFormat(parsedTime, theComp.frameRate, true);
  };

  lastSlider.onChange = function() {
    //update the edit box,
    try {
      lastHmsfText.text = percentToHMSF(lastSlider.value, theComp);

      //and the other sliders
      firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

      //propogate to the edittext box
      firstHmsfText.text = percentToHMSF(firstSlider.value, theComp);
    } catch (e) {
      writeln(e);
      firstHmsfText.text = timeToCurrentFormat(0, 25);
      lastHmsfText.text = timeToCurrentFormat(60, 25);
      firstSlider.value = 0;
      lastSlider.value = 60;
    }
  };

  // lastHmsfText.addEventListener('focus', function() {     var currText =
  // lastHmsfText.text;     lastHmsfText.text = '';     lastHmsfText.textselection
  // = currText; }); this didn't work

  lastHmsfText.onChange = function() {
    //parse the user input
    try {
      parsedTime = currentFormatToTime(lastHmsfText.text, theComp.frameRate);
      //propogate it to the slider
      lastSlider.value = parsedTime / theComp.duration * 100;

      //update the other slider if there are conflicts
      firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

      //normalise the value back to the editbox
      lastHmsfText.text = timeToCurrentFormat(parsedTime, theComp.frameRate);
    } catch (e) {
      writeln(e);
      firstHmsfText.text = timeToCurrentFormat(0, 25);
      lastHmsfText.text = timeToCurrentFormat(60, 25);
      firstSlider.value = 0;
      lastSlider.value = 60;
    }
  };

  firstBttn.onClick = function() {
    theComp = app.project.activeItem;
    if (!theComp) {
      alert('no comp is active');
    } else {
      //propogate it to the slider
      firstSlider.value = theComp.time / theComp.duration * 100;

      //update the other slider if there are conflicts
      lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

      //propogate the value to the editbox
      firstHmsfText.text = percentToHMSF(firstSlider.value);
    }
    firstBttn.active = false;
  };

  lastBttn.onClick = function() {
    theComp = app.project.activeItem;
    if (!theComp) {
      alert('no comp is active');
    } else {
      //propogate it to the slider
      lastSlider.value = theComp.time / theComp.duration * 100;

      //update the other slider if there are conflicts
      firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

      //propogate the value to the editbox
      lastHmsfText.text = percentToHMSF(lastSlider.value);
    }
    lastBttn.active = false;
  };

  fnTypeDropDown.onChange = function() {
    var i;
    var fn = 0;
    fnsel = fnTypeDropDown.selection.text;
    for (i = 0; i < fnList.length; i++) {
      if (fnList[i] === fnsel) {
        fn = i;
      }
    }
    pwrSlider.enabled = ((fn === 1) || (fn === 2)); //enable for exponential or sigmoid
    // pwrEdit.enabled = pwrSlider.enabled;

  };

  doTheStuff.onClick = function() {
    theComp = app.project.activeItem;
    if (!theComp) {
      alert('no comp is active');
    } else {
      app.beginUndoGroup('sequence layers plus');
      var order = orderDropDown.selection.text;
      var firstStartTime = theComp.duration * firstSlider.value / 100;
      var endTime = theComp.duration * lastSlider.value / 100;
      var ease = fnTypeDropDown.selection.text;
      var easePower = pwrSlider.value;
      var regularity = regularitySlider.value / 100;
      var doInPoints = inChckBox.value;
      var moveNotTrim = moveChckBox.value;
      var quantise = quantizeChkBox.value;
      var noneEqualsAll = noneEqualsAllChkBx.value;
      sequenceLayers(order, firstStartTime, endTime, ease, easePower, regularity, doInPoints, theComp, moveNotTrim, quantise, noneEqualsAll); //, randozCheckbox.value);
      app.endUndoGroup();
    }
      doTheStuff.active = false;
  };

  if (theWindow instanceof Window) {
    theWindow.center();
    theWindow.show();
  } else {
    theWindow.layout.layout(true);
  }
}

buildGUI(this);
