function myPanel(thisObj) {
  var win = {};

  win.pal = thisObj instanceof Panel ? thisObj : new Window('palette', '', undefined, { resizeable: true });

  if (win.pal === null) return win.pal;

  win.pal.myGrp = win.pal.add("Group");
  win.pal.myGrp.orientation = 'row';
  win.pal.myGrp.alignment = ['fill', 'fill'];
  win.pal.myGrp.preferredSize = [128, 64]
  win.pal.myGrp.myButton = win.pal.myGrp.add("Button");
  win.pal.myGrp.myButton.text = 'My Button Name';
  win.pal.myGrp.myButton.alignment = ['left', 'top'];
  win.pal.myGrp.myButton.minimumSize = [128, 32];
  win.pal.myGrp.myButton = win.pal.myGrp.add("Button");
  win.pal.myGrp.myButton.text = 'Yello';
  win.pal.myGrp.myButton.alignment = ['fill', 'fill'];
  win.pal.myGrp.myButton.minimumSize = [128, 32];

  win.pal.layout.layout(true);

  win.pal.onResizing = win.pal.onResize = function () {
    this.layout.resize();
  };

  if (win.pal !== null && win.pal instanceof Window) {
    win.pal.show();
  }

  return win;
}

myPanel(this);