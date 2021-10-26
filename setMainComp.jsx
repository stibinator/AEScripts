//@target aftereffects
// works in conjunction with the
// jumpToMainComp script
// this defines a main comp for a project
// to allow you to jump to it
// without navigating the hierarchy

(function () {
    this.name = "setMainComp";
    app.project.mainComp = app.project.activeItem;
})();
