// selects un-parented layers
(function (){var theComp = app.project.activeItem;
if (theComp){
    for(var n = 1; n <= theComp. numLayers; n++){
        theComp.layer(n).selected = (! theComp.layer(n).parent);
    }
}})()