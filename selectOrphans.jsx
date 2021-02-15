// selects un-parented layers
(function (){var theComp = app.project.activeItem;
    if (theComp){
        for(var n = 1; n <= theComp. numLayers; n++){
            var isOrphan = ! theComp.layer(n).parent;
            if (isOrphan){ theComp.layer(n).locked = false }
            theComp.layer(n).selected = isOrphan;
        }
    }
})()