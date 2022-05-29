// https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js

var Vector3 = (function() {
	var module = {};

	module.crossVectors = function(a, b) {
		var ax = a[0],
			ay = a[1],
			az = a[2];
		var bx = b[0],
			by = b[1],
			bz = b[2];

		var v = [];
		v[0] = ay * bz - az * by;
		v[1] = az * bx - ax * bz;
		v[2] = ax * by - ay * bx;

		return v;
	};

	module.divideScalar = function(v, scalar) {
		return module.multiplyScalar(v, 1 / scalar);
	};

	module.length = function(v) {
		return Math.sqrt(module.lengthSq(v));
	};

	module.lengthSq = function(v) {
		return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	};

	module.multiplyScalar = function(v, scalar) {
		v[0] *= scalar;
		v[1] *= scalar;
		v[2] *= scalar;

		return v;
	};

	module.normalize = function(v) {
		return module.divideScalar(v, module.length(v) || 1);
	};

	module.subVectors = function(a, b) {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	};

	return module;
})();