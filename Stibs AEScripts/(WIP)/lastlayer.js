(function () {
    var theComp = app.project.activeItem;
    if (theComp) {
        lastLayer = theComp.layer(theComp.numLayers);
        lastLayer.selected = true;
        var thecmd = app.findMenuCommandId("Scroll Selected Layer to Top");
        alert (thecmd)
    }
})()