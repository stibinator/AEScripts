//@target AfterEffects

function quantiseKeyFrames(timeQuantisation, valQuantisation) {
  app.beginUndoGroup('quantise keyframe');
  var theKeys = [];
  var i;
  var kf;
  var p;
  var prop;
  var propKeys;
  var qTime;
  var kVal;
  try {
    var theComp = app.project.activeItem;
    if (!theComp) {
      throw new Error('choose a comp');
    }

    var theLayers = theComp.selectedLayers;
    if (!theLayers) {
      throw new Error('choose some keyframes');
    }
    for (i = 0; i < theLayers.length; i++) {
      theKeys[i] = [];
      theProps = theLayers[i].selectedProperties;
      for (p = 0; p < theProps.length; p++) {
        theKeys[i][p] = {
          prop: theProps[p],
          sKeys: theProps[p].selectedKeys
        };
      }
    }
    for (i = 0; i < theLayers.length; i++) {
      for (p = 0; p < theKeys[i].length; p++) {
        prop = theKeys[i][p].prop;
        propKeys = theKeys[i][p].sKeys;
        for (kf = 0; kf < propKeys.length; kf++) {
          if (timeQuantisation) {
            qTime = theComp.frameDuration * timeQuantisation * Math.round(prop.keyTime(propKeys[kf]) / (theComp.frameDuration * timeQuantisation));
            kVal = (valQuantisation)
              ? valQuantisation * Math.round(prop.valueAtTime(qTime, true) / valQuantisation)
              : prop.valueAtTime(qTime, true);
            prop.removeKey(propKeys[kf]);
            prop.setValueAtTime(qTime, kVal);
          }
        }
      }
    }
  } catch (e) {
    alert(e.name + '->' + e.message);
  }
  app.endUndoGroup();
}

function buildUI(thisObj) {
  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window('palette', scriptName, undefined, {resizeable: true});
  }
  pal.add('staticText', undefined, 'Quantise time to how many whole keyframes:');
  var timeQSlider = pal.add('slider', undefined, 1, 0, 100);
  var timeQEditText = pal.add('editText', udefined, parseInt(timeQSlider.value, 10));
  pal.add('staticText', undefined, 'Quantise values to how many pixels:');
  var valueQSlider = pal.add('slider', undefined, 1, 0, 100);
  var valueQEditText = pal.add('editText', udefined, parseInt(valueQSlider.value, 10));
  // var selectedOnlyCheckBox = pal.add('checkbox', undefined, true, 'selected KFs
  // only')
  var quantisor = pal.add('button', undefined, 'quantise keys');

  timeQSlider.onChanging = function () {
    //update the edit box,
    timeQSlider.value = Math.round(timeQSlider.value);
    timeQEditText.text = '' + Math.round(timeQSlider.value);
  };
  valueQSlider.onChanging = function () {
    valueQSlider.value = Math.round(valueQSlider.value);
    //update the edit box,
    valueQEditText.text = '' + Math.round(valueQSlider.value);
  };
  timeQEditText.onChange = function () {
    // update the slider
    timeQSlider.value = parseInt(timeQEditText.text, 10);
    timeQEditText.text = '' + timeQSlider.value;
  };
  valueQEditText.onChange = function () {
    // update the slider
    valueQSlider.value = parseInt(valueQEditText.text, 10);
    valueQEditText.text = '' + valueQSlider.value;
  };

  quantisor.onClick = function () {
    quantiseKeyFrames(timeQSlider.value, valueQSlider.value);
  };
}

buildUI(this);
