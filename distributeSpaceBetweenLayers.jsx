// @target aftereffects
// @include './(lib)/LST/LST.js'
// (function(){
this.name = "distributeSpaceBetweenLayers";
app.beginUndoGroup(this.name);
var theComp = app.project.activeItem;
if (theComp ){
    var LayerHeights = [];
    var theLayers =theComp.selectedLayers;
    theLayers.sort(function(a, b){return a.position.value[1] - b.position.value[1]})
    for (var i = 0; i < theLayers.length; i++){
        var theLayer = theLayers[i];
        var top, bottom;
        var corners = [
            [0, 0], 
            [theLayer.width/2, 0], 
            [theLayer.width/2, theLayer.height/2], 
            [0, theLayer.height/2]
        ];
        
        for (var c = 0; c < corners.length; c++) {
            var pt = toComp(theLayer, corners[c]);
            $.writeln(pt.position);
            if (top === null || pt[1] < top){ top = pt[1]}
            if (bottom === null || pt[1] > bottom) { bottom = pt[1] }
            theLayer.top = top;
            theLayer.bottom = bottom;
        }
    }
}
app.endUndoGroup();
// })()
