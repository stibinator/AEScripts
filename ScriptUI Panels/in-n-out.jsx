// @target aftereffects
// In-n-out by stib ©2016 Stephen Dixon sequences layers in a variety of ways
// @target aftereffects

/* global app, Panel, CompItem, timeToCurrentFormat, currentFormatToTime, writeln */
(function (thisObj) {
    var scriptName = "In-n-Out";
    var methods = {moveLayers: 0, trimLayers: 1, moveKeys: 2}
    var fns = {
        linear: "linear",
        exponential: "exponential",
        sigmoid: "sigmoid",
        random: "random",
        equalOverlap: "equal overlap / gap",
    };
    var orders = {
        index: "index",
        random: "random",
        selection: "selection",
        current: "current order",
        alphabetical: "alphabetical",
    };

    var IN = 0;
    var OUT = 1;
    var inAndOut = ["in point", "out point"];

    function MyPrefs(prefList) {
        this.parsePref = function (val, prefType) {
            switch (prefType) {
                case "integer":
                    return parseInt(val, 10);
                case "float":
                    return parseFloat(val);
                case "bool":
                    return val === "true";
                default:
                    //string
                    return val;
            }
        };

        this.getPref = function (preference) {
            if (app.settings.haveSetting(scriptName, preference.name)) {
                this.prefs[preference.name] = this.parsePref(
                    app.settings.getSetting(scriptName, preference.name),
                    preference.prefType
                );
            } else {
                this.prefs[preference.name] = preference.factoryDefault;
            }
        };

        this.writePrefs = function (preference) {
            if (this.prefs[preference.name] !== preference.value) {
                app.settings.saveSetting(
                    scriptName,
                    preference.name,
                    preference.value
                );
            }
            this.prefs[preference.name] = preference.value;
        };

        this.prefs = {};
        for (var p = 0; p < prefList.length; p++) {
            this.getPref(prefList[p]);
        }
    }

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
            var g = function (n) {
                return Math.pow(1 / n, p);
            };
            return g(1 - x) / (g(x) + g(1 - x));
        }
        return 1;
    }

    // ----------- useful ------------------------
    function defaultFor(arg, val, replaceNullandEmptyVals) {
        if (replaceNullandEmptyVals) {
            return typeof arg !== "undefined" || arg === null || arg === []
                ? val
                : arg;
        }
        return typeof arg !== "undefined" ? arg : val;
    }

    // ----------- timeconversions--------------------
    function percentToHMSF(percent, acomp) {
        var theComp = defaultFor(acomp, app.project.activeItem);
        if (theComp instanceof CompItem) {
            return timeToCurrentFormat(
                (percent * theComp.duration) / 100,
                1 / theComp.frameDuration
            );
        }
        return false;
    }

    // ------------- find first and last selected key on a layer -------------
    function findFirstSelectedKey(theLayer) {
        var selectedProps = theLayer.selectedProperties;
        var keyTime = "unset";
        if (selectedProps) {
            for (var p = 0; p < selectedProps.length; p++) {
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

    function findLastSelectedKey(theLayer) {
        var selectedProps = theLayer.selectedProperties;
        var keyTime = "unset";
        if (selectedProps) {
            for (var p = 0; p < selectedProps.length; p++) {
                var selectedKeys = selectedProps[p].selectedKeys;
                if (selectedKeys) {
                    var kt = selectedProps[p].keyTime(
                        selectedKeys[selectedKeys.length - 1]
                    );
                    if (keyTime === "unset" || kt > keyTime) {
                        keyTime = kt;
                    }
                }
            }
        }
        return keyTime;
    }
    function findLongestLayerLength(theComp) {
        var longestLayer = 0;
        for (var i = 1; i <= theComp.numLayers; i++) {
            var theLayer = theComp.layer(i);
            longestLayer = Math.max(
                longestLayer,
                Math.abs(theLayer.outPoint - theLayer.inPoint)
            );
        }
        return longestLayer;
    }
    // ------------- getKeyAttributes -------------
    //in lieu of a proper keyframe object this returns all the details of a keyframe, given a property and key index.
    function getKeyAttributes(theProperty, keyIndex) {
        var theAttributes = {};
        theAttributes.keyTime = theProperty.keyTime(keyIndex);
        theAttributes.keyVal = theProperty.keyValue(keyIndex);
        theAttributes.canInterp =
            theProperty.isInterpolationTypeValid(
                KeyframeInterpolationType.BEZIER
            ) ||
            theProperty.isInterpolationTypeValid(
                KeyframeInterpolationType.HOLD
            ) ||
            theProperty.isInterpolationTypeValid(
                KeyframeInterpolationType.LINEAR
            );
        if (theAttributes.canInterp) {
            theAttributes.keyInInterpolationType =
                theProperty.keyInInterpolationType(keyIndex);
            theAttributes.keyOutInterpolationType =
                theProperty.keyOutInterpolationType(keyIndex);
            if (theAttributes.keyInInterpolationType) {
                theAttributes.keyInTemporalEase =
                    theProperty.keyInTemporalEase(keyIndex);
                theAttributes.keyOutTemporalEase =
                    theProperty.keyOutTemporalEase(keyIndex);
            }
        }
        //ignore spatial tangents for things like masks
        theAttributes.isSpatial =
            theProperty.isSpatial &&
            (theProperty.propertyValueType ==
                PropertyValueType.ThreeD_SPATIAL ||
                theProperty.propertyValueType ==
                    PropertyValueType.TwoD_SPATIAL);

        if (theAttributes.isSpatial) {
            theAttributes.keyInSpatialTangent =
                theProperty.keyInSpatialTangent(keyIndex);
            theAttributes.keyOutSpatialTangent =
                theProperty.keyOutSpatialTangent(keyIndex);
        }
        return theAttributes;
    }

    function makeKeyWithAttributes(theProperty, keyAttributes, keyTime) {
        //turns theAttributes from getKeyAttributes into a new keyframe
        if (theProperty.canVaryOverTime) {
            try {
                theProperty.setValueAtTime(keyTime, keyAttributes.keyVal);
                var newKeyIndex = theProperty.nearestKeyIndex(keyTime); //I wish Adobe would just make a keyframe class

                if (keyAttributes.canInterp) {
                    theProperty.setTemporalEaseAtKey(
                        newKeyIndex,
                        keyAttributes.keyInTemporalEase,
                        keyAttributes.keyOutTemporalEase
                    );
                    //important to do this after setting the temporal ease, or it turns all keyframes into bezier interpolation
                    theProperty.setInterpolationTypeAtKey(
                        newKeyIndex,
                        keyAttributes.keyInInterpolationType,
                        keyAttributes.keyOutInterpolationType
                    );
                }

                //theProperty.setInterpolationTypeAtKey(theAttributes.keyInInterpolationType-6412, theAttributes.keyOutInterpolationType-6412); //WTF Javascript?
                if (keyAttributes.isSpatial) {
                    theProperty.setSpatialTangentsAtKey(
                        newKeyIndex,
                        keyAttributes.keyInSpatialTangent,
                        keyAttributes.keyOutSpatialTangent
                    );
                }
                return newKeyIndex;
            } catch (e) {
                writeln(e);
                return false;
            }
        } else {
            return false;
        }
    }

    function moveKeys(theProperty, theKeys, theOffset) {
        var currentKeys = [];
        var theNewKeys = [];
        theKeys.sort(function (a, b) {
            return b - a;
        });
        for (var k = 0; k < theKeys.length; k++) {
            currentKeys.push(getKeyAttributes(theProperty, theKeys[k]));
            theProperty.removeKey(theKeys[k]);
        }
        for (var k = currentKeys.length - 1; k >= 0; k--) {
            theNewKeys.push(
                makeKeyWithAttributes(
                    theProperty,
                    currentKeys[k],
                    currentKeys[k].keyTime + theOffset
                )
            );
        }
        return theNewKeys; //indices fo the newly created keys
    }

    function crossFade(
        layerIndex,
        prevLayerIndex,
        fade,
        theComp,
        clampToOverlap
    ) {
        var incoming = theComp.layer(layerIndex);
        var outgoing = theComp.layer(prevLayerIndex);
        var overlap = outgoing.outPoint - incoming.inPoint;
        var fadeStart;
        if (fade.proportional) {
            fadeStart = outgoing.outPoint - (fade.amount / 100) * overlap;
        } else {
            fadeStart = outgoing.outPoint - fade.amount;
        }
        if (clampToOverlap) {
            fadeStart = Math.max(fadeStart, incoming.inPoint);
        }
        var fadeEnd = outgoing.outPoint + theComp.frameDuration;
        var opac = outgoing.transform.opacity;
        // var fadeStartValue = opac.valueAtTime(fadeStart, false);
        var maxOpac = 0;
        if (opac.numKeys === 0) {
            maxOpac = opac.valueAtTime(0, false);
        }
        for (var k = opac.numKeys; k >= 1; k--) {
            maxOpac = Math.max(maxOpac, opac.keyValue(k));
            opac.removeKey(k);
        }
        opac.setValueAtTime(fadeStart, maxOpac);
        opac.setValueAtTime(fadeEnd, 0);
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
        lastInOrOut,
        doXFade,
        xFadeProportional,
        xFadeAmt,
        clampFades
    ) {
        $.writeln(regularity);
        var shouldDoInPoints = doInPoints;
        if (!theComp) {
            alert("choose some layers in a comp");
        } else {
            var theLayers = theComp.selectedLayers;
            if (theLayers.length > 2) {
                switch (order) {
                    // --------- index----------
                    case orders.index:
                        theLayers.sort(function (a, b) {
                            return a.index - b.index;
                        });
                        break;
                    // ---------- random -------------
                    case orders.random:
                        theLayers.sort(function () {
                            return 1 - Math.random() * 2;
                        });
                        break;
                    // ---------- current -------------
                    case orders.current:
                        theLayers.sort(function (a, b) {
                            return a.inPoint - b.inPoint;
                        });
                        break;
                    // ---------- alphabetical -------------
                    case orders.alphabetical:
                        theLayers.sort(function (a, b) {
                            if (a.name === b.name) {
                                return 0;
                            }
                            return a.name > b.name ? -1 : 1;
                        });
                        break;
                }
                var numLayers = theLayers.length;
                var n = numLayers - 1; //just for readability
                var keysToMove = [];
                var newKeys = [];
                var currentFirstKey = [];

                if (method === methods.moveLayers) {
                    // -------- move layers --------
                    var layerLength =
                        theLayers[0].outPoint - theLayers[0].inPoint;
                    if ((firstInOrOut === OUT) & doInPoints) {
                        firstTime -= layerLength;
                    } else if ((firstInOrOut === IN) & !doInPoints) {
                        firstTime += layerLength;
                    }
                    layerLength = theLayers[n].outPoint - theLayers[n].inPoint;
                    if (
                        (lastInOrOut === OUT) &
                        doInPoints &
                        (ease !== fns.equalOverlap)
                    ) {
                        lastTime -= layerLength;
                    } else if (
                        (lastInOrOut === IN) &
                        (!doInPoints | (ease === fns.equalOverlap))
                    ) {
                        lastTime += layerLength;
                    }
                } else if (method === methods.moveKeys) {
                    // -------- move keys  --------
                    var keyDif =
                        findLastSelectedKey(theLayers[0]) -
                        findFirstSelectedKey(theLayers[0]);
                    if ((firstInOrOut === OUT) & doInPoints) {
                        firstTime -= keyDif;
                    } else if ((firstInOrOut === IN) & !doInPoints) {
                        firstTime += keyDif;
                    }

                    keyDif =
                        findLastSelectedKey(theLayers[n]) -
                        findFirstSelectedKey(theLayers[n]);
                    if ((lastInOrOut === OUT) & doInPoints) {
                        lastTime -= keyDif;
                    } else if ((lastInOrOut === IN) & !doInPoints) {
                        lastTime += keyDif;
                    }
                    for (var i = 0; i < numLayers; i++) {
                        var theLayer = theLayers[i];
                        var layerProps = [];
                        var selectedProps = theLayer.selectedProperties;
                        currentFirstKey[i] = findFirstSelectedKey(theLayer);
                        for (var p = 0; p < selectedProps.length; p++) {
                            var selectedKeys = selectedProps[p].selectedKeys;
                            layerProps.push({
                                prop: selectedProps[p],
                                keys: selectedKeys,
                            });
                        }
                        keysToMove[i] = layerProps;
                    }
                }

                var fDur = theComp.frameDuration;
                var timeSpan = lastTime - firstTime;
                var outOffset; //the offset between the layer's start time and its in-point, and its active duration
                var myTime = 0;
                var layerIndex = 0;
                var averageOverlap = 0;
                var totalLength = 0;
                var previousTime = 0;
                if (ease === fns.equalOverlap) {
                    for (var i = 0; i < numLayers; i++) {
                        totalLength += Math.abs(
                            theLayers[i].outPoint - theLayers[i].inPoint
                        );
                    }
                    averageOverlap = (totalLength - timeSpan) / (numLayers - 1);
                }
                for (var i = 0; i < numLayers; i++) {
                    layerIndex = i;
                    if (regularity < 1 && i > 0 && i < numLayers - 1) {
                        //always make the first and last keyframe on time
                        //although we're using the layer index as the input it doesn't have to be an integer. This adds some irregularity
                        //this took a while:
                        layerIndex =
                            i +
                            Math.random() *
                                (1 - regularity) *
                                ((n - 1) / n - (n - i) / (n - 1)); //randomise layers so they can start at any
                        // time between when the last layer could start and the next might, but make
                        // sure the first and last layers start on time.
                        // This should be simple, but we
                        // have to make sure that there isn't always a gap after the first layer or
                        // before the last; this spreads the randomness. Trust me, I worked it out on
                        // paper.
                    }

                    switch (ease) {
                        // -------- linear easing --------
                        case fns.linear:
                            myTime =
                                firstTime +
                                (timeSpan * layerIndex) / (numLayers - 1);
                            break;
                        // -------- exponential easing --------
                        case fns.exponential:
                            myTime =
                                firstTime +
                                timeSpan *
                                    exponential(
                                        layerIndex / (numLayers - 1),
                                        easePower
                                    );
                            break;
                        // -------- sigmoid easing --------
                        case fns.sigmoid:
                            myTime =
                                firstTime +
                                timeSpan *
                                    sigmoid(
                                        layerIndex / (numLayers - 1),
                                        easePower
                                    );
                            break;
                        // -------- equalOverlap easing --------
                        case fns.equalOverlap:
                            myTime = firstTime + previousTime;
                            if ((0 < i) & (i < numLayers - 1)) {
                                //add randomness according to the slider
                                myTime +=
                                    (1 - Math.random() * 2) *
                                    (1 - regularity) *
                                    averageOverlap;
                            }
                            previousTime +=
                                Math.abs(
                                    theLayers[i].outPoint - theLayers[i].inPoint
                                ) - averageOverlap;
                            break;
                        // -------- kompletelely randoz easing --------
                        default:
                            myTime = firstTime + timeSpan * Math.random();
                    }

                    var theLayer = theLayers[i];
                    switch (method) {
                        // ----------- move the layer ------------------
                        case 0:
                            var startOffset = 0;
                            if (shouldDoInPoints) {
                                if (theLayer.startTime) {
                                    startOffset =
                                        theLayer.inPoint - theLayer.startTime;
                                }
                                theLayer.startTime =
                                    Math.round(myTime / fDur) * fDur -
                                    startOffset; //round it to the nearest frame boundary
                            } else {
                                outOffset =
                                    theLayer.outPoint - theLayer.startTime;
                                theLayer.startTime =
                                    Math.round(myTime / fDur) * fDur -
                                    outOffset; //round it to the nearest frame boundary
                            }
                            break;

                        // ----------- trim the in or out point ------------------
                        case 1:
                            if (doInPoints) {
                                var currentOutPoint = theLayer.outPoint;
                                theLayer.inPoint = Math.min(
                                    Math.round(myTime / fDur) * fDur,
                                    currentOutPoint - fDur
                                );
                                theLayer.outPoint = currentOutPoint;
                            } else {
                                var currentInPoint = theLayer.inPoint;
                                theLayer.outPoint = Math.max(
                                    Math.round(myTime / fDur) * fDur,
                                    currentInPoint + fDur
                                );
                            }
                            break;

                        // ----------- move keys ------------------
                        case 2:
                            var keyOffset = myTime - currentFirstKey[i];
                            for (var p = 0; p < keysToMove[i].length; p++) {
                                if (keysToMove[i][p]) {
                                    newKeys.push({
                                        // layerIndex: theLayer.index,
                                        prop: keysToMove[i][p].prop,
                                        keyIndxs: moveKeys(
                                            keysToMove[i][p].prop,
                                            keysToMove[i][p].keys,
                                            keyOffset
                                        ),
                                    });
                                }
                            }
                            break;
                    }
                }
                for (var n = 0; n < newKeys.length; n++) {
                    // var theLayer = theComp.layer(newKeys[n].layerIndex);
                    var theProp = newKeys[n].prop;
                    for (var k = 0; k < newKeys[n].keyIndxs.length; k++) {
                        theProp.setSelectedAtKey(newKeys[n].keyIndxs[k], true);
                    }
                }
                //add crossfades after in and out points have veen set
                if (doXFade && (method === methods.moveLayers || method === methods.trimLayers)) {
                    var fadeTime = xFadeProportional
                        ? parseFloat(xFadeAmt, 10)
                        : currentFormatToTime(xFadeAmt, theComp.frameRate);
                    for (var i = 0; i < numLayers; i++) {
                        if (i < theLayers.length - 1) {
                            crossFade(
                                theLayers[i + 1].index,
                                theLayers[i].index,
                                {
                                    proportional: xFadeProportional,
                                    amount: fadeTime,
                                },
                                theComp,
                                clampFades
                            );
                        }
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------------------------------------
    // ---                                           GUI                                           ----
    // ------------------------------------------------------------------------------------------------

    function buildGUI(thisObj) {
        var theComp = app.project.activeItem || {
            duration: 60,
            frameDuration: 1 / 25,
            time: 0,
        };
        var theWindow =
            thisObj instanceof Panel
                ? thisObj
                : new Window("palette", scriptName, undefined, {
                      resizeable: true,
                  });

        // we need a comp for things like the sliders which are set based on the
        // duration, and for the frameDuration, so we'll set up a dummy object

        var mainGroup = theWindow.add(
            "group{orientation:'column',alignment:['left','top'],alignChildren:['left','top']" +
                "}"
        );

        //need orders and functions as an array for the dropdowns
        var orderList = [];
        for (i in orders) {
            orderList.push(orders[i]);
        }
        // var doTheStuff = mainGroup.add('button', undefined, 'Sequence layers');
        // -------- orderPanel -------------
        var orderPanel = mainGroup.add(
            'panel{text: "Sequence order", alignChildren: "left"}'
        );
        var orderGroup = orderPanel.add('group{orientation: "row"}');
        var orderDropDown = orderGroup.add(
            "dropDownList",
            undefined,
            orderList
        );

        // -------- methodPanel -------------
        var methodPanel = mainGroup.add(
            'panel{orientation:"row", text: "method" , alignChildren: "left"}'
        );
        var methodGrp = methodPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );

        var moveChckBox = methodGrp.add("radiobutton", undefined, "move");
        var trimChckBox = methodGrp.add("radiobutton", undefined, "trim");
        var keysChckBox = methodGrp.add("radiobutton", undefined, "keys");
        var methodCheckBoxes = [moveChckBox, trimChckBox, keysChckBox];
        var method = {
            name: "method",
            value: methods.moveLayers,
            choices: methodCheckBoxes,
        };
        // var slideChckBox = methodGrp.add('radiobutton', [undefined, undefined, 76, 16], 'slide');

        // -------- inoutPanel -------------
        var inoutPanel = mainGroup.add(
            'panel{orientation:"column", alignChildren: "left", text: "alignment"}',
            undefined
        );
        var inOrOut = inoutPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var inChckBox = inOrOut.add("radiobutton", undefined, "in points");
        var outChckBox = inOrOut.add("radiobutton", undefined, "out points");

        // -------- firstPanel -------------
        var firstPanel = mainGroup.add(
            'panel{alignChildren: "left", text:"first"}',
            undefined,
            "first"
        );
        var firstInOutCurrentGrp = firstPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var firstInOrOutDD = firstInOutCurrentGrp.add(
            "dropDownList",
            undefined,
            inAndOut
        );
        var firstBttn = firstInOutCurrentGrp.add(
            "button",
            undefined,
            "set to current"
        );
        var firstGrp = firstPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var firstSlider = firstGrp.add("slider", undefined, 0, 0, 100);
        var firstHmsfText = firstGrp.add(
            "editText",
            [undefined, undefined, 66, 28],
            percentToHMSF(0, theComp) || "00:00:00:00"
        );

        // -------- lastPanel -------------
        var lastPanel = mainGroup.add(
            'panel{alignChildren: "left", text:"last"}',
            undefined,
            "last"
        );
        var lastInOutCurrentGrp = lastPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var lastInOrOutDD = lastInOutCurrentGrp.add(
            "dropDownList",
            undefined,
            inAndOut
        );
        var lastBttn = lastInOutCurrentGrp.add(
            "button",
            undefined,
            "set to current"
        );
        var lastGrp = lastPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var lastSlider = lastGrp.add("slider", undefined, 100, 0, 100);
        var lastHmsfText = lastGrp.add(
            "editText",
            [undefined, undefined, 66, 28],
            percentToHMSF(100, theComp) || "00:00:10:00"
        );

        var functionList = [];
        for (var i in fns) {
            functionList.push(fns[i]);
        }
        // --------- easing panel ----------------
        var easingPanel = mainGroup.add(
            "panel{ alignChildren: 'left', text: 'easing'}",
            undefined,
            "easing"
        );
        var easingRow = easingPanel.add(
            "group{orientation:'column', alignChildren: 'left'}"
        );
        var fnTypeDropDown = easingRow.add(
            "dropDownList",
            undefined,
            functionList
        );
        var pwrGrp = easingPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var pwrSlider = pwrGrp.add("slider", undefined, 0.5, 0, 1);
        var pwrEdit = pwrGrp.add(
            "editText",
            [undefined, undefined, 66, 28],
            "" + pwrSlider.value
        );

        // -------- regularityPanel -------------
        var regularityPanel = mainGroup.add(
            'panel{alignChildren: "left", text: "regularity"}',
            undefined,
            "regularity"
        );
        var regularityGrp = regularityPanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var regularitySlider = regularityGrp.add(
            "slider",
            undefined,
            100,
            -200,
            100
        );
        var regularityEdit = regularityGrp.add(
            "editText",
            [undefined, undefined, 66, 28],
            "100"
        );
        regularitySlider.edit = regularityEdit;
        regularityEdit.slider = regularitySlider;
        regularitySlider.invokeRealTime = true;

        // -------- crossfadePanel -------------
        var crossFadePanel = mainGroup.add(
            'panel{alignChildren: "left"}',
            undefined,
            "cross fade"
        );
        var addXFadeGrp = crossFadePanel.add("group");
        var crossFadeChkBx = addXFadeGrp.add(
            "checkbox",
            undefined,
            "add crossfade"
        );
        var percentRdio = addXFadeGrp.add(
            "radiobutton",
            undefined,
            "% overlap"
        );
        var framesRdio = addXFadeGrp.add("radiobutton", undefined, "time");
        var crossFadeGrp = crossFadePanel.add(
            "group{orientation:'row',  alignChildren:'left'}"
        );
        var crossFadeSlider = crossFadeGrp.add(
            "slider",
            undefined,
            100,
            0,
            100
        );
        var crossFadeEdit = crossFadeGrp.add(
            "editText",
            [undefined, undefined, 66, 28],
            ""
        );
        var clampFadesChkBx = crossFadePanel.add(
            "checkbox",
            undefined,
            "clamp fades to overlap"
        );
        crossFadeSlider.edit = crossFadeEdit;
        crossFadeEdit.slider = crossFadeSlider;
        crossFadeSlider.invokeRealTime = false;

        // slider sizes
        orderDropDown.size =
            firstInOrOutDD.size =
            lastInOrOutDD.size =
            fnTypeDropDown.size =
            crossFadeSlider.size =
            pwrSlider.size =
            regularitySlider.size =
            firstSlider.size =
            lastSlider.size =
                {
                    width: 140,
                    height: 10,
                };
        // checkbox sizes
        moveChckBox.size =
            trimChckBox.size =
            keysChckBox.size =
            inChckBox.size =
            outChckBox.size =
            crossFadeChkBx.size =
                {
                    width: 70,
                    height: 20,
                };

        // text box and button sizes
        firstHmsfText.size =
            lastHmsfText.size =
            pwrEdit.size =
            regularityEdit.size =
            crossFadeEdit.size =
            firstBttn.size =
            lastBttn.size =
            crossFadeChkBx.size =
                {
                    width: 80,
                    height: 22,
                };
        // panel sizes
        orderPanel.size =
            methodPanel.size =
            inoutPanel.size =
                {
                    width: 264,
                    height: 40,
                };
        orderPanel.size.height = 50;

        theWindow.preferredSize = "width: -1, height: -1";
        theWindow.alignChildren = ["left", "top"];
        theWindow.margins = [10, 10, 10, 10];

        var prefs = new MyPrefs([
            {
                name: "firstInOrOutDDselection",
                factoryDefault: IN,
                prefType: "integer",
            },
            {
                name: "lastInOrOutDDselection",
                factoryDefault: OUT,
                prefType: "integer",
            },
            {
                name: "inChckBoxvalue",
                factoryDefault: true,
                prefType: "bool",
            },
            {
                name: "method",
                factoryDefault: 0,
                prefType: "integer",
            },
            {
                name: "pwrSlidervalue",
                factoryDefault: 0.5,
                prefType: "float",
            },
            {
                name: "fnTypeDropDownselection",
                factoryDefault: 1,
                prefType: "integer",
            },
            {
                name: "orderDropDownselection",
                factoryDefault: 0,
                prefType: "integer",
            },
            {
                name: "crossFadeChkBx",
                factoryDefault: false,
                prefType: "bool",
            },
            {
                name: "crossFadeSlider",
                factoryDefault: 0,
                prefType: "float",
            },
            {
                name: "percentRdio",
                factoryDefault: true,
                prefType: "bool",
            },
            {
                name: "clampFadesChkBx",
                factoryDefault: true,
                prefType: "bool",
            },
        ]);
        firstInOrOutDD.name = "firstInOrOutDDselection";
        lastInOrOutDD.name = "lastInOrOutDDselection";
        fnTypeDropDown.name = "fnTypeDropDownselection";
        inChckBox.name = "inChckBoxvalue";
        regularitySlider.name = "regularitySliderValue";
        orderDropDown.name = "orderDropDownselection";
        pwrSlider.name = "pwrSlidervalue";
        crossFadeChkBx.name = "crossFadeChkBx";
        crossFadeSlider.name = "crossFadeSlider";
        percentRdio.name = "percentRdio";
        clampFadesChkBx.name = "clampFadesChkBx";

        inChckBox.value = prefs.prefs[inChckBox.name];
        pwrSlider.value = prefs.prefs[pwrSlider.name];
        regularitySlider.value = prefs.prefs[regularitySlider.name];
        method.value = prefs.prefs[method.name];
        crossFadeChkBx.value = prefs.prefs[crossFadeChkBx.name];
        crossFadeSlider.value = prefs.prefs[crossFadeSlider.name];
        percentRdio.value = prefs.prefs[percentRdio.name];
        framesRdio.value = !percentRdio.value;
        clampFadesChkBx.value = prefs.prefs[clampFadesChkBx.name];
        firstInOrOutDD.selection = prefs.prefs[firstInOrOutDD.name];
        lastInOrOutDD.selection = prefs.prefs[lastInOrOutDD.name];
        fnTypeDropDown.selection = prefs.prefs[fnTypeDropDown.name];
        orderDropDown.selection = prefs.prefs[orderDropDown.name];

        methodCheckBoxes[method.value].value = true;
        firstSlider.value = 0;
        lastSlider.value = 100;
        firstSlider.textBox = firstHmsfText;
        lastSlider.textBox = lastHmsfText;
        firstHmsfText.slider = firstSlider;
        lastHmsfText.slider = lastSlider;
        updateHMSFEdit = function (theSlidr) {
            //update the edit box
            theSlidr.textBox.text = percentToHMSF(theSlidr.value, theComp);
        };
        firstSlider.onChanging = lastSlider.onChanging = function () {
            updateHMSFEdit(this);
        };

        updateHMSFEdit(firstSlider);
        updateHMSFEdit(lastSlider);

        firstHmsfText.onChange = lastHmsfText.onChange = function () {
            //parse the user input
            try {
                var parsedTime = currentFormatToTime(
                    this.text,
                    theComp.frameRate
                );
                //propogate it to the slider
                this.slider.value = (parsedTime / theComp.duration) * 100;

                //normalise the value back to the editbox
                this.text = timeToCurrentFormat(parsedTime, theComp.frameRate);
                doTheThings();
            } catch (e) {
                writeln(e);
                this.text = timeToCurrentFormat(theComp.duration, 25);
                this.slider.value = theComp.duration;
            }
        };

        lastSlider.onChange = firstSlider.onChange = function () {
            doTheThings();
        };

        moveChckBox.onChange = function () {
            prefs.writePrefs({
                name: this.name,
                value: this.value,
            });
            doTheThings();
        };

        orderDropDown.onChange =
            firstInOrOutDD.onChange =
            lastInOrOutDD.onChange =
                function () {
                    prefs.writePrefs({
                        name: this.name,
                        value: this.selection.index,
                    });
                    doTheThings();
                };

        fnTypeDropDown.onChange = function () {
            if (fnTypeDropDown.selection.index === 0) {
                pwrSlider.value = 0.5;
                pwrEdit.value = "1";
            }
            prefs.writePrefs({
                name: this.name,
                value: this.selection.index,
            });
            doTheThings();
        };
        //convert slider position into useful values for the functions

        firstBttn.onClick = function () {
            theComp = app.project.activeItem;
            if (!theComp) {
                firstHmsfText.text = "No Comp!";
            } else {
                //propogate it to the slider
                firstSlider.value = (theComp.time / theComp.duration) * 100;

                //update the other slider if there are conflicts
                lastSlider.value = Math.max(
                    firstSlider.value,
                    lastSlider.value
                );

                //propogate the value to the editbox
                firstHmsfText.text = percentToHMSF(firstSlider.value);
                doTheThings();
            }
        };

        lastBttn.onClick = function () {
            theComp = app.project.activeItem;
            if (!theComp) {
                // alert('no comp is active');
                lastHmsfText.text = "No Comp!";
            } else {
                //propogate it to the slider
                lastSlider.value = (theComp.time / theComp.duration) * 100;

                //update the other slider if there are conflicts
                firstSlider.value = Math.min(
                    firstSlider.value,
                    lastSlider.value
                );

                //propogate the value to the editbox
                lastHmsfText.text = percentToHMSF(lastSlider.value);
                doTheThings();
            }
        };

        //These functions map linear slider values to more useful values for the functions
        const sliderPower = 0.5;

        function mapSliderToVal(n) {
            return n > 0.999 //deal with 1 / 0 issues
                ? 1000
                : Math.max(0, Math.pow(1 / (1 - n) - 1, sliderPower));
        }

        function mapEditToVal(n) {
            return 1 - 1 / (Math.pow(n, 1 / sliderPower) + 1);
        }

        pwrEdit.onChange = function () {
            if (fnTypeDropDown.selection.index === 0) {
                fnTypeDropDown.selection = 1;
            }
            pwrSlider.value = mapEditToVal(parseFloat(pwrEdit.text, 10));
            doTheThings();
        };

        pwrSlider.onChange = function () {
            if (fnTypeDropDown.selection.index === 0) {
                fnTypeDropDown.selection = 1;
            }
            pwrEdit.text =
                "" + Math.round(mapSliderToVal(pwrSlider.value) * 1000) / 1000;
            doTheThings();
        };

        regularityEdit.onChange = crossFadeEdit.onchange = function () {
            var val = parseFloat(this.text, 10);
            if (!isNaN(val)) {
                this.slider.value = val;
                doTheThings();
            }
        };

        regularitySlider.onChange = crossFadeSlider.onChange = function () {
            this.edit.text = "" + Math.round(this.value * 10) / 10;
            if (this.invokeRealTime) {
                doTheThings();
            }
        };

        trimChckBox.onClick =
            moveChckBox.onClick =
            keysChckBox.onClick =
                function () {
                    firstInOrOutDD.visible = lastInOrOutDD.visible =
                        !trimChckBox.value;
                    if (keysChckBox.value) {
                        inChckBox.text = "first key";
                        outChckBox.text = "last key";
                    } else {
                        inChckBox.text = "in points";
                        outChckBox.text = "out points";
                    }
                    method.value =
                        methods.moveLayers * moveChckBox.value + 
                        methods.trimLayers * trimChckBox.value +
                        methods.moveKeys * keysChckBox.value; //0 if move, 1 if trim, 2 if keys
                    prefs.writePrefs({
                        name: method.name,
                        value: method.value,
                    });
                };

        inChckBox.onClick = outChckBox.onClick = function () {
            if (!trimChckBox.value) {
                doTheThings();
            }
        };

        function updateCfText() {
            var roundedVal = Math.round(crossFadeSlider.value * 10) / 10;
            theComp = app.project.activeItem;

            crossFadeEdit.text =
                "" +
                (percentRdio.value
                    ? roundedVal + " %"
                    : timeToCurrentFormat(
                          (crossFadeSlider.value / 100) *
                              findLongestLayerLength(theComp),
                          app.project.activeItem.frameRate
                      ));
        }
        updateCfText();

        function updateCFSlider() {
            try {
                if (framesRdio.value) {
                    crossFadeSlider.value =
                        (100 *
                            currentFormatToTime(
                                crossFadeEdit.text,
                                app.project.activeItem.frameRate,
                                true
                            )) /
                        findLongestLayerLength;
                    crossFadeEdit.text = timeToCurrentFormat(
                        crossFadeSlider.value,
                        app.project.activeItem.frameRate
                    );
                } else {
                    crossFadeSlider.value = parseFloat(crossFadeEdit.text);
                }
            } catch (e) {
                updateCfText();
            }
        }
        crossFadeEdit.onChange = function () {
            updateCFSlider();
            doTheThings();
        };
        percentRdio.onClick =
            crossFadeChkBx.onClick =
            framesRdio.onClick =
            crossFadeSlider.onChange =
            clampFadesChkBx.onClick =
                function () {
                    updateCfText();
                    prefs.writePrefs({
                        name: this.name,
                        value: this.value,
                    });
                    if (crossFadeChkBx.value) {
                        doTheThings();
                    }
                };

        // --------- Call down the hoo-hah -------
        function doTheThings() {
            theComp = app.project.activeItem;
            if (theComp) {
                app.beginUndoGroup("in-n-out sequence layers");
                sequenceLayers(
                    orderDropDown.selection.text, //order
                    (theComp.duration * firstSlider.value) / 100, //firstTime
                    (theComp.duration * lastSlider.value) / 100, //lastTime
                    fnTypeDropDown.selection.text, //ease
                    mapSliderToVal(pwrSlider.value), //easePower
                    regularitySlider.value / 100, //regularity
                    inChckBox.value, //doInPoints
                    theComp, //theComp
                    method.value, //method
                    firstInOrOutDD.selection.index, //firstInOrOut
                    lastInOrOutDD.selection.index,
                    crossFadeChkBx.value,
                    percentRdio.value,
                    crossFadeEdit.text,
                    clampFadesChkBx.value
                );
                app.endUndoGroup();
            }
        }

        if (theWindow instanceof Window) {
            theWindow.center();
            theWindow.show();
        } else {
            theWindow.layout.layout(true);
        }
    }

    // var prefs = new PrefsFile("in-n-out");

    buildGUI(thisObj);
})(this);
