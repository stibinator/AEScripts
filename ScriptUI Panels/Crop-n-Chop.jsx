// @target aftereffects
// @includepath "../(lib)/"
// @include "findBoundingBox.jsx"
// @include "myPrefs.jsx"


var scriptName = "Crop-n-Chop";

function cropCompToBoundingBox(theComp, bounds, reframe, margin){
    for (var s = 1; s < theComp.numLayers; s++){ //store selection state of the layers
        theComp.layer(s).wasSelected = theComp.layer(s).selected;   
    }
    if (reframe){ //attach all layers to a point at the top left of the bounding box
        parentNull = theComp.layers.addNull();
        parentNull.property("Transform").property("Position").setValue([bounds.left, bounds.top, 0]);
        allLayers = theComp.layers;
        for (var i = 1; i <= allLayers.length; i++){
            if (allLayers[i].parent === null && allLayers[i].index !== parentNull.index){
                allLayers[i].parent = parentNull;
            }
        }
    }
    var width = bounds.right - bounds.left;
    var height = bounds.bottom - bounds.top;
    if (margin.proportional){
        margin.x = margin.value * width;
        margin.y = margin.value * height;
    } else {
        margin.x = Math.max(margin.value * width, margin.value * height);
        margin.y = margin.x;
    }

    theComp.width = Math.max(Math.min(Math.round(width + margin.x), 30000), 4); //min 4px, max 30,000px comp sizes
    theComp.height = Math.max(Math.min(Math.round(height + margin.y), 30000), 4);
    if (reframe){ //move the bounding box to the top left of the frame.
        parentNull.property("Transform").property("Position").setValue([margin.x/2, margin.y/2, 0]);
        parentNull.remove();
    }
    for (var s = 1; s < theComp.numLayers; s++){ //recall selection state
        theComp.layer(s).selected = theComp.layer(s).wasSelected;   
        theComp.layer(s).wasSelected = null;   
    }
}

// ======== main function======================
function cropNChop(reframe, useMotion, margin){
    var theComp = app.project.activeItem;
    if (theComp){
        var selectedLayers = theComp.selectedLayers;
        if (selectedLayers.length > 0){
            app.beginUndoGroup("Crop-n-Chop");
            var bounds = findBoundingBox(theComp, selectedLayers, useMotion);
            cropCompToBoundingBox(theComp, bounds, reframe, margin);
            app.endUndoGroup();
            return "W: " + Math.floor(theComp.width) + " H: "+ theComp.height;
        }else {
            return "!!! Select layer(s) first !!!";
        }
    } else {
        return "!!! Select layer(s) in a comp first !!!"
    }
}



