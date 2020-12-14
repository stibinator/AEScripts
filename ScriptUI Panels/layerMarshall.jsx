// @target aftereffects
// includepath "../(lib)"
// include  "getLayerAsZeroIndexedArrayWTFAdobe.jsx"
/* global app, getLayerAsZeroIndexedArrayWTFAdobe*/

function lmAttention(theLayers, theTime, alignEndTimes){
    //aligns the layers temporarily
    var i;
    app.beginUndoGroup("Layer Marshal - Attention (use LM AtEase to undo)");
        if (! theLayers){
            theLayers = getLayerAsZeroIndexedArrayWTFAdobe(app.project.activeItem.layers);
        }
        for (i = 0; i < theLayers.length; i++){
            var theLayer = theLayers[i];
            var originalComment = theLayer.comment;
            var storedStartTime = '{"lmStoredStartTime":' + theLayer.startTime + '}';
            if (originalComment){
                // stack subsequent calls
                theLayer.comment = storedStartTime + "\n" + theLayer.comment;
            } else {
                theLayer.comment = storedStartTime;
            }
            if (alignEndTimes){
                var theDuration = theLayer.outPoint - theLayer.inPoint;
                theLayer.startTime = theTime - theDuration;
            } else {
                theLayer.startTime = theTime;
            }
            // theLayer.comment = null;
        }
    app.endUndoGroup();
}

function lmAtEase(theLayers){
    //puts the layers back where we found them
    app.beginUndoGroup("Layer Marshal - AtEase");
        if (! theLayers){
            theLayers = getLayerAsZeroIndexedArrayWTFAdobe(app.project.activeItem.layers);
        }
        for (var i = 0; i < theLayers.length; i++){
            var theLayer = theLayers[i];
            var originalComment = theLayer.comment;
            if (originalComment){
                var reg = /{"lmStoredStartTime":([-0-9.]+)}\n*/
                var lmOldVal = originalComment.match(reg);
                if (lmOldVal){
                    theLayer.startTime = lmOldVal[1];
                    theLayer.comment = theLayer.comment.replace(reg, "");
                } 
            }
        }
    app.endUndoGroup();
}


function lmFallOut(theLayers){
    // removes all lm comments

    app.beginUndoGroup("Layer Marshall clear info")
        if (! theLayers){
            theLayers = getLayerAsZeroIndexedArrayWTFAdobe(app.project.activeItem.layers);
        }
        for (var i = 0; i < theLayers.length; i++){
            var theLayer = theLayers[i];
            var originalComment = theLayer.comment;
            if (originalComment){
                var reg = /{"lmStoredStartTime":([-0-9.]+)}\n*/g
                var lmOldVal = originalComment.match(reg);
                if (lmOldVal){
                    theLayer.comment = theLayer.comment.replace(reg, "");
                } 
            }
        }
    app.endUndoGroup();
}


function buildUI(thisObj) {
    // Main Panel
    if (thisObj instanceof Panel) {
        var pal = thisObj;
    } else {
        pal = new Window("palette", "LayerMarshall", undefined, {resizeable: true});
    }
    if (pal !== null) {
        pal.text = "Layer Marshall"; 
        pal.orientation = "column"; 
        pal.alignChildren = ["center","top"]; 
        pal.spacing = 10; 
        pal.margins = 16; 

        // Attention
        // ======
        var group1 = pal.add("group", undefined, {name: "group1"}); 
            group1.orientation = "column"; 
            group1.alignChildren = ["center","center"]; 
            group1.spacing = 10; 
            group1.margins = 0; 

        var attentionBtn = group1.add("button", undefined, undefined, {name: "attentionBtn"}); 
            attentionBtn.helpTip = "Align selected layers to current time"; 
            attentionBtn.text = "Attention"; 
            attentionBtn.preferredSize.width = 90; 
            
        // Radio Buttons
        // ======
        var group2 = group1.add("group", undefined, {name: "group2"}); 
            group2.orientation = "row"; 
            group2.alignChildren = ["center","center"]; 
            group2.spacing = 10; 
            group2.margins = 0; 

        var doInPoints = group2.add("radiobutton", undefined, undefined, {name: "doInPoints"}); 
            doInPoints.text = "in"; 

        var doOutPoints = group2.add("radiobutton", undefined, undefined, {name: "doOutPoints"}); 
            doOutPoints.text = "out"; 

        // At Ease Button  
        var atEaseBtn = pal.add("button", undefined, undefined, {name: "atEaseBtn"}); 
            atEaseBtn.helpTip = "Return layers to their original positions"; 
            atEaseBtn.text = "At Ease"; 
            atEaseBtn.preferredSize.width = 90; 
        
        // Fall Out Button
        var fallOutBtn = pal.add("button", undefined, undefined, {name: "fallOutBtn"}); 
            fallOutBtn.helpTip = "Remove all LM info"; 
            fallOutBtn.text = "Fall Out"; 
            fallOutBtn.preferredSize.width = 90; 

        // OnClick functions
        attentionBtn.onClick = function(){
             lmAttention(app.project.activeItem.selectedLayers, app.project.activeItem.time, doOutPoints.value);
             attentionBtn.active = false;
        }
        atEaseBtn.onClick = function(){
            lmAtEase(app.project.activeItem.selectedLayers);
            atEaseBtn.active = false;

        }
        fallOutBtn.onClick = function(){
            areYouSure(app.project.activeItem.selectedLayers);
            fallOutBtn.active = false;
        }
        // doInPoints.onClick = function(){
        //     doOutPoints.value = ! doInPoints.value;
        // }
        // doOutPoints.onClick = function(){
        //     doInPoints.value = ! doOutPoints.value;
        // }
        doInPoints.value = true;
    }
    if (pal instanceof Window) {
        pal.center();
        alert("window");
        pal.show();
    } else {
        pal.layout.layout(true);
    }
}

function areYouSure(theLayers){
    // Create the dialog for the Fall Out Button
    var areYouSureDlg = new Window("dialog"); 
        areYouSureDlg.text = "Are you sure?"; 
        areYouSureDlg.preferredSize.width = 190; 
        areYouSureDlg.orientation = "column"; 
        areYouSureDlg.alignChildren = ["center","top"]; 
        areYouSureDlg.spacing = 10; 
        areYouSureDlg.margins = 16; 

    var statictext1 = areYouSureDlg.add("group"); 
        statictext1.preferredSize.width = 140; 
        statictext1.orientation = "column"; 
        statictext1.alignChildren = ["left","center"]; 
        statictext1.spacing = 0; 

        statictext1.add("statictext", undefined, "This will delete all", {name: "statictext1"}); 
        statictext1.add("statictext", undefined, "stored alignment info!", {name: "statictext1"}); 
        statictext1.preferredSize.width = 140; 

    // GROUP1
    // ======
    var group1 = areYouSureDlg.add("group", undefined, {name: "group1"}); 
        group1.orientation = "row"; 
        group1.alignChildren = ["left","center"]; 
        group1.spacing = 10; 
        group1.margins = 0; 

    var OK = group1.add("button", undefined, undefined, {name: "OK"}); 
        OK.text = "OK"; 
        OK.onClick = lmFallOut(theLayers);

    var button1 = group1.add("button", undefined, undefined, {name: "button1"}); 
        button1.text = "Cancel"; 
        button1.preferredSize.width = 90; 
    areYouSureDlg.show();
}

buildUI(this);