// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// one click alpha matte tidying
// trims the selected layer(s)
// to match the length of the layers below them
// and sets them as layer mattes
// or if ctrl is held down trims layers to match their mattes
(function () {
    var INVERTED = ScriptUI.environment.keyboardState.shiftKey;
    var LUMA = ScriptUI.environment.keyboardState.altKey;
    var TRIM2MATTE = ScriptUI.environment.keyboardState.ctrlKey;

    var scriptName = "trimToLayerBelowAndSetAsAlphaMatte";
    app.beginUndoGroup(scriptName);
    var theComp = app.project.activeItem;
    if (theComp) {
        for (var i = 0; i < theComp.selectedLayers.length; i++) {
            var theLayer = theComp.selectedLayers[i];
            if (theComp.numLayers > theLayer.index) {
                var targetLayer = theComp.layer(theLayer.index + TRIM2MATTE); 
                var sourceLayer = theComp.layer(theLayer.index + 1 - TRIM2MATTE);
                targetLayer.inPoint = sourceLayer.inPoint;
                targetLayer.outPoint = sourceLayer.outPoint;
                if (!TRIM2MATTE) {
                    if (LUMA) {
                        targetLayer.trackMatteType = (INVERTED) ? TrackMatteType.LUMA_INVERTED : TrackMatteType.LUMA
                    } else {
                        targetLayer.trackMatteType = (INVERTED) ? TrackMatteType.ALPHA_INVERTED : TrackMatteType.ALPHA
                    }
                }

            }

        }
    }
    app.endUndoGroup();
})();

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
