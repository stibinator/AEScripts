// @target aftereffects
var a = app.project.activeItem.selectedLayers[0];
var propertyArr = [];
for (var i=1; i <= a.numProperties; i++){
    propertyArr.push( exploreProperty(a.property(i)));
}
propertyArr

function exploreProperty(theProp){
    var resultArr = [];
    for (var i=1; i <= theProp.numProperties; i++){
        var b = theProp.property(i);
        if (b.numProperties > 1){
            resultArr.push( exploreProperty (b));
        } else {
            resultArr.push( b.name);
        }
    }
    return resultArr
}
