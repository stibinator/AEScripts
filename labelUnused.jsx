// @target aftereffects
theitems  = app.project.selection;
for (var i =0; i< theitems.length; i++){
    var uses = theitems[i].usedIn;
    if (uses && uses.length > 0){
        theitems[i].label = 14;
    } else {
        theitems[i].label = 0;
    }
}
