// @target aftereffects
(function(){var theComp = app.project.activeItem;
    if (theComp ){
        app.beginUndoGroup("zeroSelectedProperties")
        for(var i =0; i < theComp.selectedLayers.length; i++){
            theProps = theComp.selectedLayers[i].selectedProperties;
            for (var p = 0; p <theProps.length; p++){
                var prop = theProps[p];
                var canSetZero = true;
                switch (prop.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL: 
                    case PropertyValueType.ThreeD: 
                    var currentValue = prop.valueAtTime(theComp.time, false);
                    var newValue = [0, 0, 0];
                    break;
                    case PropertyValueType.TwoD_SPATIAL: 
                    case PropertyValueType.TwoD: 
                    var currentValue = prop.valueAtTime(theComp.time, false);
                    var newValue = [0, 0];
                    break;
                    case PropertyValueType.OneD: 
                    var currentValue = prop.valueAtTime(theComp.time, false);
                    var newValue = 0;
                    break;
                    case PropertyValueType.COLOR: 
                    var currentValue = prop.valueAtTime(theComp.time, false);
                    var newValue = [0, 0, 0, 0];
                    break;
                    case PropertyValueType.CUSTOM_VALUE : 
                    case PropertyValueType.MARKER: 
                    case PropertyValueType.LAYER_INDEX: 
                    case PropertyValueType.MASK_INDEX: 
                    case PropertyValueType.SHAPE: 
                    case PropertyValueType.TEXT_DOCUMENT: 
                    case PropertyValueType.NO_VALUE: 
                    default:
                    canSetZero = false;
                    break;
                    
                }
                if (canSetZero && (! prop.expression || ! prop.expressionEnabled)){
                    if (prop.numKeys){
                        for (k = 1; k<= prop.numKeys; k++){
                            prop.setValueAtTime(prop.keyTime(k), prop.valueAtTime(prop.keyTime(k), false) - currentValue);
                        }
                    } else {
                        prop.setValueAtTime(newValue);
                    }
                    var cvString = currentValue.toString();
                        prop.expression = "value + " + ((currentValue.length > 1)? "["+ cvString +"]" : cvString);
                        prop.expressionEnabled = true;
                    
                }
            }
        }
        app.endUndoGroup();
    }
})()
