/* @target AfterEffects */
// var tempDir = system.callSystem("cmd.exe /c echo \"%TEMP%\"");
// //callSystem returns a string with quotes and a line return so we need to strip them
// tempDir = tempDir.replace(/[\n\r"]*/g, "");
// var cmd = ("cmd.exe /c powershell.exe -c \"[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing');set-content (join-path " + tempDir + " fontlist.json) (convertTo-json(New-Object System.Drawing.Text.InstalledFontCollection))\"");
// system.callSystem(cmd);
var fontlistFile = new File (tempDir.replace("\\", "/") + "/fontlist.json");
fontlistFile.open("r");
var theFonts = JSON.parse(fontlistFile.read());
fontlistFile.close();
for (i = 0; i < theFonts.length; i++){
    var txtLayer = app.project.activeItem.layers.addText("hello");
    var textDocument = txtLayer.property("Source Text").value
    textDocument.resetCharStyle();
    textDocument.fontSize = 60;
    textDocument.fillColor = [Math.random(), Math.random(), Math.random()];
    textDocument.strokeColor = [Math.random(), Math.random(), Math.random()];
    textDocument.strokeWidth = Math.random()*5;
    var randoFont = theFonts[i];
    // alert(randoFont);
    textDocument.font = randoFont;
    textDocument.strokeOverFill = true;
    textDocument.applyStroke = true;
    textDocument.applyFill = true;
    textDocument.text = randoFont;
    textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
    textDocument.tracking = 50;
    txtLayer.sourceText.setValue(textDocument);
    txtLayer.position.setValue([Math.random() * app.project.activeItem.width, Math.random() * app.project.activeItem.height
    ])

}