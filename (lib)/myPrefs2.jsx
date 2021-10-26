// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function Preferences(scriptName) {
    // look for preferences for this object
    // provide a setPref function to allow values to be stored in AE's preferences
    // scriptName sets the section of the preference file they are saved in.
    this.prefsName = scriptName;
    alert ( this.prefsName);
    parsePref = function(val, prefType) {
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
    
    this.setPref = function(anObject) {
        var currentVal;
        if (anObject.name){
            if(anObject.hasOwnProperty('value')){
                currentVal = anObject.value;
            } else if (anObject instanceof EditText){
                currentVal = anObject.text;
            } else {
                throw("objects must have a 'text' or 'value' property to set preferences")
            }
            
            if (anObject.savedPref !== currentVal) {
                anObject.savedPref = currentVal;
                app.settings.saveSetting(this.scriptName, anObject.name, currentVal);
            }
        }
    }
    
    this.getPref = function(anObject){
        // constructor
        if (anObject.name ){
            if (app.settings.haveSetting(this.scriptName, anObject.name)) {
                // get prefs for UI control     
                if (anObject instanceof Slider){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "float");   
                } else if (anObject instanceof Checkbox || anObject instanceof Radiobutton){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "bool");
                } else if (anObject instanceof EditText ){
                    anObject.text = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "string");
                } else {
                    // objects can use specified pref types with the type of the returned result determined by a preftype property
                    // otherwise the default is a string
                    anObject.value = anObject.savedPref = anObject.parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), anObject.prefType); 
                }
            }
        } else {
            throw("objects must have a name to be given prefs.");
        }
        
    }

    return this;
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
