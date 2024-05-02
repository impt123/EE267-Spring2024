/**
 * @file Unwarp fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/21
 */

/* TODO (2.2.2) Fragment shader implementation */

var shaderID = "fShaderUnwarp";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

varying vec2 textureCoords;

// texture rendered in the first rendering pass
uniform sampler2D map;

// center of lens for un-distortion
// in normalized coordinates between 0 and 1
uniform vec2 centerCoordinate;

// [width, height] size of viewport in [mm]
// viewport is the left/right half of the browser window
uniform vec2 viewportSize;

// lens distortion parameters [K_1, K_2]
uniform vec2 K;

// distance between lens and screen in [mm]
uniform float distLensScreen;

void main() {

	// hello darkness my old friend;
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
	
	// calculate the distance to center in metric unit:
	float distanceToCenter = sqrt( pow(( textureCoords[0] - centerCoordinate[0] ) * viewportSize[0] , 2.0) + pow(( textureCoords[1] - centerCoordinate[1] ) * viewportSize[1] , 2.0) );

	// calculate normalized distance:
	float rNormalized = distanceToCenter / distLensScreen;

	// calculate the scaling factor 1 + K1 r^2 + K2 r^4
	float scalingFactor = 1.0 + K[0] * pow(rNormalized , 2.0) + K[1] * pow(rNormalized , 4.0);

	// calculate the distorted coordinates:
	vec2 distortedCoords = (textureCoords - centerCoordinate) * scalingFactor + centerCoordinate;
	// vec2 distortedCoords = (textureCoords) * scalingFactor;

	// assign color to the lookup coordinates:
	if ( (distortedCoords[0] < 1.0) && (distortedCoords[0] >= 0.0) && (distortedCoords[1] < 1.0) && (distortedCoords[1] >= 0.0)){
		gl_FragColor = texture2D( map, distortedCoords );
	} 

	// gl_FragColor = texture2D( map, textureCoords );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
