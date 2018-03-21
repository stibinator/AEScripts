var proxyFolder;

function proxinate(proxyFolder) {
  var originals = app.project.selection;
  if (originals) {
    var f,
      proxyPath;
    for (i = 0; i < originals.length; i++) {
      if (!proxyFolder) {
        chooseProxyFolder()
      }
      try {
        if (originals[i].typeName === "Footage") {
          newProxy = new File(proxyFolder.absoluteURI + "/" + originals[i].file.name);
          originals[i].setProxy(newProxy);
        } else {
          newProxy = new File(proxyFolder.absoluteURI + "/" + originals[i].name + ".mov");
          originals[i].setProxy(newProxy);
        }
        originals[i].selected = false;
        originals[i].selected = true;
      } catch (e) {
        alert(e)
      }
    }
  } else {
    alert("Choose some footage items to add proxies to")
  }
}

function chooseProxyFolder(startPath) {
  if (startPath) {
    proxyFolder = startPath.selectDlg("Choose the source folder for the proxies");
  } else {
    proxyFolder = Folder.selectDialog("Choose the source folder for the proxies");
  }
  writePrefs(proxyFolder);
  return proxyFolder;
}

function getLastFolder() {
  prefs = new File(Folder.userData.absoluteURI + "/proxinator.prefs");
  if (prefs.exists) {
    prefs.open("r");
    lastProxyFolder = new Folder(prefs.read());
    prefs.close();
    if (lastProxyFolder.exists) {
      return lastProxyFolder;
    }
  }
  return null
}

function writePrefs(lastProxyFolder) {
  prefs = new File(Folder.userData.absoluteURI + "/proxinator.prefs");
  if (prefs.open("w")) {
    prefs.write(lastProxyFolder);
    prefs.close();
  }
}

function buildUI(thisObj) {
  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window("palette", scriptName, undefined, {resizeable: true});
  }
  if (pal !== null) {
    chooseProxyFolderBtn = pal.add("button", [
      undefined, undefined, undefined, undefined
    ], "choose proxy folder");

    lastFolderText = (lastFolder.displayName)
      ? lastFolder.displayName
      : "<none>";

    lastFolderStaticText = pal.add("statictext", [
      undefined, undefined, undefined, undefined
    ], lastFolderText);

    proxynateBtn = pal.add("button", [
      undefined, undefined, undefined, undefined
    ], "set proxies for selected");
  }

  chooseProxyFolderBtn.onClick = function(){
    proxyFolder = chooseProxyFolder(lastFolder);
    lastFolderStaticText.text = (proxyFolder.displayName)
      ? proxyFolder.displayName
      : "<none>";
  }
  proxynateBtn.onClick = function(){
    proxynate(proxyFolder);
  }

}

var lastFolder = getLastFolder();
// var proxyFolder = chooseProxyFolder(lastFolder);
// writePrefs(proxyFolder);
// proxinate(proxyFolder);
buildUI(this);
