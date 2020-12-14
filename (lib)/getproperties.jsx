// eslint-disable-next-line no-unused-vars
function getIndividualProperties(theProps) {
    var props = [];
    for (var p = 0; p <= theProps.length; p++) {
        if (theProps[p]) {
            var propertyGroup = theProps[p];
            var newProps = traversePropertyGroups(propertyGroup, false);
            if (newProps.length) {
                for (var i = 0; i < newProps.length; i++) {
                    props.push(newProps[i]);
                }
            }
        }
    }
    return props;
}

function traversePropertyGroups(pGroup, inclusive) {
    if (pGroup) {
        var props = [];
        //alert(pGroup.numProperties);
        if (typeof pGroup.numProperties !== 'undefined') {
            if (inclusive) {
                props.push(pGroup)
            }
            for (var pp = 1; pp <= pGroup.numProperties; pp++) {
                var newProps = traversePropertyGroups(pGroup.property(pp), inclusive);
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

// eslint-disable-next-line no-unused-vars
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
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, false);
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

// eslint-disable-next-line no-unused-vars
function getPropertiesAndGroupsFromLayer(theLayer, selectedOnly) {
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
                props.push(theLayer.property(p));
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, true);
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

// eslint-disable-next-line no-unused-vars
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
    }
    return props;
}

// eslint-disable-next-line no-unused-vars
function getPropertiesWithKeyFramesFromLayer(theLayer, selectedOnly) {
    var props = [];
    //only return selected properties. Kinda trivial but here for ease of use
    if (selectedOnly) {
        for (var j = 0; j < theLayer.selectedProperties.length; j++) {
            if (theLayer.selectedProperties[j].numKeys > 0) {
                props.push(theLayer.selectedProperties[j]);
            }
        }
    } else {
        for (var p = 1; p <= theLayer.numProperties; p++) {
            if (theLayer.property(p)) {
                var propertyGroup = theLayer.property(p);
                var newProps = traversePropertyGroups(propertyGroup, false);
                if (newProps.length) {
                    for (var i = 0; i < newProps.length; i++) {
                        if (newProps[i].numKeys > 0) {
                            if (newProps[i].name != "Marker") {
                                props.push(newProps[i]);
                            }
                        }
                    }
                }
            }
        }
    }
    return props;
}