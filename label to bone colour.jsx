/* @target AfterEffects */
/* global app, PREFType, CompItem */

// this script automatically colourises the bones created by DUIK
// to match the label colour of the layer they're on
function asciiToRGB(str) {  
    var base = 20;
    var arr = [0, 0, 0];  
    var hexArr = [0, 0, 0];
    for (var i = 1, l = str.length; i < l; i ++) {  
        var hex = Number(str.charCodeAt(i)).toString(base);  
        hexArr[i-1] = hex;
        var theRGB = parseInt(hex, 16)/255;
        arr[i-1] = theRGB;  
    }  
    // alert(hexArr);
    return arr;  
} 

function getLabelColour(theLayer){
    var label = theLayer.label;

    var sect = "Label Preference Color Section 5";  
    var key = "Label Color ID 2 # " + label.toString();  
    var prefType = PREFType.PREF_Type_MACHINE_INDEPENDENT
    var thePref = app.preferences.getPrefAsString(sect,key, prefType);  
    // alert(asciiToRGB(thePref));
    return  asciiToRGB(thePref);

 }

app.beginUndoGroup('Label colours to DUIK Bones');
var theComp = app.project.activeItem;
if (theComp instanceof CompItem){
    var theLayers = theComp.selectedLayers;
    for (var i =0; i < theLayers.length; i++){
        if(theLayers[i]("Effects")("Bone")){
            theLayers[i]("Effects")("Bone")("Color").setValue(getLabelColour(theLayers[i]));
        }
    }
}
app.endUndoGroup();
