// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// @includepath "../(lib)/"
// @include "preferences.jsx"
/* global app, Panel, Folder, PrefsFile*/

(function () {
    var scriptName = "proxinator";

    var prefsFile = new PrefsFile("AE_proxinator.prefs");

    buildUI(this, prefsFile);

    function proxinate(proxyFolder, items) {
        // set a proxy for all selected items by matching file names in a folder
        var originals = items || app.project.selection;
        var msg = "";
        if (originals) {
            for (var i = 0; i < originals.length; i++) {
                if (!proxyFolder) {
                    chooseProxyFolder();
                }
                // try {
                var originalBaseName = originals[i].name;
                if (originals[i].typeName === "Footage") {
                    originalBaseName = originals[i].name.replace(/\..+$/, ""); //trim extension
                }
                // possible matches for the proxy, from the reasonable to the silly
                var suffixes = [
                    ".mov",
                    ".avi",
                    ".mp4",
                    ".mxf",
                    ".mpg",
                    ".mpeg",
                    ".mkv",
                    ".ogv",
                    ".webm",
                    ".wmv",
                    ".dv",
                    ".omf",
                ];
                var proxyStrings = ["", "_proxy", "-proxy", " proxy"];
                var foundAProxy = false;
                for (var s = 0; (s < suffixes.length) & !foundAProxy; s++) {
                    for (
                        var t = 0;
                        (t < proxyStrings.length) & !foundAProxy;
                        t++
                    ) {
                        var newProxy = new File(
                            proxyFolder.absoluteURI +
                                "/" +
                                originalBaseName +
                                proxyStrings[t] +
                                suffixes[s]
                        );
                        if (newProxy.exists) {
                            originals[i].setProxy(newProxy);
                            foundAProxy = true;
                        }
                    }
                }
                if (!foundAProxy) {
                    msg += originalBaseName + "\n";
                }
                originals[i].selected = false;
                originals[i].selected = true;
                // } catch (e) {
                //   alert("had an error" + e)
                // }
            }
            if (msg) {
                alert(
                    "Can't find matching files in\n" +
                        proxyFolder.fsName +
                        "\nfor item:\n" +
                        msg
                );
                return false;
            } else {
                return true;
            }
        } else {
            // no originals were given
            alert(
                "Choose some footage items and I'll search the proxy folder for proxies"
            );
        }
    }

    function chooseProxyFolder(startPath) {
        var newFolder = false;
        if (startPath) {
            newFolder = startPath.selectDlg(
                "Choose the source folder for the proxies"
            );
        } else {
            newFolder = Folder.selectDialog(
                "Choose the source folder for the proxies"
            );
        }
        // only update the proxy folder value if a new folder is actually choosen
        // selectDialog or selectDlg return null if user cancels, but if the proxy folder is already set
        // we don't want to overwrite it.

        if (newFolder) {
            prefsFile.saveToPrefs(newFolder);
            return newFolder;
        } else {
            return false;
        }
    }

    function createProxyWithFFMpeg(clips, proxyFolder, proxySettings) {
        var commands = [];
        for (var i = 0; i < clips.length; i++) {
            if (clips[i].typeName === "Footage") {
                var scaleX = clips[i].width * proxySettings.scaleFactor;
                var scaleY = clips[i].height * proxySettings.scaleFactor;
                var clipScale = "" + scaleX + ":" + scaleY;
                var cmd =
                    "ffmpeg -i " +
                    theFile +
                    proxySettings.vCodec +
                    "-s " +
                    clipScale +
                    proxyFile;
                commands.push(cmd);
            }
        }
    }

    function buildUI(thisObj, prefsFile) {
        if (thisObj instanceof Panel) {
            var pal = thisObj;
        } else {
            pal = new Window("palette", scriptName, undefined, {
                resizeable: true,
            });
        }

        if (pal !== null) {
            var sourcePanel = pal.add(
                "panel",
                {
                    x: 4,
                    y: undefined,
                    width: undefined,
                    height: undefined,
                },
                "source folder"
            );
            var chooseProxyFolderBtn = sourcePanel.add(
                "button",
                {
                    x: 4,
                    y: undefined,
                    width: 180,
                    height: 25,
                },
                "choose proxy folder"
            );

            var proxyFolderText = sourcePanel.add(
                "statictext",
                {
                    x: 4,
                    y: undefined,
                    width: 180,
                    height: 25,
                },
                "no folder selected",
                { truncate: "middle" }
            );

            var proxinateBtn = pal.add(
                "button",
                {
                    x: 4,
                    y: undefined,
                    width: 180,
                    height: 25,
                },
                "set proxies for selected"
            );

            var statusText = pal.add(
                "staticText",
                {
                    x: 4,
                    y: undefined,
                    width: 180,
                    height: 25,
                },
                "choose a folder",
                { truncate: "middle" }
            );

            var proxyFolder = prefsFile.readFromPrefs();
            checkProxyFolderAndUpdateText(
                proxyFolder,
                proxyFolderText,
                proxinateBtn,
                statusText
            );

            chooseProxyFolderBtn.onClick = function () {
                proxyFolder = chooseProxyFolder(proxyFolder);
                checkProxyFolderAndUpdateText(
                    proxyFolder,
                    proxyFolderText,
                    proxinateBtn,
                    statusText
                );
            };

            proxinateBtn.onClick = function () {
                if (proxinate(proxyFolder)) {
                    statusText.text = "succesfully proxinated";
                } else {
                    statusText.text = "error while proxinating";
                }
                this.active = false; // stops the button staying activated
            };

            if (!proxyFolder) {
                proxinateBtn.enabled = false;
            }
            // show the panel
            if (pal instanceof Window) {
                pal.center();
                pal.show();
            } else {
                pal.layout.layout(true);
            }
        }
    }

    function checkProxyFolderAndUpdateText(
        proxyFolder,
        proxyFolderText,
        proxinateBtn,
        statusText
    ) {
        if (proxyFolder && proxyFolder.fsName) {
            proxyFolderText.text = proxyFolder.fsName;
            if (app.project.selection) {
                statusText.text = "ready to proxinate";
            } else {
                statusText.text = "select project items to proxinate";
            }
            proxinateBtn.enabled = true;
        } else {
            proxyFolderText.text = "<none>";
            proxinateBtn.enabled = false;
            statusText.text = "choose a proxy source folder";
        }
    }

    function PrefsFile(theName) {
        // eslint-disable-line no-unused-vars

        this.saveToPrefs = function (data) {
            var payload = data || this.data;
            var f = new File(this.prefPath);
            f.encoding = "UTF8";
            f.open("w");
            f.write(payload.toSource());
            f.close();
        };

        this.readFromPrefs = function () {
            var f = new File(this.prefPath);
            if (f.exists) {
                f.open("r");
                this.data = eval(f.read()); // eslint-disable-line no-eval
                f.close();
                return this.data;
            }
            return null;
        };

        this.getPref = function (prefName) {
            var data = this.readFromPrefs();
            if (data) {
                for (var pref in data) {
                    if (pref === prefName) {
                        return data[pref];
                    }
                }
            }
            return null;
        };

        this.setPref = function (prefName, prefValue) {
            var theData = this.data;
            if (theData[prefName] !== prefValue) {
                theData[prefName] = prefValue;
                this.data = theData;
                this.saveToPrefs();
            }
        };

        this.setPrefs = function (prefData, saveOnChange) {
            var shouldSave = false;
            var theData = this.data || this.readFromPrefs() || {};
            for (var prefName in prefData) {
                if (theData[prefName] !== prefData[prefName]) {
                    theData[prefName] = prefData[prefName];
                    shouldSave = true;
                }
            }
            if (shouldSave & saveOnChange) {
                this.saveToPrefs();
            }
        };
        this.prefPath = Folder.userData.absoluteURI + theName + ".txt";
        this.data = this.readFromPrefs() || {};
    }
    // var proxyFolder = chooseProxyFolder(lastFolder);
    // prefsFile.saveToPrefs(proxyFolder);
    // proxinate(proxyFolder);
})();

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
