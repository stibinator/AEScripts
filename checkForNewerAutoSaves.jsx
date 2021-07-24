//@target aftereffects
(function () {
    this.name = "checkForNewerAutoSaves";
    prefName = "lastQuitWasClean";
    var lastQuitWasClean = true;
    if (app.settings.haveSetting(this.name, prefName)) {
        lastQuitWasClean =
            app.settings.getSetting(this.name, prefName) === "true";
    }
    if (!lastQuitWasClean) {
        findNewerAutoSaves();
    }
    app.settings.saveSetting(this.name, prefName, false);

    function findNewerAutoSaves() {
        var lastProjectPath = app.preferences.getPrefAsString(
            "Most Recently Used (MRU) Search v2",
            "MRU Project Path ID # 0, File Path"
        );

        var lastProjectFile = new File(lastProjectPath);
        var autoSaveFolder = new Folder(
            String(lastProjectFile.parent) + "/Adobe After Effects Auto-Save"
        ); //translations
        if (autoSaveFolder.exists) {
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
            if (lastAutoSaveFile) {
                if (lastAutoSaveFile.modified.getTime() > lastProjectFile.modified.getTime()) {
                    alert("ohai");
                }
            }
        }
    }
})();
