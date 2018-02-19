{
	// Find and Replace Text.jsx
	// 
	// This script finds and/or replaces text in the Source Text property of 
	// all selected text layers.
	// 
	// It presents a UI with two text entry areas: a Find Text box for the
	// text to find and a Replacement Text box for the new text.
	//
	// When the user clicks the Find All button, the layer selection is modified 
	// to include only those text layers that include the Find Text string as a 
	// value in the Source Text property or any keyframe on the Source Text 
	// property.
	//
	// When the user clicks the Replace All button, the layer selection is 
	// modified as for Find All, and all instances of the Find Text string are 
	// are replaced in the Source Text property and any keyframes on the 
	// Source Text property.
	//
	// A button labeled "?" provides a brief explanation.


	function FindAndReplaceText(thisObj)
	{
		var scriptName = "Find and Replace Text";
		var myFindString    = "";
		var myReplaceString = "";

		// This function is used  during the Find All process.
		// It deselects the layer if it is not a text layer or if it does not
		// contain the Find Text string.
		function deselectLayerIfFindStringNotFound(theLayer, findString)
		{
			// foundIt is initialized to false. It is set to true only if the Find Text string is 
			// contained in the Source Text (sourceText) property, as determined by the  
			// test in the nested if/else block below.
			var foundIt = false;

			// Get the Source Text property, if there is one.
			var sourceText = theLayer.sourceText;
			// Test to see if the Find Text value is contained in the Source Text property.
			if (sourceText != null) {
				if (sourceText.numKeys == 0) {
					// textValue is a TextDocument. Check the string inside.
					if (sourceText.value.text.indexOf(findString) != -1) {
						foundIt = true;
					}
				} else {
					// Do the test for each keyframe:
					for (var keyIndex = 1; keyIndex <= sourceText.numKeys; keyIndex++) {
						// textValue is a TextDocument. Check the string inside.
						var oldString = sourceText.keyValue(keyIndex).text;
						if (sourceText.keyValue(keyIndex).text.indexOf(findString) != -1) {
							foundIt = true;
							break;
						}
					}
				}
			}
			// Deselect the layer if foundIt was not set to true in the tests of the Source Text property.
			if (foundIt == false) {
				theLayer.selected = false;
			}
		}

		// This function is called when the Find All button is clicked.
		// It changes which layers are selected by deselecting layers that are not text layers
		// or do not contain the Find Text string. Only text layers containing the Find Text string 
		// will remain selected.
		function onFindAll()
		{
			// Show a message and return if there is no value specified in the Find Text box.
			if (myFindString == "") {
				alert("No text was entered in the Find Text box. The selection was not changed.", scriptName);
				return;
			}

			// Start an undo group.  By using this with an endUndoGroup(), you
			// allow users to undo the whole script with one undo operation.
			app.beginUndoGroup("Find All");

			// Get the active composition.
			var activeItem = app.project.activeItem;
			if (activeItem != null && (activeItem instanceof CompItem)){
				
				// Check each selected layer in the active composition.
				var activeComp = activeItem;
				var selectedLayers = activeComp.selectedLayers;
				for (var i = 0; i < selectedLayers.length; i++) {
					deselectLayerIfFindStringNotFound(selectedLayers[i], myFindString);
				}
			}
			app.endUndoGroup();
		}

		// This function takes totalString and replaces all instances of 
		// findString with replaceString.
		// Returns the changed string.
		function replaceTextInString(totalString, findString, replaceString)
		{
			// Use a regular expression for the replacement.
			// The "g" flag will direct the replace() method to change all instances
			// of the findString instead of just the first.
			var regularExpression = new RegExp(findString,"g");
			var newString = totalString.replace(regularExpression, replaceString);
			return newString;
		}

		// This function replaces findString with replaceString in the layer's 
		// sourceText property.
		// The method changes all keyframes, if there are keyframes, or just 
		// the value, if there are not keyframes.
		function replaceTextInLayer(theLayer, findString, replaceString)
		{
			var changedSomething = false;

			// Get the sourceText property, if there is one.
			var sourceText = theLayer.sourceText;
			if (sourceText != null) {
				if (sourceText.numKeys == 0) {
					// textValue is a TextDocument. Retrieve the string inside
					var oldString = sourceText.value.text;
					if (oldString.indexOf(findString) != -1) {
						var newString = replaceTextInString(oldString, findString, replaceString);
						if (oldString != newString) {
							sourceText.setValue(newString);
							changedSomething = true;
						}
					}
				} else {
					// Do it for each keyframe:
					for (var keyIndex = 1; keyIndex <= sourceText.numKeys; keyIndex++) {
						// textValue is a TextDocument. Retrieve the string inside
						var oldString = sourceText.keyValue(keyIndex).text;
						if (oldString.indexOf(findString) != -1) {
							var newString = replaceTextInString(oldString, findString, replaceString);
							if (oldString != newString) {
								sourceText.setValueAtKey(keyIndex,newString);
								changedSomething = true;
							}
						}
					}
				}
			}
			// Return a boolean saying whether we replaced the text
			return changedSomething;
		}

		// Called when the Replace All button is clicked
		// Replaces the Find Text string with the Replacement Text string everywhere within 
		// the set of selected layers.  Does not change the selected flag of any layers.
		function onReplaceAll()
		{
			// Show a message and return if there is no string specified in the Find Text box.
			if (myFindString == "") {
				alert("No text was entered in the Find Text box. No changes were made.", scriptName);
				return;
			}

			// Start an undo group.  By using this with an endUndoGroup(), you
			// allow users to undo the whole script with one undo operation.
			app.beginUndoGroup("Replace All");

			// If we don't make any changes, we'll put up an alert at the end.
			var numLayersChanged = 0;

			// Get the active comp
			var activeItem = app.project.activeItem;
			if (activeItem != null && (activeItem instanceof CompItem)){
				
				var activeComp = activeItem;
				
				// try to apply to every selected layer
				var selectedLayers = activeComp.selectedLayers;
				for (var i = 0; i < selectedLayers.length; i++) {

					var curLayer = selectedLayers[i];

					// The method returns true if it changes any text, false otherwise.
					if (replaceTextInLayer(curLayer, myFindString, myReplaceString) == true) {
						numLayersChanged++;
					}
				}
			}
			// Print a message if no layers were affected
			if (numLayersChanged == 0) {
				// Note: if you put quotes in the interior of the string,
				// they must be preceded by a backslash, as in \"blue\" below.
				alert("The string " + myFindString + " was not found in any of the selected layers. No changes were made", scriptName);
			}

			app.endUndoGroup();
		}

		// Called when the Find Text string is edited
		function onFindStringChanged()
		{
			myFindString = this.text;
		}

		// Called when the Replacement Text string is edited
		function onReplaceStringChanged()
		{
			myReplaceString = this.text;
		}

		// Called when the "?" button is clicked
		function onShowHelp()
		{
			alert(scriptName + ":\n" +
				"Select one or more layers and enter text to find in the Find Text box. \n" +
				"Click Find All to change (narrow) the layer selection to include only those text layers with a Source Text property that contain the text specified in the Find Text box.\n" +
				"Click Replace All to replace all instances of the Find Text string with the Replacement Text string. Replacements are made only within selected text layers, and the selection remains unchanged.\n" +
				"Searches and replacements occur for Source Text properties and all of their keyframes.", scriptName);
		}
		
		
		// main:
		// 
		
		if (parseFloat(app.version) < 8)
		{
			alert("This script requires After Effects CS3 or later.", scriptName);
			return;
		}
		else
		{
			// Create and show a floating palette
			var my_palette = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable:true});
			if (my_palette != null)
			{
				var res = 
				"group { \
					orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], spacing:5, margins:[0,0,0,0], \
					findRow: Group { \
						alignment:['fill','top'], \
						findStr: StaticText { text:'Find Text:', alignment:['left','center'] }, \
						findEditText: EditText { text:'', characters:20, alignment:['fill','center'] }, \
					}, \
					replaceRow: Group { \
						alignment:['fill','top'], \
						replaceStr: StaticText { text:'Replacement Text:', alignment:['left','center'] }, \
						replaceEditText: EditText { text:'', characters:20, alignment:['fill','center'] }, \
					}, \
					cmds: Group { \
						alignment:['fill','top'], \
						findButton: Button { text:'Find All', alignment:['fill','center'] }, \
						replaceButton: Button { text:'Replace All', alignment:['fill','center'] }, \
						helpButton: Button { text:'?', alignment:['right','center'], preferredSize:[25,20] }, \
					}, \
				}";
				
				my_palette.margins = [10,10,10,10];
				my_palette.grp = my_palette.add(res);
				
				// Workaround to ensure the editext text color is black, even at darker UI brightness levels
				var winGfx = my_palette.graphics;
				var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);
				my_palette.grp.findRow.findEditText.graphics.foregroundColor = darkColorBrush;
				my_palette.grp.replaceRow.replaceEditText.graphics.foregroundColor = darkColorBrush;
				
				my_palette.grp.findRow.findStr.preferredSize.width = my_palette.grp.replaceRow.replaceStr.preferredSize.width;
				
				my_palette.grp.findRow.findEditText.onChange = my_palette.grp.findRow.findEditText.onChanging = onFindStringChanged;
				my_palette.grp.replaceRow.replaceEditText.onChange = my_palette.grp.replaceRow.replaceEditText.onChanging = onReplaceStringChanged;
				
				my_palette.grp.cmds.findButton.onClick    = onFindAll;
				my_palette.grp.cmds.replaceButton.onClick = onReplaceAll;
				my_palette.grp.cmds.helpButton.onClick    = onShowHelp;
				
				my_palette.onResizing = my_palette.onResize = function () {this.layout.resize();}
			
				if (my_palette instanceof Window) {
					my_palette.center();
					my_palette.show();
				} else {
					my_palette.layout.layout(true);
					my_palette.layout.resize();
				}
			}
			else {
				alert("Could not open the user interface.", scriptName);
			}
		}
	}
	
	
	FindAndReplaceText(this);
}
