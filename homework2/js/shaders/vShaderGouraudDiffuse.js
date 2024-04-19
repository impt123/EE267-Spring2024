/**
 * @file Gouraud vertex shader with diffuse and ambient light
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.1.1), (2.1.3) */

var shaderID = "vShaderGouraudDiffuse";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;
// uniform vec3 diffuseLightColor;

attribute vec3 position;
attribute vec3 normal;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 color;
		vec3 position;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {
	
	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	vColor = ambientReflection;

	for(int j = 0; j < NUM_POINT_LIGHTS; j++){ 
		// Compute diffuse reflection
		// First transform the vectors from world space into view space, this step includes: L, N.
		vec4 normalView = vec4( normalMat * normal , 0.0 );
		normalView /= length(normalView);
		// vec3 position1 = vec3(position[0]-50.0, position[1], position[2]);
		vec4 lightVecView = viewMat * vec4( (pointLights[j].position) , 1.0 ) - modelViewMat * vec4( position , 1.0 );
		float distanceLV = length(lightVecView);
		lightVecView /= distanceLV;

		vec3 diffuseReflection = 1.0/( attenuation[0] + attenuation[1] * distanceLV + attenuation[2] * pow( distanceLV , 2.0 ) ) * (material.diffuse * pointLights[j].color * max( 0.0, dot( normalView , lightVecView ) ));

		// Summing over two terms
		vColor += diffuseReflection;
	}

	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );