//@target aftereffects
// by request.
// This works with the SetMainComp script,
// which sets a main comp for a project
// and this jumps you to it 
// without having to navigate the hierarchy
// there si a version with a UI too
(function () {
    this.name = "jumpToMainComp";
    if (app.project.mainComp) {
        app.project.mainComp.openInViewer();
    } else {
        alert("No main comp has been set for this project, silly rabbit.")
   }
})()
