//@target aftereffects
//this-n-that ©2016 Stephen Dixon
//
//selects nth layers

var scriptName = 'this-n-that';

function buildUI(thisObj) {
  var selectBttn;
  var deselectBttn;
  var logicDDown;
  var bttnGrp;
  var nthGrp;
  var logicGrp;
  var logicList = [
    'set',
    'and (intersect)',
    'or (add)',
    'xor (difference)',
    'select in current',
    '-',
    '-',
    '-'
  ];
  var nthText;
  var offsetText;
  var suffixTxt;
  var offsetGrp;

  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window('palette', scriptName, undefined, {resizeable: true});
  }

  if (pal !== null) {
    bttnGrp = pal.add('group');
    bttnGrp.orientation = 'row';
    selectBttn = bttnGrp.add('button', undefined, 'select');
    deselectBttn = bttnGrp.add('button', undefined, 'deselect');
    selectionModePanel = pal.add('panel', undefined, 'select layers:');
    selectionModePanel.orientation = 'column';
    selectionModePanel.alignChildren = 'left';
    selectionModePanel.size = {
      width: 180,
      height: undefined
    };
    nthGrp = selectionModePanel.add('group');
    nthGrp.orientation = 'row';
    nthGrp.minimumSize = {
      width: 120,
      height: undefined
    };
    nthGrp.add('staticText', undefined, 'select every');
    nthText = nthGrp.add('editText', undefined, '2');
    suffixTxt = nthGrp.add('staticText', undefined, 'nd');
    nthText.minimumSize = {
      width: 30,
      height: undefined
    };
    suffixTxt.minimumSize = {
      width: 30,
      height: undefined
    };
    offsetGrp = selectionModePanel.add('group');
    offsetGrp.minimumSize = {
      width: 120,
      height: undefined
    };
    offsetGrp.add('staticText', undefined, 'starting from');
    offsetText = offsetGrp.add('editText', undefined, '1');
    offsetText.minimumSize = {
      width: 30,
      height: undefined
    };
    randomChckBx = selectionModePanel.add('checkbox', undefined, 'random');
    logicGrp = pal.add('group');
    logicGrp.orientation = 'row';
    logicGrp.add('staticText', undefined, 'selection logic');
    logicDDown = logicGrp.add('dropDownList', undefined, logicList);
    logicDDown.selection = 0;
  }

  offsetText.onChange = function() {
    offsetText.text = '' + (
    (Math.abs(parseInt(offsetText.text, 10)) || 1));
  };

  nthText.onChange = function() {
    var val = (parseInt(nthText.text, 10) || 0);
    nthText.text = '' + (
    (Math.abs(val) || 0));
    var teens = val % 100;
    var ones = val % 10;

    if ((teens < 20 & teens > 10) || (ones > 3) || (ones === 0)) {
      suffixTxt.text = 'th';
    } else if (ones === 1) {
      suffixTxt.text = 'st';
    } else if (ones === 2) {
      suffixTxt.text = 'nd';
    } else if (ones === 3) {
      suffixTxt.text = 'rd';
    }
    pal.layout.layout(recalculate);
  };

  function findNthLayer(i, nth, offset, randoz, sense) {
    var result;
    //setting sense to false inverts the output
    if (nth === 1 & i >= offset) { //select em all
      return sense;
    }
    if (randoz) {
      //select 1/nth of the layers - since they are sorted randomly this selects a precise proportion, at random
      result = (i < (numIndexes - offset) / nth & i >= offset) & sense;
      return (sense === result);
    }
    //selection based on index
    result = (i - (offset - 1)) % nth === 0;
    return (sense === result);
  }

  function makeIndexArr(originalLayers, randoz, logic) {
    var i;
    var theIndexes = [];
    //put the indices into an array.
    if (logic === 'select in current') {
      for (i = 1; i <= originalLayers.length; i++) {
        if (originalLayers[i].selected) {
          theIndexes.push(originalLayers[i].index);
        }
      }
    } else {
      for (i = 1; i <= originalLayers.length; i++) {
        theIndexes.push(originalLayers[i].index);
      }
    }
    //..so that we can sort them for the random function
    if (randoz) {
      theIndexes.sort(function() {
        return (1 - Math.random() * 2);
      });
    }
    return theIndexes;
  }

  function selectLayers(sense) {
    // do the hoo-hah
    var originalLayers = app.project.activeItem.layers;
    var i;
    var nth = parseInt(nthText.text, 10);
    var offset = parseInt(offsetText.text, 10);
    var logic = logicDDown.selection.text;
    var isNth;
    var isSelxd;
    var theIndexes = [];
    var randoz = randomChckBx.value;
    app.beginUndoGroup('this-n-that');

    theIndexes = makeIndexArr(originalLayers, randoz, logic);
    numIndexes = theIndexes.length;

    for (i = 0; i < numIndexes; i++) {
      // is the layer on the list?
      isNth = findNthLayer(i, nth, offset, randoz, sense);
      // apply the logic
      isSelxd = originalLayers[theIndexes[i]].selected;
      if (logic === 'set' || logic === 'select in current') {
        originalLayers[theIndexes[i]].selected = isNth;
      } else if (logic === 'and (intersect)') {
        originalLayers[theIndexes[i]].selected = isNth & isSelxd;
      } else if (logic === 'or (add)') {
        originalLayers[theIndexes[i]].selected = isNth || isSelxd;
      } else if (logic === 'xor (difference)') {
        originalLayers[theIndexes[i]].selected = (!(isNth & isSelxd)) & (isNth || isSelxd);
      }
    }

    app.endUndoGroup();
  }

  selectBttn.onClick = function() {
    selectLayers(true);
  };

  deselectBttn.onClick = function() {
    selectLayers(false);
  };

  //actually build the GUI

  if (pal instanceof Window) {
    pal.center();
    pal.show();
  } else {
    pal.layout.layout(true);
  }
}

buildUI(this);
