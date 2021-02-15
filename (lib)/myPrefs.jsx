// @target aftereffects
function myPrefs(prefList) {
    this.prefs = {};
    
    this.parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
            case "int":
                return parseInt(val, 10);
            case "float":
                return parseFloat(val);
            case "bool":
                return (val === "true")
            default:
                return val
        }
    }
    
    this.getPref = function(preference) {
        if (app.settings.haveSetting(scriptName, preference.name)) {
            this.prefs[preference.name] = this.parsePref(app.settings.getSetting(scriptName, preference.name), preference.prefType);
        } else {
            this.prefs[preference.name] = preference.factoryDefault;
            this.setPref(preference.name, preference.factoryDefault);
        }
    }
    
    this.setPref = function(prefname, value) {
        if (this.prefs[prefname] !== value) {
            this.prefs[prefname] = value;
            app.settings.saveSetting(scriptName, prefname, value);
        }
    }
    
    
    for (var p = 0; p < prefList.length; p++) {
        this.getPref(prefList[p]);
    }
}
