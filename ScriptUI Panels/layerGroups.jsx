// @target aftereffects
function storeLayerGroupSettings(theComp, groupID){
    for (var i = 1; i <= theComp.numLayers; i++){
        var theLayer = theComp.layer(i);
        var currentSettings = "grp:" + groupID;
        currentSettings += ",sel:" + ((theLayer.selected)? 1: 0);
        currentSettings += ",ena:" + ((theLayer.enabled)? 1: 0);
        currentSettings += ",aud:" + ((theLayer.audioEnabled)? 1: 0);
        currentSettings += ",shy:" + ((theLayer.shy)? 1: 0);
        currentSettings += ",sol:" + ((theLayer.solo)? 1: 0);
        currentSettings += ",loc:" + ((theLayer.locked)? 1: 0);
        var theComment = theLayer.comment;
        var grpRE = new RegExp("grp:(" + groupID + "),sel:([01]),ena:([01]),aud:([01]),shy:([01]),sol:([01]),loc:([01])");
        var groupSettings = theComment.match(grpRE);
        $.writeln(currentSettings);
        if (groupSettings){
            theComment = theLayer.comment.replace(grpRE, currentSettings);
        }   else {
            theComment = (( theLayer.comment)? theLayer.comment + "\n": "") + currentSettings;
        } 
        var wasLocked = (theLayer.locked);
        theLayer.locked = false;
        theLayer.comment = theComment;
        theLayer.locked = wasLocked;
    }
}

function applyLayerGroupSettings(theComp, groupID){
    for (var i = 1; i <= theComp.numLayers; i++){
        var theLayer = theComp.layer(i);
        var theComment = theLayer.comment;
        var grpRE = new RegExp("grp:(" + groupID + "),sel:([01]),ena:([01]),aud:([01]),shy:([01]),sol:([01]),loc:([01])");
        var groupSettings = theComment.match(grpRE);
        if (groupSettings){
            theLayer.selected = (groupSettings[2] === "1");
            theLayer.enabled = (groupSettings[3] === "1");
            theLayer.audioEnabled = (groupSettings[4] === "1");
            theLayer.shy = (groupSettings[5] === "1");
            if (theLayer.enabled){
                theLayer.solo = (groupSettings[6] === "1");
            }
            theLayer.locked = (groupSettings[7] === "1");
        }   
    }
}

function storeCompSettings(theComp, groupID){
    var currentSettings = "grp:" + groupID;
    currentSettings += ",shy:" + ((theComp.hideShyLayers)? 1: 0);
    currentSettings += ",mob:" + ((theComp.motionBlur)? 1: 0);
    currentSettings += ",d3d:" + ((theComp.draft3d)? 1: 0);
    currentSettings += ",frb:" + ((theComp.frameBlending)? 1: 0);
    currentSettings += ",rfx:" + theComp.resolutionFactor[0];
    currentSettings += ",rfy:" + theComp.resolutionFactor[1];
    currentSettings += ",cti:" + theComp.time;
    currentSettings += ",was:" + theComp.workAreaStart;
    currentSettings += ",wad:" + theComp.workAreaDuration;
    if (theComp.activeCamera){
        currentSettings += ",aci:" + theComp.activeCamera.index;
    } else {
        currentSettings += ",aci:0";
    }
    var theComment = theComp.comment;
    var grpRE = new RegExp("grp:(" + groupID + "),shy:([01]),mob:([01]),d3d:([01]),frb:([01]),rfx:([0-9]+),rfy:([0-9]+),cti:([0-9\.]+),was:([0-9\.]+),wad:([0-9\.]+),aci:([0-9]+)");
    var groupSettings = theComment.match(grpRE);
    if (groupSettings){
        theComment = theComp.comment.replace(grpRE, currentSettings);
    }   else {
        theComment = (( theComp.comment)? theComp.comment + "\n": "") + currentSettings;
    } 
    $.writeln(theComment);
    theComp.comment = theComment;
}


