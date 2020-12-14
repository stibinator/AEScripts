// @target aftereffects
var theComp = app.project.activeItem;
if (theComp){
    var dataLayer = theComp.layers.addNull();
    dataLayer.property("Data").setValue({'a':1, 'b':2});
}