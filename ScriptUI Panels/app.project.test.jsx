/* eslint-disable no-debugger */
// @target aftereffects
/* global app */
var uiValues = ["deleteIKChkBx",
            "groupChkBx",
            "xSlider",
            "ySlider",
            "zSlider",
            "createIconsChkBx",
            "iconSizeSlider",
            "iconOpacitySlider",
            "createAnchorsChkBx",
            "anchorSizeSlider"
        ]
        for (var u in uiValues) {
            uiValues[u] = "foo" + uiValues[u];
        }
//alert(uiValues);