function applyCompSettings(theComp, groupID){
    var theComment = theComp.comment;
    // $.writeln(theComment);
    var grpRE = new RegExp("grp:(" + groupID + "),shy:([01]),mob:([01]),d3d:([01]),frb:([01]),rfx:([0-9]+),rfy:([0-9]+),cti:([0-9\.]+),was:([0-9\.]+),wad:([0-9\.]+),aci:([0-9]+)");
    var compSettings = theComment.match(grpRE);               
    // $.writeln(compSettings);
    if (compSettings){
        theComp.hideShyLayers = (compSettings[2] === "1");
        theComp.motionBlur = (compSettings[3] === "1");
        theComp.draft3d = (compSettings[4] === "1");
        theComp.frameBlending = (compSettings[5] === "1");
        theComp.resolutionFactor = [parseInt(compSettings[6]), parseInt(compSettings[7])];
        theComp.time = parseFloat(compSettings[8]);
        theComp.workAreaStart = parseFloat(compSettings[9]);
        theComp.workAreaDuration = parseFloat(compSettings[10]);
        if (theComp.activeCamera && parseInt(compSettings[11])){
            theComp.activeCamera = parseInt(compSettings[11]);
        }
    }   
    
}

// theComp = app.project.activeItem;
// if (theComp){
//     // storeLayerGroupSettings(theComp, "handleChildren");
//     // applyLayerGroupSettings(theComp, "handleChildren");
//     // applyLayerGroupSettings(theComp, "animation");
//     // storeLayerGroupSettings(theComp, "animation");
//     // storeLayerGroupSettings(theComp, "allUnlocked");
//     // applyLayerGroupSettings(theComp, "allUnlocked");
//     // storeCompSettings(theComp, "animation");
//     applyCompSettings(theComp, "animation");
// } else {
//     $.writeln("no active comp")
// }

function renameGroup(oldName, newName){
    for (var i = 1; i <= theComp.numLayers; i++){
        var theLayer = theComp.layer(i);
        if (theLayer.comment){
            var oldNameRE = new RegExp("grp:"+ oldName + ",")
            theLayer.comment = theLayer.comment.replace(oldNameRE, "grp:"+newName+",");
        }   
    }
}

function getGroups(theComp){
    var currentGroups = [];
    if (theComp){
        for (var i = 1; i <= theComp.numLayers; i++){
            var theLayer = theComp.layer(i);
            if (theLayer.comment){
                var grpNames = /"grp:[^,]+,/g
                var groups = theLayer.comment.match(grpNames);
                if (groups){
                    for (var g = 1; g < groups.length; g++){
                        var inGroups = false;
                        for (var c = 0; c < currentGroups.length; c++){
                            if(groups[g] === currentGroups[c]){inGroups = true}
                        }
                        if (! inGroups){currentGroups.push(groups[g])}
                    }
                }
            }   
        }
    }
    return currentGroups;
}


