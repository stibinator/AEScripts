// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// sets the label for all unused items
(function () {
    theitems = app.project.selection;
    //do all if nothing is selected
    if (theitems.length === 0) {
        for (var i = 1; i <= app.project.items.length; i++) {
            //convert 1-index collection to normal array. Thanks, Adobe.
            theitems.push(app.project.item(i));
        };
    }
    for (var i = 0; i < theitems.length; i++) {
        var uses = theitems[i].usedIn;
        if (uses && uses.length > 0) {
            // theitems[i].label = 14;
        } else {
            theitems[i].label = 0;
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
