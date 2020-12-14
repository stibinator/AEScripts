/* global Folder */

function PrefsFile(theName) { // eslint-disable-line no-unused-vars

    this.saveToPrefs = function(data) {
        var payload = data || this.data;
        var f = new File(this.prefPath);
        f.encoding = 'UTF8';
        f.open('w');
        f.write(payload.toSource());
        f.close();
    }

    this.readFromPrefs = function() {
        var f = new File(this.prefPath);
        if (f.exists) {
            f.open('r');
            this.data = eval(f.read()); // eslint-disable-line no-eval
            f.close();
            return this.data;
        }
        return null;
    }

    this.getPref = function(prefName) {
        var data = this.readFromPrefs();
        if (data) {
            for (var pref in data) {
                if (pref === prefName) {
                    return data[pref];
                }
            }
        }
        return null;
    }

    this.setPref = function(prefName, prefValue) {
        var theData = this.data;
        if (theData[prefName] !== prefValue) {
            theData[prefName] = prefValue;
            this.data = theData;
            this.saveToPrefs();
        }
    }

    this.setPrefs = function(prefData, saveOnChange) {
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
    }
    this.prefPath = Folder.userData.absoluteURI + theName + '.txt';
    this.data = this.readFromPrefs() || {};
}