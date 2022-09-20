// Expressions-n-Sliders
// Easily create expression control effects for variables in your expression.
// ============================================================================
// To automatically add controls for expressions, add a line to your expression
// like this:
//          //@Control [-type] [-value anything] [-effectname string] [-comp "target comp name"] [-targetlayer "target layer name"|index]
//
// the parameters are all optional:
//  -type
//      The type of control to create. One of:
//        -3dp -p3           --> 3DPoint
//        -an[gle]           --> Angle
//        -ch[eckbox]        --> Checkbox
//        -col[our] -col[or] --> Color
//        -dd -dr[opdown]    --> Dropdown
//        -ly -la[yer]       --> Layer
//        -pt -po[int]       --> Point
//        -sl[ider]          --> Slider
//      types can be terse, e.g. -co, -col, -colo or verbose,
//          e.g. - colour (proper spelling will work,
//          incorrect seppo spelling also acceptable)
//
//  -value anything
//      The default value for the control.
//      Can be a number, array, boolean, string or layer reference
//          the value given will be parsed to create the control
//          if the control type isn't given
//
//  -effectname string
//      A string that sets the name of the control effect. 
//      Can be any valid string.
//      If you want to include spaces in the effect name enclose it in quotes
//
//  -comp "target comp name"
//      If you want the effect to be created on a layer in a different comp
//          supply the name of the comp here.
//      If -comp is specified but not -layer the effect will be applied to
//          a layer with the same name as the current comp if it exists
//          (e.g. a precomp nested in an outer comp), or if that is not valid
//          the layer with the same index as the current layer, 
//          or if that is not valid, the first layer.
//      Comp names with spaces must be enclosed in quotes
//
//  -targetlayer "target layer name"|index
//      Supply the name or the index of the layer here if you want the
//          effect to be created on a different layer either in the current 
//          comp, or a different comp if -comp is specified.
//      Layer names with spaces must be enclosed in quotes
//      If the layer is not valid the effect will be created on the current layer




//      or a string that matches the control type, e.g. 3d, ang, co… (not case sensitive)
//  - Effect_Name - optional
//      The name the effect will be given in the layer's effect controls.
//      Underscores will be converted to spaces, so "Is_on_Fire" will create a control called "Is On Fire"
//  - variableName - optional
//      the name of the variable in the expression that will be controlled by the control effect
//  - layerID - optional
//      the id of the layer you want the effect on. This is any valid expression that returns a layer
//      To use layer names, put it in quotes, e.g. if the layerID is "foo" the expression will be
//      thisComp.layer("foo")
//      To use layer indexes, just put the index or an expression that returns an index, e.g.
//          - if the layerID is 1 the expression will be thisComp.layer(1)
//          - if the layerID is index-1 the expression will be thisComp.layer(index-1) and the effect will be put on the previous layer
//            similarly if the layerID is index+1 the effect will go on the next layer
//          - if the layerID is comp("anotherComp").layer("foo") then the control will go on the target layer
//            if that layer doesn't exist then the expression will be created, but it won't work.
//      if left off the controls will be placed on the layer with the original expression
//
//  e.g. if you add this line to your expression:
//      //@Control sl Funkiness_Value funk
//  the script will create an expression control effect on your layer called "Funkiness Value"
//  and replace the line in the expression with the text
//      const funk = thisLayer.effect("Funkiness Value")("slider");
//
//  The script will work on all selected properties, or if no properties are selected, it will
//  scan the current comp for any layers with expressions and apply to them all

// more: https://blob.pureandapplied.com.au
// license below

