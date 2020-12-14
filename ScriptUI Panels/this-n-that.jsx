//@target aftereffects
//this-n-that ©2016 Stephen Dixon
//
//selects nth layers
/* global app, Panel */

var scriptName = 'this-n-that';
var logicTypes = {
    COUNT_SELECTED: 'count selected only',
    XOR: 'xor (difference)',
    OR: 'or (add)',
    AND: 'and (intersect)',
    SET: 'set'
}



function buildUI(thisObj) {
    var logicList = [logicTypes.SET, logicTypes.AND, logicTypes.OR, logicTypes.XOR, logicTypes.COUNT_SELECTED];
    var pal;

    if (thisObj instanceof Panel) {
        pal = thisObj;
    } else {
        pal = new Window('palette', scriptName, undefined, {
            resizeable: true
        });
    }

    if (pal !== null) {
        var prefs = new myPrefs(
            [{
                    name: "layerMode",
                    factoryDefault: true,
                    prefType: "bool"
                },
                {
                    name: "keyMode",
                    factoryDefault: false,
                    prefType: "bool"
                },
                {
                    name: "nth",
                    factoryDefault: 2,
                    prefType: "integer"
                },
                {
                    name: "offset",
                    factoryDefault: 1,
                    prefType: "integer"
                },
                {
                    name: "randoz",
                    factoryDefault: false,
                    prefType: "bool"
                },
                {
                    name: "logic",
                    factoryDefault: 2,
                    prefType: "int"
                }
            ])
        var modeGrp = pal.add('group');
        modeGrp.orientation = 'row';
        var layerMode = modeGrp.add("radiobutton", undefined, "Layers");
        layerMode.name = "layerMode";
        var keyMode = modeGrp.add("radiobutton", undefined, "Keys");
        var bttnGrp = pal.add('group');
        bttnGrp.orientation = 'row';
        var selectBttn = bttnGrp.add('button', undefined, 'select');
        var deselectBttn = bttnGrp.add('button', undefined, 'deselect');
        var selectionModePanel = pal.add('panel', undefined, 'select:');
        selectionModePanel.orientation = 'column';
        selectionModePanel.alignChildren = 'left';
        selectionModePanel.size = {
            width: 180,
            height: undefined
        };
        var nthGrp = selectionModePanel.add('group');
        nthGrp.orientation = 'row';
        nthGrp.minimumSize = {
            width: 120,
            height: undefined
        };
        nthGrp.add('staticText', undefined, 'select every');
        var nthText = nthGrp.add('editText', undefined, '');
        nthText.name = "nth";
        var suffixTxt = nthGrp.add('staticText', undefined, '');
        nthText.minimumSize = {
            width: 30,
            height: undefined
        };
        suffixTxt.minimumSize = {
            width: 30,
            height: undefined
        };
        var offsetGrp = selectionModePanel.add('group');
        offsetGrp.minimumSize = {
            width: 120,
            height: undefined
        };
        offsetGrp.add('staticText', undefined, 'starting at');
        var offsetText = offsetGrp.add('editText', undefined, '');
        offsetText.name = "offset";
        offsetText.minimumSize = {
            width: 30,
            height: undefined
        };
        var randomChckBx = selectionModePanel.add('checkbox', undefined, 'random');
        randomChckBx.name = "randoz"
        var logicGrp = pal.add('group');
        logicGrp.orientation = 'row';
        logicGrp.add('staticText', undefined, 'logic');
        var logicDDown = logicGrp.add('dropDownList', undefined, logicList);
        logicDDown.name = "logic";

        // work in progress
        // var iconButtnGrp = pal.add('group');
        // iconButtnGrp.orientation = 'column';
        // var row1 = iconButtnGrp.add('group');
        // row1.orientation = 'row';
        // var row2 = iconButtnGrp.add('group');
        // row2.orientation = 'row';
        // var row3 = iconButtnGrp.add('group');
        // row3.orientation = 'row';
        // var adjustBtn = row1.add("button", undefined, 'adjust');
        // var footageBtn = row1.add("button", undefined, 'footage');
        // var imageBtn = row2.add("button", undefined, 'image');
        // var shapeBtn = row2.add("button", undefined, 'shape');
        // var solidBtn = row3.add("button", undefined, 'solid');
        // var textBtn = row3.add("button", undefined, 'text');

        //----------fill default values---------------------
        offsetText.text = prefs.prefs[offsetText.name];
        nthText.text = prefs.prefs[nthText.name];
        logicDDown.selection = prefs.prefs[logicDDown.name];
        layerMode.value = prefs.prefs[layerMode.name];
        keyMode.value = !(prefs.prefs[layerMode.name]);
        randomChckBx.value = prefs.prefs[randomChckBx.name];

        //-------- callbacks ----------------------------- 

        layerMode.onClick =
            randomChckBx.onClick =
            function() {
                prefs.setPref(this.name, this.value);
            }

        keyMode.onClick = function() {
            prefs.setPref(layerMode.name, (!(keyMode.value)));
        }

        logicDDown.onChange = function() {
            prefs.setPref(this.name, this.selection.index);
        }

        offsetText.onChange = function() {
            var num = ((Math.abs(parseInt(offsetText.text, 10)) || 1));
            offsetText.text = '' + num;
            prefs.setPref(offsetText.name, num)
        };

        nthText.onChange = function() {
            var val = (Math.abs(parseInt(nthText.text, 10)) || 1);
            nthText.text = '' + val;
            prefs.setPref(nthText.name, val);
            suffixTxt.text = getOrdinalSuffix(val);
        }

        suffixTxt.text = getOrdinalSuffix(prefs[nthText.name]);


        selectBttn.onClick = function() {
            doTheThings(true);
        }
        deselectBttn.onClick = function() {
            doTheThings(false);
        };
        // adjustBtn.onclick = selectLayerType("adjust");
        // footageBtn.onclick = selectLayerType("footage");
        // imageBtn.onclick = selectLayerType("image");
        // shapeBtn.onclick = selectLayerType("shape");
        // solidBtn.onclick = selectLayerType("solid");
        // textBtn.onclick = selectLayerType("text");
    }

    // get ui values and do the stuff. Called by the select/deselect buttons.
    function doTheThings(sense) {
        var nth = (parseInt(nthText.text, 10) || 1);
        var offset = (parseInt(offsetText.text, 10) || 1);
        var logic = logicDDown.selection.text;
        var randoz = randomChckBx.value;
        if (layerMode.value) {
            selectLayers(sense, nth, offset, logic, randoz);
        } else {
            selectKeys(sense, nth, offset, logic, randoz);
        }
    }

    //actually build the GUI

    if (pal instanceof Window) {
        pal.center();
        pal.show();
    } else {
        pal.layout.layout(true);
    }
}

