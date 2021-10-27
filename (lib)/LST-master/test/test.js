(function() {
	try {

		// @include '../LST.js'

		var layer = getTargetLayer('TARGET');

		var toComp = LST.toComp(layer);
		var toWorld = LST.toWorld(layer);

		alert([
			'LST results:',
			'toComp():\n' + toComp.join('\n'),
			'---',
			'toWorld():\n' + toWorld.join('\n')
		].join('\n'));

	} catch (error) {
		handleError(error);
	}


	///



	function getTargetLayer(layerName) {
		var composition, layer;

		composition = getActiveComposition();
		layer = composition.layer(layerName);

		if (!layer) {
			throw 'Could not find ' + layerName + ' layer';
		}

		return layer;
	}

	function getActiveComposition() {
		var composition = app.project.activeItem;
		if (!composition || !(composition instanceof CompItem)) {
			throw 'Please select composition first';
		}

		return composition;
	}

	function handleError(error) {
		var message = error.toString();
		if (error instanceof Error) {
			message += '\nScript File: ' + File(error.fileName).displayName +
				'\nFunction: ' + arguments.callee.name +
				'\nError on Line: ' + error.line.toString();
		}
		alert(message);
	}
})();