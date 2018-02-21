var originals = app.project.selection;
if (originals) {
  var f,
    proxyPath;
  var proxyFolder = Folder.selectDialog("Choose the source folder for the proxies");
  for (i = 1; i <= originals.length; i++) {
    try {
      if (originals[i].typeName === "Footage") {
        newProxy = new File(proxyFolder.absoluteURI + "/" + originals[i].file.name);

        originals[i].setProxy(newProxy);
      }

    } catch (e) {
      writeln(e)
    }
  }
} else {
  alert("Choose some footage items to add proxies to")
}
