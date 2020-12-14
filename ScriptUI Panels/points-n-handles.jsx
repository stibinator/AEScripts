/* @target aftereffects */
/* global app, Panel, Shape*/


var scriptName = "points-n-handles";
var ERR_NO_PATHS = "<!> Select at least\none pathNo to control";
var ERR_CONVERT_SHAPES = "Convert shape items to Bezier paths\nbefore using.";
var RESULT_PTS_CREATED = " points were created on layer\n";
var TXT_DOTHETHINGSBTN = "Create Path Controls";
var TXT_NEWCTRLBTN = "New point";
var NAME_CONTROL_GROUP = " control points";
var NAME_CTRL = "ctrl ";
var NAME_CTRL_LAYER = " ctrl ";

function buildUI(thisObj) {
    // DIALOG
    // ======
    var pal = thisObj;
    if (!(pal instanceof Panel)) {
        pal = new Window('palette', scriptName, undefined, {
            resizeable: true
        });
    }

    if (pal !== null) {

        pal.text = "points-n-handles";
        pal.orientation = "column";
        pal.alignChildren = ["center", "top"];
        pal.spacing = 10;
        pal.margins = 16;

        var doTheThingsBtn = pal.add("button", undefined, undefined);
        doTheThingsBtn.name = "doTheThingsBtn";
        doTheThingsBtn.text = TXT_DOTHETHINGSBTN;
        doTheThingsBtn.preferredSize.width = 160;

        var makeLayersChckBx = pal.add("checkbox", undefined, undefined);
        makeLayersChckBx.name = "makeLayersChckBx"
        makeLayersChckBx.text = "Make individual layers"

        var newCtrlBtn = pal.add("button", undefined, undefined);
        newCtrlBtn.name = "newCtrlBtn";
        newCtrlBtn.text = TXT_NEWCTRLBTN;

        var infoText = pal.add("statictext", undefined, undefined);
        infoText.text = "";
        infoText.alignment = ["left", "top"];
        infoText.preferredSize.width = 200;
        infoText.preferredSize.height = 100;

        doTheThingsBtn.onClick = function() {
            app.beginUndoGroup(scriptName);
            if (app.project && app.project.activeItem) {
                var theLayers = app.project.activeItem.selectedLayers;
                infoText.text = "";
                for (var lyr = 0; lyr < theLayers.length; lyr++) {
                    var result = createPathControls(theLayers[lyr], makeLayersChckBx.value, app.project.activeItem);
                    infoText.text += [result.converted + RESULT_PTS_CREATED + theLayers[lyr].name, result.warnings.join("\n")].join("\n");
                }
            } else {
                infoText.text = ERR_NO_PATHS
            }
            app.endUndoGroup();
        };
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        } else {
            pal.layout.layout(true);
        }
    }



}

function createPathControls(theLayer, makeLayers, theComp) { //}, method) {
    var props = [];
    theLayer.psuedoUID = Math.random();
    for (var prop = 0; prop < theLayer.selectedProperties.length; prop++) {
        props.push(theLayer.selectedProperties[prop]);
    }

    var result = {
        "converted": 0,
        "warnings": []
    };

    var allThePathInfos = [];
    for (var p = 0; p < props.length; p++) {
        var propLayer = props[p];
        var propTree = [];
        while (propLayer.parentProperty){
            propTree.push(propLayer.propertyIndex);
            propLayer = propLayer.parentProperty;
        }
        
        if (props[p].matchName === "ADBE Vector Shape - Group") {
            
            var thePathInfo = {
                "parentLayer": theLayer.psuedoUID,
                "propTree": propTree,
                "comp": theComp
            };
            allThePathInfos.push(thePathInfo);
            result.converted++;
        } else if (props[p].matchName.match(/ADBE Vector Shape - (Star|Rect|Ellipse)/)) {
            result.warnings.push(ERR_CONVERT_SHAPES);
        }
    }
    for (var pathNo = 0; pathNo < allThePathInfos.length; pathNo++) {
        var newExpression;
        newExpression = makeControlPoint(allThePathInfos[pathNo], makeLayers);
        var theOriginalPath = getInfo(allThePathInfos[pathNo]);
        theOriginalPath.pathProperty.property("ADBE Vector Shape").expression = newExpression;
    }
    return result;
}

