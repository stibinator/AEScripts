//@target aftereffects
(function () {
    this.name = "setEasingToo100";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    var easeO = new KeyframeEase(0, 100);
    if (theComp) {
        for (var i = 0; i < theComp.selectedLayers.length; i++) {
            theLayer = theComp.selectedLayers[i];
            var props = theLayer.selectedProperties
            for (p = 0; p < props.length; p++) {
  
                var kf = props[p].selectedKeys;
                if (kf) {
                    for (var k = 0; k < kf.length; k++) {
                        props[p].setTemporalEaseAtKey(kf[k], [easeO], [easeO]);
                    }
                }
            }
        }
    }
    app.endUndoGroup();
})()
