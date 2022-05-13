//@target aftereffects
// scriptrunner info
// {
// "shortname": "Scripts-n-Panels",
// "description": "Script organiser with folders",
// "weblink": "http://blob.pureandapplied.com.au",
// "license": "GPL3",
// "copyright": "2022 pureandapplied"
// }
(function (thisObj) {
    var scriptName = "scriptRunner";
    var versionNum = 0.1;
    var imgsFolder = $.fileName.replace(scriptName + ".jsx", "/images/")
    var DEFAULT_FOLDER_ICON = new File(imgsFolder + "folderIcon.png");
    var DEFAULT_FILE_ICON = new File(imgsFolder + "scriptIcon.png");
    var DEFAULT_UP_ICON = new File(imgsFolder + "upIcon.png")
    var SCRIPT_FOLDER_PREF = "scriptsFolder"
    var prefs = new myPreferences(scriptName);

    var scriptFolderPath = new Folder(Folder.decode(prefs.getPref({ "name": SCRIPT_FOLDER_PREF })));
    if (!scriptFolderPath.exists) {
        scriptFolderPath = Folder.selectDialog("Select a scripts folder");
        if (scriptFolderPath.exists) {
            prefs.setPref({ "name": SCRIPT_FOLDER_PREF, "value": Folder.encode(scriptFolderPath) })
        }
    }


    function buildGUI(thisObj) {
        var scriptFolderItemPrefs = {
            "scanFilesForMetadata": prefs.getPref({ "name": "read info from files", "default": true }),
            "maxLinesToRead": prefs.getPref({ "name": "max lines to read", "default": 16 })
        }
        var myFolder = new ScriptFolderItem(scriptFolderPath, 0, scriptFolderItemPrefs)
        // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
        var pal =
            thisObj instanceof Panel
                ? thisObj
                : new Window("palette", thisObj.scriptTitle, undefined, {
                    resizeable: true,
                });
        // ----------------------- UI Elements here ---------------------
        // ----------dropDownList-------------------
        var scriptsList = pal.add(
            "listbox",
            [undefined, undefined, 180, 222],
            [],
            {resizeable: true}
        );
        scriptsList.name = "scriptsList";
        myFolder.displayContentsInListbox(scriptsList);
        scriptsList.onDoubleClick = listBoxHandleDoubleClick;

        //-----------info text-------------------------
        var infoText =  pal.add(
            "statictext",
            [undefined, undefined, 180, 44],
            scriptName + " v. " + versionNum
        );

        //-----------Button-------------------------
        var doTheThingsBtn = pal.add(
            "button",
            [undefined, undefined, 180, 22],
            "Do the Things"
        );

        // ---------- UI Call backs -------------------
        scriptsList.onChange = function () {
            prefs.setPref(this);
            scriptsList.items[scriptsList.selection.index].payload.displayInfo(infoText);
        };
        
        doTheThingsBtn.onClick = function () {
            scriptsList.items[scriptsList.selection.index].payload.exec(scriptsList);
        };

        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    }

    //---------------------------- functions n shit ---------------------
    function doTheThings(thing) {
        app.beginUndoGroup(thing.name);
        thing.function();
        app.endUndoGroup();
    }

    function listBoxHandleDoubleClick() {
        if (this.selection.payload) {
            this.selection.payload.exec(this);
        }
    }

    function ScriptFolderItem(theItem, dirLevel, scriptRunnerPrefs) {
        // dirLevel is the depth below the main folder

        this.getInfo = function () {
            // look for info in sidecar files or in the script.
            // in scripts info is within the first lines as defined by MAX_INFO_LINES
            // and is preceded by a line like this:
            //   // scriptrunner info
            // see the top of this file for an example
            this.info = {
                "shortname": File.decode(this.fsItem.name).replace("\.jsx*(bin)*$", "", "i"),
                "icon": (this.isFolder ? DEFAULT_FOLDER_ICON : DEFAULT_FILE_ICON)
            }
            //how many lines of script to scan for info, to speed up loading
            var sidecar = new File(this.fsItem.name.replace(/(\.jsx?(bin)*)*$/, "_info.json"));
            var infoFiles = [];
            if (sidecar.exists) { //get info from sidecar if it exists
                infoFiles = [sidecar];
            }
            if ((!this.isFolder) && this.fsItem.name.match("\\.jsx*$")) {
                // also look inside jsx and js files
                infoFiles.push(this.fsItem);
            }
            for (var f = 0; f < infoFiles.length; f++) {
                if (scriptRunnerPrefs.scanFilesForMetadata) {
                    this.readInfoFromFile(infoFiles[f]);
                }
            }
            if (infoFiles[f]) { infoFiles[f].close(); }
        }

        this.readInfoFromFile = function (theFile) {
            var isJSONFile = theFile.name.match("\.json", "i");
            if (theFile.open()) {
                var infoData = "";
                var line = theFile.readln();
                if (!isJSONFile) {
                    var lc = 0;
                    var foundHeader = false;
                    // when reading script files scan the first MAX_INFO_LINES lines looking for the header
                    while (
                        (!theFile.eof) &&
                        !foundHeader &&
                        lc < scriptRunnerPrefs.maxLinesToRead
                    ) {
                        foundHeader = line.match("^\\s*\\/*\\s*scriptrunner info", "i");
                        lc++;
                        line = theFile.readln();
                    }

                }
                if (isJSONFile || foundHeader) {
                    // read the next lines as JSON, stripping off the comment slashes
                    // will stop reading once it hits an empty line
                    var keepReadingJSON = true;
                    while (!theFile.eof && keepReadingJSON) {
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
                        line = theFile.readln();
                    }
                    var info = JSON.parse(infoData);
                    for (var key in info) {
                        this.info[key] = info[key];
                    }
                }
            }
        }
        this.isThisAScript = function (theFile) {
            if (theFile instanceof String) {
                theFile = File(theFile);
            }
            return (
                theFile instanceof File &&
                theFile.exists &&
                File.decode(theFile.name).match("^[^.].*\.(js|jsx|jsxbin)$", "i"));
        }

        this.checkShouldDisplay = function () {
            // test to see if this is a script file or a folder containing script(s)
            this.shouldDisplay = false;
            this.isFolder =
                this.fsItem instanceof Folder &&
                this.fsItem.exists;

            if (this.dirLevel < 0 ||
                (File.decode(this.fsItem.name).match(/(^\.|^\(.*\)$)/))//exclude directories that are (parenthesized)
            ) {
                return false
            }
            if (this.isFolder) {
                var theContents = this.fsItem.getFiles();
                //look to see if any of the files in this folder are scripts
                for (var i = 0; i < theContents.length && (!this.shouldDisplay); i++) {
                    var fItem = theContents[i];
                    if (fItem instanceof File &&
                        this.isThisAScript(fItem)
                    ) {
                        this.shouldDisplay = true;
                    } else if (File.decode(fItem.name).match("^icon\.png$")) {
                        this.info.icon = fItem;
                    }
                }
                // if not, look to see if any of the folders contain scripts (recursively)
                for (var i = 0; i < theContents.length && (!this.shouldDisplay); i++) {
                    var fItem = theContents[i];
                    if (fItem instanceof Folder) {
                        var subFolder = new ScriptFolderItem(fItem, this.dirLevel + 1, scriptRunnerPrefs);
                        if (subFolder.shouldDisplay) {
                            this.shouldDisplay = true;
                        }
                    }
                }
            } else {
                this.shouldDisplay = this.isThisAScript(this.fsItem);
            }
        }

        this.listContents = function () {
            // if this.shouldDisplay returns an array of ScriptFolderItems
            // else returns empty array
            if (this.shouldDisplay) {
                this.getInfo();
                if (this.isFolder) {
                    var subFolders = [];
                    var scriptFiles = [];
                    var folderContents = this.fsItem.getFiles();
                    for (var f = 0; f < folderContents.length; f++) {
                        var itm = new ScriptFolderItem(folderContents[f], this.dirLevel + 1, scriptRunnerPrefs);
                        if (itm.shouldDisplay) {
                            itm.getInfo();
                            if (itm.isFolder) {
                                subFolders.push(itm);
                            } else {
                                scriptFiles.push(itm);
                            }
                        }
                    }
                    return subFolders.concat(scriptFiles);
                }
            } else {
                return []
            }
        }

        this.displayContentsInListbox = function (listBox) {
            listBox.removeAll();
            this.getInfo();
            if (this.dirLevel > 0) {
                this.parent = new ScriptFolderItem(this.fsItem.parent, this.dirLevel - 1, scriptRunnerPrefs);
                this.parent.info.shortname = "UP";
                this.parent.info.icon = DEFAULT_UP_ICON;
                this.parent.displayInListBox(listBox);
            }
            var myItems = this.listContents();
            for (var i = 0; i < myItems.length; i++) {
                myItems[i].getInfo();
                myItems[i].displayInListBox(listBox);
            }
        }

        this.displayInListBox = function (listBox) {
            item = listBox.add("item", this.info.shortname);
            item.payload = this;
            if (this.info.icon && this.info.icon.exists) {
                item.icon = this.info.icon;
            } else {
                var iconFile = (this.fsItem instanceof Folder) ? DEFAULT_FOLDER_ICON : DEFAULT_FILE_ICON;
                if (iconFile.exists) {
                    item.icon = iconFile;
                }
            }
        }

        this.exec = function (listBox) {
            if (this.isFolder) {
                this.displayContentsInListbox(listBox);
            } else {
                if (this.fsItem.exists) {
                    $.evalFile(this.fsItem.fsName);
                }
            }
        }

        this.displayInfo = function (infoText) {
            // TODO: fancy info display.
            infoText.text = this.info.description || this.fsItem.name;
        }

        // -------------------initialise ScriptFolderItem object--------------------
        // ScriptFolderItem represents one of the contents of a script folder
        // or one of its subfolders. It can be either a file or a folder
        // properties:
        //   fsItem: File,                          ← the item's actual file system file or folder,
        //   info: {shortname: String, icon: File}, ← metadata object. By default contains shortname and icon properties
        //   dirLevel: File / false,               ← all but the top level folder should be have a parent
        //   shouldDisplay: boolean                 ← files that shouldn't display don't have any info properties
        // and methods:
        //   getInfo()
        //   isThisAScript()
        //   checkShouldDisplay()
        //   listContents()
        if (theItem instanceof String) {
            this.fsItem = File(File.decode(theFolder)); //Actual file system file/folder
        } else {
            this.fsItem = theItem;
        }
        this.info = {};
        this.dirLevel = dirLevel;
        this.checkShouldDisplay();
    }

    //---------------------------- ui prefs -----------------------------
    function myPreferences(scriptName) {
        // look for preferences for this object
        // provide a setPref function to allow values to be stored in AE's preferences
        // scriptName sets the section of the preference file they are saved in.
        this.prefsName = scriptName;

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

        this.setPref = function (anObject) {
            var currentVal;
            if (anObject.name) {
                if (anObject.hasOwnProperty("value")) {
                    currentVal = anObject.value;
                } else if (anObject.hasOwnProperty("selection")) {
                    currentVal = anObject.selection.index;
                } else if (anObject instanceof EditText) {
                    currentVal = anObject.text;
                } else {
                    throw "objects must have a 'text' or 'value' property to set preferences";
                }

                if (anObject.savedPref !== currentVal) {
                    anObject.savedPref = currentVal;
                    app.settings.saveSetting(
                        this.prefsName,
                        anObject.name,
                        currentVal
                    );
                }
            }
        };

        this.getPref = function (anObject) {
            if (anObject.name) {
                if (app.settings.haveSetting(this.prefsName, anObject.name)) {
                    // get prefs for UI control
                    var prefType;
                    if (anObject instanceof Slider) {
                        prefType = "float";
                    } else if (
                        anObject instanceof Checkbox ||
                        anObject instanceof RadioButton
                    ) {
                        prefType = "bool";
                    } else if (anObject instanceof DropDownList) {
                        prefType = "int";
                    } else if (anObject instanceof EditText) {
                        prefType = "string";
                    } else {
                        // objects can use specified pref types with the type of the returned result determined by a preftype property
                        // otherwise the default is a string
                        prefType = anObject.prefType;
                    }
                    result =
                        anObject.savedPref =
                        this.parsePref(app.settings.getSetting(this.prefsName, anObject.name), prefType);
                } else if (anObject.hasOwnProperty("default")) {
                    // return the default
                    result = anObject.default;
                    anObject.value = anObject.default;
                }
                return result;
            } else {
                throw "objects must have a name to be given prefs.";
            }
        };
    }

    //--------------------- go ahead and run ----------------------
    buildGUI(thisObj);
})(this);
