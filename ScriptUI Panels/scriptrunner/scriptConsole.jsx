

/*
Code for Import https://scriptui.joonas.me — (Triple click to select): 
{"activeId":22,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"text":"Import Multiple PDF pages","preferredSize":[0,0],"margins":16,"orientation":"row","spacing":10,"alignChildren":["left","top"],"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"enabled":true}},"item-20":{"id":20,"type":"Group","parentId":23,"style":{"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null,"varName":null,"enabled":true}},"item-21":{"id":21,"type":"EditText","parentId":20,"style":{"enabled":true,"varName":"textInput","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":true,"enterKeySignalsOnChange":true},"softWrap":false,"text":"EditText","justify":"left","preferredSize":[300,26],"alignment":null,"helpTip":"Type here!"}},"item-22":{"id":22,"type":"ListBox","parentId":20,"style":{"enabled":true,"varName":"choiceList","creationProps":{"multiselect":false,"numberOfColumns":"1","columnWidths":"","columnTitles":"","showHeaders":false},"listItems":"Item 1, Item 2, item 3, item 4","preferredSize":[0,100],"alignment":null,"helpTip":null,"selection":[0]}},"item-23":{"id":23,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-24":{"id":24,"type":"Group","parentId":23,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-25":{"id":25,"type":"StaticText","parentId":24,"style":{"enabled":true,"varName":"description","creationProps":{"truncate":"none","multiline":true,"scrolling":true},"softWrap":false,"text":"Script \ndescription\ngoes\nhere","justify":"left","preferredSize":[160,100],"alignment":null,"helpTip":""}}},"order":[0,23,20,21,22,24,25],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"functionWrapper":false,"compactCode":false,"showDialog":true,"afterEffectsDockable":false,"itemReferenceList":"None"}}
*/
(function (thisObj) {
    var SCRIPT_NAME = "scriptConsole";
    var VERSION_NUM = 0.1;
    // consts
    var SCRIPT_FOLDER_PREF = "script_folder"
    var imgsFolder = $.fileName.replace(SCRIPT_NAME + ".jsx", "/images/")
    var DEFAULT_FILE_ICON = new File(imgsFolder + "scriptIcon.png");
    var FILE_NOT_FOUND = "The script file was not found."
    var MAX_LINES_TO_READ = 16;
    var DEFAULT_INFO_TEXT = SCRIPT_NAME + " v. " + VERSION_NUM;
    // initialise
    var prefs = new myPreferences(SCRIPT_NAME);
    var myScriptFolder = new Folder(Folder.decode(prefs.getPref(SCRIPT_FOLDER_PREF)));
    if (!myScriptFolder.exists) {
        myScriptFolder = Folder.selectDialog("Select a scripts folder");
        if (myScriptFolder.exists) {
            prefs.setPref({ "name": SCRIPT_FOLDER_PREF, "value": Folder.encode(myScriptFolder) })
        }
    }
    var scriptList = new ScriptFolder(myScriptFolder);
    popUPWindow(SCRIPT_NAME);

    function findMatchingScripts(theScripts, searchText) {
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
    }


    function popUPWindow(theText) {
        // DIALOG
        // ======
        var dialog = new Window("dialog");
        dialog.text = "ScriptConsole";
        dialog.orientation = "row";
        dialog.alignChildren = ["left", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;

        // GROUP1
        // ======
        var group1 = dialog.add("group", undefined, { name: "group1" });
        group1.orientation = "row";
        group1.alignChildren = ["left", "top"];
        group1.spacing = 6;
        group1.margins = 0;

        // GROUP2
        // ======
        var group2 = group1.add("group", undefined, { name: "group2" });
        group2.orientation = "column";
        group2.alignChildren = ["fill", "top"];
        group2.spacing = 6;
        group2.margins = 0;

        var textInput = group2.add('edittext {properties: { borderless: true}}');
        textInput.helpTip = "Type here!";
        textInput.text = theText;
        textInput.preferredSize.width = 240;
        textInput.preferredSize.height = 26;
        textInput.name = "textInput";
        textInput.default = "script name";
        textInput.text = prefs.getPref(textInput);
        var choiceList_array = ["Item 1", "Item 2", "item 3", "item 4"];
        var choiceList = group2.add("listbox", undefined, undefined, { name: "choiceList", items: choiceList_array });
        choiceList.selection = 0;
        choiceList.preferredSize.height = 100;

        // GROUP3
        // ======
        var group3 = group1.add("group", undefined, { name: "group3" });
        group3.orientation = "column";
        group3.alignChildren = ["left", "center"];
        group3.spacing = 6;
        group3.margins = 0;

        var descriptionGroup = group3.add("group");
        descriptionGroup.preferredSize.width = 200;
        descriptionGroup.preferredSize.height = 100;
        descriptionGroup.orientation = "column";
        descriptionGroup.alignment = ["top", "left"];
        descriptionGroup.spacing = 0;

        var scriptInfoStaticText = descriptionGroup.add(
            "statictext",
            undefined,
            "Script description goes here",
            { name: "description", multiline: true, scrolling: true, alignment: ['top', 'left'] }
        );
        scriptInfoStaticText.preferredSize.width = 200;
        // description.preferredSize.height = 100; 
        var doTheThingsBtn = group3.add('button', [undefined, undefined, 200, 22], "Do the Things")

        function handleReturn() {
            prefs.setPref(textInput);
            if (choiceList.selection) {
                choiceList.selection.payload.exec();
            }
        }
        function updateChoiceListAndInfo() {
            prefs.setPref(textInput);
            choiceList.removeAll();
            scriptInfoStaticText.text = DEFAULT_INFO_TEXT;
            if (textInput.text) {
                var matchingScripts = findMatchingScripts(scriptList.scriptFiles, textInput.text, choiceList);
                for (var i = 0; i < matchingScripts.length; i++) {
                    matchingScripts[i].displayInListBox(choiceList);
                }
                if (null !== choiceList.items) {
                    choiceList.revealItem(matchingScripts[0].info.shortname);
                    choiceList.selection = matchingScripts[0].info.shortname;
                }
            }
        }

        function updateInfoPanel(selectedScript) {
            var desc = (selectedScript && selectedScript.info) ? selectedScript.info.shortname : DEFAULT_INFO_TEXT;
            if (selectedScript.info.description) {
                desc = selectedScript.info.description
            }
            scriptInfoStaticText.text = desc;
        }
        function handleChoiceListChange() {
            if (null !== this.selection) {
                var selectedScript = this.selection.payload;
                updateInfoPanel(selectedScript);
            }
        }

        function handleDoubleClick() {
            alert(this);
        }

        updateChoiceListAndInfo(); //initialise the choicelist and infor, according to the last text from prefs
        updateInfoPanel(choiceList.selection ? choiceList.selection.payload : null);
        textInput.active = true;
        textInput.onEnterKey =
            doTheThingsBtn.onClick =
            choiceList.onDoubleClick =
            handleReturn;
        textInput.onChanging = updateChoiceListAndInfo;
        choiceList.onChange = handleChoiceListChange;
        dialog.show()
    }

    function ScriptFile(theItem) {
        // dirLevel is the depth below the main folder
        if (typeof theItem === "string") {
            this.fsItem = File(File.decode(theItem)); //Actual file system file/folder
        } else {
            this.fsItem = theItem;
        }
        this.getInfo = function () {
            // look for info in sidecar files or in the script.
            // in scripts info is within the first lines as defined by MAX_INFO_LINES
            // and is preceded by a line like this:
            //   // scriptrunner info
            // see the top of this file for an example
            this.info = {
                "shortname": File.decode(this.fsItem.name).replace("\.jsx*(bin)*$", "", "i"),
                "icon": DEFAULT_FILE_ICON
            }
            //how many lines of script to scan for info, to speed up loading
            var sidecar = new File(File.decode(this.fsItem.name.replace(/(\.jsx?(bin)*)*$/, "_info.json")));
            var infoFiles = [];
            if (sidecar.exists) { //get info from sidecar if it exists
                infoFiles = [sidecar];
            }
            if (this.fsItem.name.match("\\.jsx*$")) {
                // also look inside jsx and js files
                infoFiles.push(this.fsItem);
            }
            for (var f = 0; f < infoFiles.length; f++) {
                this.readInfoFromFile(infoFiles[f]);
            }
            if (infoFiles[f]) { infoFiles[f].close(); }
        }

        this.readInfoFromFile = function (theFile) {
            var isJSONFile = theFile.name.match("\.json", "i");
            try {
                if (theFile.open()) {
                    var infoData = "";
                    if (!isJSONFile) {
                        var lc = 0;
                        var foundHeader = false;
                        // when reading script files scan the first MAX_INFO_LINES lines looking for the header
                        while (
                            (!theFile.eof) &&
                            !foundHeader &&
                            lc < MAX_LINES_TO_READ
                        ) {
                            lc++;
                            line = theFile.readln();
                            foundHeader = line.match("^\\s*\\/*\\s*scriptrunner info", "i");
                        }

                    }
                    if (isJSONFile || foundHeader) {
                        // read the next lines as JSON, stripping off the comment slashes
                        // will stop reading once it hits an empty line
                        var keepReadingJSON = true;
                        while (!theFile.eof && keepReadingJSON) {
                            line = theFile.readln();
                            if (!isJSONFile) {
                                // in script files, keep reading until a break in the comments
                                var infoLine = line.match(/\s*\/\/(.*)/);
                                if (infoLine) {
                                    line = infoLine[1]; //strip off the slashes to return the JSON payload
                                } else {
                                    line = null;
                                    keepReadingJSON = false;
                                }
                            }
                            if (line) {
                                infoData += line;
                            }
                        }
                        var info = JSON.parse(infoData);
                        for (var key in info) {
                            this.info[key] = info[key];
                        }
                    }
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
            item = listBox.add("item", this.info.shortname);
            item.payload = this;
            // var iconFile = (this.info.icon && this.info.icon.exists) ?
            //     this.info.icon :
            //     DEFAULT_FILE_ICON;
            // if (iconFile.exists) {
            //     item.icon = iconFile;
            // }
        }

        this.exec = function () {
            try {
                if (this.fsItem.exists) {
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

        this.rankMatch = function (theString) {
            // text matching algorithm
            // matches partial and non-sequential string matches 
            // e.g given the scriptname FooBarFoo foo wil rank higher than foa, but foa will still match
            // higher ranking will be given to matches of capital letters
            // so fbf will match lower than fob
            var letters = theString.split("");
            var lCursor = 0;
            var canMatch = true;
            var canMatchUpper = true;
            for (var i = 0; i < letters.length && canMatch; i++) {
                var caseInsensitiveIndex = 1 + this.info.shortname.toLowerCase().indexOf(letters[i].toLowerCase(), lCursor);
                if (caseInsensitiveIndex) {
                    lCursor = caseInsensitiveIndex;
                } else {
                    canMatch = false;
                }
            }
            var caseInsensitiveRank = lCursor;
            lCursor = 0;
            var upperCaseLetters = this.info.shortname.match(/(^.|[A-Z]*)/g).join("").toUpperCase(); //select all the capitals and the first letter as an honorary capital
            for (var i = 0; i < letters.length && canMatch && canMatchUpper; i++) {
                var upperCaseIndex = 1 + upperCaseLetters.indexOf(letters[i].toUpperCase(), lCursor);
                if (upperCaseIndex) {
                    lCursor = upperCaseIndex;
                } else {
                    canMatchUpper = false;
                }
            }
            var upperCaseRank = lCursor + 1;
            if (canMatch) {
                if (canMatchUpper) {
                    this.rank = Math.min(caseInsensitiveRank, upperCaseRank)
                } else {
                    this.rank = caseInsensitiveRank
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

    function ScriptFolder(theItem) {
        this.recursiveScan = function (folderItem) {
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
                        var innerFolderContents = this.recursiveScan(folderContents[f]);
                        for (var i = 0; i < innerFolderContents.length; i++) {
                            scriptFiles[scriptFiles.length] = innerFolderContents[i];
                        };
                        $.writeln(folderContents[f].name + " " + innerFolderContents.length);
                        $.writeln(scriptFiles.length);
                    }
                }
            }
            return scriptFiles
        }

        if (typeof theItem === "string") {
            this.fsItem = File(File.decode(theItem)); //Actual file system file
        } else {
            this.fsItem = theItem;
        }
        this.scriptFiles = [];
        if (this.fsItem instanceof Folder &&
            this.fsItem.exists &&
            (!File.decode(this.fsItem.name).match(/(^\.|^\(.*\)$)/))) {
            this.scriptFiles = this.recursiveScan(this.fsItem);
        }
    }

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
                case "float":
                    return parseFloat(val);
                case "bool":
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

            var result, prefName;
            if (typeof anObject === "string") {
                prefName = anObject;
            } else if (anObject.hasOwnProperty('name')) {
                prefName = anObject.name;
            }
            if (typeof prefDefault !== undefined) {
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
                            prefType = "float";
                        } else if (
                            anObject instanceof Checkbox ||
                            anObject instanceof RadioButton
                        ) {
                            prefType = "bool";
                        } else if (anObject instanceof DropDownList) {
                            prefType = "int";
                        } else {
                            // otherwise the default is a string
                            prefType = "string";
                        }
                    }
                    result = this.parsePref(app.settings.getSetting(this.prefsName, prefName), prefType);
                } else {
                    // return the default
                    result = defaultVal
                }
                return result;
            } else {
                throw "Preference name not supplied.";
            }
        }
    }
})(this)