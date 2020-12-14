var theLayer = app.project.activeItem.selectedLayers[0];
if (! theLayer) {alert ("select a layer")}
var highlights = makeSamplePoint(theLayer, "Highlights");
var mids = makeSamplePoint(theLayer, "Mids");
var lows = makeSamplePoint(theLayer, "Lows");
calculateValuesFromSample(lows, 10, theLayer)

function calculateValuesFromSample(thePoint, radius, theLayer){
    var indx = theLayer.index;
    var ptNm = thePoint.name;
    var tempSlider = theLayer.property("ADBE Effect Parade").addProperty("Slider Control");
    var theXpression = "var theSample = thisComp.layer(" + indx + ").sampleImage(effect(\""+ptNm + "\")(\"Point\"), radius = [" + radius + "," + radius + "], postEffect = false, t= time);\nrgbToHsl(theSample)[2]"
    tempSlider("Slider").expression = theXpression;
    theSamples = [];
    for (var i = 0; i < theLayer.duration; i++){
        
    }
}



function makeSamplePoint(theLayer, pointName){
    if (! pointName){ pointName = "sample point"}
    var thePoint = theLayer.property("ADBE Effect Parade").addProperty("Point Control");
    thePoint.name = pointName;
    return thePoint;
}