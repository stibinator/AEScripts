function joinPath(/* path segments */) {
    // Split the inputs into a list of path commands.
    var dirs = [];
    for (var i = 0, l = arguments.length; i < l; i++) {
        var subParts = arguments[i].toString().split("/");
        dirs = dirs.concat(subParts);
    }
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

$.writeln(joinPath("foo", "baz", "../bar")); // => foo/bar
$.writeln(joinPath("~", "..")); // /Users or /c/Users <--NB. only if user's home dir is in default location
$.writeln(joinPath("~", "../../../../../../../../../../")); // / or /c
$.writeln(joinPath(Folder.desktop, "../Downloads")); // ~/Downloads
$.writeln(joinPath(Folder.userData, "/Adobe/")); // /users/yurname/Library/Adobe or /c/users/yourname/appdata/Roaming/adobe