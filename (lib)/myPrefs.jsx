// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
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
