/* eslint-disable no-redeclare */
// In-n-out by stib ©2016 Stephen Dixon sequences layers in a variety of ways
/* @target aftereffects */
// @includepath "../(lib)/"
// @include jsextras.jsx
// @include copyproperties-makekey.jsx 
/* global app, Panel, CompItem, timeToCurrentFormat, currentFormatToTime, writeln, getKeyAttributes,
makeKeyWithAttributes */

var scriptName = "pureandAppliedInNOut";

var fns = {
    linear: 'linear',
    exponential: 'exponential',
    sigmoid: 'sigmoid',
    random: 'random'
};
var orders = {
    index: 'index',
    random: 'random',
    selection: 'selection',
    current: 'current order',
    alphabetical: 'alphabetical',
};

function myPrefs(prefList) {

    this.parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
                return parseInt(val, 10);
            case "float":
                return parseFloat(val);
            case "bool":
                return (val === "true")
            default: //string
                return val
        }
    }

    this.getPref = function(preference) {
        if (app.settings.haveSetting(scriptName, preference.name)) {
            this.prefs[preference.name] = this.parsePref(app.settings.getSetting(scriptName, preference.name), preference.prefType);
        } else {
            this.prefs[preference.name] = preference.factoryDefault;
        }
    }

    this.writePrefs = function(preference) {
        if (this.prefs[preference.name] !== preference.value) {
            app.settings.saveSetting(scriptName, preference.name, preference.value)
        }
        this.prefs[preference.name] = preference.value;
    }

    this.prefs = {};
    for (var p in prefList) {
        this.getPref(prefList[p]);
    }
}

var IN = 0;
var OUT = 1;
var inAndOut = ["in point", "out point"];
// ----------------- Maths fun -----------------------------
function exponential(x, p) {
    //return a value 0-1 based on the exponential function, of order p
    if (x <= 0) {
        return 0;
    }

    if (x >= 1) {
        return 1;
    }

    return Math.pow(x, p);
}

function sigmoid(x, p) {
    // sigmoid function for 0<=x<=1 returns a variable s-shaped slope where 0<=y<=1,
    // and that always passes through [0,0] and [1,1] took a while to figure out
    // see https://www.desmos.com/calculator/40sqnfw8hf

    if (x <= 0) {
        return 0;
    }
    if (x >= 1) {
        return 1;
    }

    if (p > 0) {
        var g = function(n) {
            return (Math.pow(1 / n, p));
        };
        return g(1 - x) / (g(x) + g(1 - x));
    }
    return 1;
}

// ----------- useful ------------------------
function defaultFor(arg, val, replaceNullandEmptyVals) {
    if (replaceNullandEmptyVals) {
        return ((typeof(arg) !== 'undefined') || (arg === null) || (arg === [])) ?
            val :
            arg;
    }
    return (typeof(arg) !== 'undefined') ?
        arg :
        val;
}

// ----------- timeconversions--------------------
function percentToHMSF(percent, acomp) {
    var theComp = defaultFor(acomp, app.project.activeItem);
    if (theComp instanceof CompItem) {
        return timeToCurrentFormat(percent * theComp.duration / 100, 1 / theComp.frameDuration);
    }
    return false;
}

function findFirstKey(theLayer) {
    var selectedProps = theLayer.selectedProperties;
    var keyTime = "unset";
    if (selectedProps) {
        for (var p in selectedProps) {
            var selectedKeys = selectedProps[p].selectedKeys;
            if (selectedKeys) {
                var kt = selectedProps[p].keyTime(selectedKeys[0]);
                if (keyTime === "unset" || kt < keyTime) {
                    keyTime = kt;
                }
            }
        }
    }
    return keyTime;
}

