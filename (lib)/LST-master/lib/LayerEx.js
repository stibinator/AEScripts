var LayerEx = (function() {
	var module = {};

	module.getAnchorPointMatrix = function(layer) {
		var matrix, property, value;

		property = layer.property('ADBE Transform Group').property('ADBE Anchor Point');
		value = property.value;

		matrix = Matrix.getIdentity();
		matrix = Matrix.translate(matrix, value[0], value[1], -value[2]);

		return matrix;
	};

	module.getLocalMatrix = function(layer) {
		var localMatrix, orientationMatrix, positionMatrix, rotationMatrix, scaleMatrix;

		orientationMatrix = module.getOrientationMatrix(layer);
		positionMatrix = module.getPositionMatrix(layer);
		rotationMatrix = module.getRotationMatrix(layer);
		scaleMatrix = module.getScaleMatrix(layer);

		localMatrix = Matrix.multiplyArrayOfMatrices([
			scaleMatrix,
			rotationMatrix,
			orientationMatrix,
			positionMatrix,
		]);

		return localMatrix;
	};

	module.getLookAt = function(layer) {
		var anchorPointProperty, anchorPointValue, lookAtMatrix,
			positionProperty, positionValue;

		anchorPointProperty = layer.property('ADBE Transform Group').property('ADBE Anchor Point');
		anchorPointValue = anchorPointProperty.value;
		anchorPointValue[2] *= -1;

		positionProperty = layer.property('ADBE Transform Group').property('ADBE Position');
		positionValue = positionProperty.value;
		positionValue[2] *= -1;

		lookAtMatrix = Matrix.lookAt(
			positionValue,
			anchorPointValue, [0, 1, 0]
		);

		return lookAtMatrix;
	};

	module.getOrientationMatrix = function(layer) {
		var matrix, property, value;

		property = layer.property('ADBE Transform Group').property('ADBE Orientation');
		value = property.value;

		matrix = Matrix.getIdentity();
		matrix = Matrix.rotateZ(matrix, Trig.degreesToRadians(value[2]));
		matrix = Matrix.rotateY(matrix, Trig.degreesToRadians(-value[1]));
		matrix = Matrix.rotateX(matrix, Trig.degreesToRadians(-value[0]));

		return matrix;
	};

	module.getPositionMatrix = function(layer) {
		var matrix, property, value;

		property = layer.property('ADBE Transform Group').property('ADBE Position');
		value = property.value;

		matrix = Matrix.getIdentity();
		matrix = Matrix.translate(matrix, value[0], value[1], -value[2]);

		return matrix;
	};

	module.getRotationMatrix = function(layer) {
		var matrix, transformProperty, valueX, valueY, valueZ;

		transformProperty = layer.property('ADBE Transform Group');
		valueX = transformProperty.property('ADBE Rotate X').value;
		valueY = transformProperty.property('ADBE Rotate Y').value;
		valueZ = transformProperty.property('ADBE Rotate Z').value;

		matrix = Matrix.getIdentity();
		matrix = Matrix.rotateZ(matrix, Trig.degreesToRadians(valueZ));
		matrix = Matrix.rotateY(matrix, Trig.degreesToRadians(-valueY));
		matrix = Matrix.rotateX(matrix, Trig.degreesToRadians(-valueX));

		return matrix;
	};

	module.getScaleMatrix = function(layer) {
		var matrix, property, value;

		property = layer.property('ADBE Transform Group').property('ADBE Scale');
		value = property.value / 100;

		matrix = Matrix.getIdentity();
		matrix = Matrix.scale(matrix, value[0], value[1], value[2]);

		return matrix;
	};

	module.getWorldMatrix = function(layer) {
		var anchorPointMatrix, localMatrix, parent, worldMatrix;

		worldMatrix = Matrix.getIdentity();
		while (layer.parent) {
			parent = layer.parent;

			anchorPointMatrix = module.getAnchorPointMatrix(parent);
			localMatrix = module.getLocalMatrix(parent);

			worldMatrix = Matrix.multiplyArrayOfMatrices([
				worldMatrix,
				Matrix.invert(anchorPointMatrix),
				localMatrix,
			]);

			layer = parent;
		}

		return worldMatrix;
	};

	return module;
})();