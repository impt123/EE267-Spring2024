
/**
 * @file functions to compute model/view/projection matrices
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/03/31

 */

/**
 * MVPmat
 *
 * @class MVPmat
 * @classdesc Class for holding and computing model/view/projection matrices.
 *
 * @param  {DisplayParameters} dispParams    display parameters
 */
var MVPmat = function ( dispParams ) {

	// Alias for accessing this from a closure
	var _this = this;


	// A model matrix
	this.modelMat = new THREE.Matrix4();

	// A view matrix
	this.viewMat = new THREE.Matrix4();

	// A projection matrix
	this.projectionMat = new THREE.Matrix4();


	var topViewMat = new THREE.Matrix4().set(
		1, 0, 0, 0,
		0, 0, - 1, 0,
		0, 1, 0, - 1500,
		0, 0, 0, 1 );

	/* Functions */

	// A function to compute a model matrix based on the current state
	//
	// INPUT
	// state: state of StateController
	function computeModelTransform( state ) {

		/* TODO (2.1.1.3) Matrix Update / (2.1.2) Model Rotation  */
		var translateX = state.modelTranslation.x;
		var translateY = state.modelTranslation.y;
		var translateZ = state.modelTranslation.z;
		var rotationX = state.modelRotation.x;
		var rotationY = state.modelRotation.y;	
		trOp = new THREE.Matrix4().makeTranslation(translateX,translateY,translateZ);
		rtOpX = new THREE.Matrix4().makeRotationX( rotationX );
		rtOpY = new THREE.Matrix4().makeRotationY( rotationY );
		return trOp.multiply(rtOpX.multiply(rtOpY))

	}

	// A function to compute a view matrix based on the current state
	//
	// NOTE
	// Do not use lookAt().
	//
	// INPUT
	// state: state of StateController
	function computeViewTransform( state ) {

		/* TODO (2.2.3) Implement View Transform */
		var eyeVec = new THREE.Vector3(state.viewerPosition.x, state.viewerPosition.y, state.viewerPosition.z);
		var zcVec = new THREE.Vector3(state.viewerPosition.x - state.viewerTarget.x, state.viewerPosition.y - state.viewerTarget.y, state.viewerPosition.z - state.viewerTarget.z);
		zcVec.normalize();
		var upVec = new THREE.Vector3( 0, 1, 0 );
		var xcVec = new THREE.Vector3();
		xcVec.crossVectors( upVec, zcVec );
		xcVec.normalize();
		var ycVec = new THREE.Vector3();
		ycVec.crossVectors( zcVec, xcVec );

		
		return new THREE.Matrix4().set(
			xcVec.x, 	xcVec.y, 	xcVec.z, 	-( xcVec.x * eyeVec.x + xcVec.y * eyeVec.y + xcVec.z * eyeVec.z ),
			ycVec.x, 	ycVec.y, 	ycVec.z, 	-( ycVec.x * eyeVec.x + ycVec.y * eyeVec.y + ycVec.z * eyeVec.z ),
			zcVec.x, 	zcVec.y, 	zcVec.z, 	-( zcVec.x * eyeVec.x + zcVec.y * eyeVec.y + zcVec.z * eyeVec.z ),
			0, 			0, 			0, 			1 );

	}

	// A function to compute a perspective projection matrix based on the
	// current state
	//
	// NOTE
	// Do not use makePerspective().
	//
	// INPUT
	// Notations for the input is the same as in the class.
	function computePerspectiveTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		/* TODO (2.3.1) Implement Perspective Projection */
		/* By reading the code line, the right, ... variables 
		refers to the position on the clipNear plane. Now we 
		can define the necessary parameters:
		*/
		var fovy = Math.abs( 2 * Math.atan( ( top - bottom ) / clipNear ) );
		var f = 1 / Math.tan( fovy / 2 );
		var aspectRatio = Math.abs( ( right - left ) / ( top - bottom ) );
		var mat33 = - ( clipFar + clipNear ) / ( clipFar - clipNear );
		var mat34 = - ( 2 * clipFar * clipNear ) / ( clipFar - clipNear );
		var mat11 = 2 * clipNear / ( right - left );
		var mat22 = 2 * clipNear / ( top - bottom );
		var mat13 = ( right + left ) / ( right - left );
		var mat23 = ( top + bottom ) / ( top - bottom );

		return new THREE.Matrix4().set(
			mat11, 	0, 		mat13, 		0,
			0, 		mat22, 	mat23, 		0,
			0, 		0, 		mat33, 		mat34,
			0, 		0,  	-1.0, 		0 );

	}

	// A function to compute a orthographic projection matrix based on the
	// current state
	//
	// NOTE
	// Do not use makeOrthographic().
	//
	// INPUT
	// Notations for the input is the same as in the class.
	function computeOrthographicTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		/* TODO (2.3.2) Implement Orthographic Projection */
		var mat33 = ( - 2 ) / ( clipFar - clipNear );
		var mat34 = - ( clipFar + clipNear ) / ( clipFar - clipNear );
		var mat11 = 2 / ( right - left );
		var mat22 = 2 / ( top - bottom );
		var mat14 = - ( right + left ) / ( right - left );
		var mat24 = - ( top + bottom ) / ( top - bottom );

		return new THREE.Matrix4().set(
			mat11, 	0, 		0, 			mat14,
			0, 		mat22, 	0, 			mat24,
			0, 		0, 		mat33, 		mat34,
			0, 		0,  	0, 			1 );

	}

	// Update the model/view/projection matrices
	// This function is called in every frame (animate() function in render.js).
	function update( state ) {

		// Compute model matrix
		this.modelMat.copy( computeModelTransform( state ) );

		// Use the hard-coded view and projection matrices for top view
		if ( state.topView ) {

			this.viewMat.copy( topViewMat );

			var right = ( dispParams.canvasWidth * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

			var left = - right;

			var top = ( dispParams.canvasHeight * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

			var bottom = - top;

			this.projectionMat.makePerspective( left, right, top, bottom, 1, 10000 );

		} else {

			// Compute view matrix
			this.viewMat.copy( computeViewTransform( state ) );

			// Compute projection matrix
			if ( state.perspectiveMat ) {

				var right = ( dispParams.canvasWidth * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

				var left = - right;

				var top = ( dispParams.canvasHeight * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

				var bottom = - top;

				this.projectionMat.copy( computePerspectiveTransform(
					left, right, top, bottom, state.clipNear, state.clipFar ) );

			} else {

				var right = dispParams.canvasWidth * dispParams.pixelPitch / 2;

				var left = - right;

				var top = dispParams.canvasHeight * dispParams.pixelPitch / 2;

				var bottom = - top;

				this.projectionMat.copy( computeOrthographicTransform(
					left, right, top, bottom, state.clipNear, state.clipFar ) );

			}

		}

	}



	/* Expose as public functions */

	this.computeModelTransform = computeModelTransform;

	this.computeViewTransform = computeViewTransform;

	this.computePerspectiveTransform = computePerspectiveTransform;

	this.computeOrthographicTransform = computeOrthographicTransform;

	this.update = update;

};
