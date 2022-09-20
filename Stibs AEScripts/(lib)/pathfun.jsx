function splitPath(inPath) {
    var inputAr = [];
    if (inPath instanceof Array) {
        for (var i = 0, l = inPath.length; i < l; i++) {
            inputAr = inputAr.concat(splitPath(inPath[i]));
        }
    } else {
        inputAr = inputAr.concat(inPath.toString().split("/"))
    }
    return inputAr;
}
function joinPath(inPath) {
    // Split the inputs into an array of folder names            
    var dirs = splitPath(inPath);
    var topFolder = Folder(dirs[0]);
    var newPath = [];
    for (i = 0; i < dirs.length; i++) {
        var dir = dirs[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (dir && dir !== ".") {
            // Interpret ".." to pop the last segment
            if (dir === "..") {
                if (newPath.length > 1) {
                    newPath.pop()
                } else {
                    // reached the top original folder, find its parent
                    topFolder = topFolder.parent || topFolder;
                    newPath = topFolder.toString().split("/");
                }
                // Push new path segments.
            } else {
                newPath.push(dir)
            }
        }
    }
    // Preserve the initial slash if there was one.
    if (dirs[0] === "") newPath.unshift("");
    // Turn back into a single string path.
    return newPath.join("/") || topFolder.parent;
}

function createPath() {
    var path = joinPath(Array.prototype.slice.call(arguments));
    var folderObj = new Folder(path);
    // creates a folder and parent path if it doesn't exist
    var allGood = true;
    var parent = new Folder(folderObj.path);
    if (!parent.exists) {
        allGood = createPath(parent);
    }
    if (folderObj instanceof Folder && !folderObj.exists) {
        allGood = folderObj.create();
    }
    return (allGood) ? folderObj : false;
}

createPath("~", "foo", "/bar/faz")