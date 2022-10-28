var installDialog = new Window("dialog");
installDialog.text = "Choose AE Version to install for";
installDialog.orientation = "column";
installDialog.alignChildren = ["fill", "top"];
installDialog.spacing = 10;
installDialog.margins = 16;
var chkBx = installDialog.add("radiobutton", [undefined, undefined, 120, 20], "ohai")
chkBx.onClick = function () {
    chkBx.text = "kthxbai"
}
installDialog.show()