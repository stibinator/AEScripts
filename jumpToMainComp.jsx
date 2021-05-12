//@target aftereffects
(function(){
    this.name = "jumpToMainComp";
    if (app.project.mainComp) {
        app.project.mainComp.openInViewer();
    } else {
        alert("No main comp has been set for this project, silly rabbit.")
   }
})()