(function () {
    this.name = "expressions-n-sliders";
    //TODO: localise these bois
    var CONTROL_TYPES = {
        Point3D: { "matchName": "ADBE Point3D Control", "UIName": "3D Point", "effectName": "3D Point Control" },
        Angle: { "matchName": "ADBE Angle Control", "UIName": "Angle", "effectName": "Angle Control" },
        Checkbox: { "matchName": "ADBE Checkbox Control", "UIName": "Checkbox", "effectName": "Checkbox Control" },
        Color: { "matchName": "ADBE Color Control", "UIName": "Color", "effectName": "Color Control" },
        Dropdown: { "matchName": "ADBE Dropdown Control", "UIName": "Menu", "effectName": "Dropdown Menu Control" },
        Layer: { "matchName": "ADBE Layer Control", "UIName": "Layer", "effectName": "Layer Control" },
        Point: { "matchName": "ADBE Point Control", "UIName": "Point", "effectName": "Point Control" },
        Slider: { "matchName": "ADBE Slider Control", "UIName": "Slider", "effectName": "Slider Control" }
    }
    // turn "my_3d_point" to "my 3d point" in effect names
    var REPLACE_UNDERSCORES_IN_EFFECT_NAMES = true;
    // set to true to make variables lookLikeThis 
    // set to "false" if you want your variables to look_like_this, you goddamn freak
    var CAMELCASE = true;
    // the token you use to denote a control
    var CONTROL_MARKER = "@Control";

    function findLayer(theProperty) {
        var p = theProperty;
        var pa = theProperty.parentProperty;
        while (pa) {
            p = pa;
            pa = pa.parentProperty;
        }
        return p
    }

    function toCamelCase(str) {
        //turns "A string with spaces" into "aStringWithSpaces"
        if (str.match(/\w\s+\w/)) {
            // found internal spaces
            var TitleCaseNoSpaces = str.toLowerCase().split(' ').map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
                //lower the first letter
            }).join('');
            return TitleCaseNoSpaces.charAt(0).toLowerCase() + TitleCaseNoSpaces.slice(1);
        } else {
            // strip any leading trailing space, just in case
            return (str.match(/^\s*(.*)\s*$/)[1]);
        }
    }

    function findValueType(controlParams) {
        var valueString = controlParams.defaultValue;
        var theComp = app.project.activeItem;
        var ctrlValue;
        var noNaN = true;
        try {
            // match "[123.4]", "[-123 , 456 ]",  "[12.3, -123, 0]", "[12.3, -123, 0, -567]"
            var arrRgXp = /\[\s*(-*\s*[\d\.]+)[\s,]*(-*\s*[\d\.]*)[\s,]*(-*\s*[\d\.]*)[\s,]*(-*\s*[\d\.]*)\s*\]/
            var isArr = valueString.match(arrRgXp)
            if (isArr) {
                var varVal = [];
                for (var i = 0; i < 4 && noNaN; i++) {
                    if (isArr[i + 1]) {
                        ctrlValue = parseFloat(isArr[i].replace(/\s/g, ""));
                        noNaN = (!isNaN(ctrlValue));
                        if (noNaN) {
                            varVal[i] = ctrlValue
                        }
                    }
                }
                var arrayTypes = [
                    // choose control based on dimensions of value
                    null, //shouldn't happen
                    CONTROL_TYPES.Slider,
                    CONTROL_TYPES.Point,
                    CONTROL_TYPES.Point3D,
                    CONTROL_TYPES.Color
                ]
                return {
                    varValue: varVal,
                    controlType: arrayTypes[varVal.length]
                };
            }
            // catch edge case where a negative number written 
            // like "- 5" would return NaN with parseFloat()
            ctrlValue = parseFloat(valueString.replace(/\s/g, ""));
            if (!isNaN(ctrlValue)) {
                return {
                    varVal: ctrlValue,
                    controlType: CONTROL_TYPES.Slider
                };
            }

            var layerRgXp = /(thisComp|comp\s*\(\s*["']([^"^']+)["']\s*\))\s*\.\s*layer\s*\(\s*["']([^"^']+)["']\s*\)/;
            // for layer refs that use thisComp ,e.g.
            // thisComp.layer("layerName")
            // comp('compName').layer('layerName) ==>
            //[0]<match>[1]thisComp        [2]thisComp[3]        [4]layerName
            //[0]<match>[1]comp('compName')[2]        [3]compName[4]layerName
            isLayer = valueString.match(layerRgXp);
            if (isLayer) {
                var theProj = app.project;
                var ctrlComp;
                if (isLayer[1] === 'thisComp') {
                    ctrlComp = theComp.id;
                } else {
                    for (var c = 1; c < theProj.numItems; c++) {
                        if (theProj.item(c).name === isLayer[3] || theProj.item(c) instanceof CompItem) {
                            ctrlComp = theProj.item(c).id;
                        }
                    }
                }
                var lyrName = "";
                for (var lyr = 1; lyr <= theComp.numLayers && (!lyrName); lyr++) {
                    if (theComp.layer(lyr).name === isLayer[4]) {
                        ctrlValue = theComp.layer(lyr).index;
                    }
                }
                return {
                    varVal: [ctrlValue, ctrlComp],
                    controlType: CONTROL_TYPES.Layer
                }
            }

            var boolRgXp = /true|false/
            isBool = valueString.match(boolRgXp);
            if (isBool) {
                return {
                    varVal: isBool === "true",
                    controlType: CONTROL_TYPES.Checkbox
                }
            }
            // parse additional settings for controltype and value
            var param = controlParams.params;
            for (var p = 0; p < param.length; p++) {
                var paramIsValue = param[p].toLowerCase.match(/^(-value)\s+["']*(\w+)["']*/)
                if (paramIsValue) {
                    varVal = paramIsValue[2]
                }
                var controlTypeRegex = /-(3dp|p3|an|ch|col|ddw|dro|lyr|lay|pt|po|sl)/;
                var paramIsControlType = param[p].toLowerCase.match(controlTypeRegex);
                if (paramIsControlType) {
                    controlType = paramIsControlType[1]
                }
            }
            return {
                varVal: isBool === "true",
                controlType: CONTROL_TYPES.Checkbox
            }
            // TODO
            // return askUserWhatControl();
        } catch (e) {
            $.writeln(e)
        }
        return { controlType: null, varVal: null }
    }

    function makeControl(controlParams, theProperty) {
        // parse the expression line and create a control to match
        var controlInfo = findValueType(controlParams);
        var theLayer = findLayer(theProperty);
        var newControl = theLayer.property("ADBE Effect Parade").addProperty(controlInfo.controlType);
        newControl.name = controlParams.varName;
        newControl.value = controlParams.defaultValue;

    }

    function traversePropertyGroups(pGroup, inclusive) {
        // walks through property groups, returning properties
        // if inclusive is true, returns property groups as well
        if (pGroup) {
            var props = [];
            //alert(pGroup.numProperties);
            if (typeof pGroup.numProperties !== "undefined") {
                if (inclusive) {
                    props.push(pGroup);
                }
                for (var pp = 1; pp <= pGroup.numProperties; pp++) {
                    var newProps = traversePropertyGroups(
                        pGroup.property(pp),
                        inclusive
                    );
                    if (newProps.length) {
                        for (var i = 0; i < newProps.length; i++) {
                            props.push(newProps[i]);
                        }
                    }
                }
            } else {
                props.push(pGroup);
            }
            return props;
        }
    }

    function getPropertiesWithExpressionsFromLayer(theLayer) {
        var props = [];
        //only return selected properties. Kinda trivial but here for ease of use
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        if (newProps[i].expression) {
                            props.push(newProps[i]);
                        }
                    }
                }
            }
        }
        return props;
    }

    function getLayer(theComp, originLayer, offset) {
        // gets a layer in a comp given an original layer and the offset.
        // returns null if the layer doesn't exist
        var targetIndex = originLayer.index + offset;
        if (theComp.numLayers >= targetIndex && targetIndex > 0) {
            return theComp.layer(targetIndex);
        }
        return null;
    }

    function getComp(theCompName) {
        // returns a comp by name from the project
        var theProj = app.project;
        for (var i = 1; i < theProj.numItems; i++) {
            var theItem = theProj.item(i);
            if (theItem instanceof CompItem && theItem.name === theCompName) {
                return theItem;
            }
        }
        return null;
    }

    function parseTarget(layerTarget, theComp, currentLayer, propertyName) {
        if (theComp) {
            // returns an object containing an actual layer, and the expression for that layer
            var isALayerName = layerTarget.match(/^((["'])(.*)\2)/);
            //matches "foo bar" => '"foo bar"', '"foo bar"',', 'foo bar'
            if (isALayerName) {
                return {
                    "layer": theComp.layer(isALayerName[3]),
                    "expression": "comp('" + theComp.name + "').layer(" + isALayerName[1] + ")"
                };
            }
            var isAnIndex = layerTarget.match(/^(index)*\s*([+-])*\s*(\d+)/);
            // matches "index + 123" => 'index + 123,'index', '+','123'
            // matches "123" => '123','','','123'
            if (isAnIndex) {
                if (isAnIndex[1] === "index") {
                    var sign = (isAnIndex[2] === "+") ? 1 : -1;
                    var offset = sign * parseInt(isAnIndex[3]);
                    return {
                        "layer": getLayer(theComp, currentLayer, offset),
                        "expression": "comp('" + theComp.name + "').layer(" + isAnIndex[0] + ")"
                    };
                } else if (isAnIndex[3]) {
                    theIndex = parseInt(isAnIndex[3]);
                    return {
                        "layer": getLayer(theComp, theComp.layer(theIndex), 0),
                        "expression": "comp('" + theComp.name + "').layer(" + theIndex + ")"
                    }
                }
            }
            var isAComp = layerTarget.match(/[Cc]omp\((["'])(.*)\1\)\.[lL]ayer\((.*)\)/);
            // matches "comp('some comp').layer('foo')" => "comp('some comp').layer('foo')","'","some comp","'foo'"
            // matches "comp('some comp').layer(1)" => "comp('some comp').layer('foo')","'","some comp","1"
            // matches "comp('some comp').layer(index+1)" => "comp('some comp').layer('foo')","'","some comp","index+1"
            if (isAComp) {
                theComp = getComp(isAComp[2]);
                return parseTarget(isAComp[3], theComp, currentLayer, propertyName); // ooh funky
            }
        }
        alert("incorrect layer ID in expression\non layer " + currentLayer.name + "\nin property " + propertyName);
        return null
    }

    function createControlForExpression(theProperty, theComp) {
        if (theProperty.canSetExpression) {
            var newExpression = []
            var expressionSource = theProperty.expression.split("\n");
            for (var i = 0; i < expressionSource.length; i++) {
                var currentLine = expressionSource[i];
                // var regexMonster = new RegExp("\\s*\\/\\/\\s*" + CONTROL_MARKER + "\\s*(\\w+)(\\s*)(\\w+)*(\\s*)(\\w*)(\\s*)(.*)")
                var regexMonster = new RegExp("(var|let|const)*\\s+(\\w+)[=\\s]*([^;^/]*);*\\s*//\\s*" + CONTROL_MARKER + "\s*(.*$)")
                var needsControl = expressionSource[i].match(regexMonster);
                var params = needsControl[4].match(/-\w+\s*["'\w]*/g); //matches '-foo', '-foo 123' and '-foo "bar"' 
                if (needsControl) {
                    var controlParams = {
                        declaration: needsControl[1],
                        varName: needsControl[2],
                        defaultValue: needsControl[3],
                        params: params
                    };
                    var theControl = makeControl(controlParams, theProperty);
                    currentLine = theControl.expression;
                }
                newExpression[i] = currentLine;
            }
            theProperty.expression = newExpression.join("\n");
            return true;
        }
        return false
    }

    app.beginUndoGroup(this.name);
    var theComp = app.project.activeItem;
    if (theComp) {
        var theProps = theComp.selectedProperties
        for (var p = 0; p < theProps.length; p++) {
            createControlForExpression(theProps[p], theComp);
        }

    }
    app.endUndoGroup();
})()


// ========= LICENSE ============
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
