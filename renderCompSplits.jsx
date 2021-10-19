//@target aftereffects
(function(){
    this.name = "renderCompSplits";
    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp ){
        var theMarkers = theComp.markerProperty;
        // matrkers are 1 indexed, because Adobe
        for (var i = 0; i <= theMarkers.numKeys; i++){
            var newRQitem = app.project.renderQueue.items.add(theComp);
            var startTime = (i === 0) ? 0 : theMarkers.keyTime(i);
            var duration = (i = theMarkers.numKeys)? theComp.duration - startTime: theMarkers.keyTime(i + 1) - startTime;
            var settings = {
                "Time Span Duration": "" + duration,
                "Time Span Start": "" + startTime
            }
            newRQitem.setSettings(settings);
            var om = newRQitem.outputModule(1)
            var newName = om.file.name.replace(/([_\[#\]]*\.\w+$)/, "_" + pad(i, 3) + "$1");
            var omSettings = om.getSettings();
            om.setSettings({ "Output File Info": { "File Name": newName, "Base Path": omSettings["Output File Info"]["Base Path"] } }); 
        }
    }
    app.endUndoGroup();

    function pad ( num, size ) {
        if (num.toString().length >= size) return num;
            return ( Math.pow( 10, size ) + Math.floor(num) ).toString().substring( 1 );
        }

})()
