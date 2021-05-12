// @target aftereffects
// @include "./LST/LST.js" 

function findBoundingBox(theComp, theLayers, useMotion){
    // returns the left, right, top and bottom most point of a layer or set of layers in comp space
    // if motion is enabled it goes through all the frames looking for the bounding box containing all the motion.
    // note that this it calculates the value for the whole layer, even transparent parts.
    var bounds = {"unSet": true};
    for (var i = 0; i < theLayers.length; i++){
        var lyr = theLayers[i];
        var currTime = theComp.time;
        if (useMotion){
            startTime = (lyr.inPoint > 0)? lyr.inPoint: 0;
            endTime = (lyr.outPoint < theComp.duration)? lyr.outPoint: theComp.duration;
        } else {
            startTime = endTime = currTime;
        }
        for (t = startTime; t <= endTime; t += theComp.frameDuration){
            theComp.time = t;
            var corners = [[0,0], [lyr.width, 0], [lyr.width, lyr.height], [0, lyr.height]];
            for (c=0; c < 4; c++){
                var corner = LST.toComp(lyr, corners[c]);
                if (bounds.unSet){ //first point, initialise bounds
                    bounds.left = bounds.right = corner[0];
                    bounds.top = bounds.bottom = corner[1];
                    bounds.unSet = false;
                } else {
                    if (corner[0] < bounds.left) bounds.left = corner[0];
                    if (corner[0] > bounds.right) bounds.right = corner[0];
                    if (corner[1] < bounds.top) bounds.top = corner[1];
                    if (corner[1] > bounds.bottom) bounds.bottom = corner[1];
                }
            }
        }
        theComp.time = currTime;
    }
    
    return bounds;
}
