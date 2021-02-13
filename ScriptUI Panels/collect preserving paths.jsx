//@target aftereffects
var thisScript = this;

thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisObj.pal = (thisObj instanceof Panel)?
    thisObj: 
    new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    // ----------------------- UI Elements here ---------------------
    
    pal.text = "Collect Preserving Paths"; 
    pal.orientation = "column"; 
    pal.alignChildren = ["left","top"]; 
    pal.spacing = 10; 
    pal.margins = 16; 
    
    // PANEL1
    // ======
    var panel1 = pal.add("panel", undefined, undefined); 
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
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 10; 
    group1.margins = 0; 
    
    var destFoldrBtn = group1.add("button", undefined, undefined); 
    destFoldrBtn.text = "Choose"; 
    
    thisObj.destFoldrTxt = group1.add("statictext", undefined, undefined); 
    thisObj.destFoldrTxt.preferredSize.width = 180; 
    thisObj.destFoldrTxt.text = "None"; 
    
    // PANEL1
    // ======
    
    thisObj.doTheThingsBtn = panel1.add("button", undefined, undefined); 
    thisObj.doTheThingsBtn.enabled = false; 
    thisObj.doTheThingsBtn.preferredSize.width = 180; 
    thisObj.doTheThingsBtn.text = "Start"; 
    


    thisObj.progressTxt1 = panel1.add("statictext", undefined, undefined); 
    thisObj.progressTxt1.preferredSize.width = 180;
    thisObj.progressTxt2 = panel1.add("statictext", undefined, undefined); 
    thisObj.progressTxt2.preferredSize.width = 180;
    thisObj.progressTxt3 = panel1.add("statictext", undefined, undefined); 
    thisObj.progressTxt3.preferredSize.width = 180;
    
    thisObj.progressBar = panel1.add("progressbar", undefined, undefined); 
    thisObj.progressBar.preferredSize.width = 180; 
    thisObj.progressBar.maxvalue = 100; 
    thisObj.progressBar.value = 0; 
    thisObj.progressBar.preferredSize.height = 4; 
    
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
    var originalProjectFile = theProj.file;
    var destFolder =UIObj.destFolder;
    if (!destFolder){
        destFolder =  new Folder();
        destFolder = destFolder.selectDlg();
    }
    if (destFolder){
        if (theProj ){
            var projItemCount = theProj.numItems;
            var hp = thisScript.getHomePath();
            var rootFolder = thisScript.findCommonFolder(theProj, hp);
            for(var i = 1; i <= projItemCount; i++){
                var theItem = theProj.item(i);
                UIObj.writeMsg("" + i + " of " + projItemCount + ": " + theItem.name);

                UIObj.progressBar.value = 100 * i / projItemCount;
                UIObj.pal.update();
                if( theItem instanceof FootageItem && theItem.file){
                    var filePath = theItem.file.toString();
                    filePath = filePath.replace(/^~/, hp).replace(/^\//, ""); 
                    var dest = [destFolder, filePath].join("/");
                    var relativeFolder = filePath;
                    if (rootFolder){
                        replaceStr = new RegExp("^" + rootFolder);
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
                        UIObj.writeMsg(e);
                    }
                }
            }
            var projectFolder = new Folder([destFolder, "AE Project File"].join("/"));
            projectFolder.create();
            UIObj.writeMsg( "Saving Project File");
            theProj.save(new File([projectFolder, theProj.file.name].join("/")));
            UIObj.writeMsg("opening original project file")
            app.open(originalProjectFile);
            UIObj.writeMsg( "All done.");
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
        var osHome = system.callSystem("cmd.exe /c \"echo %HOMEPATH%\"" );
    } else {
        var osHome = system.callSystem("echo $HOME");
    }
    var homeFol = new Folder (osHome);
    return homeFol.toString().replace("%0D%0A", "");
}

thisScript.findCommonFolder = function(theProj, hp){
    //find root folder of project
    
    var commonFolder = false;
    for(var i = 1; i <= theProj.numItems; i++){
        var theItem = theProj.item(i);
        if (commonFolder === false){commonFolder = theItem.file.toString().split("/");}
        if( theItem instanceof FootageItem && theItem.file){
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


//---------------------------- ui prefs -----------------------------
thisScript.Preferences = function(scriptName) {
    // look for preferences for this object
    // provide a setPref function to allow values to be stored in AE's preferences
    // scriptName sets the section of the preference file they are saved in.
    this.prefsName = scriptName;
    alert ( this.prefsName);
    parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
            case "int":
            return parseInt(val, 10);
            case "float":
            return parseFloat(val);
            case "bool":
            return (val === "true");
            default:
            return val
        }
    }
    
    this.setPref = function(anObject) {
        var currentVal;
        if (anObject.name){
            if(anObject.hasOwnProperty('value')){
                currentVal = anObject.value;
            } else if (anObject instanceof EditText){
                currentVal = anObject.text;
            } else {
                throw("objects must have a 'text' or 'value' property to set preferences");
            }
            
            if (anObject.savedPref !== currentVal) {
                anObject.savedPref = currentVal;
                app.settings.saveSetting(this.scriptName, anObject.name, currentVal);
            }
        }
    }
    
    this.getPref = function(anObject){
        // constructor
        if (anObject.name ){
            if (app.settings.haveSetting(this.scriptName, anObject.name)) {
                // get prefs for UI control     
                if (anObject instanceof Slider){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "float");   
                } else if (anObject instanceof Checkbox || anObject instanceof Radiobutton){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "bool");
                } else if (anObject instanceof EditText ){
                    anObject.text = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "string");
                } else {
                    // objects can use specified pref types with the type of the returned result determined by a preftype property
                    // otherwise the default is a string
                    anObject.value = anObject.savedPref = anObject.parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), anObject.prefType); 
                }
            }
        } else {
            throw("objects must have a name to be given prefs.");
        }
        
    }
    
    return this;
}

//--------------------- go ahead and run ----------------------
thisScript.buildGUI(this);
