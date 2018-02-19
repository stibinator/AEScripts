//_____________________________________buildUI
function rand(min, max){
        return(min + Math.random()*(max-min));
    }

function posNeg(){
    if (Math.random()>0.5){
        return 1
    }else{
        return -1
        }
    }

function buildUI(thisObj) {
	var myPanel = (thisObj instanceof Panel) ? thisObj:new Window('palette', 'ParenNull',undefined, {resizable: true});

	myPanel.startButton= myPanel.add('button', [0,0,100,30], 'start'); //Create Null
	myPanel.numberSlider = myPanel.add('slider',[0,40,200,50], value=100, minvalue=1, maxvalue=10000, "number");
	
	myPanel.numberSlider.onChange = function(){
		writeLn(myPanel.numberSlider.value)
	}

	myPanel.startButton.onClick = function(){
		
		
		app.beginUndoGroup("create shape layer");
		myLayers=app.project.activeItem.layers;
		parentLayer = myLayers[1];
		startCount = myLayers.length;
		var parentSize = parentLayer.property("Contents").property("Ellipse 1").property("Contents").property("Ellipse Path 1").property("Size").value[0];
		var parentPos = parentLayer.property("Transform").property("Position").value;
		
		for (var i=1; i <= myPanel.numberSlider.value; i++){

			//var parentColour = myLayers[i].property("Contents").property("Ellipse 1").property("Contents").property("Fill 1").property("Color").value

			var newLayer = parentLayer.duplicate();
			var newSize = rand(parentSize/2, parentSize*1.5);
			var newColour = [rand(30,230)/255, rand(20,200)/255, rand(10,180)/255, 1]
			newLayer.property("Contents").property("Ellipse 1").property("Contents").property("Ellipse Path 1").property("Size").setValue([newSize,newSize]);
			var xOff =posNeg() * rand(parentSize, parentSize*4);
            var yOff =posNeg() * rand(parentSize, parentSize*4);
             var newX = (parentPos[0] + xOff) % 1920;
             var newY = (parentPos[1] + yOff) % 1080;
             if (newX < 0) { newX += 1920}
             if (newY < 0) { newY += 1080}
            writeLn(String(xOff));
			newPos= [newX, newY];
            
			newLayer.property("Transform").property("Position").setValue(newPos);
			newLayer.property("Contents").property("Ellipse 1").property("Contents").property("Fill 1").property("Color").setValue(newColour);
		}
		// app.project.activeItem.layers.add(newLayer);
		app.endUndoGroup();
	}

	return myPanel;
}

var myToolsPanel = buildUI(this);

