/* @target AfterEffects */
var lyr1 = app.project.activeItem.selectedLayers[0];
theText = lyr1.sourceText.value;
var font = theText.font;
// theText.fontFamily = "Yu Gothic";
theText.font = "YuGothic-Bold";

theText.text=font;
lyr1.sourceText.setValue(theText);
lyr1.sourceText.value.font 