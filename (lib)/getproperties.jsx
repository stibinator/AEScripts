function getIndividualProperties(theProps) {
    var props = [];
    for (var p = 0; p <= theProps.length; p++) {
        if (theProps[p]) {
            propertyGroup = theProps[p];
            var newProps = traversePropertyGroups(propertyGroup);
            if (newProps.length) {
                for (var i = 0; i < newProps.length; i++) {
                    props.push(newProps[i]);
                }
            }
        }
    }
    return props;
}

function traversePropertyGroups(pGroup) {
    if (pGroup) {
        var props = [];
        //alert(pGroup.numProperties);
        if (typeof pGroup.numProperties !== 'undefined') {

            for (var pp = 1; pp <= pGroup.numProperties; pp++) {
                var newProps = traversePropertyGroups(pGroup.property(pp));
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

function getPropertiesFromLayer(theLayer, selectedOnly) {
    var props = [];
    //only return selected properties. Kinda trivial but here for ease of use
    if (selectedOnly) {
        for (var j = 0; j < theLayer.selectedProperties.length; j++) {
            props.push(theLayer.selectedProperties[j]);
        }
    } else {
      //walk the whole property tree
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        props.push(newProps[i]);
                    }
                }
            }
        }
    }
    return props;
}

function getPropertiesWithExpressionsFromLayer(theLayer, selectedOnly) {
    var props = [];
    //only return selected properties. Kinda trivial but here for ease of use
    if (selectedOnly) {
        for (var j = 0; j < theLayer.selectedProperties.length; j++) {
            if (theLayer.selectedProperties[j].expression) {
                props.push(theLayer.selectedProperties[j]);
            }
        }
    } else {
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        if (newProps[i].expression) {
                            props.push(newProps[i]);
                        }
                    }
                }
            }
        }
    }
    return props;
}
