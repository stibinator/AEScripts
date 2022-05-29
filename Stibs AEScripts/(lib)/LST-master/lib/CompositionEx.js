var CompositionEx = (function() {
	var FILM_SIZE = 36;
	var FOCAL_LENGTH = 50;


	var module = {};

	/**
	 * Get vertical Angle of View
	 * @param  {CompIte} composition Composition
	 * @return {Number}              Angle in radians
	 */
	module.getAOV = function(composition) {
		var aspect, filmSizeVertical;

		aspect = composition.width / composition.height;
		filmSizeVertical = FILM_SIZE / aspect;
		
		return MathEx.getAOV(filmSizeVertical, FOCAL_LENGTH);
	};

	module.getProjectedZ = function(composition, w) {
		var z, zoom;

		zoom = getZoom(composition);
		z = zoom - (zoom / w);

		return z;
	};

	module.getViewMatrix = function(composition) {
		var viewMatrix, zoom;

		zoom = getZoom(composition);

		viewMatrix = Matrix.getIdentity();
		viewMatrix = Matrix.translate(viewMatrix,
			composition.width / 2,
			composition.height / 2,
			zoom
		);

		return viewMatrix;
	};

	return module;

	function getZoom(composition) {
		var filmSize, zoom;

		filmSize = composition.width;
		zoom = filmSize * FOCAL_LENGTH / FILM_SIZE;

		return zoom;
	}
})();