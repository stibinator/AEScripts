(function (thisObj) {
    var SCRIPT_NAME = "scriptConsole";
    var VERSION_NUM = 0.1;
    // consts
    // var LATESTRELEASEURL = "https://github.com/stibinator/AEScripts/archive/refs/heads/master.zip"
    var LATESTRELEASEURL = "https://github.com/stibinator/AEScripts/releases/download/v2.0b/StibsAEScriptsRelease2.0.zip";
    var SCRIPT_FOLDERS_PREF = "script_folders";
    var FILE_NOT_FOUND = "The script file was not found.";
    var DEFAULT_INFO_TEXT = SCRIPT_NAME + " v. " + VERSION_NUM;
    var UI_FLAG = "(UI)"; // added to the name of Script UI files if they're included
    var LOGFILEPATH = joinPath(Folder.desktop, "ScriptConsole install log");


    // parameters for the name matching algo
    var upperCaseRankScale = 8;  // higher values rank upper case matches below normal matches
    var contiguousRankScale = 9; // higher values favour contiguous matches later in the search string
    var descRankScale = 10; // higher values decrease the influence of description matches
    // globals
    var scriptList, searchDescriptions;
    var scriptConsoleFolders = [];
    // pretty stuff for battlestyle buttons
    var btnColour = {
        "primary": { "default": "#05495d", "hilite": "#05495d" },
        "secondary": { "default": "#37545d", "hilite": "#182529" },
        "tertiary": { "default": "#303638", "hilite": "#191c1e" },
        "cancel": { "default": "#60676a", "hilite": "#563a3a" }
    }
    var editIcon = [
        "26.13,5.98 21.34,3.59 20,3.63 18.99,4.38 12.12,18.17 11.96,19.25 12.98,25.22 13.33,25.68 13.81,25.71 13.9,25.67 17.48,23.83 17.25,23.12 15.95,23.8 13.27,22.56 12.68,19.13 12.77,18.5 12.93,18.17 14.5,17.65 15.39,18.09 15.88,19.55 16.68,19.95 18.14,19.46 19.03,19.9 19.55,21.47 19.39,21.8 18.94,22.25 17.25,23.12 17.48,23.83 19.28,22.9 20.04,22.12 20.44,21.33 20.44,21.33 26.19,9.78 25.48,9.58 24.96,10.61 20.66,8.47 16.23,17.36 15.96,17.59 15.38,17.33 15.39,16.94 19.82,8.05 18.34,7.31 19.41,5.17 20.89,5.91 21.39,4.9 21.75,4.64 22.2,4.84 22.23,5.31 21.72,6.32 26.03,8.47 25.48,9.58 26.19,9.78 26.91,8.33 27.01,6.99 26.13,5.98",
        "11.63,20.12 2.99,20.12 2.99,21.51 11.82,21.51",
        "21.84,20.01 21.09,21.51 24.67,21.4 24.67,20.01",
        "7.64,23.96 2.99,23.96 2.99,22.57 4.87,22.57 7.64,22.57",
        "6.64,19.06 2.99,19.06 2.99,17.67 4.68,17.67 6.64,17.67",
        "11.68,17.67 7.41,17.67 7.41,19.06 11.5,19.06",
        "13.17,26.41 2.99,26.41 2.99,25.02 13.59,25.02",
        "20.56,22.57 20.21,23.26 19.29,23.96 27.01,23.96 27.01,22.57",
        "23.07,17.48 22.33,18.98 26.26,18.87 26.26,17.48",
        "8.5,22.57 8.5,23.96 12.24,23.96 12,22.57"
    ];
    var settingsIcon = [
        "24.8,14.7 24.6,15.1 24.3,15.5 23.8,15.7 23.3,15.7 22.9,15.5 22.5,15.1 22.3,14.7 22.3,14.2 22.5,13.7 22.9,13.4 23.3,13.2 23.8,13.2 24.3,13.4 24.6,13.7 24.8,14.2 24.8,14.7 24.8,14.7 26.3,14.7 26.3,13.9 25.9,12.9 25.1,12.1 24.9,12 24.8,4.8 24.7,4.5 24.5,4.1 24.2,3.9 23.8,3.8 23.4,3.8 23,3.9 22.7,4.1 22.4,4.5 22.3,4.8 22.3,12 21.6,12.5 21,13.4 20.8,14.4 21,15.5 21.6,16.4 22.3,16.8 22.3,25.3 22.4,25.7 22.7,26 23,26.2 23.4,26.4 23.8,26.4 24.2,26.2 24.5,26 24.7,25.7 24.8,25.3 24.9,16.8 25.5,16.4 26.1,15.5 26.3,14.7 24.8,14.7",
        "16.7,18.7 16.5,19.1 16.1,19.5 15.7,19.7 15.2,19.7 14.7,19.5 14.4,19.1 14.2,18.7 14.2,18.2 14.4,17.7 14.7,17.4 15.2,17.2 15.7,17.2 16.1,17.4 16.5,17.7 16.7,18.2 16.7,18.7 16.7,18.7 18.1,18.7 18.1,17.9 17.7,16.9 16.9,16.1 16.7,16 16.7,4.8 16.5,4.5 16.3,4.1 16,3.9 15.6,3.8 15.2,3.8 14.8,3.9 14.5,4.1 14.3,4.5 14.2,4.8 14.1,16 13.5,16.5 12.9,17.4 12.7,18.4 12.9,19.5 13.5,20.4 14.1,20.8 14.2,25.3 14.3,25.7 14.5,26 14.8,26.2 15.2,26.4 15.6,26.4 16,26.2 16.3,26 16.5,25.7 16.7,25.3 16.7,20.8 17.4,20.4 18,19.5 18.1,18.7 16.7,18.7",
        "8.5,10.7 8.3,11.1 7.9,11.5 7.5,11.7 7,11.7 6.5,11.5 6.2,11.1 6,10.7 6,10.2 6.2,9.7 6.5,9.4 7,9.2 7.5,9.2 7.9,9.4 8.3,9.7 8.5,10.2 8.5,10.7 8.5,10.7 10,10.7 9.9,9.9 9.5,8.9 8.8,8.1 8.5,8 8.5,4.8 8.4,4.5 8.1,4.1 7.8,3.9 7.4,3.8 7,3.8 6.7,3.9 6.3,4.1 6.1,4.5 6,4.8 6,8 5.3,8.5 4.7,9.4 4.5,10.4 4.7,11.5 5.3,12.4 6,12.8 6,25.3 6.1,25.7 6.3,26 6.7,26.2 7,26.4 7.4,26.4 7.8,26.2 8.1,26 8.4,25.7 8.5,25.3 8.5,12.8 9.2,12.4 9.8,11.5 10,10.7 8.5,10.7"
    ];
    // minified JSON stolen from battleaxe
    var JSON; JSON || (JSON = {}); (function () { function k(a) { return a < 10 ? "0" + a : a } function o(a) { p.lastIndex = 0; return p.test(a) ? '"' + a.replace(p, function (a) { var c = r[a]; return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + a + '"' } function l(a, j) { var c, d, h, m, g = e, f, b = j[a]; b && typeof b === "object" && typeof b.toJSON === "function" && (b = b.toJSON(a)); typeof i === "function" && (b = i.call(j, a, b)); switch (typeof b) { case "string": return o(b); case "number": return isFinite(b) ? String(b) : "null"; case "boolean": case "null": return String(b); case "object": if (!b) return "null"; e += n; f = []; if (Object.prototype.toString.apply(b) === "[object Array]") { m = b.length; for (c = 0; c < m; c += 1)f[c] = l(c, b) || "null"; h = f.length === 0 ? "[]" : e ? "[\n" + e + f.join(",\n" + e) + "\n" + g + "]" : "[" + f.join(",") + "]"; e = g; return h } if (i && typeof i === "object") { m = i.length; for (c = 0; c < m; c += 1)typeof i[c] === "string" && (d = i[c], (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h)) } else for (d in b) Object.prototype.hasOwnProperty.call(b, d) && (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h); h = f.length === 0 ? "{}" : e ? "{\n" + e + f.join(",\n" + e) + "\n" + g + "}" : "{" + f.join(",") + "}"; e = g; return h } } if (typeof Date.prototype.toJSON !== "function") Date.prototype.toJSON = function () { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + k(this.getUTCMonth() + 1) + "-" + k(this.getUTCDate()) + "T" + k(this.getUTCHours()) + ":" + k(this.getUTCMinutes()) + ":" + k(this.getUTCSeconds()) + "Z" : null }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () { return this.valueOf() }; var q = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, p = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, e, n, r = { "\u0008": "\\b", "\t": "\\t", "\n": "\\n", "\u000c": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, i; if (typeof JSON.stringify !== "function") JSON.stringify = function (a, j, c) { var d; n = e = ""; if (typeof c === "number") for (d = 0; d < c; d += 1)n += " "; else typeof c === "string" && (n = c); if ((i = j) && typeof j !== "function" && (typeof j !== "object" || typeof j.length !== "number")) throw Error("JSON.stringify"); return l("", { "": a }) }; if (typeof JSON.parse !== "function") JSON.parse = function (a, e) { function c(a, d) { var g, f, b = a[d]; if (b && typeof b === "object") for (g in b) Object.prototype.hasOwnProperty.call(b, g) && (f = c(b, g), f !== void 0 ? b[g] = f : delete b[g]); return e.call(a, d, b) } var d, a = String(a); q.lastIndex = 0; q.test(a) && (a = a.replace(q, function (a) { return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) })); if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return d = eval("(" + a + ")"), typeof e === "function" ? c({ "": d }, "") : d; throw new SyntaxError("JSON.parse"); } })();

    // do the hoo-hah
    var prefs = new myPreferences(SCRIPT_NAME);
    var logFile = new LogFile(LOGFILEPATH);
    var log = logFile.log;

    var firstRun = prefs.getPref("ScriptConsole-FirstRun", true);
    if (firstRun === true) {
        installStibsAeScripts()
    };
    prefs.setPref("ScriptConsole-FirstRun", false);

    initialiseScripts();
    mainPopUpWindow(SCRIPT_NAME, thisObj);

    // functions
    function initialiseScripts() {
        scriptConsoleFolders = getFolderList();
        if (scriptConsoleFolders.length < 1) {
            settingsWindow();
        }
        getScriptInfoList(scriptConsoleFolders);
        scriptList = getScripts(scriptConsoleFolders);
        searchDescriptions = prefs.getPref("searchDescriptions", true);
    }

    function addToFileArrayIfUnique(list, fsItem) {
        var isUnique = true;
        for (var f = 0; f < list.length && isUnique; f++) {
            if (("fullName" in fsItem && "fullName" in list[f] && fsItem.fullName === list[f].fullName) ||
                (fsItem.shortName && list[f].shortName && fsItem.shortName === list[f].shortName)) {
                isUnique = false
            }
        }
        if (isUnique) { list.push(fsItem) }
        return list;
    }

    function getFolderList() {
        var folderPrefs = prefs.getPref(SCRIPT_FOLDERS_PREF);
        var folders = [];

        var folderList = [];
        if (folderPrefs) {
            folderList = folderPrefs.split("\n");
        }
        for (var f = 0; f < folderList.length; f++) {
            var myScriptFolder = new Folder(Folder.decode(folderList[f]));
            if (myScriptFolder.exists) {
                folders = addToFileArrayIfUnique(folders, myScriptFolder);
            }
        }
        return folders;
    }
    function getScriptInfoList(theFolders) {
        var theInfoList = [];
        for (var f = 0; f < theFolders.length; f++) {
            var scriptInfoFile = new File(theFolders[f].fullName + "/scriptInfo.json");
            try {
                if (scriptInfoFile.exists) {
                    if (scriptInfoFile.open()) {
                        var infoData = scriptInfoFile.read();
                        scriptInfoFile.close();
                        theInfoList = theInfoList.concat(JSON.parse(infoData));
                    }
                }
            } catch (e) {
                if (scriptInfoFile && "close" in scriptInfoFile) {
                    scriptInfoFile.close();
                }
                $.writeln(e);
                return theInfoList;
            }
        }
        for (var i = 0; i < theInfoList.length; i++) {
            prefs.setPref(
                "scriptInfo." + theInfoList[i].name,
                JSON.stringify(theInfoList[i].info
                ));
        }
    }

    function getScripts(folders) {
        var scripts = [];
        for (var f = 0; f < folders.length; f++) {
            var scanResults = scanScriptFolder(folders[f]);
            for (var r = 0; r < scanResults.length; r++) {
                scripts = addToFileArrayIfUnique(scripts, scanResults[r]);
            }
        }
        return scripts;
    }
    function findMatchingScripts(theScripts, searchText) {
        if (searchText.length > 0) {
            var matchingScripts = [];
            for (var i = 0; i < theScripts.length; i++) {
                theScripts[i].rankMatch(searchText);
                if (theScripts[i].rank) {
                    matchingScripts.push(theScripts[i]);
                }
            }
            function compareRank(a, b) { return a.rank - b.rank }
            matchingScripts.sort(compareRank);
            return matchingScripts;
        } else {
            // if no search text return all the scripts
            return theScripts;
        }
    }

    function indexOf(theArray, searchElement, fromIndex) {
        if (theArray == null) {
            throw new TypeError('"theArray" is null or not defined');
        }
        var len = theArray.length;
        var n = +fromIndex || 0;
        if (isNaN(n) || n === Infinity) { n = 0; } // ¿WTF?
        // if n is negative search from n spaces before the end of the array
        if (n < 0) {
            n = Math.max(len + n, 0)
        }
        while (n < len) {
            if (theArray[n] === searchElement) {
                return n;
            }
            n++;
        }
        return -1;
    };

    // --------------------------------------------Main window --------------------------------------------------------------------

    function mainPopUpWindow(theText, thisObj) {
        // DIALOG
        // ======
        var minimumWidthForTwoColumns = 360;
        var dialog = (thisObj instanceof Panel)
            ? thisObj
            : new Window("window", this.scriptTitle, undefined, {
                resizeable: true,
            });
        dialog.text = "ScriptConsole";
        dialog.orientation = "row";
        dialog.alignChildren = ["left", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;

        // GROUP1
        // ======
        var mainGroup = dialog.add("group", undefined, { name: "mainGroup" });
        mainGroup.orientation = "row";
        mainGroup.spacing = 12;
        mainGroup.margins = 0;
        mainGroup.alignment = ["fill", "fill"];

        // GROUP2
        // ======
        var leftGroup = mainGroup.add("group", undefined, { name: "leftGroup" });
        leftGroup.orientation = "column";
        leftGroup.spacing = 6;
        leftGroup.margins = 0;
        leftGroup.alignment = ["fill", "fill"];

        var textInput = leftGroup.add('edittext {properties: { borderless: true}}');
        textInput.helpTip = "Type here!";
        textInput.text = theText;
        textInput.name = "textInput";
        textInput.default = "script name";
        textInput.alignment = ["fill", "top"];
        textInput.preferredSize.width = 200;
        textInput.minimumSize.width = 160;
        var initialText = prefs.getPref(textInput);
        textInput.text = initialText || "Search text";

        var choiceList_array = ["Scripts here"];
        var choiceList = leftGroup.add("listbox", undefined, undefined, { name: "choiceList", items: choiceList_array });
        choiceList.alignment = ["fill", "fill"];
        choiceList.selection = 0;

        // RIGHT GROUP
        // ===========
        var rightGroup = mainGroup.add("group", undefined, { name: "rightGroup" });
        rightGroup.orientation = "column";
        rightGroup.spacing = 12;
        rightGroup.margins = 0;
        rightGroup.alignment = ["fill", "fill"];

        var descriptionGroup = rightGroup.add("group");
        descriptionGroup.orientation = "column";
        descriptionGroup.alignment = ["fill", "fill"];
        descriptionGroup.spacing = 0;

        var scriptInfoStaticText = descriptionGroup.add(
            "statictext",
            undefined,
            "",
            { name: "description", multiline: true, alignment: ['top', 'left'] }
        );
        scriptInfoStaticText.alignment = ["fill", "fill"];
        var btnGrp = rightGroup.add('Group', undefined);
        btnGrp.alignment = ['right', 'bottom'];
        var editInfoBtn = buttonColorVector(btnGrp, editIcon, [30, 30], btnColour.secondary.default, btnColour.secondary.hilite);
        editInfoBtn.helpTip = "Edit script display info"
        var setTheSettingsBtn = buttonColorVector(btnGrp, settingsIcon, [30, 30], btnColour.secondary.default, btnColour.secondary.hilite);
        setTheSettingsBtn.helpTip = "Settings";
        var doTheThingsBtn = buttonColorText(btnGrp, "Do the things!", btnColour.primary.default, btnColour.primary.hilite);
        doTheThingsBtn.helpTip = "Execute the script"
        btnGrp.orientation = 'row';

        function handleReturn() {
            prefs.setPref(textInput);
            if (choiceList.selection) {
                if (dialog.close) {
                    dialog.close();
                }
                choiceList.selection.payload.exec();
            }
        }

        function updateChoiceListAndInfo() {
            choiceList.removeAll();
            scriptInfoStaticText.text = DEFAULT_INFO_TEXT;
            var matchingScripts = findMatchingScripts(scriptList, textInput.text, choiceList);
            for (var i = 0; i < matchingScripts.length; i++) {
                matchingScripts[i].displayInListBox(choiceList);
            }
            if (null !== choiceList.items && choiceList.items.length !== 0) {
                choiceList.revealItem(matchingScripts[0].info.shortName);
                choiceList.selection = matchingScripts[0].info.shortName;
            }
        }

        function updateInfoPanel(selectedScript) {
            if (selectedScript) {
                var isUIFlag = "";
                isUIFlag = (selectedScript.info.isUI) ?
                    " " + UI_FLAG :
                    "";
                var desc = (selectedScript && selectedScript.info) ?
                    selectedScript.info.shortName + isUIFlag :
                    DEFAULT_INFO_TEXT;
                if (selectedScript.info.description) {
                    desc = selectedScript.info.shortName + isUIFlag + "\n\n" + selectedScript.info.description
                }
                scriptInfoStaticText.text = desc + "\n\n" + File.decode(selectedScript.fsItem.path);
            } else {
                desc = "No script selected."
            }
        }

        function handleChoiceListChange() {
            if (null !== this.selection) {
                var selectedScript = this.selection.payload;
                updateInfoPanel(selectedScript);
            }
        }
        function setTheSettings() {
            settingsWindow();
        }

        function editTheInfo() {
            if (choiceList.selection) {
                editScriptDescWindow(choiceList.selection.payload);
                updateInfoPanel(choiceList.selection.payload);
            }
        }
        dialog.onResizing = dialog.onResize = function () {
            if (this.size.width < minimumWidthForTwoColumns) {
                mainGroup.orientation = "column";
            } else {
                mainGroup.orientation = "row";
            }
            this.layout.resize();
        }
        // ----------- time to show some windows ----------
        updateChoiceListAndInfo(); //initialise the choicelist and infor, according to the last text from prefs
        updateInfoPanel(choiceList.selection ? choiceList.selection.payload : null);
        textInput.onEnterKey =
            doTheThingsBtn.onClick =
            choiceList.onDoubleClick =
            handleReturn;
        setTheSettingsBtn.onClick = setTheSettings;
        textInput.onChanging = updateChoiceListAndInfo;
        choiceList.onChange = handleChoiceListChange;
        textInput.active = true;
        editInfoBtn.onClick = editTheInfo;
        if (dialog instanceof Window) {
            dialog.center();
            dialog.show();
        } else {
            dialog.layout.layout(true);
        }
    }


    // --------------------------------------------Installer  --------------------------------------------------------------------

    function installStibsAeScripts() {

        var STIBSAESCRIPTS = "Stibs AEScripts";
        var SCRIPTUIPANELS = "ScriptUI Panels"
        var SCRIPTS = "Scripts";
        var TEMPZIPNAME = 'stibsaescripts.zip';
        var TEMPFOLDERNAME = 'StibsAEScriptsDownloadTemp';
        var PNAFOLDER = "PureAndApplied";

        function getScriptsFromGithub(log) {
            var tempFolder = new Folder(Folder.temp.fsName);
            var tempZipFile = new File(tempFolder.fullName + '/' + TEMPZIPNAME);
            var tempScriptsFolder = new Folder(tempFolder.fsName + '/' + TEMPFOLDERNAME);
            createPath(tempScriptsFolder);
            var op = system.callSystem('curl -L -o "' + tempZipFile.fsName + '" --url ' + LATESTRELEASEURL);
            $.writeln(op);
            log(op);
            var result = system.callSystem('tar -xf ' + tempZipFile.fsName + ' -C "' + tempScriptsFolder.fsName + '"');
            $.writeln(result);
            return tempScriptsFolder
        }

        function getAeVersions() {
            var aeUserDataFolder = new Folder(Folder.userData.fullName + "/Adobe/After Effects/")
            var aeUserDataContents = aeUserDataFolder.getFiles();
            aeVersions = [];
            for (var v = 0; v < aeUserDataContents.length; v++) {
                if (Folder.decode(aeUserDataContents[v].name).match(/^\d+\.*\d*$/)) {
                    aeVersions.push(aeUserDataContents[v]);
                }
            }

            if (aeVersions) {
                aeVersions = aeVersions.sort(function (a, b) {
                    return parseFloat(b.name) - parseFloat(a.name);
                })
            }
            return aeVersions;
        }

        function chooseVersion() {
            var aeVersions = getAeVersions();
            var chosenVersions = [];

            // INSTALL DIALOG
            // ==============
            var installDialog = new Window("dialog");
            installDialog.text = "Choose AE Version to install for";
            installDialog.orientation = "column";
            installDialog.alignChildren = ["fill", "top"];
            installDialog.spacing = 10;
            installDialog.margins = 16;

            // LATEST VERSION PANEL
            // ====================
            var latestPnl = installDialog.add("panel", undefined, undefined, { name: "latestPnl" });
            latestPnl.text = "Latest version";
            // latestPnl.preferredSize.width = 300;
            latestPnl.orientation = "column";
            latestPnl.alignment = ["fill", "fill"];
            latestPnl.alignChildren = ["left", "center"];
            latestPnl.spacing = 10;
            latestPnl.margins = [10, 16, 10, 4];

            var versionCheckBoxes = [latestPnl.add("checkbox", undefined, undefined, { name: "versChkBx" + aeVersions[0].name })];
            versionCheckBoxes[0].text = "Latest Version: " + aeVersions[0].name;
            versionCheckBoxes[0].value = 1;

            // OLDER VERSIONS PANEL
            // ====================
            var olderVersnsPnl = installDialog.add("panel", undefined, undefined, { name: "olderVersnsPnl" });
            olderVersnsPnl.text = "Older versions";
            olderVersnsPnl.orientation = "column";
            olderVersnsPnl.alignChildren = ["fill", "center"];
            olderVersnsPnl.spacing = 10;
            olderVersnsPnl.margins = [10, 16, 10, 4];

            for (var v = 1; v < aeVersions.length; v++) {
                versionCheckBoxes[v] = olderVersnsPnl.add("checkbox", undefined, undefined, { name: "versChkBx" + aeVersions[v].name });
                versionCheckBoxes[v].text = "Version " + aeVersions[v].name;
                versionCheckBoxes[v].alignment = ["fill", "fill"];
            }
            // INSTALL TO AE Panel
            // ===================
            var headlessScriptsPnl = installDialog.add("panel", undefined, undefined, {});
            headlessScriptsPnl.alignment = ["fill", "fill"];
            headlessScriptsPnl.orientation = "column";
            headlessScriptsPnl.alignChildren = ["left", "center"];
            headlessScriptsPnl.spacing = 10;
            headlessScriptsPnl.margins = [10, 16, 10, 4];

            // INSTALL BUTTON GROUP
            // ====================
            var installBtnGrp = installDialog.add("group", undefined, { name: "installBtnGrp" });
            installBtnGrp.orientation = "row";
            installBtnGrp.spacing = 10;
            installBtnGrp.margins = [0, 0, 10, 0];
            installBtnGrp.alignment = ["fill", "fill"];

            // var installToAEChkBx = headlessScriptsPnl.add("checkbox", undefined, undefined, { name: "installToAeChkBx" });
            // installToAEChkBx.text = "install UI-less scripts to AE";
            // installToAEChkBx.helpTip = "If checked stib's scripts will be visible in the usual FILE > SCRIPTS menu\notherwise they will only be accessible from ScriptConsole.\nUncheck if you have lots of scripts."

            var cancelBtn = installBtnGrp.add("button", undefined, undefined, { name: "cancelBtn" });
            cancelBtn.helpTip = "Don't install";
            cancelBtn.text = "Cancel";
            cancelBtn.alignment = ["fill", "fill"];

            var installPNABtn = installBtnGrp.add("button", undefined, undefined, { name: "installPNABtn" });
            installPNABtn.helpTip = "Install Stib's AEScripts for selected versions";
            installPNABtn.text = "Install";
            installPNABtn.preferredSize.width = 140;
            installPNABtn.alignment = ["right", "bottom"];

            function getChosenVersions() {
                for (var v = 0; v < aeVersions.length; v++) {
                    if (versionCheckBoxes[v].value) {
                        chosenVersions.push(aeVersions[v])
                    }
                    installDialog.close();
                }
            }
            installPNABtn.onClick = getChosenVersions;

            installDialog.show();
            return chosenVersions;

        }


        function recursivelyMoveFolder(sourceFolder, destinationFolder, deleteOriginals, log) {
            var sourceChildren = sourceFolder.getFiles();
            for (var f = 0; f < sourceChildren.length; f++) {
                if (sourceChildren[f] instanceof Folder) {
                    var newDestFolder = createPath(destinationFolder.fullName, sourceChildren[f].name);
                    log("created destination Folder: " + newDestFolder);
                    recursivelyMoveFolder(sourceChildren[f], newDestFolder)
                } else {
                    createPath(destinationFolder);
                    var copiedOK = sourceChildren[f].copy(
                        File.decode(joinPath(destinationFolder.fullName, sourceChildren[f].name))
                    );

                    if (copiedOK) {
                        if (deleteOriginals) {
                            if (sourceChildren[f].exists && sourceChildren[f].remove()) {
                                log("moved " + sourceChildren[f].name + " to " + destinationFolder.fsName);
                            } else {
                                log("couldn't remove original " + sourceChildren[f].name);
                            }
                        }
                    } else {
                        log("couldn't " + (deleteOriginals) ? "move " : "copy " + sourceChildren[f].name);
                    }
                }
            }
            if (deleteOriginals) {
                if (!sourceFolder.remove()) {
                    log("couldn't remove folder " + sourceFolder);
                }
            }
        }

        function recursivelyUpdateScripts(sourceFolder, mainTargetFolder, adobePrefsScriptsFolder, log) {
            // adobePrefsScriptsFolder for when headless scripts have been moved to the Adobe folder
            var sourceChildren = sourceFolder.getFiles();
            var targetFolder;
            for (var f = 0; f < sourceChildren.length; f++) {
                if (sourceChildren[f] instanceof Folder) {
                    var mainTargetSubFolder = createPath(mainTargetFolder, sourceChildren[f].name);
                    var secondTargetSubFolder = joinPath(adobePrefsScriptsFolder, sourceChildren[f].name);
                    recursivelyUpdateScripts(sourceChildren[f], mainTargetSubFolder, secondTargetSubFolder, log);
                    if (! sourceChildren[f].remove()){log("Couldn't remove downloaded folder: "+sourceChildren[f].name)}
                } else {
                    // object is a file
                    if (adobePrefsScriptsFolder.exists && (joinPath(adobePrefsScriptsFolder, sourceChildren[f].name).exists)) {
                        // script is in the adobe folder
                        targetFolder = adobePrefsScriptsFolder;
                    } else {
                        targetFolder = mainTargetFolder;
                    }
                    target = joinPath(targetFolder, sourceChildren[f].name);
                    if (sourceChildren[f].copy(target)) {
                        sourceChildren[f].remove();
                    } else {
                        if (! sourceChildren[f].remove()){log("Couldn't remove downloaded file: "+sourceChildren[f].name)}
                    }
                }
            }
            if (!sourceFolder.remove()) {
                if (log) { log.log("couldn't remove download folder: " + sourceFolder.name) }
            }
        }

        function installHeadlessScripts(downloadedScriptsFolder) {
            log("Installing stib's AEScripts");
            var headlessScriptsFolder = joinPath(downloadedScriptsFolder, STIBSAESCRIPTS);
            var targetFolder = joinPath(Folder.userData, PNAFOLDER, STIBSAESCRIPTS);
            var adobePrefsScriptsFolder = joinPath(chosenVersions[chosenVersions.length - 1].fsName, SCRIPTS, STIBSAESCRIPTS);
            // create new folder if need be
            createPath(targetFolder);
            var keepGoing = true;
            while (!targetFolder.exists && keepGoing) {
                alert("couldn't create a folder for the scripts.\nPlease choose a location to install to.\n(Recommend that this *isn't* in the Adobe Scripts folder)");
                log("couldn't create a folder for the scripts. Asking user");
                var alternativeFolder = Folder.selectDialog("Choose a location for scripts");
                if (alternativeFolder) {
                    targetFolder = createPath(alternativeFolder, STIBSAESCRIPTS);
                } else {
                    keepGoing = false;
                    targetFolder = null;
                    log("User cancelled—stibs' AEScripts not installed");;
                }
            }
            if (targetFolder.exists) {
                log("Install target: " + targetFolder.toString());
                recursivelyUpdateScripts(headlessScriptsFolder, targetFolder, adobePrefsScriptsFolder, log);
                scriptConsoleFolders = addToFileArrayIfUnique(scriptConsoleFolders, targetFolder);
                return true;
            }
            return false;
        }

        function installUIScripts(downloadedScriptsFolder, versions) {
            log("Installing stib's ScriptUI Panels");
            var uIScriptsFolder = joinPath(downloadedScriptsFolder, SCRIPTUIPANELS);
            var noProblems = true;
            for (var v = 0; v < versions.length; v++) {
                var targetFolder = createPath(chosenVersions[v].fsName, SCRIPTS, SCRIPTUIPANELS);
                log("Creating ScriptUI Panels folder at " + targetFolder);
                // create new folder
                deleteSource = v === versions.length - 1; //delete the source folder on the last version
                var keepGoing = true;
                while (!targetFolder.exists && keepGoing) {
                    alert("couldn't Access the Adobe ScriptUI Panels Folder");
                    if (log) { log("couldn't Access the Adobe ScriptUI Panels Folder at " + targetFolder); }
                    var alternativeFolder = Folder.selectDialog("Choose a location for the scriptUI panels for version " + chosenVersions[v].name);
                    if (alternativeFolder) {
                        targetFolder = createPath(alternativeFolder, SCRIPTS, SCRIPTUIPANELS);
                    } else {
                        keepGoing = false;
                        targetFolder = null;
                        log("User cancelled—ScriptUI Panels for " + chosenVersions[v].name + " not installed");;
                    }
                }
                if (targetFolder.exists) {
                    log("Install target: " + targetFolder);
                    recursivelyMoveFolder(uIScriptsFolder, targetFolder, deleteSource, log);
                    scriptConsoleFolders = addToFileArrayIfUnique(scriptConsoleFolders, targetFolder);
                } else {
                    noProblems = false;
                }
            }
            return noProblems;
        }

        // ======================= Install the Scripts ===========================

        var noProblems = true;
        var downloadedScriptsFolder = getScriptsFromGithub(log);
        if (downloadedScriptsFolder.exists) {
            var chosenVersions = chooseVersion();
            if (installHeadlessScripts(downloadedScriptsFolder, log)) {
                noProblems = installUIScripts(downloadedScriptsFolder, chosenVersions, log);
            } else {
                noProblems = false;
            }
        } else {
            noProblems = false;
        }
    }


    // --------------------------------------------ScriptFile object --------------------------------------------------------------------

    function ScriptFile(theItem) {
        // object representing a script
        // contains fsItem which is the File object in the file System
        // 
        // dirLevel is the depth below the main folder
        if (typeof theItem === "string") {
            this.fsItem = File(File.decode(theItem)); //Actual file system file/folder
        } else {
            this.fsItem = theItem;
        }


        this.getInfo = function () {
            var isUI = (File.decode(this.fsItem.path).match(/ScriptUI Panels/i) !== null);
            // look for info in sidecar files or in the prefs.
            this.info = JSON.parse(prefs.getPref("scriptInfo." + this.fsItem.name, JSON.stringify({
                "shortName": File.decode(this.fsItem.name).replace("\.jsx*(bin)*$", "", "i"),
                // "icon": DEFAULT_FILE_ICON,
                "fsPath": File.decode(this.fsItem.fullName),
                "isUI": isUI
            })));
            var sidecar = new File(File.decode(this.fsItem.name.replace(/(\.jsx?(bin)*)*$/, "_info.json")));
            // var infoFiles = [];
            if (sidecar.exists) { //get info from sidecar if it exists
                this.readInfoFromFile(sidecar);
            }
            prefs.setPref("scriptInfo." + this.fsItem.name, JSON.stringify(this.info));
        }

        this.toString = function () {
            infoText = "";
            if (this.info) {
                for (var key in this.info) {
                    infoText += "" + key + ": " + this.info[key] + "\n"
                }
            }
            return infoText;
        }

        this.readInfoFromFile = function (theFile) {
            try {
                if (theFile.open()) {
                    var infoData = theFile.read();
                    theFile.close();
                    var info = JSON.parse(infoData);
                    for (var key in info) {
                        this.info[key] = info[key];
                    }
                    // }
                }
            } catch (e) {
                try {
                    theFile.close();
                    $.writeln(e);
                } catch (e) {
                    $.writeln(e)
                }
            }
        }

        this.isThisAScript = function (theFile) {
            if (typeof theFile === "string") {
                theFile = File(theFile);
            }
            return (
                theFile instanceof File &&
                theFile.exists &&
                File.decode(theFile.name).match("^[^.].*\.(js|jsx|jsxbin)$", "i"));
        }

        this.checkShouldDisplay = function () {
            // test to see if this is a script file and isn't parenthised or .invisible
            this.shouldDisplay = (this.isThisAScript(this.fsItem) &&
                (!File.decode(this.fsItem.name).match(/(^\.|^\(.*\)$)/)));
        }

        this.displayInListBox = function (listBox) {
            item = listBox.add("item", this.info.shortName);
            item.payload = this;
        }

        this.exec = function () {
            try {
                if (this.fsItem.exists) {
                    // alert(this.fsItem.fsName);
                    $.evalFile(this.fsItem.fsName);
                } else {
                    alert(FILE_NOT_FOUND)
                }
            } catch (e) {
                alert(e);
            }
        }

        this.displayInfo = function (infoText) {
            // TODO: fancy info display.
            infoText.text = this.info.description || this.fsItem.name;
        }

        this.exportInfo = function () {
            return (this.info);
        }

        this.importInfo = function (theInfo) {
            this.info = {};
            for (var key in theInfo) {
                this.info[key] = theInfo[key];
            }
            prefs.setPref("scriptInfo." + this.fsItem.name, JSON.stringify(this.info));
        }

        this.rankMatch = function (theString) {
            // text matching algorithm
            // in which I came up with my own version of the Levenshtein Distance Algorithm
            // because I didn't know it was a thing, and only found out the week after I wrote it.
            // It matches partial and non-sequential string matches similar to the VSCode command pallette
            // e.g. given the scriptname FozBarFoo:
            //      "foo" wil rank higher than 
            //      "fbf" which will rank higher than 
            //      "foa", which will still match, and
            //      "faz" will not match
            // groups of letters separate by spaces will match in any order,
            // e.g. "foo bar" will match "foobar" and "barfaz foo"
            // tweak the settings at the beginning of the script to adjust the algo

            var lCursor = 0;
            var canMatch = true;
            var canMatchUpper = true;
            var canMatchDesc = true;
            var firstMatch = 0;
            var caseInsensitiveRank = 0;
            var upperCaseRank = 0;
            var descRank = 0;

            // --- do the case insenstitive matching ---
            var letterGroups = theString.split(" ");
            for (var group = 0; group < letterGroups.length; group++) {
                var letters = letterGroups[group].split("");
                for (var i = 0; i < letters.length && canMatch; i++) {
                    var caseInsensitiveIndex = 1 + indexOf(this.info.shortName.toLowerCase(), letters[i].toLowerCase(), lCursor);
                    if (caseInsensitiveIndex) {
                        if (i === 0) { firstMatch = caseInsensitiveIndex }
                        lCursor = caseInsensitiveIndex;
                    } else {
                        canMatch = false;
                    }
                }
                caseInsensitiveRank += lCursor - firstMatch * contiguousRankScale / 10; // favour contiguous matches

                // --- do the upper case matching ---
                lCursor = 0;
                var upperCaseLetters = this.info.shortName.match(/(^.|[A-Z]*)/g).join("").toUpperCase(); //select all the capitals and the first letter as an honorary capital
                for (var i = 0; i < letters.length && canMatch && canMatchUpper; i++) {
                    var upperCaseIndex = 1 + indexOf(upperCaseLetters, letters[i].toUpperCase(), lCursor);
                    if (upperCaseIndex) {
                        if (i === 0) { firstMatch = upperCaseIndex }
                        lCursor = upperCaseIndex;
                    } else {
                        canMatchUpper = false;
                    }
                }
                upperCaseRank += (lCursor - firstMatch) * upperCaseRankScale;

                // --- do the description matching ---
                lCursor = 0;
                if (this.info.description && this.info.description.length) {
                    var descriptionLetters = this.info.description.replace("[^a-Z]", "").split(""); //select all the capitals and the first letter as an honorary capital
                    for (var i = 0; i < letters.length && canMatchDesc; i++) {
                        var descIndex = 0;
                        if (descriptionLetters.length) {
                            descIndex = 1 + indexOf(descriptionLetters, letters[i].toUpperCase(), lCursor);
                        }
                        if (descIndex) {
                            if (i === 0) { firstMatch = descIndex }
                            lCursor = descIndex;
                        } else {
                            canMatchDesc = false;
                        }
                    }
                    descRank += (lCursor - firstMatch * contiguousRankScale / 10) * descRankScale;
                } else {
                    canMatchDesc = false;
                }
            }
            if (canMatch) {
                this.rank = caseInsensitiveRank;
                if (canMatchUpper) {
                    this.rank = Math.min(this.rank, upperCaseRank)
                }
                if (canMatchDesc) {
                    this.rank = Math.min(this.rank, descRank);
                }
            } else {
                this.rank = 0;
            }
        }

        // -------------------initialise --------------------
        if (typeof theItem === "string") {
            this.fsItem = File(File.decode(theItem)); //Actual file system file
        } else {
            this.fsItem = theItem;
        }
        this.checkShouldDisplay()
        if (this.shouldDisplay) { this.getInfo() };
    }

    // --------------------------------------------Scan script folder --------------------------------------------------------------------

    function scanScriptFolder(theItem) {
        function recursiveScan(folderItem) {
            var scriptFiles = [];
            if (folderItem instanceof Folder &&
                folderItem.exists &&
                (!File.decode(folderItem.name).match(/(^\.|^\(.*\)$)/))) {
                var folderContents = folderItem.getFiles();
                for (var f = 0; f < folderContents.length; f++) {
                    if (folderContents[f] instanceof File) {
                        var newScriptFile = new ScriptFile(folderContents[f]);
                        if (newScriptFile.shouldDisplay) { scriptFiles.push(newScriptFile) };
                    } else {
                        var innerFolderContents = recursiveScan(folderContents[f]);
                        scriptFiles = scriptFiles.concat(innerFolderContents);
                        // $.writeln(folderContents[f].name + " " + innerFolderContents.length);
                        // $.writeln(scriptFiles.length);
                    }
                }
            }
            return scriptFiles
        }
        var fsItem;
        if (typeof theItem === "string") {
            fsItem = File(File.decode(theItem)); //Actual file system file
        } else {
            fsItem = theItem;
        }
        if (fsItem instanceof Folder &&
            fsItem.exists &&
            // ignore folders with (brackets) around their name
            (!File.decode(fsItem.name).match(/(^\.|^\(.*\)$)/))
        ) {
            var scriptFiles = recursiveScan(fsItem);
            return scriptFiles;
        } else {
            return [];
        }
    }

    // --------------------------------------------Edit description window --------------------------------------------------------------------

    function editScriptDescWindow(theScript) {
        // DIALOG
        // ======
        var dialog = new Window("dialog");
        dialog.text = "Edit script info";
        dialog.orientation = "column";
        dialog.alignChildren = ["left", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;
        dialog.resizeable = true;

        // PATHPNL
        // =======
        var pathPnl = dialog.add("panel", undefined, undefined, { name: "pathPnl", borderStyle: "gray" });
        pathPnl.text = "Script file";
        pathPnl.orientation = "column";
        pathPnl.alignChildren = ["left", "top"];
        pathPnl.spacing = 10;
        pathPnl.margins = 10;

        var pathBtn = buttonColorText(pathPnl, File.decode(theScript.fsItem), btnColour.secondary.default, btnColour.secondary.hilite)
        pathBtn.preferredSize.width = 460;

        // NAMEPNL
        // =======
        var namePnl = dialog.add("panel", undefined, undefined, { name: "namePnl", borderStyle: "gray" });
        namePnl.text = "Script Short Name";
        namePnl.orientation = "column";
        namePnl.alignment = ["fill", "top"];
        namePnl.spacing = 10;
        namePnl.margins = 10;

        var shortNameEdTxt = namePnl.add('edittext {properties: {name: "shortName", borderless: true}}');
        shortNameEdTxt.text = theScript.info.shortName;
        shortNameEdTxt.alignment = ["fill", "fill"];
        // // shortNameEdTxt.preferredSize.width = pathBtn.preferredSize.width;

        // DESCPNL
        // =======
        var descPnl = dialog.add("panel", undefined, undefined, { name: "descPnl", borderStyle: "gray" });
        descPnl.text = "Description";
        // // descPnl.preferredSize.width = pathBtn.preferredSize.width + 20;
        descPnl.orientation = "column";
        descPnl.alignment = ["fill", "fill"];
        descPnl.spacing = 10;
        descPnl.margins = 10;

        var descriptionEditTxt = descPnl.add('edittext {properties: {name: "descriptionEditTxt", multiline: true, scrollable: true, borderless: true}}');
        descriptionEditTxt.text = theScript.info.description || "Description";
        descriptionEditTxt.alignment = ["fill", "fill"];
        descriptionEditTxt.minimumSize.height = 160;

        // GROUP1
        // ======
        var group1 = dialog.add("group", undefined, { name: "group1" });
        group1.orientation = "row";
        group1.alignChildren = ["right", "center"];
        group1.spacing = 10;
        group1.margins = [0, 0, 10, 0];
        group1.alignment = ["right", "top"];

        var cancelBtn = group1.add("button", undefined, undefined, { name: "cancelBtn" });
        cancelBtn.text = "Cancel";
        // cancelBtn.preferredSize.width = 140;
        cancelBtn.alignment = ["right", "bottom"];

        var saveDescrBtn = group1.add("button", undefined, undefined, { name: "saveDescrBtn" });
        saveDescrBtn.text = "Save Settings";
        // saveDescrBtn.preferredSize.width = 140;
        saveDescrBtn.alignment = ["right", "bottom"];

        function goToFile() {
            if (theScript.fsItem.exists) {
                if ($.os.match("Windows")) {
                    // system.callSystem("explorer.exe" + theFolder.fsName);
                    system.callSystem('cmd.exe /c "explorer.exe /select,' + theScript.fsItem.fsName + '"');
                }
                if ($.os.match("Macintosh")) {
                    system.callSystem("open -R " + theScript.fsItem.fsName);
                }
            }
        }

        function saveDesc() {
            if (shortNameEdTxt.text.length) {
                theScript.info.shortName = shortNameEdTxt.text;
            }
            theScript.info.description = descriptionEditTxt.text;
            prefs.setPref("scriptInfo." + theScript.fsItem.name, JSON.stringify(theScript.info));
            dialog.close();
        }
        pathBtn.onClick = goToFile;
        saveDescrBtn.onClick = saveDesc;
        dialog.show();
    }

    // --------------------------------------------Settings window --------------------------------------------------------------------
    function settingsWindow() {
        // DIALOG
        // ======
        var settingsPanel = new Window("dialog");
        settingsPanel.text = "ScriptConsole Settings";
        settingsPanel.orientation = "column";
        settingsPanel.alignChildren = ["fill", "top"];
        settingsPanel.spacing = 10;
        settingsPanel.margins = 16;

        // FOLDERSPNL
        // ==========
        var foldersPnl = settingsPanel.add("panel", undefined, undefined, { name: "foldersPnl" });
        foldersPnl.text = "Scripts Folders";
        foldersPnl.orientation = "column";
        foldersPnl.alignChildren = ["left", "top"];
        foldersPnl.spacing = 10;
        foldersPnl.margins = 10;

        // SCRIPTSGRP
        // ==========
        var scriptsGrp = foldersPnl.add("group", undefined, { name: "scriptsGrp" });
        scriptsGrp.orientation = "row";
        scriptsGrp.alignChildren = ["left", "top"];
        scriptsGrp.spacing = 10;
        scriptsGrp.margins = 0;
        var folderListBox = scriptsGrp.add("listbox", undefined, undefined, { name: "folderListBox" });
        folderListBox.preferredSize.width = 400;
        folderListBox.preferredSize.height = 80;

        // BTNGRP
        // ======
        var btnGrp = scriptsGrp.add("group", undefined, { name: "btnGrp" });
        btnGrp.orientation = "column";
        btnGrp.alignChildren = ["left", "center"];
        btnGrp.spacing = 10;
        btnGrp.margins = 0;

        // var addBtn = btnGrp.add("button", undefined, undefined, { name: "addBtn" });
        var addBtn = buttonColorText(btnGrp, "Add", btnColour.tertiary.default, btnColour.tertiary.hilite);
        // addBtn.text = "Add";
        // addBtn.preferredSize.width = 140;

        // var removeBtn = btnGrp.add("button", undefined, undefined, { name: "removeBtn" });
        var removeBtn = buttonColorText(btnGrp, "Remove", btnColour.tertiary.default, btnColour.tertiary.hilite);
        // removeBtn.text = "Remove";
        // removeBtn.preferredSize.width = 140;

        // GROUP1
        // ======
        var group1 = foldersPnl.add("group", undefined, { name: "group1" });
        group1.orientation = "row";
        group1.alignChildren = ["left", "center"];
        group1.spacing = 10;
        group1.margins = 0;
        group1.alignment = ["right", "top"];

        // var installPNABtn = group1.add("button", undefined, undefined, { name: "installPNABtn" });
        var installPNABtn = buttonColorText(group1, "Install Stib's Scripts", btnColour.secondary.default, btnColour.secondary.hilite);
        // installPNABtn.text = "Install PnA Scripts";
        // installPNABtn.preferredSize.width = 140;
        installPNABtn.onClick = installPNAScripts;

        // STGSPNL
        // =======
        var stgsPnl = settingsPanel.add("panel", undefined, undefined, { name: "stgsPnl" });
        stgsPnl.text = "Settings";
        stgsPnl.orientation = "row";
        stgsPnl.alignChildren = ["fill", "center"];
        stgsPnl.spacing = 10;
        stgsPnl.margins = 10;

        var searchDescriptionsBtn = stgsPnl.add("checkbox", undefined, undefined, { name: "searchDescriptions" });
        searchDescriptionsBtn.text = "Search Descriptions";
        searchDescriptionsBtn.value = searchDescriptions;

        var exportSettingsBtn = buttonColorText(stgsPnl, "Export Settings", btnColour.secondary.default, btnColour.secondary.hilite);
        var importSettingsBtn = buttonColorText(stgsPnl, "Import Settings", btnColour.secondary.default, btnColour.secondary.hilite);

        // GROUP2
        // ======
        var group2 = settingsPanel.add("group", undefined, { name: "group2" });
        group2.orientation = "row";
        group2.alignChildren = ["right", "center"];
        group2.spacing = 10;
        group2.margins = [0, 0, 10, 0];
        group2.alignment = ["right", "top"];

        // var cancelBtn = group2.add("button", undefined, undefined, { name: "cancelBtn" });
        var cancelBtn = buttonColorText(group2, "Cancel", btnColour.cancel.default, btnColour.cancel.hilite);
        // cancelBtn.text = "Cancel";
        // cancelBtn.preferredSize.width = 140;
        cancelBtn.alignment = ["right", "bottom"];

        // var saveSettingsBtn = group2.add("button", undefined, undefined, { name: "saveSettingsBtn" });
        var saveSettingsBtn = buttonColorText(group2, "Save Settings", btnColour.primary.default, btnColour.secondary.hilite);
        // saveSettingsBtn.text = "Save Settings";
        // saveSettingsBtn.preferredSize.width = 140;
        saveSettingsBtn.alignment = ["right", "bottom"];
        saveSettingsBtn.enabled = scriptConsoleFolders.length > 0;

        function installPNAScripts() {
            scriptConsoleFolders = installStibsAeScripts();
            updateFolderListBox();
        }

        function updateFolderListBox() {
            folderListBox.removeAll();
            for (var f = 0; f < scriptConsoleFolders.length; f++) {
                var newFolderItem = folderListBox.add("item", Folder.decode(scriptConsoleFolders[f]));
                newFolderItem.payload = scriptConsoleFolders[f];
            }
        }
        function addNewScriptsFolder() {
            scriptConsoleFolders = getFolderList();
            var newScriptFolder = Folder.selectDialog("Select a scripts folder");
            if (newScriptFolder && newScriptFolder.exists) {
                addToFileArrayIfUnique(scriptConsoleFolders, newScriptFolder);
            }
            updateFolderListBox();
            prefs.setPref({ "name": SCRIPT_FOLDERS_PREF, "value": scriptConsoleFolders.join("\n") })
            saveSettingsBtn.enabled = scriptConsoleFolders.length > 0;
        }

        function removeScriptsFolder() {
            var newFolderAr = [];
            if (folderListBox.selection) {
                var theDoomedFolder = folderListBox.selection.payload.fullName;
                for (var f = 0; f < scriptConsoleFolders.length; f++) {
                    if (scriptConsoleFolders[f].fullName !== theDoomedFolder) {
                        newFolderAr.push(scriptConsoleFolders[f]);
                    }
                }
                scriptConsoleFolders = newFolderAr;
            }
            updateFolderListBox();
            saveSettingsBtn.enabled = scriptConsoleFolders.length > 0;
        }

        function saveSettings() {
            prefs.setPref(searchDescriptionsBtn);
            searchDescriptions = searchDescriptionsBtn.value;
            if (scriptConsoleFolders.length) {
                prefs.setPref({ "name": SCRIPT_FOLDERS_PREF, "value": scriptConsoleFolders.join("\n") });
                settingsPanel.close();
            } else {
                alert("You need to specify a script folder for this script to work")
            }
            initialiseScripts();
        }
        function cancelSettings() {
            scriptConsoleFolders = getFolderList();
            settingsPanel.close();
        }

        function exportSettings() {
            var exportedFile = File.saveDialog("choose a file to write the prefs to", "JSON:*.json,Text:*.txt,All files:*.*");
            var info = [];
            for (var s = 0; s < scriptList.length; s++) {
                info[s] = scriptList[s].exportInfo();
            }
            if (exportedFile.open("w")) {
                exportedFile.write(JSON.stringify(info))
                exportedFile.close();
            }

        }

        function importSettings() {
            var importFile = File.openDialog("choose a valid json file");
            if (importFile.open("r")) {
                var importedInfo = JSON.parse(importFile.read());
                for (var s = 0; s < scriptList.length; s++) {
                    for (var i = 0; i < importedInfo.length; i++) {
                        if (importedInfo[s].fsPath = scriptList[i].info.fsPath) {
                            scriptList[i].importInfo(importedInfo[s]);
                        }
                    }
                }
            }


        }

        // ---------------- initialise and show the window-----------------
        cancelBtn.onClick = cancelSettings;
        updateFolderListBox();
        addBtn.onClick = addNewScriptsFolder;
        removeBtn.onClick = removeScriptsFolder;
        saveSettingsBtn.onClick = saveSettings;
        exportSettingsBtn.onClick = exportSettings;
        importSettingsBtn.onClick = importSettings;
        settingsPanel.show();
    }
    // --------------------------------------------Path operations ------------------------------------------------------------------------
    
    function splitPath(inPath) {
        var inputAr = [];
        if (inPath instanceof Array) {
            for (var i = 0, l = inPath.length; i < l; i++) {
                inputAr = inputAr.concat(splitPath(inPath[i]));
            }
        } else {
            inputAr = inputAr.concat(inPath.toString().split("/"))
        }
        return inputAr;
    }

    function joinPath() {
        // Split the inputs into an array of folder names
        var inPath = Array.prototype.slice.call(arguments);
        var dirs = splitPath(inPath);
        var topFolder = Folder(dirs[0]);
        var newPath = [];
        for (i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            // Remove leading and trailing slashes
            // Also remove "." segments
            if (dir && dir !== ".") {
                // Interpret ".." to pop the last segment
                if (dir === "..") {
                    if (newPath.length > 1) {
                        newPath.pop()
                    } else {
                        // reached the top original folder, find its parent
                        topFolder = topFolder.parent || topFolder;
                        newPath = topFolder.toString().split("/");
                    }
                    // Push new path segments.
                } else {
                    newPath.push(dir)
                }
            }
        }
        // Preserve the initial slash if there was one.
        if (dirs[0] === "") newPath.unshift("");
        // Turn back into a single string path.
        return Folder(newPath.join("/") || topFolder.parent);
    }

    function createPath() {
        var path = joinPath(Array.prototype.slice.call(arguments));
        var folderObj = new Folder(path);
        // creates a folder and parent path if it doesn't exist
        var allGood = true;
        var parent = new Folder(folderObj.path);
        if (!parent.exists) {
            allGood = createPath(parent);
        }
        if (folderObj instanceof Folder && !folderObj.exists) {
            allGood = folderObj.create();
        }
        return (allGood) ? folderObj : false;
    }
    
    // --------------------------------------------Log File ------------------------------------------------------------------------
    
    function LogFile(logFilePath) {
        if (logFilePath instanceof Folder || logFilePath.toString().match(/[\/\\]$/)) {
            logFilePath = logFilePath.toString() + SCRIPT_NAME + "_log.txt"
        }
        if (!logFilePath.toString().match(/\.txt$/)) {
            logFilePath = logFilePath.toString() + ".txt"
        }
        var logFile = new File(logFilePath);
        createPath(logFile.parent);
        this.log = function () {
            var messageAr = Array.prototype.slice.call(arguments);
            var message = messageAr.join("\n");
            if (logFile.open("a")) {
                logFile.write(message);
                logFile.close();
            }
            $.writeln(message);
        }
        this.log(Date());
    }
    // --------------------------------------------preferences ------------------------------------------------------------------------


    function myPreferences(SCRIPT_NAME) {
        // look for preferences for this object
        // provide a setPref function to allow values to be stored in AE's preferences
        // SCRIPT_NAME sets the section of the preference file they are saved in.
        this.prefsName = SCRIPT_NAME;

        this.parsePref = function (val, prefType) {
            switch (prefType) {
                case "integer":
                case "int":
                    return parseInt(val, 10);
                case "number":
                    return parseFloat(val);
                case "boolean":
                    return val === "true";
                default:
                    return val;
            }
        };

        this.setPref = function (anObject, value) {
            var currentVal = value;
            var prefName = anObject.name;
            if (!prefName) { prefName = (typeof anObject == 'string') ? anObject : null };
            if (prefName && typeof value === 'undefined') {
                if (anObject.hasOwnProperty("value")) {
                    currentVal = anObject.value;
                } else if (anObject.hasOwnProperty("selection")) {
                    currentVal = anObject.selection.index;
                } else if (anObject instanceof EditText) {
                    currentVal = anObject.text;
                } else {
                    throw "can't set a preference with no value";
                }

            }
            if (anObject.savedPref !== currentVal) {
                anObject.savedPref = currentVal;
                app.settings.saveSetting(
                    this.prefsName,
                    prefName,
                    currentVal
                );
            }
        };

        this.getPref = function (anObject, prefDefault) {

            var result, prefName, defaultVal;
            if (typeof anObject === "string") {
                prefName = anObject;
            } else if (anObject.hasOwnProperty('name')) {
                prefName = anObject.name;
            }

            if (typeof prefDefault !== "undefined") {
                defaultVal = prefDefault
            } else if (anObject.hasOwnProperty("default")) {
                defaultVal = anObject.default;
            } else if (anObject.hasOwnProperty("value")) {
                defaultVal = anObject.value;
            } else if (anObject.hasOwnProperty("selection")) {
                defaultVal = anObject.selection.index;
            } else if (anObject instanceof EditText) {
                defaultVal = anObject.text;
            }
            if (prefName) {
                if (app.settings.haveSetting(this.prefsName, prefName)) {
                    // get prefs for UI control
                    // objects can use specified pref types with the type of the returned result determined by a preftype property
                    var prefType = anObject.prefType;
                    if (!prefType) {
                        if (anObject instanceof Slider) {
                            prefType = "number";
                        } else if (
                            anObject instanceof Checkbox ||
                            anObject instanceof RadioButton
                        ) {
                            prefType = "boolean";
                        } else if (anObject instanceof DropDownList) {
                            prefType = "int";
                        } else {
                            prefType = typeof prefDefault;
                        }
                        if (prefType !== "undefined") {
                            // otherwise the default is a string
                            prefType = "string";
                        }
                    }
                    result = this.parsePref(app.settings.getSetting(this.prefsName, prefName), prefType);
                } else if (typeof defaultVal !== "undefined") {
                    // return the default
                    result = defaultVal
                }
                return result;
            } else {
                throw "Preference name not supplied.";
            }
        }
    }

    /**************************************************************************
    * BattleStyle stuff********************************************************
    **************************************************************************/

    /** convert a #ff00ff color string to a normalized RGBA color array
        @parem {hexString} - string - hex string
    */
    function hexToArray(hexString) {
        var hexColor = hexString.replace('#', '');
        var r = parseInt(hexColor.slice(0, 2), 16) / 255;
        var g = parseInt(hexColor.slice(2, 4), 16) / 255;
        var b = parseInt(hexColor.slice(4, 6), 16) / 255;
        return [r, g, b, 1];
    }

    /** open url in browser
        @parem {url} - string - url
    */
    function visitURL(url) {
        if (indexOf($.os, "Windows") != -1) {
            system.callSystem('cmd /c "' + Folder.commonFiles.parent.fsName + "\\Internet Explorer\\iexplore.exe" + '" ' + url);
        } else {
            system.callSystem('open "' + url + '"');
        }
    }

    /**************************************************************************
     * Text Button ************************************************************
     **************************************************************************/
    function txtDraw() {
        this.graphics.drawOSControl();
        this.graphics.rectPath(0, 0, this.size[0], this.size[1]);
        this.graphics.fillPath(this.fillBrush);
        if (this.text) {
            this.graphics.drawString(
                this.text,
                this.textPen,
                (this.size[0] - this.graphics.measureString(this.text, this.graphics.font, this.size[0])[0]) / 2,
                (this.size[1] - this.graphics.measureString(this.text, this.graphics.font, this.size[0])[1]) / 1.75,
                this.graphics.font);
        }
    }

    /** draw an text button with a colored background - returns a button object
        @parem {parentObj} - object - ScriptUI panel or group
        @parem {buttonText} - string - button text
        @parem {staticColor} - string - icon color when static
        @parem {hoverColor} - string - icon color when hovered (optional)
        @parem {textColour} - string - text color (optional)
        @parem {textHoverColour} - string - text color when hovered (optional)
    */
    function buttonColorText(parentObj, buttonText, staticColor, hoverColor, textColour, textHoverColour) {
        var txtCol = textColour || "#FFFFFF";
        var txtHoverCol = textHoverColour || "#FFFFFF";
        var btn = parentObj.add('button', undefined, '', { name: 'ok' });    // add a basic button to style
        btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, hexToArray(staticColor));
        btn.text = buttonText;
        btn.textPen = btn.graphics.newPen(btn.graphics.PenType.SOLID_COLOR, hexToArray(txtCol), 1);
        btn.onDraw = txtDraw;

        if (hoverColor) {
            try {
                btn.addEventListener("mouseover", function () {
                    updateTextButtonOnHover(this, buttonText, hoverColor, txtHoverCol);
                });
                btn.addEventListener("mouseout", function () {
                    updateTextButtonOnHover(this, buttonText, staticColor, txtCol);
                });
            } catch (err) {
                // fail silently
            }
        }

        return btn;
    }

    function updateTextButtonOnHover(btn, buttonText, backgroundColor, textColor) {
        btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, hexToArray(backgroundColor));
        btn.text = buttonText;
        btn.textPen = btn.graphics.newPen(btn.graphics.PenType.SOLID_COLOR, hexToArray(textColor), 1);
        btn.onDraw = txtDraw;
        return btn;
    }

    /**************************************************************************
     * Vector Button **********************************************************
     **************************************************************************/
    function vecToPoints(vecCoord) {
        var points = [];
        var n;
        for (var i = 0; i < vecCoord.length; i++) {
            var eachNum = vecCoord[i].split(/[\s,]/);
            var coordinates = [];
            var sets = [];
            for (var k = 0; k < eachNum.length; k += 2) {
                sets.push(eachNum[k] + "," + eachNum[k + 1]);
            }
            for (var j = 0; j < sets.length; j++) {
                n = sets[j].split(",");
                coordinates[j] = n;
                coordinates[j][0] = (parseFloat(coordinates[j][0]));
                coordinates[j][1] = (parseFloat(coordinates[j][1]));
            }
            points.push(coordinates);
        }
        return points;
    }

    function vecDraw() {
        this.graphics.drawOSControl();
        this.graphics.rectPath(0, 0, this.size[0], this.size[1]);
        this.graphics.fillPath(this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0.15]));
        try {
            for (var i = 0; i < this.coord.length; i++) {
                var line = this.coord[i];
                this.graphics.newPath();
                this.graphics.moveTo(line[0][0] + (this.size[0] / 2 - this.artSize[0] / 2), line[0][1] + (this.size[1] / 2 - this.artSize[1] / 2));
                for (var j = 0; j < line.length; j++) {
                    this.graphics.lineTo(line[j][0] + (this.size[0] / 2 - this.artSize[0] / 2), line[j][1] + (this.size[1] / 2 - this.artSize[1] / 2));
                }
                this.graphics.fillPath(this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, hexToArray(this.iconColor)));
            }
        } catch (e) {

        }
    }

    /** draw an colored icon button - returns a button object
        @parem {parentObj} - object - ScriptUI panel or group
        @parem {iconVec} - array of strings - SVG coords as string
        @parem {size} - array - icon size
        @parem {staticColor} - string - icon color when static
        @parem {hoverColor} - string - icon color when hovered (optional)
    */
    function buttonColorVector(parentObj, iconVec, size, staticColor, hoverColor) {
        var btn = parentObj.add("button", [0, 0, size[0], size[1], undefined]);
        btn.coord = vecToPoints(iconVec);
        btn.iconColor = staticColor;
        btn.artSize = size;
        btn.onDraw = vecDraw;

        if (hoverColor) {
            try {
                btn.addEventListener("mouseover", function () {
                    updateVectorButtonOnHover(this, iconVec, hoverColor, size);
                });
                btn.addEventListener("mouseout", function () {
                    updateVectorButtonOnHover(this, iconVec, staticColor, size);
                });
            }
            catch (err) {
                // fail silently
            }
        }

        return btn;
    }

    function updateVectorButtonOnHover(btn, iconVec, iconColor, size) {
        btn.coord = vecToPoints(iconVec);
        btn.iconColor = iconColor;
        btn.artSize = size;
        btn.onDraw = vecDraw;
        return btn;
    }


})(this)