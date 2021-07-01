// @target aftereffects
var prop = app.project.activeItem.selectedProperties[0];
alert(getPropID(prop));

function getPropID(prop){
    var id = prop.name + prop.propertyIndex;
    var pParent = prop.parentProperty;
    while (pParent) {
        var pName = pParent.name;
        if (pParent.propertyIndex){pName = pName + "-" + pParent.propertyIndex}
        id = pName + "." + id;
        pParent  = pParent.parentProperty;
    }
    return(id);
}