// @target aftereffects
// sets the label of all
// portrait(taller than wide)
// project items
(function () {
    theitems = app.project.selection;
    for (var i = 0; i < theitems.length; i++) {
        if (theitems[i].width < theitems[i].height) {
            theitems[i].label = 12;
        } else {
            theitems[i].label = 10;
        }
    }
})()