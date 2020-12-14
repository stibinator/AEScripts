/* global app, Panel, writeLn */
// first-n-last a handy comp trimmer that can trim to layers that extend before
// or after the comp's start and finish you can also trim to selected layers.

function getLayers(theComp, useSelected) {
if (theComp && theComp.layers){
  if (useSelected) {
    if (theComp.selectedLayers.length > 0) {
      var theLayers = theComp.selectedLayers; //selectedLayers is indexed from 0...
    } else {
      alert('you need to select some layers to trim to the selection');
      return false;
    }
  } else {
    theLayers = [];
    for (var i = 1; i <= theComp.layers.length; i++) { //but compItem.layers is indexed from 1! WTF?
      theLayers.push(theComp.layer(i));
    }
  }
  return theLayers;
} else {
          alert('you need to use this in a composition window');
    }
}

function trimToLastLayer(theComp, useSelected, toSource, extendLayers, recurse, doLocked) {
  var theLayers = getLayers(theComp, useSelected);
  if (theLayers) {
    var lastOut = 0;
    if (theLayers.length > 0) {
      var isFootageLayer;
      for (var i = 0; i < theLayers.length; i++) {
        // find out if it is a moving source layer, in case we want to trim from the
        // source.
        if (theLayers[i].source) {
          isFootageLayer = theLayers[i].source.duration !== 0;
        } else {
          isFootageLayer = false;
        }
        // if we want to trim from the source we use the source files duration obviously
        // that makes no sense if time remapping is on
        var layerOut;
        if (toSource && isFootageLayer && theLayers[i].timeRemapEnabled === false) {
          layerOut = theLayers[i].startTime + theLayers[i].source.duration;
        } else {
          //or just use the layer out time
          layerOut = theLayers[i].outPoint;
        }
        if (layerOut > lastOut) {
          writeLn(layerOut + '>' + lastOut);
          lastOut = layerOut;
        }
      }
      trimToTime(lastOut, theComp, false, extendLayers, recurse, doLocked)
    }
  }
}

function trimToFirstLayer(theComp, useSelected, toSource, extendLayers, recurse, doLocked) {

  var theLayers = getLayers(theComp, useSelected);
   if (theLayers) {
    var firstIn = theComp.duration;
    if (theLayers.length > 0) {
      for (var i = 0; i < theLayers.length; i++) {
        // find out if it is a moving source layer, in case we want to trim from the
        // source
        var theLayer = theLayers[i];
        var isFootageLayer;

        if (theLayer.source) {
          //has a file, but is it moving?
          isFootageLayer = theLayer.source.duration !== 0;
        } else {
          isFootageLayer = false;
        }
        var layerIn;
        if (toSource && isFootageLayer && (theLayer.timeRemapEnabled === false)) {
          //trim to the source's start time in the comp
          layerIn = theLayer.startTime;
        } else {
          layerIn = theLayer.inPoint;
        }
        if (layerIn < firstIn) {
          writeLn(layerIn + '<' + firstIn);
          firstIn = layerIn;
        }
      }
      trimToTime(firstIn, theComp, true, extendLayers, recurse, doLocked)
      // writeLn("set comp start to " + timeToCurrentFormat(firstIn,
      // theComp.frameRate, true));
    }
  }
}

function trimToFirstAndLastLayers(theComp, useSelected, toSource, extendLayers, recurse, doLocked) {
  trimToFirstLayer(theComp, useSelected, toSource, extendLayers, recurse, doLocked);
  trimToLastLayer(theComp, useSelected, toSource, extendLayers, recurse, doLocked);
}

function trimToTime(theTime, theComp, first, extendLayers, recurse, doLocked) {
  var oldDuration;
  if (first) {
    extendHeads(theComp, theTime, recurse, doLocked);

    theComp.duration = theComp.duration - theTime;
    theComp.time = 0;
  } else {
    oldDuration = theComp.duration;
    theComp.duration = theTime;// + theComp.frameDuration; //there was an off-by one error here originally. Remember that the duration is the number of the last frame + 1

    if (extendLayers) {
      extendTails(theComp, oldDuration, theComp.duration, doLocked, recurse);
    }
  }
}

function extendHeads(theComp, newStartTime, extendLayers, recurse, doLocked){
  for (var n = 1; n <= theComp.layers.length; n++) {
    var theLayer = theComp.layer(n);
    var layerWasLocked = theLayer.locked;
    theLayer.locked = false;
    //find where the layer started
    var oldInPoint = theLayer.inPoint;
    //offset it by the negative of the amount we're lengthening/shortening the comp
    theLayer.startTime = theLayer.startTime - newStartTime;
    // recurse into nested comps
    if ((theLayer.source) && (theLayer.source.typeName === 'Composition') && recurse) {
      trimToTime(newStartTime, theLayer.source, true, true, recurse, doLocked);
    }
    // extend any layers that started at 0
    if (extendLayers && (oldInPoint <= 0 || oldInPoint <= newStartTime)) {
      theLayer.inPoint = 0;
    }
    if (layerWasLocked) {
      theLayer.locked = true;
    }
  }
}