//=================================UI guff=============================
// cropNChopUI
// ============
function cropNChopUI(thisObj) {
    if (thisObj instanceof Panel) {
        cropNChopUI = thisObj;
    } else {
        cropNChopUI = new Window('palette', scriptName, undefined, {resizeable: true});
    }
    
    // cropNChopUI.text = "Crop-n-Chop"; 
    cropNChopUI.orientation = "column"; 
    cropNChopUI.alignChildren = ["left","top"]; 
    cropNChopUI.spacing = 10; 
    cropNChopUI.margins = 16; 
    
    var cropNResizePnl = cropNChopUI.add("panel", undefined, {name: "cropNResizePnl"}); 
    cropNResizePnl.text = "Crop-N-Chop";
    cropNResizePnl.orientation = "column"; 
    cropNResizePnl.alignChildren = ["left","center"]; 
    cropNResizePnl.spacing = 10; 
    cropNResizePnl.margins = [10,16,10,10]; 
    // cropNResizePnl.preferredSize.width = 200; 
    
    
    // GROUP1
    // ======
    var group1 = cropNResizePnl.add("group", undefined, {name: "group1"}); 
    group1.orientation = "column"; 
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 10; 
    group1.margins = 0; 
    
    var useMotionChkBx = group1.add("checkbox", undefined, undefined); 
    useMotionChkBx.name = "useMotionChkBx";
    useMotionChkBx.helpTip = "Allow space to fit moving layers"; 
    useMotionChkBx.text = "Include motion (⚠ slow)"; 
    
    var reframeChkBx = group1.add("checkbox", undefined, undefined); 
    reframeChkBx.name = "reframeChkBx";
    reframeChkBx.helpTip = "Reframe the comp to match the bounds of selected layers."; 
    reframeChkBx.text = "Reframe to fit layer(s)"; 
    
    var cropBtn = cropNResizePnl.add("button", undefined, undefined, {name: "cropBtn"}); 
    cropBtn.helpTip = "Crop the comp to match selected layers"; 
    cropBtn.text = "Crop Comp to selected"; 
    cropBtn.preferredSize.width = 180; 
    
    // marginPnl
    // ====
    var marginPnl = cropNResizePnl.add("panel", undefined, {name: "marginPnl"}); 
    marginPnl.text = "Margin %"
    marginPnl.orientation = "column"; 
    marginPnl.alignChildren = ["left","center"]; 
    marginPnl.spacing = 8; 
    marginPnl.margins = 8; 
    
    var marginSlidrGrp = marginPnl.add("group", undefined, {name: "marginSlidrGrp"});
    marginSlidrGrp.orientation = "row"; 
    marginSlidrGrp.preferredSize.width = 160; 
    marginSlidrGrp.alignChildren = ["left","center"]; 
    marginSlidrGrp.margins = 0; 

    // var statictext1 = marginGrp.add("statictext", undefined, undefined, {name: "statictext1"}); 
    // statictext1.text = "±"; 
    
    var marginSlidr = marginSlidrGrp.add("slider", undefined, undefined, undefined, undefined ); 
    marginSlidr.name= "xSlidr"
    marginSlidr.helpTip = "add or subtract margins"; 
    marginSlidr.minvalue = -99; 
    marginSlidr.maxvalue = 100; 
    marginSlidr.preferredSize.width = 116; 
    marginSlidr.preferredSize.height = 10; 
    
    var marginTxtBx = marginSlidrGrp.add('edittext'); 
    marginTxtBx.name= "XTxtInput"
    marginTxtBx.preferredSize.width = 34; 
    
    var proportionalChkBx = marginPnl.add("checkbox", undefined, undefined); 
    proportionalChkBx.name = "proportionalChkBx";
    proportionalChkBx.helpTip = "margins proportional to width and height."; 
    proportionalChkBx.text = "proportional"; 

// INFO Text box
    var infoText = cropNResizePnl.add("statictext", undefined, undefined ); 
    infoText.name= "infoText"
    infoText.preferredSize.width = 180;
    
    var prefs = new myPrefs
    ([{
        name: useMotionChkBx.name,
        factoryDefault: false,
        prefType: "bool"
    },{
        name: reframeChkBx.name,
        factoryDefault: true,
        prefType: "bool"
    },{
        name: marginSlidr.name,
        factoryDefault: 0,
        prefType: "float"
    },{
        name: proportionalChkBx.name,
        factoryDefault: false,
        prefType: "bool"
    }], scriptName);
    useMotionChkBx.value = prefs.prefs[useMotionChkBx.name]; 
    reframeChkBx.value = prefs.prefs[reframeChkBx.name];         
    marginSlidr.value = prefs.prefs[marginSlidr.name]; 
    marginTxtBx.text = marginSlidr.value; 
    
    
    // ================================================ Do the things ===================================================
    cropBtn.onClick = function(){
        var margin = {"proportional": proportionalChkBx.value, "value": marginSlidr.value / 100}
        infoText.text = cropNChop(reframeChkBx.value, useMotionChkBx.value, margin);
    }
    
    // UI callbacks and guff
    //finicky detail, change the button text depending on whether we're reframing.
    function updateBtnText(){
        if (reframeChkBx.value){
            cropBtn.text = "Crop Comp to selected";
            cropBtn.helpTip = "Crop Comp to fit selected layer(s),\ncentering the layer(s).";
        } else {
            cropBtn.text = "Size Comp to selected";
            cropBtn.helpTip = "Resize Comp to match the size selected layers,\n without centering.";
        }
    }
    reframeChkBx.onClick = function(){
        prefs.setPref(this.name,this.value);
        updateBtnText();
    }
    
    marginSlidr.onChange =
    useMotionChkBx.onClick = function(){
        prefs.setPref(this.name,this.value);
    }
    
    marginSlidr.onChanging = function(){
        marginTxtBx.text = Math.round(marginSlidr.value * 10)/10;
    }
    
    
    
    marginTxtBx.onChange = function(){
        try{
            var parsedVal = parseFloat(marginTxtBx.text);
            if (isNaN(parsedVal)){
                parsedVal = marginSlidr.value;
            }
            marginSlidr.value = parsedVal;
            marginTxtBx.text = marginSlidr.value;
        } catch(e){
            marginTxtBx.text = marginSlidr.value;
        }
        prefs.setPref(marginSlidr.name, marginSlidr.value);
    }
    updateBtnText();

    //Actually build the panel
    
    if (cropNChopUI instanceof Window) {
        cropNChopUI.center();
        cropNChopUI.show();
    } else {
        cropNChopUI.layout.layout(true);
    }
}

cropNChopUI(this);