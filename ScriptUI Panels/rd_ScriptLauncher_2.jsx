// @target aftereffects
// rd_ScriptLauncherPlus.jsx
// Copyright (c) 2005-2013 redefinery (Jeffrey R. Almasol). All rights reserved.
// check it: www.redefinery.com
// 
// Name: rd_ScriptLauncherPlus
// Version: 3.1
// 
// Description:
// This script displays a palette of the installed scripts 
// in the selected Scripts folder (and subfolders). Only 
// scripts with .js, .jsx, and .jsxbin extensions are 
// displayed. Double-click a script to launch it. Scripts 
// located in subfolders whose names are enclosed in 
// parentheses are ignored. You can change the 
// Scripts folder at any time, and refresh the scripts 
// list if the contents of the folder have changed. The 
// selected scripts folder is stored as a setting, so you 
// don't have to reselect it every time you reopen this palette.
// 
// Note: The palette cannot detect any errors in the scripts 
// that you run from it. It's just a quick way of launching 
// scripts without restarting AE or using ExtendScript 
// Toolkit (i.e., switching away from AE).
// 
// If a PNG file of a similar name and same folder as the 
// script file (but with a .png file name extension) exists, 
// it will appear next to the script name in the list.
// 
// Note: This version of the script requires After Effects 
// CS5 or later. It can be used as a dockable panel by 
// placing the script in a ScriptUI Panels subfolder of 
// the Scripts folder, and then choosing this script 
// from the Window menu.
// 
// Enhancements requested by Russ Maehl, Julian 
// Herrera, and Navarro Parker
// 
// Legal stuff:
// This script is provided "as is," without warranty of any kind, expressed
// or implied. In no event shall the author be held liable for any damages
// arising in any way from the use of this script.
// 
// In other words, I'm just trying to share knowledge with and help out my
// fellow AE script heads, so don't blame me if my code doesn't rate. :-)




// rd_ScriptLauncherPlus()
// 
// Description:
// This function contains the main logic for this script.
// 
// Parameters:
// thisObj - "this" object.
// 
// Returns:
// Nothing.
//
(function rd_ScriptLauncherPlus(thisObj)
{
    // Globals
    
    var rd_ScriptLauncherPlusData = new Object();	// Store globals in an object
    rd_ScriptLauncherPlusData.scriptName = "rd: Script Launcher";
    rd_ScriptLauncherPlusData.scriptTitle = rd_ScriptLauncherPlusData.scriptName + " v3.1";
    rd_ScriptLauncherPlusData.scriptPath = "";
    rd_ScriptLauncherPlusData.scriptFiles = [];
    
    rd_ScriptLauncherPlusData.strScriptsFolder = {en: "Folder..."};
    rd_ScriptLauncherPlusData.addScriptsFolder = {en: "Add Folder..."};
    rd_ScriptLauncherPlusData.strShowPaths = {en: "Show paths"};
    rd_ScriptLauncherPlusData.strRefreshList = {en: "Refresh"};
    rd_ScriptLauncherPlusData.strRun = {en: "Run"};
    rd_ScriptLauncherPlusData.strHelp = {en: "?"};
    rd_ScriptLauncherPlusData.strErrNoScriptsPath = {en: "Cannot open the palette because the Scripts folder could not be located."};
    rd_ScriptLauncherPlusData.strErrMissingFile = {en: "Cannot locate the selected script."};
    rd_ScriptLauncherPlusData.strMinAE100 = {en: "This script requires Adobe After Effects CS5 or later."};
    rd_ScriptLauncherPlusData.strHelpText = 
    {
        en: "Copyright (c) 2005-2013 redefinery (Jeffrey R. Almasol). \n" +
        "All rights reserved.\n" +
        "\n" +
        "This script displays a palette of the installed scripts in the selected Scripts folder (and subfolders). Only scripts with .js, .jsx, and .jsxbin extensions are displayed. Double-click a script to launch it. Double-click a script to launch it. Scripts located in subfolders whose names are enclosed in parentheses are ignored. You can change the Scripts folder at any time, and refresh the scripts list if the contents of the folder have changed. The selected scripts folder is stored as a setting, so you don't have to reselect it every time you reopen this palette.\n" +
        "\n" +
        "Note: The palette cannot detect any errors in the scripts that you run from it. It's just a quick way of launching scripts without restarting AE or using ExtendScript Toolkit (i.e., switching away from AE).\n" +
        "\n" + 
        "If a PNG file of a similar name and same folder as the script file (but with a .png file name extension) exists, it will appear next to the script name in the list.\n" + 
        "\n" +
        "Note: This version of the script requires After Effects CS5 or later. It can be used as a dockable panel by placing the script in a ScriptUI Panels subfolder of the Scripts folder, and then choosing this script from the Window menu.\n" +
        "\n" +
        "Enhancements requested by Russ Maehl, Julian Herrera, and Navarro Parker."
    };
    
    
    
    
    // rd_ScriptLauncherPlus_localize()
    // 
    // Description:
    // This function localizes the given string variable based on the current locale.
    // 
    // Parameters:
    //   strVar - The string variable's name.
    // 
    // Returns:
    // String.
    //
    function rd_ScriptLauncherPlus_localize(strVar)
    {
        return strVar["en"];
    }
    
    
    
    
    // rd_ScriptLauncherPlus_buildUI()
    // 
    // Description:
    // This function builds the user interface.
    // 
    // Parameters:
    // thisObj - Panel object (if script is launched from Window menu); null otherwise.
    // 
    // Returns:
    // Window or Panel object representing the built user interface.
    //
    function rd_ScriptLauncherPlus_buildUI(thisObj)
    {
        var positionPal = (app.settings.haveSetting("redefinery", "rd_ScriptLauncherPlus_frameBounds") && !(thisObj instanceof Panel));
        if (positionPal)
        {
            var bounds = [];
            bounds = app.settings.getSetting("redefinery", "rd_ScriptLauncherPlus_frameBounds").split(",");
            for (i in bounds)
            bounds[i] = parseInt(bounds[i], 10);
        }
        else
        var bounds = undefined;
        
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", rd_ScriptLauncherPlusData.scriptName, bounds, {resizeable:true});
        
        if (pal !== null)
        {
            var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + rd_ScriptLauncherPlusData.scriptName + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strHelp) +"', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                listBox: ListBox { alignment:['fill','fill'], properties:{items:" + rd_ScriptLauncherPlusData.scripts + "} }, \
                footer: Group { \
                    alignment:['fill','bottom'], \
                    folder: Button { text:'" + rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strScriptsFolder) + "', alignment:['left','center'], preferredSize:[-1,20] }, \
                    addFolder: Button { text:'" + rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.addScriptsFolder) + "', alignment:['left','center'], preferredSize:[-1,20] }, \
                    showPaths: Checkbox { text:'" + rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strShowPaths) + "', alignment:['left','bottom'], value:true }, \
                    refresh: Button { text:'" + rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strRefreshList) + "', alignment:['right','center'], preferredSize:[-1,20] }, \
                }, \
            }";
            pal.grp = pal.add(res);
            
            pal.grp.listBox.preferredSize.height = 300;
            
            pal.layout.layout(true);
            pal.grp.minimumSize = [pal.grp.size.width, pal.grp.header.size.height + pal.grp.spacing * 5];
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {this.layout.resize();}
            
            pal.grp.header.help.onClick = function () {alert(rd_ScriptLauncherPlusData.scriptTitle + "\n" + rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strHelpText), rd_ScriptLauncherPlusData.scriptName);}
            pal.grp.footer.folder.onClick = function(){
                rd_ScriptLauncherPlus_doSelectFolder();
                rd_ScriptLauncherPlus_buildScriptsList(pal);
            }
            pal.grp.footer.addFolder.onClick = function(){
                rd_ScriptLauncherPlus_doAddFolder();
                rd_ScriptLauncherPlus_buildScriptsList(pal);
            }
            pal.grp.footer.refresh.onClick = rd_ScriptLauncherPlus_doRefreshList;
            pal.grp.listBox.onDoubleClick = rd_ScriptLauncherPlus_doRun;
            
            pal.grp.footer.showPaths.onClick = function ()
            {
                rd_ScriptLauncherPlus_buildScriptsList(pal);
            }
        }
        
        return pal;
    }
    
    
    
    
    // rd_ScriptLauncherPlus_doSelectFolder()
    // 
    // Description:
    // This callback function asks the user to locate the Scripts folder.
    // 
    // Parameters:
    // None.
    // 
    // Returns:
    // Nothing.
    //
    function rd_ScriptLauncherPlus_doSelectFolder()
    {
        var folder = Folder.selectDialog("Locate AE's Scripts folder");
        if (folder !== null)
        {
            rd_ScriptLauncherPlusData.scriptPath = [folder];
            
            // Store the path in the settings so the user doesn't have to set it the next time
            app.settings.saveSetting("redefinery", "rd_ScriptLauncherPlus_scriptPath", rd_ScriptLauncherPlusData.scriptPath.join(";"))
            
            rd_ScriptLauncherPlus_buildScriptsList(this.parent.parent.parent);
        }
    }
    
    // rd_ScriptLauncherPlus_addFolder()
    // 
    // Description:
    // This callback function asks the user to locate the Scripts folder.
    // 
    // Parameters:
    // None.
    // 
    // Returns:
    // Nothing.
    //
    function rd_ScriptLauncherPlus_doAddFolder()
    {
        var folder = Folder.selectDialog("Locate a Scripts folder");
        if (folder !== null)
        {
            if (! rd_ScriptLauncherPlusData.scriptPath){rd_ScriptLauncherPlusData.scriptPath = [];}
            rd_ScriptLauncherPlusData.scriptPath.push(folder);
            
            // Store the path in the settings so the user doesn't have to set it the next time
            
            app.settings.saveSetting("redefinery", "rd_ScriptLauncherPlus_scriptPath", rd_ScriptLauncherPlusData.scriptPath.join(";"));
            
        }
    }
    
    
    
    // rd_ScriptLauncherPlus_doRefreshList()
    // 
    // Description:
    // This callback function rescans the current Scripts folder and
    // rebuilds the scripts list.
    // 
    // Parameters:
    // None.
    // 
    // Returns:
    // Nothing.
    //
    function rd_ScriptLauncherPlus_doRefreshList()
    {
        rd_ScriptLauncherPlus_buildScriptsList(this.parent.parent.parent);
    }
    
    
    
    
    // rd_ScriptLauncherPlus_doRun()
    // 
    // Description:
    // This callback function runs the selected script.
    // 
    // Parameters:
    // None.
    // 
    // Returns:
    // Nothing.
    //
    function rd_ScriptLauncherPlus_doRun()
    {
        var scriptSelected = (rdslPal.grp.listBox.selection !== null);
        
        if (scriptSelected)
        {
            var scriptIndex = rdslPal.grp.listBox.selection.index;
            var scriptFile = new File(rd_ScriptLauncherPlusData.scriptFiles[scriptIndex].absoluteURI);
            
            // Load the script's contents into a string
            /*
            if (scriptFile.fsName.match(/.jsxbin$/) === null)
            {
                var scriptText = "";
                
                // Load the script's contents into a string
                scriptFile.open("r");
                while (!scriptFile.eof)
                scriptText += scriptFile.readln() + "\r\n";
                scriptFile.close();
                
                // Evaluate the script's contents
                eval(scriptText);
            }
            else
            $.evalFile(scriptFile);
            */
            if (scriptFile.exists)
            $.evalFile(scriptFile);
            else
            alert(rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strErrMissingFile), rd_ScriptLauncherPlusData.scriptName);
        }
    }
    
    
    
    
    // rd_ScriptLauncherPlus_sortByName()
    // 
    // Description:
    // Custom array sort function for sorting File and Folder objects by their names.
    // 
    // Parameters:
    //   a - First object.
    //   b - Second object.
    // 
    // Returns:
    // Integer controlling the array sort function.
    //
    function rd_ScriptLauncherPlus_sortByName(a, b)
    {
        if (a.name.toLowerCase() < b.name.toLowerCase())
        return -1;
        else if (a.name.toLowerCase() > b.name.toLowerCase())
        return 1;
        else
        return 0;
    }
    
    
    
    
    // rd_ScriptLauncherPlus_getAEScripts()
    // 
    // Description:
    // This callback function retrieves the list of scripts.
    // 
    // Parameters:
    //   path - Folder object of the folder to scan.
    // 
    // Returns:
    // Array of FileSystem objects.
    //
    function rd_ScriptLauncherPlus_getAEScripts(paths)
    {
        var pathFiles = [], files = [], subfiles;;
        for (var p =0; p < paths.length; p++){
            pathFiles += paths[p].getFiles();
            alert(pathFiles.length);
        }
        // Sort the entries in pathFiles
        pathFiles.sort(rd_ScriptLauncherPlus_sortByName);
        
        // Loop through the current folder's files and subfolders
        for (var i = 0; i < pathFiles.length; i++){
            if (pathFiles[i] instanceof Folder)
            {
                // Skip recusion if folder's name is enclosed in parentheses
                if (pathFiles[i].name.match(/^\(.*\)$/))
                continue;
                else
                {
                    // Recurse, and append contents - isn't there an easier way, like array addition?
                    subfiles = rd_ScriptLauncherPlus_getAEScripts([pathFiles[i]]);
                    for (var j = 0; j < subfiles.length; j++){
                        files[files.length] = subfiles[j];
                    }
                }
            }
            else
            {
                // Add only files that end in .js or .jsx or .jsxbin, and that isn't this file itself
                if (pathFiles[i].name.match(/\.(js|jsx|jsxbin)$/) && (pathFiles[i].fsName !== File($.fileName).fsName))
                files[files.length] = pathFiles[i];
            }
        }
        
        return files;
    }
    
    
    
    
    // rd_ScriptLauncherPlus_buildScriptsList()
    // 
    // Description:
    // This function builds the contents of the scripts list.
    // 
    // Parameters:
    //   palette - Window object.
    // 
    // Returns:
    // Nothing.
    //
    function rd_ScriptLauncherPlus_buildScriptsList(palette)
    {
        var fullName, script;
        // Remove the existing list items
        palette.grp.listBox.removeAll();
        // Load the scripts from the Scripts folder hierarchy
        rd_ScriptLauncherPlusData.scriptFiles = [];
        alert(rd_ScriptLauncherPlusData.scriptPath.length);
        for (var sp = 0; sp < rd_ScriptLauncherPlusData.scriptPath.length; sp ++){
            rd_ScriptLauncherPlusData.scriptFiles.push( rd_ScriptLauncherPlus_getAEScripts(rd_ScriptLauncherPlusData.scriptPath[sp]));
        }
        var item, iconFile;
        for (var i = 0; i < rd_ScriptLauncherPlusData.scriptFiles.length; i++)
        {
            // Build the array of script names used in the UI, but strip off the base path 
            // (and folder separator, assumed as one character)
            fullName = rd_ScriptLauncherPlusData.scriptFiles[i].fsName;
            iconFile = File(fullName.replace(/.(js|jsx|jsxbin)$/,".png"));
            if (palette.grp.footer.showPaths.value === true)
            fullName = fullName.substr(rd_ScriptLauncherPlusData.scriptPath.fsName.length+1);
            else
            fullName = rd_ScriptLauncherPlusData.scriptFiles[i].displayName;
            
            // Add the script's name to the list box
            item = palette.grp.listBox.add("item", fullName);
            if (iconFile.exists)
            item.icon = iconFile;
        }
    }
    
    
    
    
    // main code:
    //
    
    // Prerequisites check
    if (parseFloat(app.version) < 10.0)
    alert(rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strMinAE100), rd_ScriptLauncherPlusData.scriptName);
    else
    {
        // Check if the script path variable is stored in the settings; use if so
        var gotScriptPath = false;
        if (app.settings.haveSetting("redefinery", "rd_ScriptLauncherPlus_scriptPath"))
        {
            rd_ScriptLauncherPlusData.scriptPath = [];
            var pathPrefs = app.settings.getSetting("redefinery", "rd_ScriptLauncherPlus_scriptPath").split(";")
            for (var i = 0; i < pathPrefs; i++){
                rd_ScriptLauncherPlusData.scriptPath.push( new Folder(pathPrefs[i] ))
            };
        }
        gotScriptPath = (rd_ScriptLauncherPlusData.scriptPath.length > 0);
        if (! gotScriptPath)
        {
            rd_ScriptLauncherPlus_doAddFolder();
        }
        gotScriptPath = (rd_ScriptLauncherPlusData.scriptPath.length > 0);
        
        // Build and show the palette
        var rdslPal= rd_ScriptLauncherPlus_buildUI(thisObj);
        if (rdslPal !== null)
        {
            if (app.settings.haveSetting("redefinery", "rd_ScriptLauncherPlus_showPaths"))
            rdslPal.grp.footer.showPaths.value = (app.settings.getSetting("redefinery", "rd_ScriptLauncherPlus_showPaths") === "false") ? false : true;
            if (gotScriptPath)
            rd_ScriptLauncherPlus_buildScriptsList(rdslPal);
            else
            alert(rd_ScriptLauncherPlus_localize(rd_ScriptLauncherPlusData.strErrNoScriptsPath), rd_ScriptLauncherPlusData.scriptName);
            
            rdslPal.onClose = function()
            {
                app.settings.saveSetting("redefinery", "rd_ScriptLauncherPlus_showPaths", rdslPal.grp.footer.showPaths.value);
                if (!(rdslPal instanceof Panel))
                app.settings.saveSetting("redefinery", "rd_ScriptLauncherPlus_frameBounds", rdslPal.frameBounds.toString());
            }
            
            if (rdslPal instanceof Window)
            {
                //rdslPal.center();
                rdslPal.show();
            }
            else
            rdslPal.layout.layout(true);
        }
    }
})(this);
