//@target aftereffects
(function(){
    this.name = "add wiggle controls";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        for (var i = 0; i < theComp.selectedLayers.length; i++){
            var theLayer = theComp.selectedLayers[i];
            var theProps = theLayer.selectedProperties;
            for (var p = 0; p < theProps.length; p++){
                var theProp = theProps[i];
                ampSliderName = theProp.name + " wiggle amplitude";
                freqSliderName = theProp.name + " wiggle frequency";
                theProp.expression = "let a = effect('" + ampSliderName + "')('Slider');\n" +
                    "let f = effect('" + freqSliderName + "')('Slider');\n" +
                    "wiggle(f, a);";
                var effectsProperty = theLayer.property("ADBE Effect Parade");
                var ampSlider = effectsProperty.addProperty("ADBE Slider Control");
                ampSlider.name = ampSliderName;
                var freqSlider = effectsProperty.addProperty("ADBE Slider Control");
                freqSlider.name = freqSliderName;
            }
        }
    }
    app.endUndoGroup();
})()
