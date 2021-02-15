// @target aftereffects
function buildGUI(thisObj) {
    var theWindow = (thisObj instanceof Panel) ? thisObj
        : new Window('palette', thisObj.scriptTitle, undefined, {resizeable: true});
    theWindow.preferredSize = 'width: -1, height: -1';
    theWindow.alignChildren = ['left', 'top'];
    theWindow.margins = [10, 10, 10, 10];

    var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']}");

    mainGroup.add('staticText', undefined, 'Number of bars');
    var numBarsGrp = mainGroup.add("group{orientation:'row'}");
    var numBarsSlider = numBarsGrp.add('slider', undefined, 5, 1, 64);
    numBarsSlider.size = 'width: 150, height: 10';
    var numBarsEdit = numBarsGrp.add("editText{alignment: ['right', 'center'], size: [25,20], justify: 'center'}");
    numBarsEdit.text = '' + Math.round(numBarsSlider.value);

    numBarsSlider.onChanging = function () {
        numBarsEdit.text = '' + Math.round(numBarsSlider.value);
    };

    numBarsEdit.onChange = function () {
        if (numBarsSlider.maxValue < parseInt(numBarsEdit.text, 10)) {
        numBarsSlider.maxValue = parseInt(numBarsEdit.text, 10);
        }
        numBarsSlider.value = parseInt(numBarsEdit.text, 10);
    };


    var buttonsGrp = mainGroup.add("group{orientation:'row'}");
    var orientationDD = buttonsGrp.add('dropdownlist', undefined, ['Horizontal', 'Vertical'])
    orientationDD.selection = 0;
    var doItButton = buttonsGrp.add("button{text:'Process'}");
    doItButton.onClick = function () {
        makeFrequencyBars(Math.round(numBarsSlider.value), orientationDD.value);
    };

    if (theWindow instanceof Window) {
        theWindow.center();
        theWindow.show();
    } else {
        theWindow.layout.layout(true);
    }
}

// buildGUI(this)

function makeFrequencyBars(numBars, mono, lGradient, rGradient){
    app.beginUndoGroup("Make frequency bars");
    var theComp = app.project.activeItem;

    if (theComp instanceof CompItem){
        var barHeight = Math.round(theComp.height/4) ;
        var barWidth = Math.round(theComp.width / (1 + numBars));
        var theAudioLayers = theComp.selectedLayers;
        for (var i = 0; i < theAudioLayers.length; i++) {
            var theAudioLayer = theAudioLayers[i];
            var controllerNull = theComp.layers.addNull();
            controllerNull.name = "Audio Bars"
            if (theAudioLayer("Effects").canAddProperty("ADBE Aud HiLo")){
                var currentEffectCount  = theAudioLayer.property("Effects").numProperties;
                var hiPass1 = theAudioLayer("Effects").addProperty("ADBE Aud HiLo").propertyIndex;
                var loPass1 = theAudioLayer("Effects").addProperty("ADBE Aud HiLo").propertyIndex;
                // var hiPass2 = theAudioLayer("Effects").addProperty("ADBE Aud HiLo").propertyIndex;
                // var loPass2 = theAudioLayer("Effects").addProperty("ADBE Aud HiLo").propertyIndex;
                var hiPassEffect1 = theAudioLayer("Effects")(hiPass1);
                var loPassEffect1 = theAudioLayer("Effects")(loPass1);
                // var hiPassEffect2 = theAudioLayer("Effects")(hiPass2);
                // var loPassEffect2 = theAudioLayer("Effects")(loPass2);

                for (var i=0; i < numBars ; i++) {
                    hiPassFreq = 18000 * Math.pow(i / (numBars), 3); //exponential freq bands
                    hiPassFreq = (hiPassFreq <= 0)? 1 : hiPassFreq;
                    loPassFreq = 18000 * Math.pow((i+1) / (numBars), 3);
                    loPassFreq = (loPassFreq <= 0)? 1 : loPassFreq;
                    hiPassEffect1.property("Cutoff Frequency").setValue(hiPassFreq);
                    loPassEffect1.property("Cutoff Frequency").setValue(loPassFreq);
                    // hiPassEffect2.property("Cutoff Frequency").setValue(hiPassFreq);
                    // loPassEffect2.property("Cutoff Frequency").setValue(loPassFreq);
                    hiPassEffect1.property("Filter Options").setValue(1);
                    loPassEffect1.property("Filter Options").setValue(2);
                    // hiPassEffect2.property("Filter Options").setValue(1);
                    // loPassEffect2.property("Filter Options").setValue(2 );
                    app.executeCommand(5025);
                    kfLayer = theComp.layer(1);
                    kfLayer.name = ("levels-" + Math.round(hiPassFreq) + "-" + Math.round(loPassFreq));
                    kfLayer.shy = true;
                    kfLayer.locked = true;
                    theComp.hideShyLayers = true;
                    var lColour = i / numBars * lGradient[0] + (1 - i / numBars) * lGradient[1];
                    var newBarL = theComp.layers.addSolid(lColour, kfLayer.name, barWidth, barHeight, 1);
                    newBarL.position.setValue([(i + 1) * barWidth,  theComp.height/2]);
                    newBarL.parent = controllerNull;
                    newBarL.transform.anchorPoint.setValue([barWidth/2, barHeight]);
                    if (mono){
                        newBarL.name = ("" + Math.round(hiPassFreq) + "-" + Math.round(loPassFreq));
                        newBarL.scale.expression = ('[value[0], value[1] * thisComp.layer("' + kfLayer.name + '").effect("Both Channels")("Slider")];');
                    } else {
                        newBarL.scale.expression = ('[value[0], value[1] * thisComp.layer("' + kfLayer.name + '").effect("Left Channel")("Slider")];');
                        newBarL.name = ("L-" + Math.round(hiPassFreq) + "-" + Math.round(loPassFreq));
                        
                        var rColour = i / numBars * rGradient[0] + (1 - i / numBars) * rGradient[1];
                        var newBarR = theComp.layers.addSolid(rColour, kfLayer.name, barWidth, barHeight, 1);
                        newBarR.position.setValue([(i + 1) * barWidth,  theComp.height/2]);
                        newBarR.name = ("R-" + Math.round(hiPassFreq) + "-" + Math.round(loPassFreq));
                        newBarR.parent = controllerNull;
                        newBarR.scale.expression = ('[value[0], value[1] * thisComp.layer("' + kfLayer.name + '").effect("Right Channel")("Slider")];');
                        newBarR.transform.anchorPoint.setValue([barWidth/2, 0]);
                    }
                };
            }
            theAudioLayer("Effects")(loPass1).remove()  ;
            theAudioLayer("Effects")(hiPass1).remove()  ;
            // hiPassEffect2.remove()  ;
            // loPassEffect2.enabled = false  ;
        };
    }
    app.endUndoGroup();
};
makeFrequencyBars(6, false, [[1, 0, 0], [0, 0, 1]], [[1, 0.5, 0], [0, 0.5, 1]]);