// showUI(this);
/*
Code for Import https://scriptui.joonas.me — (Triple click to select): 
{"activeId":12,"items":{"item-0":{"id":0,"type":"pal","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"pal","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Groupinator","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"newGroupBtn","text":"New Group","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-2":{"id":2,"type":"Button","parentId":10,"style":{"enabled":true,"varName":"setBtn","text":"Store","justify":"center","preferredSize":[68,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":10,"style":{"enabled":true,"varName":"applyBtn","text":"Apply","justify":"center","preferredSize":[68,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Groups","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-5":{"id":5,"type":"EditText","parentId":8,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"Group 1","justify":"left","preferredSize":[180,0],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"group1Rdio","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-7":{"id":7,"type":"Group","parentId":16,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":[0,0,0,0],"orientation":"column","spacing":17,"alignChildren":["left","center"],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":16,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":8,"alignChildren":["left","center"],"alignment":null}},"item-9":{"id":9,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"group2Rdio","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-10":{"id":10,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":9,"alignChildren":["center","center"],"alignment":null}},"item-11":{"id":11,"type":"Button","parentId":10,"style":{"enabled":true,"varName":"applyBtn","text":"Delete","justify":"center","preferredSize":[68,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"EditText","parentId":8,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"Group 2","justify":"left","preferredSize":[180,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"group3Rdio","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-14":{"id":14,"type":"EditText","parentId":8,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"Group 3","justify":"left","preferredSize":[180,0],"alignment":null,"helpTip":null}},"item-15":{"id":15,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-16":{"id":16,"type":"Group","parentId":4,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":0,"alignChildren":["left","center"],"alignment":null}}},"order":[0,4,16,7,6,9,13,8,5,12,14,1,10,2,3,11,15],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showpal":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
*/ 
function showUI(thisObj){
    // pal
    // ======
    var groupList = getGroups(app.project.activeItem);
    var pal = (thisObj instanceof Panel) ? thisObj:new Window('palette', 'Groupinator',undefined, {resizable: true});
    pal.text = "Groupinator"; 
    pal.orientation = "column"; 
    pal.alignChildren = ["left","top"]; 
    pal.spacing = 10; 
    pal.margins = 16; 
    
    // PANEL1
    // ======
    var panel1 = pal.add("panel", undefined, undefined, {name: "panel1"}); 
    panel1.text = "Groups"; 
    panel1.orientation = "column"; 
    panel1.alignChildren = ["left","top"]; 
    panel1.spacing = 10; 
    panel1.margins = 10; 
    
    // GROUP1
    // ======
    var groupsGroup = panel1.add("group", undefined, {name: "groupsGroup"}); 
    groupsGroup.orientation = "row"; 
    groupsGroup.alignChildren = ["left","center"]; 
    groupsGroup.spacing = 0; 
    groupsGroup.margins = 0; 
    
    // GROUP2
    // ======
    var radioColumn = groupsGroup.add("group", undefined, {name: "radioColumn"}); 
    radioColumn.orientation = "column"; 
    radioColumn.alignChildren = ["left","center"]; 
    radioColumn.spacing = 12; 
    radioColumn.margins = [0,0,0,0]; 
    
    var group1Rdio = radioColumn.add("radiobutton", undefined, undefined, {name: "group1Rdio"}); 
    group1Rdio.value = true; 
    
    var group2Rdio = radioColumn.add("radiobutton", undefined, undefined, {name: "group2Rdio"}); 
    
    var group3Rdio = radioColumn.add("radiobutton", undefined, undefined, {name: "group3Rdio"}); 
    
    // GROUP3
    // ======
    var nameColumn = group1.add("group", undefined, {name: "nameColumn"}); 
    nameColumn.orientation = "column"; 
    nameColumn.alignChildren = ["left","center"]; 
    nameColumn.spacing = 8; 
    nameColumn.margins = 0; 
    
    var edittext1 = nameColumn.add('edittext {properties: {name: "edittext1"}}'); 
    edittext1.text = "Group 1"; 
    edittext1.preferredSize.width = 180; 
    
    var edittext2 = nameColumn.add('edittext {properties: {name: "edittext2"}}'); 
    edittext2.text = "Group 2"; 
    edittext2.preferredSize.width = 180; 
    
    var edittext3 = nameColumn.add('edittext {properties: {name: "edittext3"}}'); 
    edittext3.text = "Group 3"; 
    edittext3.preferredSize.width = 180; 
    
    // PANEL1
    // ======
    var newGroupBtn = panel1.add("button", undefined, undefined, {name: "newGroupBtn"}); 
    newGroupBtn.text = "New Group"; 
    
    // GROUP4
    // ======
    var group4 = pal.add("group", undefined, {name: "group4"}); 
    group4.orientation = "row"; 
    group4.alignChildren = ["center","center"]; 
    group4.spacing = 9; 
    group4.margins = 0; 
    
    var setBtn = group4.add("button", undefined, undefined, {name: "setBtn"}); 
    setBtn.text = "Store"; 
    setBtn.preferredSize.width = 68; 
    
    var applyBtn = group4.add("button", undefined, undefined, {name: "applyBtn"}); 
    applyBtn.text = "Apply"; 
    applyBtn.preferredSize.width = 68; 
    
    var applyBtn1 = group4.add("button", undefined, undefined, {name: "applyBtn1"}); 
    applyBtn1.text = "Delete"; 
    applyBtn1.preferredSize.width = 68; 
    
    // GROUP5
    // ======
    var group5 = pal.add("group", undefined, {name: "group5"}); 
    group5.orientation = "row"; 
    group5.alignChildren = ["left","center"]; 
    group5.spacing = 10; 
    group5.margins = 0; 
    
    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }
    
}