buildUI(this);

function findNth(i, nth, offset, sense) {
    // returns true if the index is the nth
    // so much off-by-one!  
    var result;
    //setting sense to false inverts the output
    if (nth === 1) { //de/select em all
        return ((i >= offset - 1) && sense);
    }

    //selection based on index
    result = ((i >= offset - 1) && (i - (offset - 1)) % nth === 0);
    return (sense === result);
}

function randomizeIndexes(theIndexes, offset) {
    var nonRandomIndexes = theIndexes.slice(0, offset - 1);
    var randomIndexes = theIndexes.slice(offset - theIndexes.length - 1)
    randomIndexes = shuffle(randomIndexes);
    return nonRandomIndexes.concat(randomIndexes);
}

function makeLayerIndexArr(theComp, randoz, logic, offset) {
    //returns an array of integers, being the indexes of the layers we're selecting from
    var i;
    var theIndexes = [];
    //put the indices into an array.
    if (logic === logicTypes.COUNT_SELECTED) {
        for (i = 0; i < theComp.selectedLayers.length; i++) {
            theIndexes.push(theComp.selectedLayers[i].index);
        }
    } else {
        for (i = 1; i <= theComp.numLayers; i++) {
            theIndexes.push(i);
        }
    }
    //..so that we can sort them for the random function
    if (randoz) {
        theIndexes = randomizeIndexes(theIndexes, offset)
    } else {
        theIndexes = theIndexes.sort(function(a, b) {
            return (a - b)
        });
    }
    return theIndexes;
}

function makeKFIndexArr(theProperty, randoz, logic, offset) {
    //returns an array of integers, being the indexes of the keyframes we're selecting from
    var i;
    var theIndexes = [];
    //put the indices into an array.
    if (logic === logicTypes.COUNT_SELECTED) {
        theIndexes = theProperty.selectedKeys;
    } else {
        for (i = 1; i <= theProperty.numKeys; i++) {
            theIndexes.push(i);
        }
    }
    //..so that we can sort them for the random function
    if (randoz) {
        theIndexes = randomizeIndexes(theIndexes, offset)
    } else {
        theIndexes = theIndexes.sort(function(a, b) {
            return (a - b)
        });
    }
    return theIndexes;
}