function extendTails(theComp, oldDuration, newDuration, doLocked, recurse) {
  for (var n = 1; n <= theComp.layers.length; n++) { //
    var theLayer = theComp.layer(n);
    var layerWasLocked = theLayer.locked;
    if (doLocked) {
      theLayer.locked = false;
    }
    if (! theLayer.locked) {
      // if the layer currently ends at or after the end of the comp extend it
      if (theLayer.outPoint >= oldDuration) {
        //   // recurse into nested comps
        if (theLayer.source && ((theLayer.source.typeName === 'Composition') && recurse)) {
          //     // make sure the nested comps time is synched
          //alert("recursing");
          theLayer.source.time = newDuration - theLayer.startTime;
          trimToTime(newDuration, theLayer.source, false, true, recurse, doLocked);
        }
        // add the extra time needed
        theLayer.outPoint = theComp.duration + theLayer.outPoint - oldDuration;

      }
      if (layerWasLocked) {
        theLayer.locked = true;
      }
    }
  }

}

function buildUI(thisObj) {
  var imgFolder = 'first-n-last/'; //for production
  // var imgFolder = 'C:/Users/sdixon/AppData/Roaming/Adobe/After Effects/16.0/Scripts/ScriptUI Panels/first-n-last/'; //for debug
  var scriptName = "first n last";
  var pal;
  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window('palette', scriptName, undefined, {resizeable: true});
  }
  if (pal !== null) {
    // trimFirst = pal.add("button",  [undefined, undefined, 220, 22], '||< Trim to
    // first In-Point');
    var row1 = pal.add("group{orientation:'row', alignment: ['fill','top'], alignChildren: ['fill','top'" +
    ']}');

    var trimFirst = row1.add('iconbutton', {
      x: undefined,
      y: undefined,
      width: 40,
      height: 32
    }, new File(imgFolder + 'first.png'));

    var trimFirstnLast = row1.add('iconbutton', {
      x: undefined,
      y: undefined,
      width: 46,
      height: 32
    }, new File(imgFolder + 'firstnlast.png'));

    var trimLast = row1.add('iconbutton', {
      x: undefined,
      y: undefined,
      width: 40,
      height: 32
    }, new File(imgFolder + 'last.png'));

    var row2 = pal.add("group{orientation:'column', alignment: ['left','top'], alignChildren: ['left','t" +
    "op']}");

    var useSelected = row2.add('checkbox', {
      x: undefined,
      y: undefined,
      width: 120,
      height: 16
    }, 'Trim to selected');

    var toSource = row2.add('checkbox', [
      undefined, undefined, 120, 18
    ], 'Trim to source');

    var row3 = pal.add("group{orientation:'row', alignment: ['fill','top'], alignChildren: ['fill','top'" +
    ']}');

 var addToStart = row3.add('iconbutton', {
      x: undefined,
      y: undefined,
      width: 40,
      height: 32
    }, new File(imgFolder + 'addStart.png'));

    var trimStartToCurrent = row3.add('iconbutton', { 
      x: undefined,
      y: undefined,
      width: 40,
      height: 32
    }, new File(imgFolder + 'startCurrent.png'));

    var trimEndToCurrent = row3.add('iconbutton', {
      x: undefined,
      y: undefined,
      width: 40,
      height: 32
    }, new File(imgFolder + 'endCurrent.png'));

 var addToEnd = row3.add('iconbutton', {
      x: undefined,
      y: undefined,
      width: 40,
      height: 32
    }, new File(imgFolder + 'addEnd.png'));

    var row4 = pal.add("group{orientation:'column', alignment: ['left','top'], alignChildren: ['left','t" +
    "op']}");

    var extendLayersChkBx = row4.add('checkbox', {
      x: undefined,
      y: undefined,
      width: 120,
      height: 16
    }, 'Extend layers');

    var recuseChkBx = row4.add('checkbox', [
      undefined, undefined, 120, 18
    ], 'recurse into nested');

    var row5 = pal.add("group{orientation:'column', alignment: ['left','top'], alignChildren: ['left','t" +
    "op']}");

    var doLockedchkBx = row5.add('checkbox', {
      x: undefined,
      y: undefined,
      width: 120,
      height: 16
    }, 'include locked');

    useSelected.value = false;
    row2.spacing = 8;
    row1.spacing = 4;
    //        useSelected.onclick = function () {useSelected.value =  !
    // useSelected.value};
    trimFirst.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      trimToFirstLayer(app.project.activeItem, useSelected.value, toSource.value, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
    trimFirstnLast.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      trimToFirstAndLastLayers(app.project.activeItem, useSelected.value, toSource.value, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
    trimLast.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      trimToLastLayer(app.project.activeItem, useSelected.value, toSource.value, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
    trimStartToCurrent.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      var theComp = app.project.activeItem;
      trimToTime(theComp.time, theComp, true, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
    trimEndToCurrent.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      var theComp = app.project.activeItem;
      trimToTime(theComp.time + theComp.frameDuration, theComp, false, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
    addToStart.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      var theComp = app.project.activeItem;
      trimToTime(0 - 5, theComp, true, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
    
    addToEnd.onClick = function () {
      app.beginUndoGroup("Trim to first layer");
      var theComp = app.project.activeItem;
      trimToTime(theComp.duration + 5, theComp, false, extendLayersChkBx.value, recuseChkBx.value, doLockedchkBx.value);
      app.endUndoGroup();
    };
  }
  if (pal instanceof Window) {
    pal.center();
    pal.show();
  } else {
    pal
    .layout
    .layout(true);
  }
}

buildUI(this);
//trimToTime(app.project.activeItem.time, app.project.activeItem, false, true, true, true);