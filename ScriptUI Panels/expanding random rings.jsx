function buildUI(thisObj) {

	var myPanel = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'createshapes', [100, 100, 300, 300], {resizable: true});
	writeLn(myPanel);
	myPanel.startButton= myPanel.add('button', [0,0,100,30], 'start'); //Create Null
	myPanel.numberSlider = myPanel.add('slider',[0,40,200,50], value=100, minvalue=1, maxvalue=10000, "number");
	
	myPanel.numberSlider.onChange = function(){
		writeLn(myPanel.numberSlider.value);
	}

	myPanel.startButton.onClick = function (){
		app.beginUndoGroup("create shape layer");
		drawShape(getCurrentCompOrMakeOne());
		app.endUndoGroup();
	}
	return myPanel
}


function hslToRgb(h, s, l){
 /**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 1].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b]
    //[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function drawShape(currentComp){
	// Adding shape layer for the circles
	var shapeLayer = currentComp.layers.addShape();  
	//put it at the top Right
    shapeLayer.property("Transform").property("Position").setValue([Math.random()*currentComp.width, Math.random()*currentComp.height])
     
	// Adding circle shapes group
	var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
	var lineCol = hslToRgb(Math.random()*0.5, 1, 0.5)
	// Adding circle shapes
	createEllipse(shapeGroup, 0, false, false, lineCol, 50+Math.random()*200);
    theEllipse = shapeGroup.property("Contents").property("ADBE Vector Shape - Ellipse");
    //randoz the start and end and trim the layer
    var startTime = Math.random()*(currentComp.duration-10);
    var endTime = startTime +10 + Math.random()*(currentComp.duration - startTime -10);
    shapeLayer.inPoint = startTime;
    shapeLayer.outPoint = endTime;
    
    //create the keyframeEase objects
    //var easeIn = new KeyframeEase(4000,0.1);
    //startSpeed = 10+Math.random()*80;
    //var easeOut = new KeyframeEase(startSpeed, 100);

    //create the keyframes and ease them
    theEllipse.property("Size").setValueAtTime(endTime,[4440,4440]);
  //  theEllipse.property("Size").setTemporalEaseAtKey(1, [easeIn, easeIn], [easeOut, easeOut]);
    //use the same ease for both keyframes
    theEllipse.property("Size").setValueAtTime(startTime, [0,0]);
    //theEllipse.property("Size").setTemporalEaseAtKey(2, [easeIn, easeIn], [easeOut, easeOut]);
    theEllipse.property("Size").expression = "[value[1], value[1]]";
   // theEllipse.property("Size").expressionEnabled=true;
   shapeLayer.property("Contents").property("Group 1").property("Contents").property("Stroke 1").property("Stroke Width").expression = "value*content('Group 1').content('Ellipse Path 1').size[0]/4440"
}

function createEllipse(shapeGroup, size, pos, fill, stroke, strokewidth) {
	var ellipse     = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
	var ellipseSize = ellipse.property("Size").setValue([size,size]);
    if (pos){
        var ellipsePos = ellipse.property("Position").setValue(pos);
    }
	if (fill){
		shapeGroup.property("Contents")
			.addProperty("ADBE Vector Graphic - Fill")
			.property("Color")
			.setValue(fill)
		}
	if (stroke){
		shapeGroup.property("Contents")
			.addProperty("ADBE Vector Graphic - Stroke")
			.property("Color")
			.setValue(stroke)
		if (strokewidth){
				.property("ADBE Vector Graphic - Stroke")
			shapeGroup.property("Contents")
				.property("Stroke Width")
				.setValue(strokewidth)
		}
	}
}

function getCurrentCompOrMakeOne(compSettings, defaultCompName){
	if (! compSettings){ compSettings    = cs = [1920, 1080, 1, 10, 25];}
	if (! defaultCompName){ defaultCompName = "Demo"}
	var currentProject  = (app.project) ? app.project : app.newProject();
	var currentComp     = (currentProject.activeItem) ? currentProject.activeItem : currentProject.items.addComp(defaultCompName, cs[0], cs[1], cs[2], cs[3], cs[4]);
	currentComp.openInViewer();
	return currentComp;
}

//var myToolsPanel = buildUI(this);
app.beginUndoGroup("create shape layer");
for (var i=0; i<80; i++){		
        drawShape(getCurrentCompOrMakeOne());
}		
 app.endUndoGroup();