function findLastKey(theLayer) {
    var selectedProps = theLayer.selectedProperties;
    var keyTime = "unset";
    if (selectedProps) {
        for (var p in selectedProps) {
            var selectedKeys = selectedProps[p].selectedKeys;
            if (selectedKeys) {
                var kt = selectedProps[p].keyTime(selectedKeys[selectedKeys.length - 1]);
                if (keyTime === "unset" || kt > keyTime) {
                    keyTime = kt;
                }
            }
        }
    }
    return keyTime;
}

function moveKeys(theProperty, theKeys, theOffset) {
    var currentKeys = [];
    var theNewKeys = [];
    theKeys.sort(function(a, b) {
        return (b - a)
    })
    for (var k in theKeys) {
        currentKeys.push(getKeyAttributes(theProperty, theKeys[k]));
        theProperty.removeKey(theKeys[k]);
    }
    for (k in currentKeys) {
        theNewKeys.push (makeKeyWithAttributes(theProperty, currentKeys[k], currentKeys[k].keyTime + theOffset));
    }
    return theNewKeys; //indices fo the newly created keys
}

//here comes the hoo-ha
function sequenceLayers(
    order,
    firstTime,
    lastTime,
    ease,
    easePower,
    regularity,
    doInPoints,
    theComp,
    method,
    firstInOrOut,
    lastInOrOut) {
    var shouldDoInPoints = doInPoints;
    if (!theComp) {
        alert('choose some layers in a comp');
    } else {
        var theLayers = theComp.selectedLayers;
        // if no layers are selected do all of them, lightwave style.
        // if (theLayers.length === 0) {
        //   theLayers = [];
        //   // what were Adobe thinking when they didn't make comp.layers a proper array?
        //   for (i = 1; i <= theComp.layers.length; i++) {
        //     theLayers[i] = theComp.layers[i];
        //   }
        // }
        if (theLayers.length > 2) {
            switch (order) {
                case orders.index:
                    theLayers
                        .sort(function(a, b) {
                            return (a.index - b.index);
                        });
                    break;
                case orders.random:
                    theLayers
                        .sort(function() {
                            return (1 - Math.random() * 2);
                        });
                    break;
                case orders.current:
                    theLayers
                        .sort(function(a, b) {
                            return (a.inPoint - b.inPoint);
                        });
                    break;
                case orders.alphabetical:
                    theLayers
                        .sort(function(a, b) {
                            if (a.name === b.name) {
                                return 0;
                            }
                            return (a.name > b.name) ?
                                -1 :
                                1;
                        });
                    break;
            }
            var numLayers = theLayers.length;
            var n = numLayers - 1; //just for readability
            var keysToMove = [];
            var currentFirstKey = [];


            if (method === 0) {
                var layerLength = theLayers[0].outPoint - theLayers[0].inPoint;
                if (firstInOrOut === OUT & doInPoints) {
                    firstTime -= layerLength;
                } else if (firstInOrOut === IN & !doInPoints) {
                    firstTime += layerLength;
                }
                layerLength = theLayers[n].outPoint - theLayers[n].inPoint;
                if (lastInOrOut === OUT & doInPoints) {
                    lastTime -= layerLength;
                } else if (lastInOrOut === IN & !doInPoints) {
                    lastTime += layerLength;
                }
            } else if (method === 2) {
                var keyDif = findLastKey(theLayers[0]) - findFirstKey(theLayers[0]);
                if (firstInOrOut === OUT & doInPoints) {
                    firstTime -= keyDif;
                } else if (firstInOrOut === IN & !doInPoints) {
                    firstTime += keyDif;
                }

                keyDif = findLastKey(theLayers[n]) - findFirstKey(theLayers[n]);
                if (lastInOrOut === OUT & doInPoints) {
                    lastTime -= keyDif;
                } else if (lastInOrOut === IN & !doInPoints) {
                    lastTime += keyDif;
                }
                for (var i = 0; i < numLayers; i++) {
                    var theLayer = theLayers[i];
                    var layerProps = [];
                    var selectedProps = theLayer.selectedProperties;
                    currentFirstKey[i] = findFirstKey(theLayer);
                    for (var p in selectedProps) {
                        var selectedKeys = selectedProps[p].selectedKeys;
                        layerProps.push({
                            prop: selectedProps[p],
                            keys: selectedKeys
                        })
                    }
                    keysToMove[i] = layerProps;
                }
            }

            var fDur = theComp.frameDuration;
            var timeSpan = lastTime - firstTime;
            var startOffset;
            var outOffset; //the offset between the layer's start time and its in-point, and its active duration
            var myTime = 0;
            var layerIndex = 0;
            var newKeys = [];
            for (var i = 0; i < numLayers; i++) {
                layerIndex = i;
                if (regularity < 1 && i > 0 && i < (numLayers - 1)) { //always make the first and last keyframe on time
                    //although we're using the layer index as the input it doesn't have to be an integer. This adds some irregularity
                    //this took a while:
                    layerIndex = i + Math.random() * (1 - regularity) * (((n - 1) / n) - (n - i) / (n - 1)); //randomise layers so they can start at any
                    // time between when the last layer could start and the next might, but make
                    // sure the first and last layers start on time this should be simple, but we
                    // have to make sure that there isn't always a gap after the first layer or
                    // before the last this spreads the randomness. Trust me, I worked it out on
                    // paper.
                }

                switch (ease) {
                    case fns.linear:
                        myTime = firstTime + timeSpan * layerIndex / (numLayers - 1);
                        break;
                    case fns.exponential:
                        myTime = firstTime + timeSpan * exponential(layerIndex / (numLayers - 1), easePower);
                        break;
                    case fns.sigmoid:
                        myTime = firstTime + timeSpan * sigmoid(layerIndex / (numLayers - 1), easePower);
                        break;
                    default: //kompletelely randoz
                        myTime = firstTime + timeSpan * Math.random();
                }

                var theLayer = theLayers[i];
                switch (method) {
                    case 0:
                        //move the layer
                        if (shouldDoInPoints) {
                            startOffset = theLayer.inPoint - theLayer.startTime;
                            theLayer.startTime = Math.round(myTime / fDur) * fDur - startOffset; //round it to the nearest frame boundary
                        } else {
                            outOffset = theLayer.outPoint - theLayer.startTime;
                            theLayer.startTime = Math.round(myTime / fDur) * fDur - outOffset; //round it to the nearest frame boundary
                        }
                        break;
                    case 1: //trim the in or out point
                        if (doInPoints) {
                            var currentOutPoint = theLayer.outPoint;
                            theLayer.inPoint = Math.min(Math.round(myTime / fDur) * fDur, currentOutPoint - fDur);
                            theLayer.outPoint = currentOutPoint;
                        } else {
                            var currentInPoint = theLayer.inPoint;
                            theLayer.outPoint = Math.max(Math.round(myTime / fDur) * fDur, currentInPoint + fDur);
                        }
                        break;
                    case 2: //move keys
                        
                        var keyOffset = myTime - currentFirstKey[i];
                        for (var p in keysToMove[i]) {
                            if (keysToMove[i][p]) {
                                newKeys[i] = moveKeys(keysToMove[i][p].prop, keysToMove[i][p].keys, keyOffset);
                            }
                        }
                        break;
                }
            }
            for (var i in newKeys){
                for (var k in newKeys[i]){
                    //make new keys
                }
            }
        }
    }
}

