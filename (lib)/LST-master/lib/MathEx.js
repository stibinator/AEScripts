var MathEx = (function() {
	var module = {};

	/**
	 * Get angle of view
	 * @param  {Number} filmSize    film size
	 * @param  {Number} focalLength focal length
	 * @return {Number}             angle in radians
	 */
	module.getAOV = function(filmSize, focalLength) {
		return 2 * Math.atan(filmSize / (2 * focalLength));
	};

	return module;
})();