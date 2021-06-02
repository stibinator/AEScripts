// @target aftereffects
/* jshint ignore:start */
// Code here will be ignored by JSHint.
// @include "imageButtons.jsx"
// @includepath "../(lib)"
// @include "defaultFor.jsx"
// @include "getproperties.jsx"
// @include "copyproperties-makekey.jsx"
// @script "copyMultiLayer"
/* jshint ignore:end */
var thisScript = this;
thisScript.scriptTitle = "copyMultiLayer";

thisScript.run = function() {
  this.buildGUI(this);
};




thisScript.buildGUI = function(thisObj) {

  //thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
  thisObj.w = (thisObj instanceof Panel)? thisObj : new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
  if (thisObj.w === null) return null;
  thisObj.w.alignChildren = ['fill', 'fill'];
  thisObj.w.margins = 5;
  thisObj.w.spacing = 2;
  var row1 = thisObj.w.add('group');
    img= "/C/Program Files/Adobe/Adobe After Effects CC 2015.3/Support Files/Scripts/ScriptUI Panels/copy_multi/copy.png";
    imgo = "/C/Program Files/Adobe/Adobe After Effects CC 2015.3/Support Files/Scripts/ScriptUI Panels/copy_multi/copy-o.png";
  var copyBttn = addImageButton(row1,"copy keys", img, "copy keys", imgo);
  if (thisObj.w instanceof Window) {
        thisObj.w.center();
        thisObj.w.show();
    } else {
        thisObj.w.layout.layout(true);
    }
};



thisScript.run();
