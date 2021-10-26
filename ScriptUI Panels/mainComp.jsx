// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// defines a "main" comp for a project
// and lets you jump straight to it
// without navigating the hierarchy

var thisScript = this;
thisScript.name = "Main Comp";

thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisObj.pal = (thisObj instanceof Panel)?
    thisObj: 
    new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    // ----------------------- UI Elements here ---------------------
    var setMainCompBtn = thisObj.pal.add("button", [undefined, undefined, 180, 22], "Set Main Comp");
    var mainCompText = thisObj.pal.add("staticText", [undefined, undefined, 180, 22], "Not set");
    var jumpToMainCompBtn = thisObj.pal.add("button", [undefined, undefined, 180, 22], "Jump to Main comp");
    jumpToMainCompBtn.enabled = false;
    
    if (app.project.mainComp) {
        jumpToMainCompBtn.enabled = true;
        mainCompText = app.project.mainComp.name;
    } 

    setMainCompBtn.onClick = function () {
        thisScript.setMainComp();
        if (app.project.mainComp){
            mainCompText.text = app.project.mainComp.name;
            jumpToMainCompBtn.enabled = true;
        }
    };
    jumpToMainCompBtn.onClick = function () {
        if (app.project.mainComp) {
            app.project.mainComp.openInViewer();
        }
    };
    
    //------------------------ build the GUI ------------------------
    if (thisObj.pal instanceof Window) {
        thisObj.pal.center();
        thisObj.pal.show();
    } else{
        thisObj.pal.layout.layout(true);
    }
}

//---------------------------- functions n shit ---------------------
thisScript.setMainComp = function(){
    app.project.mainComp = app.project.activeItem;
}

//--------------------- go ahead and run ----------------------
thisScript.buildGUI(this);

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
