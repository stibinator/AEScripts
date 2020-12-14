var CameraEx = (function() {
	var module = {};

	module.getAOV = function(camera) {
		var filmSize, focalLength;

		filmSize = camera.containingComp.height;
		focalLength = camera.property('ADBE Camera Options Group').property('ADBE Camera Zoom').value;

		return MathEx.getAOV(filmSize, focalLength);
	};

	module.getLocalMatrix = function(camera) {
		var localMatrix, lookAtMatrix;

		lookAtMatrix = LayerEx.getLookAt(camera);
		localMatrix = Matrix.multiplyArrayOfMatrices([
			LayerEx.getRotationMatrix(camera),
			LayerEx.getOrientationMatrix(camera),
			Matrix.invert(lookAtMatrix),
			LayerEx.getPositionMatrix(camera),
		]);

		return localMatrix;
	};

	module.getProjectedZ = function(camera, w) {
		var z, zoom;

		zoom = camera.property('ADBE Camera Options Group').property('ADBE Camera Zoom').value;
		z = zoom - (zoom / w);

		return z;
	};

	module.getViewMatrix = function(camera) {
		var localMatrix, viewMatrix, worldMatrix;

		localMatrix = module.getLocalMatrix(camera);
		worldMatrix = module.getWorldMatrix(camera);
		viewMatrix = Matrix.multiplyArrayOfMatrices([
			localMatrix,
			worldMatrix,
		]);

		return viewMatrix;
	};

	module.getWorldMatrix = function(camera) {
		return LayerEx.getWorldMatrix(camera);
	};

	return module;
})();