//@target aftereffects
(function(){
    this.name = "openCurrentProject";
    var projFolder = app.project.file;
    if (projFolder) {
        if ($.os.match("Windows")) {
            cmd = 'Explorer /select, "' + projFolder.fsName + '"';
        } else {
            cmd = "open '" + projFolder.fsName + "/'";
        }
        $.writeln(cmd);
        system.callSystem(cmd)
    }
})()


