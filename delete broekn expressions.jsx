// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au 
// eslint-disable-next-line
// includepath "./(lib)" 
// eslint-disable-next-line
// include  getproperties.jsx
/* global app, getPropertiesWithExpressionsFromLayer */
(function () {
    var proj = app.project;
    var itms = proj.items;
    var errs = 0;

    try {
        for (var i = 1; i <= itms.length; i++) {
            if (itms[i].typeName === "Composition") {
                var lyrs = itms[i].layers
                for (var lIndex = 1; lIndex <= lyrs.length; lIndex++) {
                    // eslint-disable-next-line no-undef
                    var theProps = getPropertiesWithExpressionsFromLayer(lyrs[lIndex], false);
                    // if (theProps.length > 0) {alert (lyrs[lIndex].name);}
                    for (var p = 0; p < theProps.length; p++) {
                        if (theProps[p].expressionError) {
                            errs++;
                            theProps[p].expression = "";
                        }
                    }
                }
            }
        }
        if (errs) {
            alert("found and deleted" + errs + "expressions with errors");
        } else {
            alert("no errors found")
        }
    } catch (e) { alert("error: " + e); }
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
