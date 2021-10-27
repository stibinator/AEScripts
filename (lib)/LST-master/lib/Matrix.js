// Most of the methods are adopted from THREE.js
// https://github.com/mrdoob/three.js/tree/master/src

var Matrix = (function() {

	var module = {};

	module.decompose = function(matrix) {
		var result = {
			rotation: module.getRotation(matrix),
			scale: module.getScale(matrix),
			translate: module.getTranslate(matrix),
		};

		return result;
	};

	module.getIdentity = function() {
		var identity = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];

		return identity;
	};

	module.getRotation = function(matrix) {
		var scale = module.getScale(matrix);
		var sX = scale[0];
		var sY = scale[1];
		var sZ = scale[2];

		// https://community.khronos.org/t/is-it-possible-to-extract-rotation-translation-scale-given-a-matrix/49221/4
		var sinPitch = -matrix[8] / sX;
		var sinRoll = -matrix[6] / sZ;
		var cosRoll = matrix[5] / sY;
		var sinYaw = 0;
		var cosYaw = 1;

		var cosPitch = Math.sqrt(1 - sinPitch * sinPitch);
		if (Math.abs(cosPitch) > 1e-6) {
			sinRoll = (matrix[9] / sY) / cosPitch;
			cosRoll = (matrix[10] / sZ) / cosPitch;
			sinYaw = (matrix[4] / sX) / cosPitch;
			cosYaw = (matrix[0] / sX) / cosPitch;
		}

		var x = Math.atan2(sinRoll, cosRoll);
		var y = Math.atan2(sinPitch, cosPitch);
		var z = Math.atan2(sinYaw, cosYaw);

		return [
			Trig.radiansToDegrees(x),
			Trig.radiansToDegrees(y),
			Trig.radiansToDegrees(z),
		];
	};

	module.getScale = function(matrix) {
		var x, y, z;

		x = Vector3.length([matrix[0], matrix[4], matrix[8]]);
		y = Vector3.length([matrix[1], matrix[5], matrix[9]]);
		z = Vector3.length([matrix[2], matrix[6], matrix[10]]);

		return [x, y, z];
	};

	module.getTranslate = function(matrix) {
		var x, y, z;

		x = matrix[3];
		y = matrix[7];
		z = matrix[11];

		return [x, y, z];
	};

	module.invert = function(matrix) {
		// Adapted from: https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js
		var result = [];

		var n11 = matrix[0],
			n12 = matrix[4],
			n13 = matrix[8],
			n14 = matrix[12];
		var n21 = matrix[1],
			n22 = matrix[5],
			n23 = matrix[9],
			n24 = matrix[13];
		var n31 = matrix[2],
			n32 = matrix[6],
			n33 = matrix[10],
			n34 = matrix[14];
		var n41 = matrix[3],
			n42 = matrix[7],
			n43 = matrix[11],
			n44 = matrix[15];

		result[0] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
		result[4] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
		result[8] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
		result[12] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
		result[1] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
		result[5] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
		result[9] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
		result[13] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
		result[2] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
		result[6] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
		result[10] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
		result[14] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
		result[3] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
		result[7] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
		result[11] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
		result[15] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;

		var determinant = n11 * result[0] + n21 * result[4] + n31 * result[8] + n41 * result[12];

		if (determinant === 0) {
			throw new Error('Can\'t invert matrix, determinant is 0');
		}

		for (var i = 0, il = result.length; i < il; i++) {
			result[i] /= determinant;
		}

		return result;
	};

	module.lookAt = function(eye, target, up) {
		var result, x, y, z;

		z = Vector3.subVectors(eye, target);
		if (Vector3.lengthSq(z) === 0) {
			// eye and target are in the same position
			z[2] = 1;
		}

		z = Vector3.normalize(z);

		x = Vector3.crossVectors(up, z);
		if (Vector3.lengthSq(x) === 0) {
			// up and z are parallel
			if (Math.abs(up.z) === 1) {
				z[0] += 0.0001;
			} else {
				z[2] += 0.0001;
			}

			z = Vector3.normalize(z);
			x = Vector3.crossVectors(up, z);
		}

		x = Vector3.normalize(x);
		y = Vector3.crossVectors(z, x);

		result = module.getIdentity();
		result[0] = x[0];
		result[4] = y[0];
		result[8] = z[0];
		result[1] = x[1];
		result[5] = y[1];
		result[9] = z[1];
		result[2] = x[2];
		result[6] = y[2];
		result[10] = z[2];

		return result;
	};

	module.multiplyArrayOfMatrices = function(matrices) {
		var result = matrices[0];
		for (var i = 1, il = matrices.length; i < il; i++) {
			result = module.multiplyMatrices(result, matrices[i]);
		}

		return result;
	};

	module.multiplyMatrices = function(a, b) {
		var a11 = a[0],
			a12 = a[4],
			a13 = a[8],
			a14 = a[12];
		var a21 = a[1],
			a22 = a[5],
			a23 = a[9],
			a24 = a[13];
		var a31 = a[2],
			a32 = a[6],
			a33 = a[10],
			a34 = a[14];
		var a41 = a[3],
			a42 = a[7],
			a43 = a[11],
			a44 = a[15];

		var b11 = b[0],
			b12 = b[4],
			b13 = b[8],
			b14 = b[12];
		var b21 = b[1],
			b22 = b[5],
			b23 = b[9],
			b24 = b[13];
		var b31 = b[2],
			b32 = b[6],
			b33 = b[10],
			b34 = b[14];
		var b41 = b[3],
			b42 = b[7],
			b43 = b[11],
			b44 = b[15];

		var result = [
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		];

		result[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		result[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		result[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		result[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		result[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		result[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		result[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		result[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		result[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		result[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		result[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		result[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		result[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		result[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		result[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		result[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return result;

	};

	module.perspective = function(fovy, aspect, near, far) {
		var f = 1 / Math.tan(fovy / 2);
		var nf = 1 / (near - far);

		var result = [
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) * nf, 2 * far * near * nf,
			0, 0, -1, 0
		];

		return result;
	};

	module.rotateX = function(matrix, theta) {
		var rotationXmatrix = [
			1, 0, 0, 0,
			0, Math.cos(theta), -Math.sin(theta), 0,
			0, Math.sin(theta), Math.cos(theta), 0,
			0, 0, 0, 1
		];

		return module.multiplyMatrices(matrix, rotationXmatrix);
	};

	module.rotateY = function(matrix, theta) {
		var rotationYmatrix = [
			Math.cos(theta), 0, Math.sin(theta), 0,
			0, 1, 0, 0, -Math.sin(theta), 0, Math.cos(theta), 0,
			0, 0, 0, 1
		];

		return module.multiplyMatrices(matrix, rotationYmatrix);
	};

	module.rotateZ = function(matrix, theta) {
		var rotationZmatrix = [
			Math.cos(theta), -Math.sin(theta), 0, 0,
			Math.sin(theta), Math.cos(theta), 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];

		return module.multiplyMatrices(matrix, rotationZmatrix);
	};

	module.scale = function(matrix, x, y, z) {
		var scaleMatrix = [
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		];

		return module.multiplyMatrices(matrix, scaleMatrix);
	};

	module.skew = function(matrix, thetaX, thetaY) {
		var skewMatrix = [
			1, Math.tan(thetaX), 0, 0,
			Math.tan(thetaY), 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];

		return module.multiplyMatrices(matrix, skewMatrix);
	};

	module.translate = function(matrix, x, y, z) {
		var translateMatrix = [
			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1
		];

		return module.multiplyMatrices(matrix, translateMatrix);
	};

	return module;
})();