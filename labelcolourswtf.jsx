// @target aftereffects
/* global app, Folder */
// eslint-disable-next-line no-unused-vars
function readLabelColoursFromPrefs() {
    try {
        // returns an array of colour objects corresponding to the label colours in the user's prefs
        // colours are 8-bit rgb values with r g and b components
        // eg. [{r: 255, g: 123, b:0}]
        app.preferences.saveToDisk(); //flush any unsaved prefs to disk
        var versionStr = "" + app.version.match(/[0-9]+.[0-9]+/);
        var prefsFilePath = Folder.userData.absoluteURI + "/Adobe/After Effects/" + versionStr + "/Adobe After Effects " + versionStr + " Prefs-indep-general.txt";
        var prefs = new File(prefsFilePath);
        var labelColours = [];
        if (prefs.exists) {
            prefs.open("r")
            var line = prefs.readln();
            var notDoneYet = true
            while ((!prefs.eof) & notDoneYet) {
                if (line.match(/\["Label Preference Color Section.*/)) {
                    line = prefs.readln();
                    while (line) {
                        var labelNum = line.match(/"Label Color ID 2 # ([0-9]+)"/);
                        var labelVal = line.match(/.*= FF(.*)/);
                        var encodedData = labelVal[1];
                        var inQuotes = false;
                        var colourStr = "";
                        var colour = {
                            "r": 0,
                            "g": 0,
                            "b": 0
                        }
                        for (var i = 0; i < encodedData.length; i++) {
                            if (encodedData[i] === '"') {
                                inQuotes = !inQuotes;
                            } else {
                                if (inQuotes) {
                                    colourStr += encodedData.charCodeAt(i).toString(16)
                                } else {
                                    colourStr += encodedData[i];
                                }
                            }
                        }

                        colour.r = parseInt(colourStr.slice(0, 2), 16)
                        colour.g = parseInt(colourStr.slice(2, 4), 16)
                        colour.b = parseInt(colourStr.slice(4), 16)
                        // label colours aren't stored in numerical order, but in alphabetical order, I think. 
                        // Anyway parsing the labelNum assigns the right label to the right index.
                        labelColours[parseInt(labelNum[1], 10)] = colour;
                        line = prefs.readln();
                    }
                    notDoneYet = false;
                }
                line = prefs.readln();
            }
            prefs.close();
            return labelColours;
        } else {
            return false;
        }
    } catch (e) {
        alert(e);
        return false;
    }
}