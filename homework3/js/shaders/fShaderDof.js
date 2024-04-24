/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderDof";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// depth map from the first rendering
uniform sampler2D depthMap;

// Projection matrix used for the first pass
uniform mat4 projectionMat;

// Inverse of projectionMat
uniform mat4 invProjectionMat;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// Gaze position in [pixels]
uniform vec2 gazePosition;

// Diameter of pupil in [mm]
uniform float pupilDiameter;

// pixel pitch in [mm]
uniform float pixelPitch;

const float searchRad = 11.0;


// Compute the distance to fragment in [mm]
// p: texture coordinate of a fragment / a gaze position
//
// Note: GLSL is column major
float distToFrag( vec2 p ) {

	/* TODO (2.3.1) Distance to Fragment */
	vec4 depthVec = texture2D( depthMap , p ); // accessing the depth info
	float zWindow = depthVec.x;
	vec3 widthHeightConst = vec3(windowSize.xy / 2.0, 0.5);
	vec3 vWindow = vec3(p.xy, zWindow);
	vec3 vNDC = vWindow / widthHeightConst - 1.0;
	float wClip = projectionMat[2][3] / (vNDC.z - projectionMat[2][2] / projectionMat[3][2]);
	vec4 vClip = vec4(vNDC.xyz * wClip, wClip);
	vec4 vView = invProjectionMat * vClip;
	// Check that the fourth component is 1.0, otherwise return false
	// if (vView.w != 1.0) {
	// 	return false
	// }
	vec4 vOrigin = vec4(0.0, 0.0, 0.0, 1.0);
	float distFragOrigin = distance(vView,vOrigin);
	return distFragOrigin;

}


// compute the circle of confusion in [mm]
// fragDist: distance to current fragment in [mm]
// focusDist: distance to focus plane in [mm]
float computeCoC( float fragDist, float focusDist ) {

	/* TODO (2.3.2) Circle of Confusion Computation */
	float CoC = pupilDiameter / abs(focusDist - pupilDiameter) * abs(fragDist - focusDist) / focusDist * pupilDiameter;

	return CoC;

}


// compute depth of field blur and return color at current fragment
vec4 computeBlur() {

	/* TODO (2.3.3) Retinal Blur */
	// first get the CoC at this fragment, which needs the accommodation distance and the fragment distance. 
	vec2 gazeCoords = gazePosition / windowSize; // convert to in range [0,1]
	float accomDist = distToFrag(gazeCoords); // calculate the accommodation distance
	float fragDist = distToFrag(textureCoords); // calculate the fragment distance
	float coc = computeCoC(fragDist, accomDist); 
	float cocRad = coc / 2.0 / pixelPitch; // Convert CoC (diameter) from mm to pixels

	// initializing the parameters
    vec4 colorSum = vec4(0.0); 
    float weightSum = 0.0;
    
    // Define the maximum search radius in pixels (assuming square window for simplicity)
    // int maxRadius = int(min(searchRad, cocRad));
	
	// for loop moving pixel step
	vec2 pixelStep = 1.0 / windowSize; // Step size for one pixel in texture coordinate units

    // Double for loop to average over neighboring pixels
    for (float i = -searchRad; i <= searchRad; i++) {
        for (float j = -searchRad; j <= searchRad; j++) {

            // Compute the current sampling point
            vec2 offset = vec2(float(i), float(j)) * pixelStep;

			// Compute distance of the current sample from the center pixel
            float distToCenter = length(vec2(float(i), float(j)));
			
			// judge whether the fragment is inside the CoC or outside. If inside then add it in if outside then skip (Check if the current sample is within the CoC)
            if (distToCenter <= cocRad) {
                vec4 sampleColor = texture2D(textureMap, textureCoords + offset);
                
                // Accumulate color and weight
                colorSum += sampleColor;
                weightSum += 1.0;
            } 
			else {
				continue;
			}
        }
    }
	// for debugging: vec4 depthVec = texture2D( depthMap , gazeCoords);

    // Normalize the accumulated color by the weight sum
    return colorSum / weightSum;

	/* vec4(depthVec.xyz / 2.0, 1.0);
	vec4(cocRad, 0.0, 0.0, 1.0);
	*/
}


void main() {

	gl_FragColor = computeBlur();

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
