//@target aftereffects
var thisScript = this;

thisScript.letterWidth = 6; // adjust these until they're right
thisScript.rowHeight = 16;


thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisObj.pal = (thisObj instanceof Panel) ?
    thisObj: 
    new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    thisScript.colCount = 1;
    thisScript.rowCount = 1;
    var pnl = pal.add("panel", undefined, undefined);
    var txtBx = pnl.add("staticText", undefined, "ohai");
    pnl.alignChildren = "top"
    var doTheThingsBtn = thisObj.pal.add("button", undefined, "Do the things");
    doTheThingsBtn.onClick = function () {
        var chars = "";
        for (var i = 65; i < 91; i++){
            chars += String.fromCharCode(i, i + 32)
        }
        var newText = "";
        for (var c = 1; c < thisScript.rowCount; c++){
            newText += chars.slice(0, c * 5)+"\n";
        }
        
        thisScript.rowCount++;
        txtBx.text = newText
        var boxDims = thisScript.measureText(newText);
        txtBx.size = [boxDims[0] * thisScript.letterWidth, boxDims[1] * thisScript.rowHeight];
        txtBx.alignment = ["top", "right"];
        pnl.alignChildren = ["top", "right"];
        pnl.layout.layout(true);
        thisObj.pal.layout.layout(true);
    };
    
    //------------------------ build the GUI ------------------------
    if (thisObj.pal instanceof Window) {
        thisObj.pal.center();
        thisObj.pal.show();
    } else{
        thisObj.pal.layout.layout(true);
    }
    
    thisScript.measureText = function (text) {
        var width = 0;
        var lines = text.split("\n");
        for (var ln = 0; ln < lines.length; ln++){
            if (width< lines[ln].length){width = lines[ln].length}
        }
        return([width, lines.length])
    }
}

//--------------------- go ahead and run ----------------------
thisScript.buildGUI(this);
