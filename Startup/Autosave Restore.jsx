// Autosave Restore by stib
// @target aftereffects

// if AE crashes this finds if there are autosaved copies your project that are newer than the saved one

// license below
// more: https://blob.pureandapplied.com.au
(function () {
    var scriptName = this.name = "AutoSave Restore";
    var ignoredPrefName = "ignoredAutoSaves";
    var openAfterPrefname = "openAfterCheckBoxValue"
    var lastProj;

    if (app.project) {
        //if run by user with a file open
        lastProj = app.project.file;
    }
    if (!lastProj) {
        //run at startup before opening project
        lastProj = findLastProj();
    }
    if (lastProj) {
        var lastAutoSave = findLastAutoSave(lastProj);
        if (lastAutoSave) {
            ignoredAutoSaves = getListOfIgnoredAutosaves(this.name);
            if (notInIgnoredList(lastAutoSave, ignoredAutoSaves)) {
                if (isNewer(lastAutoSave, lastProj)) {
                    if (askUserAboutRestoring(lastProj, lastAutoSave)) {
                        restoreAutoSave(lastProj, lastAutoSave);
                    }
                }
            }
        }
    }

    function findLastProj() {
        var lastProjectPath = app.preferences.getPrefAsString(
            "Most Recently Used (MRU) Search v2",
            "MRU Project Path ID # 0, File Path"
        );
        if (lastProjectPath && lastProjectPath.length) {
            var lastProjectFile = new File(lastProjectPath);
            return lastProjectFile;
        }
        return false;
    }

    function findLastAutoSave(lastProjectFile) {
        try {
            //TODO localised strings
            var autoSaveFolder = new Folder(
                String(lastProjectFile.parent) +
                "/Adobe After Effects Auto-Save"
            );
            if (autoSaveFolder.exists) {
                //TODO localised strings
                var mask =
                    File.decode(lastProjectFile.name).replace(".aep", "") +
                    "*auto-save*.aep";
                var autosaves = autoSaveFolder.getFiles(mask);
                var lastVersion = 0;
                var lastAutoSaveFile;
                for (var a = 0; a < autosaves.length; a++) {
                    var vers = parseInt(
                        File.decode(autosaves[a].name).match(
                            /.*\s([0-9]+)\.aep$/
                        )[1]
                    );
                    if (vers > lastVersion) {
                        lastVersion = vers;
                        lastAutoSaveFile = autosaves[a];
                    }
                }
                return lastAutoSaveFile;
            }
        } catch (e) {
            // 
        }
        return false;
    }

    function getListOfIgnoredAutosaves() {
        var ignoredAutoSaves = [];
        if (app.settings.haveSetting(scriptName, ignoredPrefName)) {
            ignoredAutoSaves = app.settings.getSetting(scriptName, ignoredPrefName).split(":\n");
        }
        return ignoredAutoSaves;
    }
    function notInIgnoredList(lastAutoSave, ignoredAutoSaves) {
        var lastAutoSaveURI = lastAutoSave.absoluteURI;
        for (var i = 0; i < ignoredAutoSaves.length; i++) {
            if (ignoredAutoSaves[i] === lastAutoSaveURI) {
                return false;
            }
        }
        return true;
    }
    function ignoreLastAutoSave(lastAutoSave) {
        var ignoredAutoSaves = getListOfIgnoredAutosaves();
        var newIgnoredList = [lastAutoSave.absoluteURI];
        // remember a maximum of 10 ignored autosaves.
        for (var i = 0; i < 10 && ignoredAutoSaves.length > i; i++) {
            newIgnoredList.push(ignoredAutoSaves[i])
        }
        app.settings.saveSetting(scriptName, ignoredPrefName, newIgnoredList.join(":\n"))
    }

    function isNewer(fileOne, fileTwo) {
        // returns true if fileOne is newer than fileTwo
        var timeOne, timeTwo;
        if (fileOne.modified && fileTwo.modified) {
            timeOne = fileOne.modified.getTime();
            timeTwo = fileTwo.modified.getTime();
            if (timeOne && timeTwo) {
                return timeOne > timeTwo;
            }
        }
        return null;
    }

    function formateDate(theDate) {
        return (
            [theDate.getFullYear(), theDate.getMonth(), theDate.getDate()].join(
                "/"
            ) +
            " " +
            [
                theDate.getHours(),
                theDate.getMinutes(),
                theDate.getSeconds(),
            ].join(":")
        );
    }

    function incrementName(proj) {

        var serial = 1;
        var origName = File.decode(proj.name);
        var serialStr = origName.match(/(\d+)\.aep$/);
        if (serialStr) {
            serial = parseInt(serialStr[1]) + 1 | 1;
        }
        var fileName = origName.replace(/\s*\d*\.aep$/, "") + " " + serial + ".aep"
        var fullname = File.encode(File.decode(proj.parent) + "/" + fileName);
        while (new File(fullname).exists) {
            serial++;
            fileName = origName.replace(/\s*\d*\.aep$/, "") + " " + serial + ".aep";
            fullname = File.encode(File.decode(proj.parent) + "/" + fileName);
        }
        return fileName;

    }

    function restoreFromAutoSave(project, autoSave, restoreAs, openAfterwards) {
        if (autoSave.exists) {
            var newProjName = File.encode(
                File.decode(project.parent) +
                "/" +
                restoreAs.replace(/\.aep$/, "") +
                ".aep"
            );
            try {
                if (autoSave.copy(newProjName)) {
                    if (openAfterwards) {
                        app.open(new File(newProjName));
                    }
                }
            } catch (err) {
                alert (err.message);
            }
        }
    }

    function checkText(proj, candidateName) {
        var statusReport = { msg: "", status: true };
        candidateName = candidateName.replace(/\.aep$/i, "") + ".aep";

        var badchars = candidateName.match(/[\\\/\?<>:\*\|":]+/);
        if (badchars) {
            statusReport.msg = "Can't use the characters '" + badchars[0] + "'  in file name.";
            statusReport.status = false;
            return statusReport;
        }
        if (
            new File(File.encode(File.decode(proj.parent) + "/" + candidateName))
                .exists
        ) {
            statusReport.msg = "A file with that name exists.";
            statusReport.status = false;
        }
        return statusReport;
    }

    function askUserAboutRestoring(proj, autoSave) {
        var projName = File.decode(proj.name);
        var projDate = formateDate(proj.modified);
        var autoName = File.decode(autoSave.name);
        var autoDate = formateDate(autoSave.modified);


        // DIALOG
        // ======
        var dialog = new Window("dialog");
        dialog.text = "AutoSave Restore";
        dialog.orientation = "column";
        dialog.alignChildren = ["center", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;

        var statictext1 = dialog.add("group");
        statictext1.preferredSize.width = 360;
        statictext1.orientation = "column";
        statictext1.alignChildren = ["left", "center"];
        statictext1.spacing = 0;

        statictext1.add(
            "statictext",
            undefined,
            "The Autosaved version of the last opened project is newer than the",
            { name: "statictext1" }
        );
        statictext1.add("statictext", undefined, "saved version.", {
            name: "statictext1",
        });
        statictext1.preferredSize.width = 360;

        // PANEL1
        // ======
        var panel1 = dialog.add("panel", undefined, undefined, {
            name: "panel1",
        });
        panel1.preferredSize.width = 360;
        panel1.orientation = "column";
        panel1.alignChildren = ["center", "top"];
        panel1.spacing = 6;
        panel1.margins = 10;
        panel1.lastSavedProjectGroup = panel1.add("group");
        panel1.lastSavedProjectGroup.orientation = "row";
        panel1.lastSavedProjectGroup.spacing = 6;
        panel1.lastSavedProject = panel1.lastSavedProjectGroup.add(
            "statictext",
            undefined,
            undefined,
            {
                name: "lastSavedProject",
            }
        );
        panel1.lastSavedProject.text = projName;
        panel1.lastSavedProject.preferredSize.width = 220;

        panel1.lastProjDate = panel1.lastSavedProjectGroup.add(
            "statictext",
            undefined,
            undefined,
            {
                name: "lastProjDate",
            }
        );
        panel1.lastProjDate.text = projDate;
        panel1.lastProjDate.preferredSize.width = 100;

        panel1.lastAutoSaveGroup = panel1.add("group");
        panel1.lastAutoSaveGroup.orientation = "row";
        panel1.lastAutoSaveGroup.spacing = 6;
        panel1.lastAutoSave = panel1.lastAutoSaveGroup.add(
            "statictext",
            undefined,
            undefined,
            {
                name: "lastAutosavSave",
            }
        );
        panel1.lastAutoSave.text = autoName;
        panel1.lastAutoSave.preferredSize.width = 220;

        panel1.lastAutoDate = panel1.lastAutoSaveGroup.add(
            "statictext",
            undefined,
            undefined,
            {
                name: "lastAutoDate",
            }
        );
        panel1.lastAutoDate.text = autoDate;
        panel1.lastAutoDate.preferredSize.width = 100;

        // PANEL3
        // ======
        var panel3 = dialog.add("panel", undefined, undefined, {
            name: "panel3",
        });
        panel3.text = "Restore from autosave";
        panel3.preferredSize.width = 360;
        panel3.orientation = "column";
        panel3.alignChildren = ["left", "top"];
        panel3.spacing = 6;
        panel3.margins = [10, 16, 10, 6];
        var buttonGrp = panel3.add("group");
        buttonGrp.orientation = "row";
        var yeahNahButton = buttonGrp.add("button", undefined, undefined, {
            name: "yeahNahButton",
        });
        yeahNahButton.text = "Ignore";
        yeahNahButton.preferredSize.width = 60;

        var restoreButton = buttonGrp.add("button", undefined, undefined, {
            name: "restoreButton",
        });
        restoreButton.text = "Restore from autosave";
        restoreButton.preferredSize.width = 270;

        var infoTextRow = panel3.add("group");
        infoTextRow.orientation = "row";
        var restoreAsStaticText = infoTextRow.add(
            "statictext",
            undefined,
            "Restore as…"
        );
        restoreAsStaticText.preferredSize.width = 80;
        var infoText = infoTextRow.add("statictext", undefined, "");
        infoText.preferredSize.width = 230;
        var edittext1 = panel3.add(
            'edittext {properties: {name: "edittext1"}}'
        );
        edittext1.text = incrementName(proj);
        edittext1.preferredSize.width = 340;
        function checkValidity() {
            var nameOk = checkText(proj, edittext1.text);
            infoText.text = nameOk.msg;
            restoreButton.enabled = nameOk.status;
        }
        edittext1.onChanging = checkValidity;
        checkValidity();

        var openAfterChkBx = panel3.add("checkbox", undefined, undefined, {
            name: "openAfterChkBx",
        });
        openAfterChkBx.text = "Open after restoring";
        openAfterChkBx.preferredSize.width = 340;
        openAfterChkBx.value = (app.settings.haveSetting(scriptName, openAfterPrefname)) ?
            app.settings.getSetting(scriptName, openAfterPrefname) :
            true;
        openAfterChkBx.onChange = function () {
            app.settings.saveSetting(scriptName, openAfterPrefname, openAfterChkBx.value);
        }

        restoreButton.onClick = function () {
            restoreFromAutoSave(
                proj,
                autoSave,
                edittext1.text,
                openAfterChkBx.value
            );
            dialog.close();
        };

        yeahNahButton.onClick = function () {
            ignoreLastAutoSave(autoSave);
            dialog.close();
        }

        dialog.show();
    }
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
