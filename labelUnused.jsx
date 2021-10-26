// @target aftereffects
// sets the label for all unused items
(function () {
    theitems = app.project.selection;
    //do all if nothing is selected
    if (theitems.length === 0) {
        for (var i = 1; i <= app.project.items.length; i++) {
            //convert 1-index collection to normal array. Thanks, Adobe.
            theitems.push(app.project.item(i));
        };
    }
    for (var i = 0; i < theitems.length; i++) {
        var uses = theitems[i].usedIn;
        if (uses && uses.length > 0) {
            theitems[i].label = 14;
        } else {
            theitems[i].label = 0;
        }
    }
})()