function selectLayers(sense, nth, offset, logic, randoz) {
    // do the hoo-hah
    var isNth;
    var isSelxd;
    var theIndexes = [];
    app.beginUndoGroup('this-n-that');
    try {
        theIndexes = makeLayerIndexArr(app.project.activeItem, randoz, logic, offset);
        var numIndexes = theIndexes.length;

        for (var i = 0; i < numIndexes; i++) {
            // is the layer on the list?
            isNth = findNth(i, nth, offset, sense);
            // isNth = isNth & (originalLayers[theIndexes[i]].index >= offset);
            // apply the logic
            isSelxd = app.project.activeItem.layer(theIndexes[i]).selected;
            if (logic === logicTypes.SET || logic === logicTypes.COUNT_SELECTED) {
                app.project.activeItem.layer(theIndexes[i]).selected = isNth;
            } else if (logic === logicTypes.AND) {
                app.project.activeItem.layer(theIndexes[i]).selected = isNth & isSelxd;
            } else if (logic === logicTypes.OR) {
                app.project.activeItem.layer(theIndexes[i]).selected = isNth || isSelxd;
            } else if (logic === logicTypes.XOR) {
                app.project.activeItem.layer(theIndexes[i]).selected = (!(isNth & isSelxd)) & (isNth || isSelxd);
            }
        }

    } catch (e) {
        alert(e);
    }
    app.endUndoGroup();
}


function selectKeys(sense, nth, offset, logic, randoz) {
    // do the hoo-hah
    var theProps = app.project.activeItem.selectedProperties;
    var isNth;
    var isSelxd;
    var theIndexes = [];

    app.beginUndoGroup('this-n-that');
    try {
        for (var p = 0; p < theProps.length; p++) {
            var theProp = theProps[p];
            theIndexes = makeKFIndexArr(theProp, randoz, logic, offset);
            var numIndexes = theIndexes.length;
            var selectedKFs = theProp.selectedKeys;
            for (var i = 0; i < numIndexes; i++) {
                // is the layer on the list?
                isNth = findNth(i, nth, offset, sense);
                // apply the logic
                isSelxd = includes(selectedKFs, theIndexes[i]);
                if (logic === logicTypes.SET || logic === logicTypes.COUNT_SELECTED) {
                    theProp.setSelectedAtKey(theIndexes[i], isNth);
                } else if (logic === logicTypes.AND) {
                    theProp.setSelectedAtKey(theIndexes[i], (isNth & isSelxd));
                } else if (logic === logicTypes.OR) {
                    theProp.setSelectedAtKey(theIndexes[i], (isNth || isSelxd));
                } else if (logic === logicTypes.XOR) {
                    theProp.setSelectedAtKey(theIndexes[i], (!(isNth & isSelxd)) & (isNth || isSelxd));
                }
            }
        }
    } catch (e) {
        alert(e);
    }
    app.endUndoGroup();
}



function myPrefs(prefList) {
    this.prefs = {};

    this.parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
                return parseInt(val, 10);
            case "float":
                return parseFloat(val);
            case "bool":
                return (val === "true")
            default:
                return val
        }
    }

    this.getPref = function(preference) {
        if (app.settings.haveSetting(scriptName, preference.name)) {
            this.prefs[preference.name] = this.parsePref(app.settings.getSetting(scriptName, preference.name), preference.prefType);
        } else {
            this.prefs[preference.name] = preference.factoryDefault;
            this.setPref(preference.name, preference.factoryDefault);
        }
    }

    this.setPref = function(prefname, value) {
        if (this.prefs[prefname] !== value) {
            this.prefs[prefname] = value;
            app.settings.saveSetting(scriptName, prefname, value);
        }
    }


    for (var p = 0; p < prefList.length; p++) {
        this.getPref(prefList[p]);
    }
}

function shuffle(array) {
    var tmp, current, top = array.length;

    if (top)
        while (--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = array[current];
            array[current] = array[top];
            array[top] = tmp;
        }
    return array;
}

function getOrdinalSuffix(val) {
    var teens = val % 100;
    var ones = val % 10;
    var suffixTxt = '';
    if ((teens < 20 & teens > 10) || (ones > 3) || (ones === 0)) {
        suffixTxt = 'th';
    } else if (ones === 1) {
        suffixTxt = 'st';
    } else if (ones === 2) {
        suffixTxt = 'nd';
    } else if (ones === 3) {
        suffixTxt = 'rd';
    }
    return suffixTxt;
    // pal.layout.layout(recalculate);
}


function includes(arr, element) {
    var isInArr = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == element) {
            isInArr = true
        }
    }
    return isInArr;
}