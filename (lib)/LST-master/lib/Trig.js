var Trig = (function() {
	var module = {};

	/**
	 * Convert degrees to radians
	 * @param  {Number} degrees angle in degrees
	 * @return {Number}         angle in radians
	 */
	module.degreesToRadians = function(degrees) {
		return degrees * Math.PI / 180;
	};

	/**
	 * Convert radians to degrees
	 * @param  {Number} radians angle in radians
	 * @return {Number}         angle in degrees
	 */
	module.radiansToDegrees = function(radians) {
		return radians * 180 / Math.PI;
	};

	return module;
})();