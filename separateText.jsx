/* global app, Panel, writeLn */
var selectedText = app.project.activeItem.selectedLayers;
if (selectedText){
    for (var i =0; i < selectedText.length; i++){
        var textLyr = selectedText[i];
        var theWords = textLyr.text.split(" ");
        for (var w =0; w < theWords.length; w++){
            // var newTextLyr = 
        }

    }
}