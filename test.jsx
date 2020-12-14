//@target aftereffects

for (var i = 1; i <= app.project.numItems; i++) {
    if ((app.project.item(i).typeName == "Composition") && (i != 1)){
         app.project.item(1).layer(1).copyToComp(app.project.item(i));
         }
}