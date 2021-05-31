// @target aftereffects
theitems = app.project.selection;
//label all if nothing is selected
if (theitems.length === 0) {
    theitems = app.project.items;
}
for (var i =0; i< theitems.length; i++){
    var uses = theitems[i].usedIn;
    if (uses && uses.length > 0){
        theitems[i].label = 14;
    } else {
        theitems[i].label = 0;
    }
}
