// global constants
var scriptName = "proxinator";
var prefsFile = Folder.userData.absoluteURI + "/AE_proxinator.prefs";

function proxinate(proxyFolder, items) {
  // set a proxy for all selected items by matching file names in a folder
  originals = items || app.project.selection;
  var msg = "";
  if (originals) {
    var f,
      proxyPath;
    for (var i = 0; i < originals.length; i++) {
      if (!proxyFolder) {
        chooseProxyFolder()
      }
      try {
        if (originals[i].typeName === "Footage") {
          newProxy = new File(proxyFolder.absoluteURI + "/" + originals[i].file.name);
          originals[i].setProxy(newProxy);
        } else {
          // possible matches for the proxy, from the reasonable to the silly
          var suffixes = [
            ".mov",
            ".avi",
            ".mp4",
            ".mxf",
            ".mpg",
            ".mpeg",
            ".mkv",
            ".ogv",
            ".webm",
            ".wmv",
            ".dv",
            ".omf"
          ];
          var attempt = 0;
          for (var s = 0; s < suffixes.length; s++) {
            newProxy = new File(proxyFolder.absoluteURI + "/" + originals[i].name + suffixes[s]);
            if (newProxy.exists) {
              break
            }
          }
          if (newProxy.exists) {
            originals[i].setProxy(newProxy);
          } else {
            msg += originals[i].name + "\n";
          }
        }
        originals[i].selected = false;
        originals[i].selected = true;
      } catch (e) {
        alert("had an error" + e)
      }
    }
    if (msg) {
      alert("Can't find matching files in\n" + proxyFolder.fsName + "\nfor item:\n" + msg);
      return false;
    } else {
      return true;
    }
  } else {
    // no originals were given
    alert("Choose some footage items and I'll search the proxy folder for proxies")
  }
}

function chooseProxyFolder(startPath) {
  if (startPath) {
    newFolder = startPath.selectDlg("Choose the source folder for the proxies");
  } else {
    newFolder = Folder.selectDialog("Choose the source folder for the proxies");
  }
  // only update the proxy folder value if a new folder is actually choosen
  // selectDialog or selectDlg return null if user cancels, but if the proxy folder is already set
  // we don't want to overwrite it.
  if (newFolder){
    writePrefs(newFolder);
    proxyFolder = newFolder;
  }
  return proxyFolder;
}

function getLastFolder() {
  prefs = new File(prefsFile);
  if (prefs.exists) {
    prefs.open("r");
    lastProxyFolder = new Folder(prefs.read());
    prefs.close();
    if (lastProxyFolder && lastProxyFolder.exists) {
      return lastProxyFolder;
    }
  }
  return null
}

function writePrefs(lastProxyFolder) {
  prefs = new File(prefsFile);
  if (prefs.open("w")) {
    prefs.write(lastProxyFolder);
    prefs.close();
  }
}

function buildUI(thisObj) {
  var proxyFolder = getLastFolder();
  if (thisObj instanceof Panel) {
    pal = thisObj;
  } else {
    pal = new Window("palette", scriptName, undefined, {resizeable: true});
  }

  if (pal !== null) {
    chooseProxyFolderBtn = pal.add("button", {
      x: 4,
      y: undefined,
      width: 180,
      height: 25
    }, "choose proxy folder");

    proxyFolderText = pal.add("statictext", {
      x: 4,
      y: undefined,
      width: 180,
      height: 25
    }, "no folder selected", {truncate: "middle"});

    proxinateBtn = pal.add("button", {
      x: 4,
      y: undefined,
      width: 180,
      height: 25
    }, "set proxies for selected");

    function checkProxyFolderAndUpdateText() {

      if ( proxyFolder && proxyFolder.fsName) {
        proxyFolderText.text = proxyFolder.fsName;
        proxinateBtn.enabled = true;
      } else {
        proxyFolderText.text = "<none>";
        proxinateBtn.enabled = false;
      }
    }
    checkProxyFolderAndUpdateText();

    chooseProxyFolderBtn.onClick = function() {
      proxyFolder = chooseProxyFolder(proxyFolder);
      checkProxyFolderAndUpdateText();
    };

    proxinateBtn.onClick = function() {
      proxinate(proxyFolder);
      this.active = false; // stops the button staying activated
    };

    if (!proxyFolder) {
      proxinateBtn.enabled = false
    };
    // show the panel
    if (pal instanceof Window) {
      pal.center();
      pal.show();
    } else {
      pal.layout.layout(true);
    }
  }
}
// var proxyFolder = chooseProxyFolder(lastFolder);
// writePrefs(proxyFolder);
// proxinate(proxyFolder);
buildUI(this);
