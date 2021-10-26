// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
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

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