// PREFS dialog
function setPrefs(){
    var Groupinator = new Window("dialog"); 
    Groupinator.text = "Preferences"; 
    Groupinator.orientation = "column"; 
    Groupinator.alignChildren = ["left","top"]; 
    Groupinator.spacing = 10; 
    Groupinator.margins = 16; 
    
    // PANEL1
    // ======
    var panel1 = Groupinator.add("panel", undefined, undefined, {name: "panel1"}); 
    panel1.text = "Properties to remember"; 
    panel1.orientation = "column"; 
    panel1.alignChildren = ["center","top"]; 
    panel1.spacing = 10; 
    panel1.margins = 10; 
    
    // GROUP1
    // ======
    var group1 = panel1.add("group", undefined, {name: "group1"}); 
    group1.preferredSize.width = 159; 
    group1.orientation = "column"; 
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 10; 
    group1.margins = [7,0,0,0]; 
    
    var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
    statictext1.text = "Layer Properties"; 
    
    var Selection = group1.add("checkbox", undefined, undefined, {name: "Selection"}); 
    Selection.helpTip = "Remember selection status with layer group"; 
    Selection.text = "Selection"; 
    Selection.value = true; 
    
    var Enabled = group1.add("checkbox", undefined, undefined, {name: "Enabled"}); 
    Enabled.helpTip = "Remember layer enabled status (eye icon) with group"; 
    Enabled.text = "Enabled status"; 
    Enabled.value = true; 
    
    var AudioStatus = group1.add("checkbox", undefined, undefined, {name: "AudioStatus"}); 
    AudioStatus.helpTip = "Remember audio enabled status (speaker icon) with group"; 
    AudioStatus.text = "Audio status"; 
    AudioStatus.value = true; 
    
    var Shy = group1.add("checkbox", undefined, undefined, {name: "Shy"}); 
    Shy.helpTip = "Remember shy status with group"; 
    Shy.text = "Shy"; 
    Shy.value = true; 
    
    var Solo = group1.add("checkbox", undefined, undefined, {name: "Solo"}); 
    Solo.helpTip = "Remember solo status with group"; 
    Solo.text = "Solo"; 
    Solo.value = true; 
    
    var Lock = group1.add("checkbox", undefined, undefined, {name: "Lock"}); 
    Lock.helpTip = "Remember lock status with group"; 
    Lock.text = "Lock"; 
    Lock.value = true; 
    
    var divider1 = group1.add("panel", undefined, undefined, {name: "divider1"}); 
    divider1.alignment = "fill"; 
    
    var statictext2 = group1.add("statictext", undefined, undefined, {name: "statictext2"}); 
    statictext2.text = "Comp Properties"; 
    
    var ShyVisibility = group1.add("checkbox", undefined, undefined, {name: "ShyVisibility"}); 
    ShyVisibility.helpTip = "Remember hide / show shy status with group"; 
    ShyVisibility.text = "Shy visibility"; 
    ShyVisibility.value = true; 
    
    var MotionBlur = group1.add("checkbox", undefined, undefined, {name: "MotionBlur"}); 
    MotionBlur.helpTip = "Remember motion blur preview on / off with group"; 
    MotionBlur.text = "Motion Blur"; 
    MotionBlur.value = true; 
    
    var Draft3D = group1.add("checkbox", undefined, undefined, {name: "Draft3D"}); 
    Draft3D.helpTip = "Remember draft 3d preview on / off with group"; 
    Draft3D.text = "Draft 3D"; 
    Draft3D.value = true; 
    
    var FrameBlending = group1.add("checkbox", undefined, undefined, {name: "FrameBlending"}); 
    FrameBlending.helpTip = "Remember frame blending preview on / off with group"; 
    FrameBlending.text = "Frame Blending"; 
    FrameBlending.value = true; 
    
    var Resolution = group1.add("checkbox", undefined, undefined, {name: "Resolution"}); 
    Resolution.helpTip = "Remember resolution with group"; 
    Resolution.text = "Resolution"; 
    Resolution.value = true; 
    
    var CurrentTime = group1.add("checkbox", undefined, undefined, {name: "CurrentTime"}); 
    CurrentTime.helpTip = "Remember time with group"; 
    CurrentTime.text = "Current Time"; 
    CurrentTime.value = true; 
    
    var WorkArea = group1.add("checkbox", undefined, undefined, {name: "WorkArea"}); 
    WorkArea.helpTip = "Remember work area with group"; 
    WorkArea.text = "Work Area"; 
    WorkArea.value = true; 
    
    var divider2 = group1.add("panel", undefined, undefined, {name: "divider2"}); 
    divider2.alignment = "fill"; 
    
    // GROUP2
    // ======
    var group2 = panel1.add("group", undefined, {name: "group2"}); 
    group2.orientation = "row"; 
    group2.alignChildren = ["left","center"]; 
    group2.spacing = 10; 
    group2.margins = 0; 
    
    var Cancel = group2.add("button", undefined, undefined, {name: "Cancel"}); 
    Cancel.text = "Cancel"; 
    Cancel.preferredSize.width = 72; 
    
    var OK = group2.add("button", undefined, undefined, {name: "OK"}); 
    OK.text = "OK"; 
    OK.preferredSize.width = 72; 
    
    Groupinator.show();
}