//------------------------------------------------------------------------------------------------
//---                                           GUI                                           ----
//------------------------------------------------------------------------------------------------

function buildGUI(thisObj) {
    var theComp = (app.project.activeItem || {
        duration: 60,
        frameDuration: 1 / 25,
        time: 0
    });
    var theWindow = (thisObj instanceof Panel) ?
        thisObj :
        new Window('pavarte', thisObj.scriptTitle, undefined, {
            resizeable: true
        });

    // we need a comp for things like the sliders which are set based on the
    // duration, and for the frameDuration, so we'll set up a dummy object

    var mainGroup = theWindow.add("group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']" +
        '}');


    //need orders and functions as an array for the dropdowns
    var orderList = [];
    for (i in orders) {
        orderList.push(orders[i]);
    }
    // var doTheStuff = mainGroup.add('button', undefined, 'Sequence layers');
    var orderPanel = mainGroup.add('panel{text: "Sequence order"}');
    var orderGroup = orderPanel.add('group{orientation: "row"}');
    var orderDropDown = orderGroup.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], orderList);
    orderGroup.add('staticText', [undefined, undefined, 96, 16]);
    var trimMovePanel = mainGroup.add('panel{orientation:"row", text: "method"}')
    var trimOrMove = trimMovePanel.add("group{orientation:'row'}");

    var moveChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 75, 16], 'move');
    var trimChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 75, 16], 'trim');
    var keysChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 75, 16], 'keys');
    var methodCheckBoxes = [moveChckBox, trimChckBox, keysChckBox];
    var method = {
        name: "method",
        value: 0,
        choices: methodCheckBoxes
    };
    // var slideChckBox = trimOrMove.add('radiobutton', [undefined, undefined, 76, 16], 'slide');

    var inoutPanel = mainGroup.add('panel{orientation:"column", alignChildren: "left", text: "alignment"}', undefined);
    var inOrOut = inoutPanel.add("group{orientation:'row'}", );
    var inChckBox = inOrOut.add('radiobutton', [undefined, undefined, 75, 16], 'in points');
    var outChckBox = inOrOut.add('radiobutton', [undefined, undefined, 161, 16], 'out points');

    var firstPanel = mainGroup.add('panel', undefined, 'first');
    var firstInOutCurrentGrp = firstPanel.add("group{orientation:'row'}");
    var firstInOrOutDD = firstInOutCurrentGrp.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], inAndOut);
    var firstBttn = firstInOutCurrentGrp.add('button', undefined, 'set to current');
    var firstGrp = firstPanel.add("group{orientation:'row'}");
    var firstSlider = firstGrp.add('slider', undefined, 0, 0, 100);
    var firstHmsfText = firstGrp.add('editText', [
        undefined, undefined, 66, 28
    ], percentToHMSF(0, theComp) || "00:00:00:00");

    var lastPanel = mainGroup.add('panel', undefined, 'last');
    var lastInOutCurrentGrp = lastPanel.add("group{orientation:'row'}");
    var lastInOrOutDD = lastInOutCurrentGrp.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], inAndOut);
    var lastBttn = lastInOutCurrentGrp.add('button', undefined, 'set to current');
    var lastGrp = lastPanel.add("group{orientation:'row'}");
    var lastSlider = lastGrp.add('slider', undefined, 100, 0, 100);
    var lastHmsfText = lastGrp.add('editText', [
        undefined, undefined, 66, 28
    ], percentToHMSF(100, theComp) || "00:00:10:00");

    var functionList = [];
    for (var i in fns) {
        functionList.push(fns[i]);
    }
    var easingPanel = mainGroup.add("panel{ alignChildren: 'left', text: 'easing'}", undefined, 'easing');
    var easingRow = easingPanel.add("group{orientation:'column', alignChildren: 'left'}");
    var fnTypeDropDown = easingRow.add('dropDownList', [
        undefined, undefined, 140, undefined
    ], functionList);
    var pwrGrp = easingPanel.add("group{orientation:'row'}");
    var pwrSlider = pwrGrp.add('slider', undefined, 0.5, 0, 1);
    var pwrEdit = pwrGrp.add('editText', [undefined, undefined, 66, 28], '' + pwrSlider.value);

    var regularityPanel = mainGroup.add('panel', undefined, 'regularity');
    var regularityGrp = regularityPanel.add("group{orientation:'row'}");
    var regularitySlider = regularityGrp.add('slider', undefined, 100, -200, 100);
    regularityGrp.add('staticText', [undefined, undefined, 66, 28]);
    pwrSlider.size = {
        width: 170,
        height: 10
    };
    regularitySlider.size = firstSlider.size = lastSlider.size = {
        width: 170,
        height: 10
    };
    theWindow.preferredSize = 'width: -1, height: -1';
    theWindow.alignChildren = ['left', 'top'];
    theWindow.margins = [10, 10, 10, 10];


    var prefs = new myPrefs(
        [{
                name: "firstInOrOutDDselection",
                factoryDefault: IN,
                prefType: "integer"
            },
            {
                name: "lastInOrOutDDselection",
                factoryDefault: OUT,
                prefType: "integer"
            },
            {
                name: "inChckBoxvalue",
                factoryDefault: true,
                prefType: "bool"
            },
            {
                name: "method",
                factoryDefault: 0,
                prefType: "integer"
            },
            {
                name: "pwrSlidervalue",
                factoryDefault: 0.5,
                prefType: "float"
            },
            {
                name: "fnTypeDropDownselection",
                factoryDefault: 1,
                prefType: "integer"
            },
            {
                name: "orderDropDownselection",
                factoryDefault: 0,
                prefType: "integer"
            }
        ]
    );
    firstInOrOutDD.name = "firstInOrOutDDselection";
    lastInOrOutDD.name = "lastInOrOutDDselection";
    fnTypeDropDown.name = "fnTypeDropDownselection";
    inChckBox.name = "inChckBoxvalue";

    orderDropDown.name = "orderDropDownselection";
    pwrSlider.name = "pwrSlidervalue";

    inChckBox.value = prefs.prefs[inChckBox.name];
    pwrSlider.value = prefs.prefs[pwrSlider.name];

    method.value = prefs.prefs[method.name];
    methodCheckBoxes[method.value].value = true;

    firstInOrOutDD.selection = prefs.prefs[firstInOrOutDD.name];
    lastInOrOutDD.selection = prefs.prefs[lastInOrOutDD.name];
    fnTypeDropDown.selection = prefs.prefs[fnTypeDropDown.name];
    orderDropDown.selection = prefs.prefs[orderDropDown.name];

    firstSlider.value = 0;
    lastSlider.value = 100;
    firstSlider.textBox = firstHmsfText;
    lastSlider.textBox = lastHmsfText;
    firstHmsfText.slider = firstSlider;
    lastHmsfText.slider = lastSlider;
    firstSlider.onChanging = lastSlider.onChanging = function() {
        //update the edit box
        this.textBox.text = percentToHMSF(lastSlider.value, theComp);
    }

    lastSlider.onChange =
        firstSlider.onChange =
        function() {
            doTheThings();
        }

    regularitySlider.onChange =
        moveChckBox.onChange =
        function() {
            prefs.writePrefs({
                name: this.name,
                value: this.value
            })
            doTheThings();
        }

    orderDropDown.onChange =
        firstInOrOutDD.onChange =
        lastInOrOutDD.onChange =
        function() {
            prefs.writePrefs({
                name: this.name,
                value: this.selection.index
            })
            doTheThings();
        }

    fnTypeDropDown.onChange = function() {
        if (fnTypeDropDown.selection.index === 0) {
            pwrSlider.value = 0.5;
            pwrEdit.value = '1';
        }
        prefs.writePrefs({
            name: this.name,
            value: this.selection.index
        })
        doTheThings();
    };

    firstHmsfText.onChange = lastHmsfText.onChange = function() {
        //parse the user input
        try {
            var parsedTime = currentFormatToTime(this.text, theComp.frameRate);
            //propogate it to the slider
            this.slider.value = parsedTime / theComp.duration * 100;

            //normalise the value back to the editbox
            this.text = timeToCurrentFormat(parsedTime, theComp.frameRate);
            doTheThings();
        } catch (e) {
            writeln(e);
            this.text = timeToCurrentFormat(theComp.duration, 25);
            this.slider.value = theComp.duration;
        }
    };
    //convert slider position into useful values for the functions


    firstBttn.onClick = function() {
        theComp = app.project.activeItem;
        if (!theComp) {
            firstHmsfText.text = "No Comp!"
        } else {
            //propogate it to the slider
            firstSlider.value = theComp.time / theComp.duration * 100;

            //update the other slider if there are conflicts
            lastSlider.value = Math.max(firstSlider.value, lastSlider.value);

            //propogate the value to the editbox
            firstHmsfText.text = percentToHMSF(firstSlider.value);
            doTheThings();
        }
    };

    lastBttn.onClick = function() {
        theComp = app.project.activeItem;
        if (!theComp) {
            // alert('no comp is active');
            lastHmsfText.text = "No Comp!"
        } else {
            //propogate it to the slider
            lastSlider.value = theComp.time / theComp.duration * 100;

            //update the other slider if there are conflicts
            firstSlider.value = Math.min(firstSlider.value, lastSlider.value);

            //propogate the value to the editbox
            lastHmsfText.text = percentToHMSF(lastSlider.value);
            doTheThings();
        }
    };

    //These functions map linear slider values to more useful values for the functions
    const sliderPower = 0.5;

    function mapSliderToVal(n) {
        return (n > 0.999) ? //deal with 1 / 0 issues
            1000 :
            Math.max(0, Math.pow(1 / (1 - n) - 1, sliderPower));
    }

    function mapEditToVal(n) {
        return 1 - 1 / (Math.pow(n, 1 / sliderPower) + 1);
    }


    pwrEdit.onChange = function() {
        if (fnTypeDropDown.selection.index === 0) {
            fnTypeDropDown.selection = 1;
        }
        pwrSlider.value = mapEditToVal(parseFloat(pwrEdit.text, 10));
        doTheThings();
    };

    pwrSlider.onChange = function() {

        if (fnTypeDropDown.selection.index === 0) {
            fnTypeDropDown.selection = 1;
        }
        pwrEdit.text = '' + Math.round(mapSliderToVal(pwrSlider.value) * 1000) / 1000;
        doTheThings();
    };



    trimChckBox.onClick =
        moveChckBox.onClick =
        keysChckBox.onClick =
        function() {
            firstInOrOutDD.visible =
                lastInOrOutDD.visible =
                (!trimChckBox.value);
            if (keysChckBox.value) {
                inChckBox.text = "first key";
                outChckBox.text = "last key";
            } else {
                inChckBox.text = "in points";
                outChckBox.text = "out points";
            }
            method.value = 1 * trimChckBox.value + 2 * keysChckBox.value; //0 if move, 1 if trim, 2 if keys
            prefs.writePrefs({
                name: method.name,
                value: method.value
            })
        }

    inChckBox.onClick =
        outChckBox.onClick = function() {
            if (!trimChckBox.value) {
                doTheThings();
            }
        };


    function doTheThings() {
        theComp = app.project.activeItem;
        if (theComp) {
            app.beginUndoGroup('in-n-out sequence layers');
            sequenceLayers(
                orderDropDown.selection.text, //order
                theComp.duration * firstSlider.value / 100, //firstTime
                theComp.duration * lastSlider.value / 100, //lastTime
                fnTypeDropDown.selection.text, //ease
                mapSliderToVal(pwrSlider.value), //easePower
                regularitySlider.value / 100, //regularity
                inChckBox.value, //doInPoints
                theComp, //theComp
                method.value, //method
                firstInOrOutDD.selection.index, //firstInOrOut
                lastInOrOutDD.selection.index //lastInOrOut
            );
            app.endUndoGroup();
        }
    }

    if (theWindow instanceof Window) {
        theWindow.center();
        theWindow.show();
    } else {
        theWindow
            .layout
            .layout(true);
    }
}

// var prefs = new PrefsFile("in-n-out");
buildGUI(this);