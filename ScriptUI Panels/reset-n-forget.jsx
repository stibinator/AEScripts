var NAME_ROTATION = "Rotation"

function resetXforms(theLayer, position, rotation, scale, anchor){
    var theProperties = [];
    if (position){
        theProperties.push({"prop": "Position", "val": [theLayer.width/2,theLayer.height/2,0]})
    }
    if (rotation){
        if (theLayer.threeDLayer){
            theProperties.push
            ({"prop": "Orientation", "val": [0, 0, 0]},
            {"prop": "X Rotation", "val": 0},
            {"prop": "Y Rotation", "val": 0},
            {"prop": "Z Rotation", "val": 0} );
        } else {
            theProperties.push({"prop": "Rotation", "val": 0});
        }
    }
    if (scale){
        theProperties.push({"prop": "Scale", "val": [100,100,100]})
    }
    if (anchor){
        theProperties.push({"prop": "Anchor Point", "val": [theLayer.width/2,theLayer.height/2,0]})
    }
    
    //set all the values
    for (p = 0; p< theProperties.length; p++){
        var theProp = theLayer.property("Transform").property(theProperties[p].prop);
        if (theProp.isTimeVarying){ //check for KFs
            theProp.setValueAtTime(theLayer.containingComp.time, theProperties[p].val);
        } else {
            theProp.setValue(theProperties[p].val);
        }
    }
    
}

function resetNForget(position, rotation, scale, anchor){
    app.beginUndoGroup("ResetNForget");
    var theLayers = app.project.activeItem.selectedLayers;
    if (theLayers.length === 0){
        alert("Select some layers to reset,\nthen mash that button again.");
    }
    for (var i =0 ; i< theLayers.length; i++){
        resetXforms(theLayers[i], position, rotation, scale, anchor)
    }
    app.endUndoGroup();
}

function buildUI(thisObj) {
    if (thisObj instanceof Panel) {
        resetNForgetPanl = thisObj;
    } else {
        resetNForgetPanl = new Window('palette', scriptName, undefined, {resizeable: true});
    }
    
    // resetNForgetPanl.text = "reset-n-forget"; 
    resetNForgetPanl.orientation = "column"; 
    resetNForgetPanl.alignChildren = ["center","top"]; 
    resetNForgetPanl.spacing = 10; 
    resetNForgetPanl.margins = 16; 
    
    // GROUP1
    // ======
    var group1 = resetNForgetPanl.add("group", undefined, {name: "group1"}); 
    group1.orientation = "row"; 
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 10; 
    group1.margins = 0; 
    
    var positionChkBx = group1.add("checkbox", undefined, undefined, {name: "positionChkBx"}); 
    positionChkBx.helpTip = "Reset Position"; 
    positionChkBx.text = "P"; 
    positionChkBx.value = true; 
    
    var rotationChkBx = group1.add("checkbox", undefined, undefined, {name: "rotationChkBx"}); 
    rotationChkBx.helpTip = "Reset Rotation"; 
    rotationChkBx.text = "R"; 
    rotationChkBx.value = true; 
    
    var scaleChkBx = group1.add("checkbox", undefined, undefined, {name: "scaleChkBx"}); 
    scaleChkBx.helpTip = "Reset Scale"; 
    scaleChkBx.text = "S"; 
    scaleChkBx.value = true; 
    
    var anchorChkBx = group1.add("checkbox", undefined, undefined, {name: "anchorChkBx"}); 
    anchorChkBx.helpTip = "Reset Anchor Point"; 
    anchorChkBx.text = "A"; 
    anchorChkBx.value = true; 
    
    // GROUP2
    // ======
    var group2 = resetNForgetPanl.add("group", undefined, {name: "group2"}); 
    group2.orientation = "row"; 
    group2.alignChildren = ["left","center"]; 
    group2.spacing = 10; 
    group2.margins = 0; 
    
    var button1 = group2.add("button", undefined, undefined, {name: "button1"}); 
    button1.text = "Reset"; 
    button1.preferredSize.width = 143; 
    
    button1.onClick = function(){
        resetNForget(positionChkBx.value, rotationChkBx.value, scaleChkBx.value, anchorChkBx.value)
    }
    
    if (resetNForgetPanl instanceof Window) {
        resetNForgetPanl.center();
        resetNForgetPanl.show();
    } else {
        resetNForgetPanl.layout.layout(true);
    }
}

buildUI(this);