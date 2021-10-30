// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var thisScript = this;

thisScript.buildGUI = function(thisObj) {
    thisObj.pal = (thisObj instanceof Panel)?
    thisObj: 
    new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    // ----------------------- UI Elements here ---------------------
    
    thisObj.pal.text = "Collect Preserving Paths"; 
    thisObj.pal.orientation = "column"; 
    thisObj.pal.alignChildren = ["left","top"]; 
    thisObj.pal.spacing = 10; 
    thisObj.pal.margins = 16; 
    
    // PANEL1
    // ======
    var panel1 = thisObj.pal.add("panel", undefined, undefined); 
    panel1.text = "Destination"; 
    panel1.preferredSize.width = 180; 
    panel1.orientation = "column"; 
    panel1.alignChildren = ["left","top"]; 
    panel1.spacing = 6; 
    panel1.margins = 10; 
    
    // GROUP1
    // ======
    var group1 = panel1.add("group", undefined); 
    group1.orientation = "column"; 
    group1.alignChildren = ["left","top"]; 
    group1.spacing = 10; 
    group1.margins = 0; 
    
    var destFoldrBtn = group1.add("button", undefined, undefined); 
    destFoldrBtn.text = "Choose";
    destFoldrBtn.preferredSize.width = 180;
    
    thisObj.destFoldrTxt = group1.add("statictext", undefined, undefined); 
    thisObj.destFoldrTxt.preferredSize.width = 180; 
    thisObj.destFoldrTxt.text = "None"; 
    
    // do the things button
    // ======
    
    thisObj.doTheThingsBtn = panel1.add("button", undefined, undefined); 
    thisObj.doTheThingsBtn.enabled = false; 
    thisObj.doTheThingsBtn.preferredSize.width = 180; 
    thisObj.doTheThingsBtn.text = "Start"; 
    
    var radioPanel = panel1.add("panel", undefined, "After collecting open:");
    radioPanel.preferredSize.width = 180;
    radioPanel.alignChildren = ["left", "top"];
    radioPanel.margins = [10,10,10,4];
    radioPanel.spacing = 0; 
    thisObj.origRadio = radioPanel.add( "radiobutton", undefined, "Original project" );
    newRadio = radioPanel.add( "radiobutton", undefined, "New collected project" );
    thisObj.origRadio.value = true;
    
    thisObj.progressBar = panel1.add("progressbar", undefined, undefined); 
    thisObj.progressBar.preferredSize.width = 180; 
    thisObj.progressBar.maxvalue = 100; 
    thisObj.progressBar.value = 0; 
    thisObj.progressBar.preferredSize.height = 4; 
    
    thisObj.progressTxt1 = panel1.add("statictext", undefined, undefined); 
    thisObj.progressTxt1.preferredSize.width = 180;
    thisObj.progressTxt2 = panel1.add("statictext", undefined, undefined); 
    thisObj.progressTxt2.preferredSize.width = 180;
    thisObj.progressTxt3 = panel1.add("statictext", undefined, undefined); 
    thisObj.progressTxt3.preferredSize.width = 180;
    
    //------------------------ Callbacks ---------------------------
    destFoldrBtn.onClick = function(){
        thisObj.destFolder =  new Folder();
        thisObj.destFolder = destFolder.selectDlg();
        if (thisObj.destFolder){
            thisObj.destFoldrTxt.text = thisObj.destFolder.toString();
            thisObj.doTheThingsBtn.enabled = true;
        }
    }
    
    thisObj.doTheThingsBtn.onClick = function(){
        thisObj.progressBar.value = 0;
        thisScript.doTheThings(thisObj);
    }
    
    thisObj.writeMsg = function(theMessage){
        //scrolling text box
        thisObj.progressTxt1.text = thisObj.progressTxt2.text;
        thisObj.progressTxt2.text = thisObj.progressTxt3.text;
        thisObj.progressTxt3.text = theMessage;
    }
    //------------------------ build the GUI ------------------------
    if (thisObj.pal instanceof Window) {
        thisObj.pal.center();
        thisObj.pal.show();
    } else{
        thisObj.pal.layout.layout(true);
    }
}

//---------------------------- functions n shit ---------------------
thisScript.name = "Collect with relative paths";

