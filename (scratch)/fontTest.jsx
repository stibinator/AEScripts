// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
function findFonts(){
    if( $.os.match(/Windows.*/)){
        system.callSystem("cmd.exe /c \"powershell.exe -c [System.Reflection.Assembly]::LoadWithPartialName('System.Drawing');set-content fontlist.json (convertTo-json(New-Object System.Drawing.Text.InstalledFontCollection))\"");
    } else {

     var fonts =  system.callSystem('osascript -e \'tell application "Font Book" to postscript name of typefaces\'').split(", "); //name of font families
     var txtLayer = app.project.activeItem.layer(1);
     var textDocument = txtLayer.property("Source Text").value
     textDocument.resetCharStyle();
     textDocument.fontSize = 60;
     textDocument.fillColor = [Math.random(), Math.random(), Math.random()];
     textDocument.strokeColor = [Math.random(), Math.random(), Math.random()];
     textDocument.strokeWidth = Math.random()*5;
     var randoFont = fonts[Math.round(Math.random()*fonts.length)];
     alert(randoFont);
     textDocument.font = randoFont;
     textDocument.strokeOverFill = true;
     textDocument.applyStroke = true;
     textDocument.applyFill = true;
     textDocument.text = "it worked";
     textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
     textDocument.tracking = 50;
     txtLayer.sourceText.setValue(textDocument);
     
    }
    


}
findFonts()

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
