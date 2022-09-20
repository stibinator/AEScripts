function Point() {
    // point object. 
    // Can take either one array as an argument, or up to three scalar values
    // e.g. p = new Point(anArray);
    // or p = new Point(myX, myY, myZ);
    // individual components are available as 
    // p.x, p.y or p.z
    // to convert to Array use p.toArr()
    var dimensions = ['x', 'y', 'z'];
    var inputComponents = [];
    if (Array.isArray(arguments[0])) {
        inputComponents = arguments[0]
    } else if (
        typeof arguments[0].x !== "undefined" &&
        typeof arguments[0].y !== "undefined") {
        inputComponents[0] = arguments[0].x;
        inputComponents[1] = arguments[0].y;
        inputComponents[2] = arguments[0].z;
    } else {
        inputComponents = arguments;
    }
    if (inputComponents.length < 2) {
        throw ("Point needs at least two dimensions")
    }
    for (var d = 0; d < inputComponents.length && d < dimensions.length; d++) {
        this[dimensions[d]] = inputComponents[d]; // assigns x, y, and z properties
        this[d] = inputComponents[d]; //also 
    }
    this.toArr = function () {
        var outputAr = [];
        for (var d = 0; d < dimensions.length && typeof this[dimensions[d]] !== "undefined"; d++) {
            outputAr[d] = this[dimensions[d]];
        }
        return outputAr
    }
}
//create a Point from an array
var anArr = [1, 2, 3]
var p = new Point(anArr)
$.writeln("From Array:\nx: " + p.x + ", y: " + p.y + ", z: " + p.z);
$.writeln("To array: [" + p.toArr().join(", ") + "]")

//create a Point from three scalar values
p = new Point(100, 200, 300);
$.writeln("From Scalar:\nx: " + p.x + ", y: " + p.y + ", z: " + p.z);
$.writeln("To array: [" + p.toArr().join(", ") + "]")

//create a Point from two scalar values
p = new Point(111, 22.2);
$.writeln("From 2D scalars:\nx: " + p.x + ", y: " + p.y + ", z: " + p.z);

// create a point from an object 
p = new Point({ x: 12.3, y: 45.6, z: 78.9 })
$.writeln("From Object '{x, y, y}':\nx: " + p.x + ", y: " + p.y + ", z: " + p.z);

// create a point from another Point
p = new Point(777, 88.8, -999.9)
q = new Point(p)
$.writeln("From another Point:\nx: " + q.x + ", y: " + q.y + ", z: " + q.z);

// shouldn't work
try {
    p = new Point(666);
    $.writeln("WTF?");
} catch (e) {
    $.writeln("Error: " + e);
}