// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au

// the cloninator clones an item in a comp and creates a
// new source for it in the project (c)2016 Stephen Dixon

/* global app, Panel, $, isValid */
(function (thisObj) {



  var scriptName = 'cloninate';



  function makeUniqueCompName(oldSource, prefix, suffix) {
    if (oldSource.name) {
      if (!suffix) { suffix = '' }
      if (!prefix) { prefix = '' }
      // Create a unique name, given a layer
      // find a serialnumber suffix if one exists e.g. mypic.jpg_1 
      // everyone stand back… 
      // the RE matches any string that ends with '_', '-', or a space,
      // followed by a number. eg foo99bar_9 will match
      // (foo99bar)_(9)
      var re = /(.*[^\d^_])[_\- ](\d*)$/;

      var m = oldSource.name.match(re);
      var oldSourceSerial = m[2];
      var oldSourceBaseName = m[1];

      //default serial number
      var newSourceSerial = 1;

      // if no match, then the source doesn't have a serial number. One of these
      // should catch it
      if (typeof (oldSourceSerial) === 'undefined' || oldSourceSerial === '' || isNaN(parseInt(oldSourceSerial, 10))) {
        // since there was no serial we add a separator onto the base name so that it
        // becomes basename_1 etc
        oldSourceBaseName = oldSource.name + '_';
      } else {
        //there was a serial number, so increment it
        newSourceSerial = 1 + parseInt(oldSourceSerial, 10);
      }

      if (!oldSourceBaseName) {
        oldSourceBaseName = oldSource.name;
      } //shouldn't happen, but you know, regex..
      // we need to check to see if a source layer with the new serial number exists,
      // and if it does we keep incrementing the serial until it doesn't
      while (findDuplicateSourceItems('' + oldSourceBaseName + newSourceSerial)) {
        newSourceSerial++;
      }

      return prefix + oldSourceBaseName + suffix + '_' + newSourceSerial;
    } else {
      return false;
    }
  }

  function findDuplicateSourceItems(theName) {
    var allItems = app.project.items;
    var j;
    for (j = 1; j <= allItems.length; j++) {
      if (app.project.items[j].name === theName) {
        return true;
      }
    }

    return false;
  }

  function reinstateButton(theButton) { //reinstate a button with an oldValue property
    if (!theButton.enabled) { //turn on the footage button and reinstate its value if needs be
      theButton.value = theButton.oldValue;
      theButton.enabled = true;
    }
  }

  function duplicateLayerSource(theLayer) {
    //first deselect all the layers
    var oldLayerSelection = [];
    var theComp = theLayer.containingComp;
    for (i = 1; i < + theComp.numLayers; i++) {
      if (theComp.layers[i].selected) {
        oldLayerSelection.push(i);
        theComp.layers[i].selected = false;
      }
    }

    // select the layer we want to dupe the source for
    theLayer.selected = true;
    // so kludgy, but it's the only way
    app.executeCommand(app.findMenuCommandId("Reveal Layer Source in Project"));
    app.executeCommand(app.findMenuCommandId("Duplicate"));
    // when we duplicate an item it will be selected
    var newItem = app.project.selection[0];

    // now put all the selection back to how we found it

    // now in the comp
    for (var i = 1; i < oldLayerSelection.length; i++) {
      theComp.layer(oldLayerSelection[i]).selected = true;
    }
    return (newItem);
  }

  function cloninate(
    // duplicate an item, making its ancestors unique
    originalItem,
    recursionLimit,
    replaceOriginal,
    recursionDepth) {
    var newItem;
    // recursionLimit < 0 means infinite. We start at recursion level = 0 so if the
    // user has limited it to 0 recursions only dupe the outer layer
    if (recursionLimit < 0 || recursionDepth <= recursionLimit) {
      if (originalItem instanceof CompItem) {
        // item is either comp in project window
        // or the currently active comp.
        newItem = originalItem.duplicate();
        for (var i = 1; i <= newItem.numLayers; i++) {
          cloninate(
            originalItem.layer(i),
            recursionLimit,
            replaceOriginal = true,
            recursionDepth + 1);
          if (recursionDepth > 0 || replaceOriginal) {
            originalItem.remove() // TODO check this
          }
        }
        return newItem;
      }
      if (originalItem instanceof FootageItem) {
        // footageItem in project window
        newItem = app.project.importFile(new ImportOptions(originalItem.file));
        // synch original and new item
        newItem.mainSource.alphaMode = originalItem.mainSource.alphaMode;
        newItem.mainSource.conformFrameRate = originalItem.mainSource.conformFrameRate;
        newItem.mainSource.displayFrameRate = originalItem.mainSource.displayFrameRate;
        newItem.mainSource.fieldSeparationType = originalItem.mainSource.fieldSeparationType;
        newItem.mainSource.hasAlpha = originalItem.mainSource.hasAlpha;
        newItem.mainSource.highQualityFieldSeparation = originalItem.mainSource.highQualityFieldSeparation;
        newItem.mainSource.invertAlpha = originalItem.mainSource.invertAlpha;
        newItem.mainSource.isStill = originalItem.mainSource.isStill;
        newItem.mainSource.loop = originalItem.mainSource.loop;
        newItem.mainSource.nativeFrameRate = originalItem.mainSource.nativeFrameRate;
        newItem.mainSource.premulColor = originalItem.mainSource.premulColor;
        newItem.mainSource.removePulldown = originalItem.mainSource.removePulldown;
        return newItem;
      }
      if (originalItem instanceof AVLayer) {
        // layer is a footage layer
        newItem = originalItem.duplicate();
        newItem.source = cloninate(
          originalItem.source,
          recursionLimit,
          replaceOriginal = false,
          recursionDepth + 1);
        return newItem;
      }
    }
  }


  function buildUI(thisObj) {
    var cloninateBttn;
    var replacinateBttn;
    var recurseGrp;
    var levelGroup;
    var infiniteRecurseBttn;
    var recursionLimitTextBx;
    var recurseIntoCompsBtn;
    var btnGrp;
    var pal = thisObj;
    if (!(pal instanceof Panel)) {
      pal = new Window('palette', scriptName, undefined, { resizeable: true });
    }

    if (pal !== null) {
      btnGrp = pal.add('group', undefined, { orientation: 'row' });
      cloninateBttn = btnGrp.add('button', [
        undefined, undefined, 90, 22
      ], 'cloninate');
      replacinateBttn = btnGrp.add('button', [
        undefined, undefined, 90, 22
      ], 'replacinate');

      recurseIntoCompsBtn = pal.add('checkbox', [
        undefined, undefined, 180, 22
      ], ' recurse into comps');

      recurseGrp = pal.add('panel', undefined, 'recursion level', { alignChildren: "left" });
      recurseGrp.orientation = 'column';

      levelGroup = recurseGrp.add('group', undefined, {
        orientation: 'row',
        alignChildren: "left"
      });
      levelGroup.alignChildren = ['left', 'center'];
      infiniteRecurseBttn = levelGroup.add('checkbox', [
        undefined, undefined, 100, 22
      ], 'infinite');
      recursionLimitTextBx = levelGroup.add('editText', [
        undefined, undefined, 30, 22
      ], '1');

      levelGroup.add('staticText', undefined, 'limit:');
      recursionLimitTextBx.enabled = true;
      recursionLimitTextBx.width = 40;
      infiniteRecurseBttn.value = false;
      recurseIntoCompsBtn.value = false;
      recurseIntoCompsBtn.oldValue = false; // see below

      infiniteRecurseBttn.onClick = function () {
        if (infiniteRecurseBttn.value) {
          reinstateButton(recurseIntoCompsBtn);
          recursionLimitTextBx.enabled = false; //infinite overrides the limit
        } else {
          recursionLimitTextBx.enabled = true;
          if (parseInt(recursionLimitTextBx.text, 10) === 0) {
            // both recursion methods are off so turn off the footage switch remember the
            // value so it can be reinstated when I uncheck the "selected only" checkbox
            recurseIntoCompsBtn.oldValue = recurseIntoCompsBtn.value;

            //turn it off so it's unambiguous
            recurseIntoCompsBtn.value = false;
            recurseIntoCompsBtn.enabled = false;
          }
        }
      };

      recursionLimitTextBx.onChange = function () {
        if (isNaN(parseInt(recursionLimitTextBx.text, 10))) {
          recursionLimitTextBx.text = 0;
        }

        if (parseInt(recursionLimitTextBx.text, 10) === 0) { //user set no recursion
          infiniteRecurseBttn.value = false;

          // recursion is off so turn off the footage switch remember the value so it can
          // be reinstated when I uncheck the "selected only" checkbox
          recurseIntoCompsBtn.oldValue = recurseIntoCompsBtn.value;

          //turn it off so it's unambiguous
          recurseIntoCompsBtn.value = false;
          recurseIntoCompsBtn.enabled = false;
        } else if (parseInt(recursionLimitTextBx.text, 10) < 0) { //user set <0 recursion => infinite
          infiniteRecurseBttn.value = true;
          recursionLimitTextBx.enabled = false;
          reinstateButton(recurseIntoCompsBtn);
        } else if (parseInt(recursionLimitTextBx.text, 10) > 0) { //user set limited recursion
          infiniteRecurseBttn.value = false;
          reinstateButton(recurseIntoCompsBtn);
        }
      };

      cloninateBttn.onClick = function () {
        // do the hoo-hah
        var originalItems = app.project.activeItem.selectedLayers;
        var i;
        // var layerHistory = [];
        // recursionLimit of -1 == infinite recursion
        var recursionLimit = (infiniteRecurseBttn.value)
          ? -1
          : parseInt(recursionLimitTextBx.text, 10);


        app.beginUndoGroup('cloninator');
        var originalIsCompInProjectWindow = (originalItems.length === 0);
        if (originalIsCompInProjectWindow) {
          cloninate(app.project.activeItem, recursionLimit, recurseIntoCompsBtn.value, 0);
        } else {
          for (i = 0; i < originalItems.length; i++) {
            cloninate(originalItems[i], recursionLimit, recurseIntoCompsBtn.value, false, 0);
            originalItems[i].selected = true
          }
        }
        app.endUndoGroup();
      };

      replacinateBttn.onClick = function () {
        // do the hoo-hah
        var originalItems = app.project.activeItem.selectedLayers;
        var i;
        // var layerHistory = [];
        // recursionLimit of -1 == infinite recursion
        var recursionLimit = (infiniteRecurseBttn.value)
          ? -1
          : parseInt(recursionLimitTextBx.text, 10);


        app.beginUndoGroup('cloninator');
        var originalIsCompInProjectWindow = (originalItems.length === 0);
        if (!originalIsCompInProjectWindow) {
          for (i = 0; i < originalItems.length; i++) {
            cloninate(originalItems[i], recursionLimit, recurseIntoCompsBtn.value, false, 0);
            originalItems[i].remove();
          }
        }
        app.endUndoGroup();
      };
    }

    if (pal instanceof Window) {
      pal.center();
      pal.show();
    } else {
      pal.layout.layout(true);
    }
  }

  function isTypeOf(anItem, type) {
    var TYPES = {
      composition: /Komposition|Composición|Composition|Composizione|コンポジション|컴포지션|Composição|Композиция|合成/,
      folder: /Folder|Ordner|Carpeta|Dossier|Cartella|フォルダー|폴더|Pasta|Папка|文件夹/,
      footage: /Footage|Material de archivo|Métrage|Metraggio|フッテージ|푸티지|Gravação|Видеоряд|素材/

    }
    if (TYPES[type]) {
      return TYPES[type].test(anItem.typeName)
    }
    return false
  }

  buildUI(thisObj);
})(this)
//cloninate(app.project.activeItem.selectedLayers[0], -1, true, false, 0);

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



