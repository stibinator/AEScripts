// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function(){
    this.getHomePath = function(){
        $.writeln($.os);
        if ($.os.match("Windows.*")){
            var osHome = system.callSystem("cmd.exe /c \"echo %HOMEPATH%\"" );
        } else {
            var osHome = system.callSystem("echo $HOME");
        }
        var homeFol = new Folder (osHome);
        return homeFol.toString().replace("%0D%0A", "");
    }
    
    this.findCommonFolder = function(theProj, hp){
        //find root folder of project
        
        var commonFolder = false;
        for(var i = 1; i <= theProj.numItems; i++){
            var theItem = theProj.item(i);
            if (commonFolder === false){commonFolder = theItem.file.toString().split("/");}
            if( theItem instanceof FootageItem && theItem.file){
                var filePath = theItem.file.toString()
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
    
    this.name = "Collect with relative paths";
    app.beginUndoGroup(this.name);
    var theProj = app.project;
    if (theProj ){
        var hp = this.getHomePath();
        var destFolder =  new Folder();
        destFolder = destFolder.selectDlg()
        var rootFolder = this.findCommonFolder(theProj, hp);
        for(var i = 1; i <= theProj.numItems; i++){
            var theItem = theProj.item(i);
            if( theItem instanceof FootageItem && theItem.file){
                var filePath = theItem.file.toString();
                filePath = filePath.replace(/^~/, hp).replace(/^\//, ""); 
                var dest = [destFolder, filePath].join("/");
                var relativeFolder = filePath;
                if (rootFolder){
                    replaceStr = new RegExp("^" + rootFolder)
                    var relativeFolder = filePath.replace(replaceStr);
                }
                dest = [destFolder, relativeFolder].join("/");
                var folderTree = relativeFolder.split("/");
                var parentFolder = destFolder.toString();
                for (dir = 0; dir < folderTree.length -1; dir++){
                    var newFolder = new Folder([parentFolder, folderTree[dir]].join("/"));
                    newFolder.create();
                    parentFolder = newFolder.toString();
                }
                // $.writeln(dest);
                if (!(new File(dest)).exists){
                    theItem.file.copy(dest);
                }
                try{
                    theItem.replace(new File(dest));
                } catch(e){
                    $.writeln(e)
                }
            }
            $.writeln("copied " + i + " of " + theProj.numItems);
        }
        var projectFolder = new Folder([destFolder, "AE Project File"].join("/"));
        projectFolder.create();
        theProj.save(new File([projectFolder, theProj.file.name].join("/")));
    }
    app.endUndoGroup();
})()

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