thisScript.doTheThings = function(UIObj){
    app.beginUndoGroup(thisScript.name);
    var theProj = app.project;
    theProj.save();
    var originalProjectFile = theProj.file;
    var destFolder = UIObj.destFolder;
    if (!destFolder){
        destFolder =  new Folder();
        destFolder = destFolder.selectDlg();
    }
    if (destFolder){
        if (theProj ){
            var projItemCount = theProj.numItems;
            var hp = thisScript.getHomePath();
            var rootFolder = thisScript.findCommonFolder(theProj, hp);
            var errors = [];
            for(var i = 1; i <= projItemCount; i++){
                var theItem = theProj.item(i);
                UIObj.writeMsg("" + i + " of " + projItemCount + ": " + theItem.name);
                
                UIObj.progressBar.value = 100 * i / projItemCount;
                UIObj.pal.update();
                if( theItem instanceof FootageItem && theItem.file){
                    try{
                        if (! theItem.footageMissing) {
                            var filePath = theItem.file.toString();
                            filePath = filePath.replace(/^~/, hp).replace(/^\//, ""); 
                            
                            var relativeFilePath = filePath.replace(/[\r\n]/g, "");
                            if (rootFolder){
                                replaceStr = new RegExp("^" + rootFolder);
                                relativeFilePath = filePath.replace(replaceStr, "");
                            }
                            var dest = [destFolder, relativeFilePath].join("/");
                            
                            var folderTree = relativeFilePath.split("/");
                            var parentFolder = destFolder.toString();
                            for (dir = 0; dir < folderTree.length -1; dir++){
                                var newFolder = new Folder([parentFolder, folderTree[dir]].join("/"));
                                if (!newFolder.exists) {
                                    newFolder.create();
                                    UIObj.writeMsg("new folder created: " + newFolder.name);
                                }
                                parentFolder = newFolder.toString();
                            }
                            if (!(new File(dest)).exists){
                                theItem.file.copy(dest);
                            }
                            theItem.replace(new File(dest));
                        } 
                    } catch (e) {
                        UIObj.writeMsg(e.message);
                        errors.push("error with " + theItem.name + ":\n" + e.message);
                    }
                }
            }
            var projectFolder = new Folder([destFolder, "AE Project File"].join("/"));
            projectFolder.create();
            UIObj.writeMsg("Saving Project File");
            var newProjName = theProj.file.name.replace(/\.aep$/i, "") + "_Collected"
            var collectedProj = new File([projectFolder, newProjName].join("/"));
            theProj.save(collectedProj);
            if (UIObj.origRadio.value) {
                UIObj.writeMsg("opening original project file")
                app.open(originalProjectFile)
            };
            if (errors.length) {
                alert("There were some errors during export:\n" + errors.join("\n"));
            } 
            UIObj.writeMsg("All done.");
            UIObj.progressBar.value = 0;
        } else {
            UIObj.writeMsg( "No open Project");
        }
    } else { //no dest folder
        UIObj.doTheThingsBtn.enabled = false;
        UIObj.destFoldrTxt = "";
        
    }
    app.endUndoGroup();
}

thisScript.getHomePath = function(){
    $.writeln($.os);
    if ($.os.match("Windows.*")){
        var osHome = system.callSystem('cmd.exe /c "echo %HOMEPATH%"');
        osHome = osHome.replace(/\\/g, "/");
    } else {
        var osHome = system.callSystem("echo $HOME");
    }
    // var homeFol = new Folder (osHome);
    return osHome.replace(/[\r\n]/g, "");
}

thisScript.findCommonFolder = function(theProj, hp){
    //find root folder of project
    
    var commonFolder = false;
    for(var i = 1; i <= theProj.numItems; i++){
        var theItem = theProj.item(i);
        
        if( theItem instanceof FootageItem && theItem.file){
            if (commonFolder === false){commonFolder = theItem.file.toString().split("/");}
            var filePath = theItem.file.toString();
            filePath = filePath.replace(/^~/, hp); 
            filePath = filePath.split("/");
            var newCommonFolder = [];
            for (var f =0; f < (Math.min(commonFolder.length, filePath.length)); f++){
                if (commonFolder[f] === filePath[f]){newCommonFolder.push(commonFolder[f])}
            }
            commonFolder = newCommonFolder; 
        }
    }     
    return commonFolder.join("/");
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
