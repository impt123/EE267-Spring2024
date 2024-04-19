/**
 * @file Phong vertex shader with point and directional lights
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.3) */

var shaderID = "vShaderMultiPhong";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Vertex position in view cooridnate

uniform mat4 modelViewMat;
uniform mat4 projectionMat;
uniform mat3 normalMat;

attribute vec3 position;
attribute vec3 normal;

void main() {

	// For Phong lighting, only the transformations are done in vertex shader:
	// First transform the vectors from world space into view space, this step includes: L, N.
	normalCam = normalMat * normal;
	normalCam /= length(normalCam);
	// vec3 position1 = vec3(position[0]+100.0, position[1], position[2]);
	fragPosCam = (modelViewMat * vec4(position, 1.0)).xyz;	
	
	gl_Position = projectionMat * modelViewMat * vec4( position, 1.0 );	

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );