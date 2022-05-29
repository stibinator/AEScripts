// rd_ScriptLauncher.jsx
// Copyright (c) 2005-2013 redefinery (Jeffrey R. Almasol). All rights reserved.
// check it: www.redefinery.com
// 
// Name: rd_ScriptLauncher
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




// rd_ScriptLauncher()
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
(function rd_ScriptLauncher(thisObj) {
	// Globals

	var rd_ScriptLauncherData = new Object();	// Store globals in an object
	rd_ScriptLauncherData.scriptName = "rd: Script Launcher";
	rd_ScriptLauncherData.scriptTitle = rd_ScriptLauncherData.scriptName + " v3.1";
	rd_ScriptLauncherData.scriptPath = "";
	rd_ScriptLauncherData.folderItems = new Array();

	rd_ScriptLauncherData.strScriptsFolder = { en: "Folder..." };
	rd_ScriptLauncherData.strShowPaths = { en: "Show paths" };
	rd_ScriptLauncherData.strRefreshList = { en: "Refresh" };
	rd_ScriptLauncherData.strRun = { en: "Run" };
	rd_ScriptLauncherData.strHelp = { en: "?" };
	rd_ScriptLauncherData.strErrNoScriptsPath = { en: "Cannot open the palette because the Scripts folder could not be located." };
	rd_ScriptLauncherData.strErrMissingFile = { en: "Cannot locate the selected script." };
	rd_ScriptLauncherData.strMinAE100 = { en: "This script requires Adobe After Effects CS5 or later." };
	rd_ScriptLauncherData.strHelpText =
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




	// rd_ScriptLauncher_localize()
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
	function rd_ScriptLauncher_localize(strVar) {
		return strVar["en"];
	}




	// rd_ScriptLauncher_buildUI()
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
	function rd_ScriptLauncher_buildUI(thisObj) {
		var positionPal = (app.settings.haveSetting("redefinery", "rd_ScriptLauncher_frameBounds") && !(thisObj instanceof Panel));
		if (positionPal) {
			var bounds = new Array();
			bounds = app.settings.getSetting("redefinery", "rd_ScriptLauncher_frameBounds").split(",");
			for (i in bounds)
				bounds[i] = parseInt(bounds[i], 10);
		}
		else
			var bounds = undefined;

		var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", rd_ScriptLauncherData.scriptName, bounds, { resizeable: true });

		if (pal !== null) {
			var res =
				"group { \
				orientation:'column', alignment:['fill','fill'], \
				header: Group { \
					alignment:['fill','top'], \
					title: StaticText { text:'" + rd_ScriptLauncherData.scriptName + "', alignment:['fill','center'] }, \
					help: Button { text:'" + rd_ScriptLauncher_localize(rd_ScriptLauncherData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
				}, \
				listBox: ListBox { alignment:['fill','fill'], properties:{items:" + rd_ScriptLauncherData.scripts + "} }, \
				footer: Group { \
					alignment:['fill','bottom'], \
					folder: Button { text:'" + rd_ScriptLauncher_localize(rd_ScriptLauncherData.strScriptsFolder) + "', alignment:['left','center'], preferredSize:[-1,20] }, \
					showFolders: Checkbox { text:'" + rd_ScriptLauncher_localize(rd_ScriptLauncherData.strShowPaths) + "', alignment:['left','bottom'], value:true }, \
					refresh: Button { text:'" + rd_ScriptLauncher_localize(rd_ScriptLauncherData.strRefreshList) + "', alignment:['right','center'], preferredSize:[-1,20] }, \
				}, \
			}";
			pal.grp = pal.add(res);

			pal.grp.listBox.preferredSize.height = 300;

			pal.layout.layout(true);
			pal.grp.minimumSize = [pal.grp.size.width, pal.grp.header.size.height + pal.grp.spacing * 5];
			pal.layout.resize();
			pal.onResizing = pal.onResize = function () { this.layout.resize(); }

			pal.grp.header.help.onClick = function () { alert(rd_ScriptLauncherData.scriptTitle + "\n" + rd_ScriptLauncher_localize(rd_ScriptLauncherData.strHelpText), rd_ScriptLauncherData.scriptName); }
			pal.grp.footer.folder.onClick = rd_ScriptLauncher_doSelectFolder;
			pal.grp.footer.refresh.onClick = rd_ScriptLauncher_doRefreshList;
			pal.grp.listBox.onDoubleClick = rd_ScriptLauncher_handleDoubleClick; 

			pal.grp.footer.showFolders.onClick = function () {
				rd_ScriptLauncher_buildScriptsList(pal);
			}
		}

		return pal;
	}




	// rd_ScriptLauncher_doSelectFolder()
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
	function rd_ScriptLauncher_doSelectFolder() {
		var folder = Folder.selectDialog("Locate AE's Scripts folder");
		if (folder !== null) {
			rd_ScriptLauncherData.scriptPath = folder;

			// Store the path in the settings so the user doesn't have to set it the next time
			app.settings.saveSetting("redefinery", "rd_ScriptLauncher_scriptPath", folder.fsName)

			rd_ScriptLauncher_buildScriptsList(this.parent.parent.parent);
		}
	}




	// rd_ScriptLauncher_doRefreshList()
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
	function rd_ScriptLauncher_doRefreshList() {
		rd_ScriptLauncher_buildScriptsList(this.parent.parent.parent);
	}

	function rd_ScriptLauncher_handleDoubleClick() {

		if (this.selection.isFolder) {
			rd_ScriptLauncher_drawDropDown(this.parent.parent.parent, this.contents);
		} else {
			rd_ScriptLauncher_doRun(this.selection.path);
		}
	}


	// rd_ScriptLauncher_doRun()
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
	function rd_ScriptLauncher_doRun(path) {
		var scriptSelected = (rdslPal.grp.listBox.selection !== null);

		if (scriptSelected) {
			var scriptFile = new File(path.absoluteURI);

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
				alert(rd_ScriptLauncher_localize(rd_ScriptLauncherData.strErrMissingFile), rd_ScriptLauncherData.scriptName);
		}
	}




	// rd_ScriptLauncher_sortByName()
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
	function rd_ScriptLauncher_sortByName(a, b) {
		if (a.name.toLowerCase() < b.name.toLowerCase())
			return -1;
		else if (a.name.toLowerCase() > b.name.toLowerCase())
			return 1;
		else
			return 0;
	}




	// rd_ScriptLauncher_getAEScripts()
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
	function rd_ScriptLauncher_getAEScripts(path) {
		var folderContents = path.getFiles(), subFolder;
		var folder = { "path": path, "contents": [], "isFolder": true }
		// Sort the entries in folderContents
		folderContents.sort(rd_ScriptLauncher_sortByName);

		// Loop through the current folder's folder and subfolders
		for (var i = 0; i < folderContents.length; i++)
			if (folderContents[i] instanceof Folder) {
				// Skip recusion if folder's name is enclosed in parentheses
				if (folderContents[i].name.match(/(^\(.*\)$|^\..*)/))
					continue;
				else {
					// Recurse, and append contents - isn't there an easier way, like array addition?
					subFolder = rd_ScriptLauncher_getAEScripts(folderContents[i]);
					if (subFolder.isFolder && subFolder.contents.length > 0) {
						folder.contents[folder.contents.length] = subFolder;
					}
				}
			}
			else {
				// Add only folder that end in .js or .jsx or .jsxbin, and that isn't this file itself
				if (folderContents[i].name.match(/\.(js|jsx|jsxbin)$/) && (folderContents[i].fsName !== File($.fileName).fsName))
					folder.contents[folder.contents.length] = { "path": folderContents[i], "isFolder": false };
			}

		return folder;
	}


	function rd_ScriptLauncher_drawDropDown(palette, topLevel) {
	// rd_ScriptLauncher_drawDropDown()
	// 
	// Description:
	// This function adds the contents of a folder to the drop-down.
	// 
	// Parameters:
	//   palette - Window object.
	//   topLevel a folder item from rd_ScriptLauncherData.folderItems
	// 
	// Returns:
	// Nothing.
	//
		// Remove the existing list items
		palette.grp.listBox.removeAll();
		for (var i = 0; i < topLevel.contents.length; i++) {
			// Build the array of script names used in the UI, but strip off the base path 
			// (and folder separator, assumed as one character)
			var folderItem = topLevel.contents[i];
			fullName = folderItem.path.fsName;

			fullName = folderItem.path.displayName;

			// Add the script's name to the list box
			item = palette.grp.listBox.add("item", fullName);
			item.isFolder = (folderItem.isFolder);
			item.contents = folderItem.contents;

			iconFile = File(fullName.replace(/.(js|jsx|jsxbin)$/, ".png"));
			if (!iconFile.exists && item.isFolder) {
				iconFile = File("./ScriptLauncher/folder.png")
			}
			if (iconFile.exists)
				item.icon = iconFile;
		}
	}

	// rd_ScriptLauncher_buildScriptsList()
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
	function rd_ScriptLauncher_buildScriptsList(palette) {
		var fullName, listTtem;

		// Load the scripts from the Scripts folder hierarchy
		rd_ScriptLauncherData.folderItems = rd_ScriptLauncher_getAEScripts(rd_ScriptLauncherData.scriptPath);
		var item, iconFile;

		rd_ScriptLauncher_drawDropDown(palette, rd_ScriptLauncherData.folderItems);
	}




	// main code:
	//

	// Prerequisites check
	if (parseFloat(app.version) < 10.0)
		alert(rd_ScriptLauncher_localize(rd_ScriptLauncherData.strMinAE100), rd_ScriptLauncherData.scriptName);
	else {
		// Check if the script path variable is stored in the settings; use if so
		var gotScriptPath = false;
		if (app.settings.haveSetting("redefinery", "rd_ScriptLauncher_scriptPath")) {
			rd_ScriptLauncherData.scriptPath = new Folder(app.settings.getSetting("redefinery", "rd_ScriptLauncher_scriptPath"));
			gotScriptPath = true;
		}
		else {
			// No stored script path, so ask the user where the Scripts folder is located
			var folder = Folder.selectDialog("Locate AE's Scripts folder");
			if (folder !== null) {
				rd_ScriptLauncherData.scriptPath = folder;
				gotScriptPath = true;

				// Store the path in the settings so the user doesn't have to set it the next time
				app.settings.saveSetting("redefinery", "rd_ScriptLauncher_scriptPath", folder.fsName)
			}
		}

		// Build and show the palette
		var rdslPal = rd_ScriptLauncher_buildUI(thisObj);
		if (rdslPal !== null) {
			if (app.settings.haveSetting("redefinery", "rd_ScriptLauncher_showFolders"))
				rdslPal.grp.footer.showFolders.value = (app.settings.getSetting("redefinery", "rd_ScriptLauncher_showFolders") === "false") ? false : true;
			if (gotScriptPath)
				rd_ScriptLauncher_buildScriptsList(rdslPal);
			else
				alert(rd_ScriptLauncher_localize(rd_ScriptLauncherData.strErrNoScriptsPath), rd_ScriptLauncherData.scriptName);

			rdslPal.onClose = function () {
				app.settings.saveSetting("redefinery", "rd_ScriptLauncher_showFolders", rdslPal.grp.footer.showFolders.value);
				if (!(rdslPal instanceof Panel))
					app.settings.saveSetting("redefinery", "rd_ScriptLauncher_frameBounds", rdslPal.frameBounds.toString());
			}

			if (rdslPal instanceof Window) {
				//rdslPal.center();
				rdslPal.show();
			}
			else
				rdslPal.layout.layout(true);
		}
	}
})(this);
