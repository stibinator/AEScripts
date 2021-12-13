//@target aftereffects
(function (thisObj) {
    var pal = thisObj instanceof Panel
        ? thisObj
        : new Window("palette", thisObj.scriptTitle, undefined, {
            resizeable: true,
        });
    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }
})(this)