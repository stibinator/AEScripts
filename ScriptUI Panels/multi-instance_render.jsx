//@target aftereffects
var projectQueue = (app.project)?app.project.renderQueue:false;
var externalQueue = [];
for (var i= 1; i <= projectQueue.items.length; i++){
    var theItem = projectQueue.items[i];
    externalQueue.push({"QNum": i, "itemName": theItem.comp.name, "settings": theItem.outputModule(1).getSettings( GetSettingsFormat.json )});
}
alert(externalQueue[0].settings.toSource());