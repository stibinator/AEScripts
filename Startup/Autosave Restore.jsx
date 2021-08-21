// Autosave Restore by stib
// if AE crashes it finds if there are autosaved copies your project that are newer than the saved one
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

// @target aftereffects
(function () {
    var scriptName = this.name = "AutoSave Restore";
    var prefName = "ignoredAutoSaves";

    if (app.project) {
        //if run by user with a file open
        lastProj = app.project.file;
    }
    if (!lastProj) {
        //run at startup before opening project
        var lastProj = findLastProj();
    }
    if (lastProj) {
        var lastAutoSave = findLastAutoSave(lastProj);
        if (lastAutoSave) {
            ignoredAutoSaves = getListOfIgnoredAutosaves(this.name);
            if(notInIgnoredList(lastAutoSave, ignoredAutoSaves)){
            if (isNewer(lastAutoSave, lastProj)) {
                if (askUserAboutRestoring(lastProj, lastAutoSave)) {
                    restoreAutoSave(lastProj, lastAutoSave);
                }
            }}
        }
    }

    function findLastProj() {
        var lastProjectPath = app.preferences.getPrefAsString(
            "Most Recently Used (MRU) Search v2",
            "MRU Project Path ID # 0, File Path"
        );
        if (lastProjectPath.length) {
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
        if (app.settings.haveSetting(scriptName, prefName)) {
            ignoredAutoSaves = app.settings.getSetting(scriptName, prefName).split(":\n");
        }
        return ignoredAutoSaves;
    }
    function notInIgnoredList(lastAutoSave, ignoredAutoSaves){
        var lastAutoSaveURI = lastAutoSave.absoluteURI;
        for (var i = 0; i < ignoredAutoSaves.length; i++){
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
        for (var i = 0; i < 10 && ignoredAutoSaves.length > i; i++){
                newIgnoredList.push(ignoredAutoSaves[i])
        }
        app.settings.saveSetting(scriptName, prefName, newIgnoredList.join(":\n"))
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

    function incrementName(theName) {
        try {
            var serial = 1;
            var serialStr = theName.match(/(\d+)\.aep$/);
            if (parseInt(serialStr)) {
                serial = parseInt(serialStr) + 1;
            }
            return theName.replace(/\s*\d*\.aep$/, "") + " " + serial + ".aep";
        } catch (e) {
            return theName;
        }
    }

    function restoreFromAutoSave(project, autoSave, restoreAs, openAfterwards) {
        if (autoSave.exists) {
            var newProjName = File.encode(
                File.decode(project.parent) +
                    "/" +
                    restoreAs.replace(/\.aep$/, "") +
                    ".aep"
            );
            if (autoSave.copy(newProjName)) {
                if (openAfterwards) {
                    app.open(new File(newProjName));
                }
            }
        }
    }

    function checkText(proj, fileName) {
        var statusReport = { text: "", status: true };
        filename = fileName.replace(/\.aep$/i, "") + ".aep";
        if (fileName.match(/[:\\\/]/)) {
            statusReport.text = "Can't use : / or  in file name.";
            statusReport.status = false;
        }
        if (
            new File(File.encode(File.decode(proj.parent) + "/" + fileName))
                .exists
        ) {
            statusReport.text = "A file with that name exists.";
            statusReport.status = false;
        }
        return statusReport;
    }

    function askUserAboutRestoring(proj, autoSave) {
        var projName = File.decode(proj.name);
        var projDate = formateDate(proj.modified);
        var autoName = File.decode(autoSave.name);
        var autoDate = formateDate(autoSave.modified);

        /*
        Code for Import https://scriptui.joonas.me — (Triple click to select): 
        {"activeId":11,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"AutoSave alert!","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"The Autosaved version of the\nlast opened project is newer\nthan the saved version.","justify":"left","preferredSize":[200,0],"alignment":null,"helpTip":null}},"item-2":{"id":2,"type":"EditText","parentId":12,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"EditText","justify":"left","preferredSize":[340,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":0,"style":{"enabled":true,"varName":null,"text":"Restore from autosave","justify":"center","preferredSize":[200,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"lastSavedProject","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Last.aep","justify":"left","preferredSize":[90,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"lastProjDate","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"StaticText","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Last saved project","preferredSize":[200,0],"margins":10,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-8":{"id":8,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Last autosave","preferredSize":[200,0],"margins":10,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-9":{"id":9,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"lastAutosavSave","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Last.aep","justify":"left","preferredSize":[90,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"lastProjDate","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"StaticText","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Checkbox","parentId":12,"style":{"enabled":true,"varName":null,"text":"Open after restoring","preferredSize":[10,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Restore as","preferredSize":[200,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}}},"order":[0,1,7,4,5,8,9,10,3,12,2,11],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
        */

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
        var restoreButton = buttonGrp.add("button", undefined, undefined, {
            name: "restoreButton",
        });
        restoreButton.text = "Restore from autosave";
        restoreButton.preferredSize.width = 270;
        
        var yeahNahButton = buttonGrp.add("button", undefined, undefined, {
            name: "yeahNahButton",
        });
        yeahNahButton.text = "Ignore";
        yeahNahButton.preferredSize.width = 60;

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
        edittext1.text = incrementName(projName);
        edittext1.preferredSize.width = 340;
        function checkValidity() {
            var fileNameStatus = checkText(proj, edittext1.text);
            infoText.text = fileNameStatus.text;
            restoreButton.enabled = fileNameStatus.status;
        }
        edittext1.onChange = checkValidity;
        checkValidity();

        var checkbox1 = panel3.add("checkbox", undefined, undefined, {
            name: "checkbox1",
        });
        checkbox1.text = "Open after restoring";
        checkbox1.preferredSize.width = 340;

        restoreButton.onClick = function () {
            restoreFromAutoSave(
                proj,
                autoSave,
                edittext1.text,
                checkbox1.value
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
