var LST = (function() {
	// @include 'lib/CameraEx.js'
	// @include 'lib/CompositionEx.js'
	// @include 'lib/LayerEx.js'
	// @include 'lib/MathEx.js'
	// @include 'lib/Matrix.js'
	// @include 'lib/Trig.js'
	// @include 'lib/Vector3.js'


	var module = {};
	/**
	 * Transforms a point from layer scope into composition scope.
	 * @param  {LayerObject}    layer     Layer
	 * @param  {Array}          offset    Point coordinates, optional. Defaults to layers anchor point value.
	 * @return {Array}                    Points coordinates in composition scope.
	 */
	module.toComp = function(layer, offset) {
		var modelMatrix, mvp, result;

		offset = fixOffset(layer, offset);
		modelMatrix = getModelMatrix(layer, offset);

		if (!layer.threeDLayer) {
			result = Matrix.getTranslate(modelMatrix);
			result.pop();
		} else {
			mvp = getModelViewProjection(modelMatrix, layer.containingComp);
			result = toScreenCoordinates(mvp, layer.containingComp);
		}

		return result;
	};

	/**
	 * Transforms a point from layer scope into view-independent world scope.
	 * @param  {LayerObject}    layer     Layer
	 * @param  {Array}          offset    Point coordinates, optional. Defaults to layers anchor point value.
	 * @return {Array}                    Points coordinates in view-independent world scope.
	 */
	module.toWorld = function(layer, offset) {
		var modelMatrix, result;

		offset = fixOffset(layer, offset);
		modelMatrix = getModelMatrix(layer, offset);
		result = Matrix.getTranslate(modelMatrix);

		if (!layer.threeDLayer) {
			result.pop();
		} else {
			result[2] *= -1;
		}

		return result;
	};

	return module;



	function fixOffset(layer, offset) {
		var property, value;

		if (typeof offset === 'undefined') {
			offset = [0, 0, 0];
		} else {
			property = layer.property('ADBE Transform Group').property('ADBE Anchor Point');
			value = property.value;

			value[2] *= -1;
			offset -= value;
		}

		return offset;
	}

	function getAOV(composition) {
		var camera, result;

		camera = composition.activeCamera;
		if (camera && camera.enabled) {
			result = CameraEx.getAOV(camera);
		} else {
			result = CompositionEx.getAOV(composition);
		}

		return result;
	}

	function getModelMatrix(layer, offset) {
		var localMatrix, offsetMatrix, result, worldMatrix;

		localMatrix = LayerEx.getLocalMatrix(layer);
		offsetMatrix = getOffsetMatrix(offset);
		worldMatrix = LayerEx.getWorldMatrix(layer);

		result = Matrix.multiplyArrayOfMatrices([
			offsetMatrix,
			localMatrix,
			worldMatrix
		]);

		return result;
	}

	function getModelViewProjection(modelMatrix, composition) {
		var projectionMatrix, result, viewMatrix;

		projectionMatrix = getProjectionMatrix(composition);
		viewMatrix = getViewMatrix(composition);

		// Model-View-Projection
		result = Matrix.multiplyArrayOfMatrices([
			modelMatrix,
			Matrix.invert(viewMatrix),
			projectionMatrix,
		]);

		return result;
	}

	function getOffsetMatrix(offset) {
		var matrix, result;

		matrix = Matrix.getIdentity();
		result = Matrix.translate(matrix, offset[0], offset[1], offset[2]);

		return result;
	}

	function getProjectedZ(composition, w) {
		var camera, result;

		camera = composition.activeCamera;
		if (camera && camera.enabled) {
			result = CameraEx.getProjectedZ(camera, w);
		} else {
			result = CompositionEx.getProjectedZ(composition, w);
		}

		return result;
	}

	function getProjectionMatrix(composition) {
		var aov, aspect, far, near, result;

		aov = getAOV(composition);
		aspect = composition.width / composition.height;
		far = 10000;
		near = 0.1;

		result = Matrix.perspective(aov, aspect, near, far);

		return result;
	}

	function getViewMatrix(composition) {
		var camera, result;

		camera = composition.activeCamera;
		if (camera && camera.enabled) {
			result = CameraEx.getViewMatrix(camera);
		} else {
			result = CompositionEx.getViewMatrix(composition);
		}

		return result;
	}

	function toScreenCoordinates(mvp, composition) {
		var ndc, result, x, y, z, w;

		w = mvp[15];
		ndc = Matrix.getTranslate(mvp) / w;

		x = (ndc[0] + 1) * composition.width / 2;
		y = (ndc[1] + 1) * composition.height / 2;
		z = getProjectedZ(composition, w);

		result = [x, y, z];

		return result;
	}
})();