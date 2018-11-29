#include "./(lib)/json2.js" // eslint-disable-line
//@target "aftereffects"

app.beginUndoGroup("add supers");
var parasF = File("~/documents/current work/IM-Khalil Gibran/transcripts/kg-paras.json");
var jParas = null;
var content = null;
if (parasF !== false){
    parasF.open('r');
    content = parasF.read();
    jParas = JSON.parse(content);
    parasF.close();
}

var keysF = File("~/documents/current work/IM-Khalil Gibran/transcripts/keyframes.json");
var jKFs = null
if (keysF !== false){
    keysF.open('r');
    content = keysF.read();
    jKFs = JSON.parse(content);
    keysF.close();
}

var vidComp;
for (i = 1; i <= app.project.items.length; i++){
    if (app.project.items[i].name === "KG-16-11"){
        vidComp = app.project.items[i];
    }
}

var newDoc;
var words;
var myLayer;
var myMidPt;
var textComp = app.project.items.addComp("KG-CV-text", vidComp.width, vidComp.height, vidComp.pixelAspect, vidComp.duration, vidComp.frameRate);

for (p=0; p < jParas.length; p++){
    newDoc = new TextDocument(jParas[p].text.replace(". ", ".\n"));
    newText = textComp.layers.addBoxText([600,800]);
    
    newText.sourceText.setValue(newDoc);
    words = jParas[p].text.split(" ");
    newText.inPoint = jParas[p].inPt;
    newText.outPoint = jParas[p].outPt;
    newText.moveToEnd();
    
    //find the appropriate layer of video
    myMidPt = newText.inPoint + (newText.outPoint - newText.inPoint)/3 ;
    myLayer = null;
    for (var vlyr = 1; vlyr <= vidComp.numLayers- 1 ; vlyr++){
        if (vidComp.layer(vlyr).inPoint < myMidPt && vidComp.layer(vlyr).outPoint > myMidPt){
            myLayer = vidComp.layer(vlyr);
        }
    }
    
    if (myLayer !== null){
        for (var srcKey = 1;srcKey <= myLayer.opacity.numKeys;srcKey++) {
            newText.opacity.setValueAtTime((srcKey>2)?myLayer.opacity.keyTime(srcKey)+2: myLayer.opacity.keyTime(srcKey), myLayer.opacity.keyValue(srcKey));
        }
        newText.name = [myLayer.index, words[0], words[1] + "...", words[words.length -1]].join(" ");
        newText.position.setValue([myLayer.position.value[0]+ ((myLayer.name[0] === "M")? 600: 500), 700]);
    }
    
    
    
    
    grpTextAnimators = newText.property("ADBE Text Properties").property("Animators");
    // animator 1----------
    var grpTextAnimator1 = grpTextAnimators.addProperty("ADBE Text Animator"); 
    // animated opacity and tracking <--in
    var txtOpacity1 = grpTextAnimator1.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
    txtOpacity1.setValue(0); 
    // var trackingIn = grpTextAnimator1.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount");
    // trackingIn.setValue(-1);
    // selector 1--------------
    var inSelector = grpTextAnimator1.property(1).addProperty("ADBE Text Selector");
    // 1 square 2 Ramp up, 3 ramp down, 4 triangle, 5 round, 6 smooth
    inSelector.property("ADBE Text Range Advanced").property("ADBE Text Range Shape") .setValue(2);
    var inSelectorOffset = inSelector.property("Offset");
    var inSelectorStart = inSelector.property("Start");
    inSelectorStart.setValue(90);
    var inSelectorEnd = inSelector.property("End");
    inSelectorEnd.setValue(100);
    var easeLoIn = inSelector.property("ADBE Text Range Advanced").property("ADBE Text Levels Min Ease");
    easeLoIn.setValue(20);

    var paraKeys = jKFs[p];
    var firstKey = paraKeys[0];
    var lastKey = paraKeys[paraKeys.length -1];
    var avSpd = 1/(lastKey - firstKey);
    var offsetKeys = [];
    for (var i in paraKeys) {
      offsetKeys[i] = i / paraKeys.length - avSpd * (paraKeys[i] - firstKey);
    };
    var peaks = [paraKeys[0]];
    for (var i =1; i < offsetKeys.length -1; i++) {
        alert
        if (offsetKeys[i-1] < offsetKeys[i] && offsetKeys[i+1] < offsetKeys[i]){
            peaks.push(paraKeys[i]);
        }
    };
    peaks.push(paraKeys[paraKeys.length -1]);
    offsetKeys = [];

    for (var i in peaks) {
      offsetKeys[i] = i / peaks.length - avSpd * (peaks[i] - firstKey);
    };
    var metaPeaks = [peaks[0]];
    for (var i= 1; i < peaks.length -1; i++) {
        offset = i / peaks.length - avSpd * (peaks[i] - firstKey);
        if (offsetKeys[i-1] < offsetKeys[i] && offsetKeys[i+1] < offsetKeys[i]){
            metaPeaks.push(peaks[i]);
        }
    };
    metaPeaks.push(peaks[peaks.length-1]);
    for (k = 0; k < metaPeaks.length; k++){
        inSelectorOffset.setValueAtTime(metaPeaks[k], 100 * ((k+1) / metaPeaks.length) - 100 );
        inSelectorOffset.setTemporalAutoBezierAtKey(k+1, true);
    }
    // add a final keyframe to the selector
    // inSelectorOffset.setValueAtTime(myLayer.opacity.keyTime(myLayer.opacity.numKeys)+0.5, 100);
        inSelectorOffset.setValueAtTime(newText.outPoint, 100);

    // animator 2----------
    var grpTextAnimator2 = grpTextAnimators.addProperty("ADBE Text Animator"); 
    // animator 2 properties - opacity, blur tracking
    var txtOpacity2 = grpTextAnimator2.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
    txtOpacity2.setValue(0); 
    // var txtBlur = grpTextAnimator2.property("ADBE Text Animator Properties").addProperty("ADBE Text Blur");
    // txtBlur.setValue([30, 13]);
    // var trackingOut = grpTextAnimator2.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount");
    // trackingOut.setValue(2);
    // selector 2
    var outSelector = grpTextAnimator2.property(1).addProperty("ADBE Text Selector");
    // var outSelectorEnd = outSelector.property("End"); //leave to default 0-100
    // outSelectorEnd.setValue(30);
    var outSelectorOffset = outSelector.property("Offset");
    outSelectorOffset.expression = "text.animator(\"Animator 1\").selector(\"Range Selector 1\").offset - 5"; 
    // 1 square 2 Ramp up, 3 ramp down, 4 triangle, 5 round, 6 smooth
    outSelector.property("ADBE Text Range Advanced").property("ADBE Text Range Shape") .setValue(3);
    var easeLoOut = outSelector.property("ADBE Text Range Advanced").property("ADBE Text Levels Min Ease");
    easeLoOut.setValue(75);
    
        // animator 3----------
    var grpTextAnimator3 = grpTextAnimators.addProperty("ADBE Text Animator"); 
    // animator 3 properties - opacity, blur tracking
    // var txtOpacity3 = grpTextAnimator3.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
    // txtOpacity3.setValue(0); 
    var txtBlur = grpTextAnimator3.property("ADBE Text Animator Properties").addProperty("ADBE Text Blur");
    txtBlur.setValue([30, 13]);
    var trackingOut = grpTextAnimator3.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount");
    trackingOut.setValue(4);
    // selector 3
    var outSelector2 = grpTextAnimator3.property(1).addProperty("ADBE Text Selector");
    // var outSelector2End = outSelector2.property("End"); //leave to default 0-100
    // outSelector2End.setValue(30);
    var outSelector2Offset = outSelector2.property("Offset");
    outSelector2Offset.setValueAtTime(newText.inPoint, -100);
    outSelector2Offset.setValueAtTime(paraKeys[paraKeys.length-1], 0);
    outSelector2Offset.setValueAtTime(newText.outPoint, 100);
    outSelector2Offset.expression = "text.animator(\"Animator 1\").selector(\"Range Selector 1\").offset"; ; 
    // 1 square 3 Ramp up, 3 ramp down, 4 triangle, 5 round, 6 smooth
    outSelector2.property("ADBE Text Range Advanced").property("ADBE Text Range Shape") .setValue(3);
    var easeLoOut = outSelector2.property("ADBE Text Range Advanced").property("ADBE Text Levels Min Ease");
    easeLoOut.setValue(75);
    
}



app.endUndoGroup();