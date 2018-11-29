//freeze expressions at first frame
//freezes expressions on layers

function freezeExpression(theProperty) {
    writeLn(theProperty);
    if (theProperty.expression) {
        theProperty.setValueAtTime(app.project.activeItem.time, theProperty.valueAtTime(app.project.activeItem.time, false));
        theProperty.expressionEnabled = false;
    }
}

function traverseProperties(propertyGroup) {
    if (propertyGroup) {
        //alert(propertyGroup.numProperties);
        if (propertyGroup.numProperties) {
            for (var pp = 1; pp <= propertyGroup.numProperties; pp++) {
                traverseProperties(propertyGroup.property(pp));
                //freezeExpression(propertyGroup);
            }
        } else {
            freezeExpression(propertyGroup[0]);
        }
    }
}

function freezeAllExpressions() {
    var scriptName = "Freeze Expressions";
    var proj = app.project;
    var selectedProps = app.project.activeItem.selectedProperties;
    // change this to true if you want to leave locked layers untouched.
    writeLn(app.project.activeItem);
    var unlockedOnly = false;
    if (proj) {
        if (selectedProps[0] !== undefined) {
            writeLn(selectedProps);
            traverseProperties(selectedProps);
        } else {
            if (app.project.activeItem !== null) {
                var theLayers = app.project.activeItem.selectedLayers;
                if (theLayers.length === 0) {
                    theLayers = app.project.activeItem.layers;
                }
                if (theLayers !== null) {
                    app.beginUndoGroup(scriptName);
                    var total_number = theLayers.length;
                    for (var i = 0; i < total_number; i++) {

                        if (!(unlockedOnly && theLayers[i].locked)) {
                            for (var p = 1; p <= theLayers[i].numProperties; p++) {
                                if (theLayers[i].property(p)) {
                                    propertyGroup = theLayers[i].property(p);
                                    traverseProperties(propertyGroup);
                                }
                            }

                        }
                    }
                }
            } else {
                alert("Please select a comp to use this script", scriptName);
            }
            app.endUndoGroup();
        }
    } else {
        alert("Please open a project first to use this script, you silly rabbit", scriptName);
    }
}

freezeAllExpressions();