function getInfo(pathInfo){
    var theComp = pathInfo.comp;
    var theLayer = false;
    for (var lyr = 1; lyr <= theComp.numLayers && (! theLayer); lyr++){
        if (theComp.layer(lyr).psuedoUID === pathInfo.parentLayer){
            theLayer = theComp.layer(lyr);
        }
    }
    var thePathProperty = theLayer;
    for (var i = pathInfo.propTree.length-1; i >= 0; i--){
        thePathProperty = thePathProperty.property(pathInfo.propTree[i]);
    }
    return {"pathProperty": thePathProperty, "layr": theLayer}
}


function makeControlPoint(pathInfo, makeLayers) {
    var newGroup, newCtrlGp, ctrlLayerName; 
    var info = getInfo(pathInfo);
    var theLayer = info.layr; 
    if (! makeLayers)  {
        newCtrlGp = newCtrlGroup(pathInfo, theLayer);
        newGroup = newCtrlGp.group;
        ctrlLayerName = theLayer.name;
    }
    // layers and properties become invalid when we add new ones, so get them again
    info = getInfo(pathInfo);
    var thePathProperty = info.pathProperty;
    theLayer = info.layr;
    var theShape = thePathProperty.property("ADBE Vector Shape").value;
    var ctrlsExpression = [];
    for (var v = 0; v < theShape.vertices.length; v++) {
        if (makeLayers){
            var newCtrlLayer = app.project.activeItem.layers.addShape();
            newCtrlLayer.moveAfter(theLayer);
            newCtrlLayer.name = thePathProperty.name + NAME_CTRL_LAYER + (v+1);
            newCtrlGp = newCtrlGroup(pathInfo, newCtrlLayer);   
            newGroup = newCtrlGp.group;
            ctrlLayerName = newCtrlLayer.name;
        } 
        var newPoint = new Shape();
        newPoint.vertices = [theShape.vertices[v]];
        newPoint.inTangents = [theShape.inTangents[v]];
        newPoint.outTangents = [theShape.outTangents[v]];
        newPoint.closed = false; //explicitly set this or you get weird single point closed paths
        var ctrlPointGrp = newGroup.content.addProperty("ADBE Vector Shape - Group");
        ctrlPointGrp.name = NAME_CTRL + (v + 1);
        ctrlPointGrp.property("ADBE Vector Shape").setValue(newPoint);
        ctrlPointGrp.selected = true;
        ctrlsExpression.push("thisComp.layer('" + ctrlLayerName + "').content('" + newGroup.name + "').content('" + ctrlPointGrp.name + "').path")
    }
    var pointExpression = "let ctrls = [\n" + ctrlsExpression.join(",\n  ") + "\n];\n";
    pointExpression += "let pts =[];\n"
    pointExpression += "let inTans =[];\n"
    pointExpression += "let outTans =[];\n"
    pointExpression += "for (i in ctrls){\n"
    pointExpression += "  pts.push(ctrls[i].points()[0]);\n"
    pointExpression += "  inTans.push(ctrls[i].inTangents()[0]);\n"
    pointExpression += "  outTans.push(ctrls[i].outTangents()[0]);\n"
    pointExpression += "}\n"
    pointExpression += "createPath(pts, inTans, outTans, " + theShape.closed + ")";

    return pointExpression;
}


buildUI(this);


function newCtrlGroup(pathInfo, ctrlGrpLayer) {
    //creates the vector group and sets the transform values.
    var xformExpressions = [];
    var newGroup = ctrlGrpLayer.property("Contents").addProperty("ADBE Vector Group");
    var info = getInfo(pathInfo);
    var theProp = info.pathProperty;
    newGroup.name = theProp.name + NAME_CONTROL_GROUP;
    var shapeGrp = theProp.parentProperty.parentProperty; //the "content" property of a shape is elided
    // hence two layers up
    var xformGrp = shapeGrp.property("ADBE Vector Transform Group");
    for (var t = 1; t <= xformGrp.length; t++) {
        //the transfroms property group is 1-indexed, hence property(t+1)
        newGroup.property("ADBE Vector Transform Group").property(t).setValue(xformGrp.property(t).value);
        xformExpressions.push("thisComp.layer('"+ ctrlGrpLayer.name + "').content.('"+ newGroup.name + "').transform." + xformGrp.property(t).name);
    }
    return {"group": newGroup, "xformXps": xformExpressions};
}
