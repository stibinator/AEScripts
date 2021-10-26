// @target aftereffects
//***********Selected as Spine, version 1
//this script will take the selected group of layers and from them create an animatable spine;
//  each vertebra is parented to the one below it, and each vertebra above the lowermost (base) vertebra
//  has an expression that is linked to the base vertebra's x rotation.
//***********//

(function () {
	function mainSpine() {
		// make sure a comp is selected
		var activeItem = app.project.activeItem;
		if (activeItem == null || !(activeItem instanceof CompItem)) {
			alert("You need to select some layers first.");
		} else {
      
			// make sure more than one layer is selected
			var s = activeItem.selectedLayers;
			var selNum = s.length;
			if (selNum < 2) {
				alert("You need to select at least two layers first.");
			} else {

				vn = selNum;
				gotANum = false;
				cancelledOut = false;
				while (!gotANum) {
					p = prompt("Enter overlap amount (in pixels. Zero means no overlap; negative number creates spacing):", "2");
					if (p == null) {
						cancelledOut = true;
						gotANum = true;//well, not really, but ...
					} else {
						if (!isNaN(p)) {
							vOlap = parseFloat(p);
							gotANum = true;
						}
					}
				}
				if (!cancelledOut) {
					app.beginUndoGroup("selection as spine");
            
					vNa = "vertabra";
					vShy = true;
            
					baseLayer = s[0];
            
					// (if not 3D layer, make it one)
					if (!baseLayer.threeDLayer) { baseLayer.threeDLayer = true };
            
					// rename to 'base vertebra'
					vZeroName = ("base " + vNa);
					baseLayer.name = vZeroName;
            
					lastLayer = baseLayer;
					lastLayerHtOffset = lastLayer.height;
				
					//change anchor point to bottom of layer
					ap = lastLayer.property("Anchor Point").value;
					lastLayer.property("Anchor Point").setValue([ap[0], (lastLayerHtOffset), ap[2]]);
            
					for (i = 1; i < (vn); ++i) {
						/////LAYER ITEM ADJUSTMENTS/////
               
						newLayer = s[i];
						newLayer.name = (vNa + "_" + i);
					
						// (if not 3D layer, make it one)
						if (!newLayer.threeDLayer) { newLayer.threeDLayer = true };
               
						/////PROPERTY ADJUSTMENTS/////
               
						//change anchor point to bottom of layer
						ap = newLayer.property("Anchor Point").value;
						newLayer.property("Anchor Point").setValue([ap[0], (newLayer.height), ap[2]]);
               
						p = lastLayer.property("Position").value;
               
						newLayer.property("Position").setValue([p[0], (p[1] - lastLayerHtOffset + vOlap), p[2]]);
					
						//add x rot expression to new layer
						newLayer.property("rotationX").expression = 'thisComp.layer("' + vZeroName + '").rotationX;';
					
						lastLayer = newLayer;  ///// now we have a reference to this layer to use at next iteration as last layer
						lastLayerHtOffset = lastLayer.height;
					}
            
					for (n = 0; n < (s.length - 1); ++n) {
						childL = s[n + 1];
						parentL = s[n];
						childL.parent = parentL;
						if (vShy == true) { childL.shy = true };
					}
            
					app.endUndoGroup();
					alert("The base vertebra is the first layer selected.");
				}
			}
		}
	}

	mainSpine();

})()