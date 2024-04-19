/**
 * @file Phong fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.2.2) */

var shaderID = "fShaderPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	vec3 fColor = ambientReflection;

	for(int j = 0; j < NUM_POINT_LIGHTS; j++){ 
		// Compute diffuse reflection
		vec3 lightVecView = (viewMat * vec4( (pointLights[j].position) , 1.0 )).xyz - fragPosCam;
		float distanceLV = length(lightVecView);
		lightVecView /= distanceLV;

		vec3 diffuseReflection = (material.diffuse * pointLights[j].color * max( 0.0, dot( normalCam , lightVecView ) ));

		// Compute specular term
		vec3 viewerVecView = - fragPosCam;
		viewerVecView /= length(viewerVecView);
		vec3 rVecView = - reflect(lightVecView, normalCam);
		rVecView /= length(rVecView);
		vec3 specularReflection = (material.specular * pointLights[j].color * pow( max(0.0, dot(rVecView, viewerVecView)) , material.shininess ) );

		// Summing over all three terms
		fColor += 1.0/( attenuation[0] + attenuation[1] * distanceLV + attenuation[2] * pow( distanceLV , 2.0 ) ) * ( diffuseReflection + specularReflection );
	}

	gl_FragColor = vec4( fColor, 1.0 );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );