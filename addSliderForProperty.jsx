function makeSlider(theComp, sliderSize, thePropName) {
  var theHandle = new Shape();
  var theSlide =  new Shape();
  var theLabel = (thePropName) ?
    theComp.addText(thePropName) :
    theComp.addText('Slider');
  var theSize = (sliderSize) ? [sliderSize[0] / 2, sliderSize[1] / 2] : [100, 20];
  var top = 0 - theSize[1];
  var left = 0 - theSize[0];
  var bot = theSize[1];
  var right = theSize[0];
  theHandle.vertices = [[left, left], [right, left], [right, right], [left, left]];
  theSlide.vertices = [[left, top], [left, bot], [left, s0], [right, s0], [right, top], [right, bot]];

  theLabel.position.setValue(bot * 2);
}
