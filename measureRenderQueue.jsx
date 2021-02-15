// @target aftereffects
alert(renderProj);
app.open(renderProj);
var rq = app.project.renderQueue;
var tempFile = new File("~/Appdata/Local/Temp/rqcount.txt");
tempFile.open("w");
tempFile.write(rq.numItems);
tempFile.close();
