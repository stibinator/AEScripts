// @target aftereffects 
// eslint-disable-next-line
// includepath "./(lib)" 
// eslint-disable-next-line
// include  getproperties.jsx
/* global app, getPropertiesWithExpressionsFromLayer */

var proj = app.project;
var itms = proj.items;
var errs = 0;

try {
    for (var i = 1; i <= itms.length; i++){
        if (itms[i].typeName === "Composition"){
            var lyrs = itms[i].layers
            for (var lIndex = 1; lIndex <= lyrs.length; lIndex++){
                // eslint-disable-next-line no-undef
                var theProps = getPropertiesWithExpressionsFromLayer(lyrs[lIndex], false);
                // if (theProps.length > 0) {alert (lyrs[lIndex].name);}
                for (var p = 0; p < theProps.length; p++){
                    if (theProps[p].expressionError){
                        errs++;
                        theProps[p].expression = "";
                    }
                }
            }
        }
    }
    if (errs){
        alert("found and deleted" + errs + "expressions with errors");
    } else {
        alert("no errors found")
    }
} catch (e) { alert("error: " + e);}