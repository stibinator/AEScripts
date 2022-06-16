// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// sets the label of all
// portrait(taller than wide)
// project items
(function () {
    theitems = app.project.selection;
    if (theitems.length === 0) {
        theitems = app.project.items;
    }
    for (var i = 0; i < theitems.length; i++) {
        if (theitems[i].width < theitems[i].height) {
            theitems[i].label = 12; //brown by default
        } else {
            theitems[i].label = 10; //purple by default
        }
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
