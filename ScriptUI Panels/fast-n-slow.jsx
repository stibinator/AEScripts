//@target aftereffects
(function (thisObj) {
    
    var scriptName = "fast-n-slow";
    var versionNum = 0.1;
    
    function buildGUI(thisObj) {
        // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
        var pal = (thisObj instanceof Panel)?
        thisObj: 
        new Window("palette", thisObj.scriptTitle, undefined, { resizeable: true });
        // ----------------------- UI Elements here ---------------------
        var firstOrLastGrp = pal.add("panel", undefined, "Anchor");
        firstOrLastGrp.preferredSize.width = 200;
        firstOrLastGrp.margins = [8,10,0,4];
        firstOrLastGrp.orientation = "row";
        firstOrLastGrp.alignChildren = "fill";
        var firstBtn = firstOrLastGrp.add("radiobutton", undefined, "in");
        firstBtn.value = true;
        var lastBtn = firstOrLastGrp.add("radiobutton", undefined, "out");
        var curBtn = firstOrLastGrp.add("radiobutton", undefined, "current fr");
        
        // SPEEDPNL
        // ========
        var speedPnl = pal.add("panel", undefined, undefined, {name: "speedPnl"}); 
        speedPnl.text = "Speed"; 
        speedPnl.preferredSize.width = 200; 
        speedPnl.orientation = "column"; 
        speedPnl.alignChildren = ["left","top"]; 
        speedPnl.spacing = 10; 
        speedPnl.margins = [10, 16, 10, 10]; 
        
        var frezeChkBx = speedPnl.add("checkbox", undefined, undefined); 
        frezeChkBx.text = "Freeze";
        var dividr = speedPnl.add("panel");
        dividr.preferredSize.width = 170;
        var reverseChkBx = speedPnl.add("checkbox", undefined, undefined); 
        reverseChkBx.text = "Reverse"; 
        
        // GROUP1
        // ======
        var presetsGrp = speedPnl.add("group", undefined, {name: "presetsGrp"}); 
        presetsGrp.orientation = "row"; 
        presetsGrp.alignChildren = ["left","center"]; 
        presetsGrp.spacing = 2; 
        presetsGrp.margins = 0; 
        
        var speedBtnHalf = presetsGrp.add("radiobutton", undefined, undefined, {name: "speedBtnHalf"}); 
        speedBtnHalf.text = "½"; 
        
        var speedBtnFull = presetsGrp.add("radiobutton", undefined, undefined, {name: "speedBtnFull"}); 
        speedBtnFull.text = "1x"; 
        
        var speedBtn2x = presetsGrp.add("radiobutton", undefined, undefined, {name: "speedBtn2x"}); 
        speedBtn2x.text = "2x";
        
        var speedBtn3x = presetsGrp.add("radiobutton", undefined, undefined, {name: "speedBtn2x"}); 
        speedBtn3x.text = "3x"; 
        
        var speedBtnVar = presetsGrp.add("radiobutton", undefined, undefined, {name: "speedBtnVar"}); 
        speedBtnVar.text = "var"; 
        
        // VARISPEEDGrp
        // ============
        var varispeedGrp = speedPnl.add("group", undefined, undefined); 
        varispeedGrp.orientation = "row"; 
        varispeedGrp.spacing = 8;
        varispeedGrp.margins = 0;
        // varispeedGrp.preferredSize.width = 10;
        
        
        var varSlidr = varispeedGrp.add("slider", undefined, undefined, undefined, undefined, {name: "varSlidr"}); 
        varSlidr.minvalue = 0; 
        varSlidr.maxvalue = 1; 
        varSlidr.value = 1; 
        varSlidr.preferredSize.width = 120; 
        
        varSlidr.setValue = function (val) {
            varSlidr.value = Math.pow(val/1000, 0.25);
        }

        varSlidr.getValue = function () {
            return 1000 * Math.pow(varSlidr.value, 4);
        }

        var varText = varispeedGrp.add('edittext {properties: {name: "varText", enterKeySignalsOnChange: true}}'); 
        varText.text = varSlidr.getValue(); 
        varText.preferredSize.width = 40; 
        
        // ---------------------- calbacks ----------------------
        
        speedBtnHalf.onClick = speedBtn2x.onClick = speedBtnFull.onClick = speedBtnVar.onClick = function () {
            if (!speedBtnVar.value) {
                var newVal = 50 * speedBtnHalf.value;
                newVal += 100 * speedBtnFull.value;
                newVal += 200 * speedBtn2x.value;
                newVal += 300 * speedBtn3x.value;
                varSlidr.setValue(newVal);
            }
            varText.text = varSlidr.getValue();
        }
        
        varSlidr.onChanging = function () {
            var anchor = (0 + lastBtn.value + curBtn.value * 2);
            varText.text = Math.round(varSlidr.getValue() * 10) / 10;
            speedBtnVar.value = true;
            retimeUsingTimeRemap(varSlidr.value, anchor);
        }
        
        varText.onChange = function () {
            try {
            newSpeed = parseFloat(varText.text);
            alert(newSpeed);
                if (isNaN(newSpeed)) {
                    varText.value = varSlidr.getValue;
                } else {
                    varSlidr.setValue(newSpeed);
                     if (newSpeed % 50 === 0 && newSpeed <= 300) {
                        [speedBtnHalf, speedBtnFull, speedBtnVar, speedBtn2x, speedBtnVar, speedBtn3x][newSpeed / 50 - 1].value = true;
                    }
                }
            } catch (e) {
                
            }
        }
        //------------------------ build the GUI ------------------------
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else{
            pal.layout.layout(true);
        }
    }
    
    // //---------------------------- functions n shit ---------------------
    function retimeUsingTimeRemap(speed, anchor){
        app.beginUndoGroup(scriptName);
        //alert(anchor);
        var theComp = app.project.activeItem;
        if (theComp ){
            for(var i =0; i < theComp.selectedLayers.length; i++){
                theLayer = theComp.selectedLayers[i];
                if (theLayer.canSetTimeRemapEnabled) {
                    
                }
                
            }
        }
        app.endUndoGroup();
    }
    
    //---------------------------- ui prefs -----------------------------
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
    
    //--------------------- go ahead and run ----------------------
    buildGUI(thisObj);
})(this)
