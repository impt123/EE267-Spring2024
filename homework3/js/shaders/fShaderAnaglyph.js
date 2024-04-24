/**
 * @file Fragment shader for anaglyph rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.4.3) Color Channel Multiplexing */

var shaderID = "fShaderAnaglyph";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// Texture map for the left eye
uniform sampler2D textureMapL;

// Texture map for the right eye
uniform sampler2D textureMapR;

void main() {

	// get the RGB colors of the left and right eyes
	vec4 fragColorLeft = texture2D( textureMapL,  textureCoords );
	vec4 fragColorRight = texture2D( textureMapR,  textureCoords );	

	// convert to gray scale:
	float fragGrayLeft = 0.2989 * fragColorLeft.x + 0.5870 * fragColorLeft.y + 0.1140 * fragColorLeft.z;
	float fragGrayRight = 0.2989 * fragColorRight.x + 0.5870 * fragColorRight.y + 0.1140 * fragColorRight.z;

	gl_FragColor = vec4(fragGrayLeft, fragGrayRight, fragGrayRight, 1.0);

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
