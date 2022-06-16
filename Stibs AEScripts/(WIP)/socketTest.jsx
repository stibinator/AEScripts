function installStibsAeScripts() {

    var STIBSAESCRIPTS = "Stibs AEScripts";
    var TEMPZIPNAME = 'stibsaescripts.zip';
    var TEMPFOLDERNAME = 'StibsAEScriptsDownloadTemp'
    // var LATESTRELEASEURL = "https://github.com/stibinator/AEScripts/archive/refs/heads/master.zip"
    var LATESTRELEASEURL = "https://github.com/stibinator/AEScripts/releases/download/v2.0b/StibsAEScriptsRelease2.0.zip"
    function getScriptsFromGithub() {
        var tempFolder = new Folder(Folder.temp.fsName);
        var tempZipFile = new File(tempFolder.fullName + '/' + TEMPZIPNAME);
        var tempScriptsFolder = new Folder(tempFolder.fsName + '/' + TEMPFOLDERNAME);
        createPath(tempScriptsFolder);
        var op = system.callSystem('curl -L -o "' + tempZipFile.fsName + '" --url ' + LATESTRELEASEURL);
        $.writeln(op);
        var result = system.callSystem('tar -xf ' + tempZipFile.fsName + ' -C "' + tempScriptsFolder.fsName + '"');
        $.writeln(result);
        return tempScriptsFolder
    }

    // system.callSystem('cmd.exe /c "explorer.exe /select,' + outPutFolder.fsName + '"');
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
        // DIALOG
        // ======
        var installDialog = new Window("dialog");
        installDialog.text = "Choose AE Version to install for";
        installDialog.orientation = "column";
        installDialog.alignChildren = ["left", "top"];
        installDialog.spacing = 10;
        installDialog.margins = 16;

        // PANEL1
        // ======
        var latestPnl = installDialog.add("panel", undefined, undefined, { name: "latestPnl" });
        latestPnl.text = "Latest version";
        latestPnl.preferredSize.width = 300;
        latestPnl.orientation = "column";
        latestPnl.alignChildren = ["left", "center"];
        latestPnl.spacing = 10;
        latestPnl.margins = [10, 16, 10, 4];

        var versionCheckBoxes = [latestPnl.add("checkbox", undefined, undefined, { name: "versChkBx" + aeVersions[0].name })];
        versionCheckBoxes[0].text = "Latest Version: " + aeVersions[0].name;
        versionCheckBoxes[0].value = 1;

        // PANEL2
        // ======
        var olderVersnsPnl = installDialog.add("panel", undefined, undefined, { name: "olderVersnsPnl" });
        olderVersnsPnl.text = "Older versions";
        olderVersnsPnl.preferredSize.width = 300;
        olderVersnsPnl.orientation = "column";
        olderVersnsPnl.alignChildren = ["left", "center"];
        olderVersnsPnl.spacing = 10;
        olderVersnsPnl.margins = [10, 16, 10, 4];

        for (var v = 1; v < aeVersions.length; v++) {
            versionCheckBoxes[v] = olderVersnsPnl.add("checkbox", undefined, undefined, { name: "versChkBx" + aeVersions[v].name });
            versionCheckBoxes[v].text = "Version " + aeVersions[v].name;
        }
        // INSTALL TO AE Panel
        // ======
        var headlessScriptsPnl = installDialog.add("panel", undefined, undefined, {});
        headlessScriptsPnl.preferredSize.width = 300;
        headlessScriptsPnl.orientation = "column";
        headlessScriptsPnl.alignChildren = ["left", "center"];
        headlessScriptsPnl.spacing = 10;
        headlessScriptsPnl.margins = [10, 16, 10, 4];
        // GROUP1
        // ======
        var group1 = installDialog.add("group", undefined, { name: "group1" });
        group1.orientation = "row";
        group1.alignChildren = ["right", "center"];
        group1.spacing = 10;
        group1.margins = [0, 0, 10, 0];
        group1.alignment = ["right", "top"];


        var installToAEChkBx = headlessScriptsPnl.add("checkbox", undefined, undefined, { name: "installToAeChkBx" });
        installToAEChkBx.text = "install UI-less scripts to AE";
        installToAEChkBx.helpTip = "If checked scripts will be visible in the Scripts menu\notherwise they will only be accessible from ScriptConsole.\nUncheck if you have lots of scripts."

        var cancelBtn = group1.add("button", undefined, undefined, { name: "cancelBtn" });
        cancelBtn.helpTip = "Don't install";
        cancelBtn.text = "Cancel";
        cancelBtn.preferredSize.width = 140;
        cancelBtn.alignment = ["right", "bottom"];

        var installPNABtn = group1.add("button", undefined, undefined, { name: "installPNABtn" });
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
        return { "chosenVersions": chosenVersions, "installToAE": installToAEChkBx.value };

    }

    function recursivelyCopyFiles(sourceFolder, destinationFolder, excludeMask) {
        var sourceChildren = sourceFolder.getFiles();
        var problemFiles = [];
        var ignoreExcludeMask = typeof excludeMask === "undefined" || excludeMask === null || excludeMask === false;
        for (var f = 0; f < sourceChildren.length; f++) {
            var okToCopy = (
                ignoreExcludeMask ||
                (!(sourceChildren[f].name.match(excludeMask) ||
                    Folder.decode(sourceChildren[f].name).match(excludeMask))));
            if (sourceChildren[f] instanceof Folder) {
                if (okToCopy) {
                    var newDestFolder = new Folder(File.decode(destinationFolder.fullName + "/" + sourceChildren[f].name));
                    createPath(newDestFolder);
                    problemFiles = problemFiles.concat(
                        recursivelyCopyFiles(sourceChildren[f], newDestFolder, excludeMask)
                    )
                }
            } else {
                if (okToCopy) {
                    createPath(destinationFolder);
                    var copiedOK = sourceChildren[f].copy(
                        File.decode(destinationFolder.fullName + "/" + sourceChildren[f].name)
                    );
                    if (copiedOK) {
                        $.writeln("copied " + sourceChildren[f].name + " to " + destinationFolder.fsName);
                    } else {
                        problemFiles.push(sourceChildren[f].name);
                    }
                }
            }
        }
        return problemFiles;
    }

    function createPath(path) {
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
        return allGood;
    }

    var downloadedScriptsFolder = getScriptsFromGithub();

    var installSettings = chooseVersion();
    var chosenVersions = installSettings.chosenVersions;
    var installToAE = installSettings.installToAE;
    var nahWorriesMate = true;
    var okToInstall = false;

    if (!installToAE) {
        var pnaFolder = new Folder(Folder.userData.fullName + "/PureAndApplied/");
        okToInstall = createPath(pnaFolder);
        var scriptConsoleFolder = new Folder(pnaFolder.fullName + "/" + STIBSAESCRIPTS);
        okToInstall = createPath(scriptConsoleFolder);
        var headlessScriptsFolder = new Folder(downloadedScriptsFolder.fullName + "/" + STIBSAESCRIPTS)
        recursivelyCopyFiles(headlessScriptsFolder, scriptConsoleFolder);
        // set fodler prefs for scriptConsole
    }
    for (var v = 0; v < chosenVersions.length; v++) {
        var userPrefsScriptFolder = new Folder(chosenVersions[v].fsName + "/Scripts/");
        okToInstall = createPath(userPrefsScriptFolder);

        if (okToInstall) {
            var problems = [];
            var excludeMask = (installToAE) ? false : STIBSAESCRIPTS;
            problems = recursivelyCopyFiles(downloadedScriptsFolder, userPrefsScriptFolder, excludeMask);
            if (problems.length) {
                alert("Problem copying these files:\n" + problems.join("\n"))
            }
        } else {
            nahWorriesMate = false;
        }
    }
    return (nahWorriesMate);
}
installStibsAeScripts();