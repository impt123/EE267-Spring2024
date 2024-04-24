/**
 * @file Fragment shader for foveated rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.2.4) Fragment Shader Foveation Blur */

var shaderID = "fShaderFoveated";

var shader = document.createTextNode( `
/***
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// texture or uv coordinates of current fragment in normalized coordinates [0,1]
varying vec2 textureCoords;

// texture map from the first rendering pass
uniform sampler2D textureMap;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// window space coordinates of gaze position in [pixels]
uniform vec2 gazePosition;

// eccentricity angle at boundary of foveal and middle layers
uniform float e1;

// eccentricity angle at boundary of middle and outer layers
uniform float e2;

// visual angle of one pixel
uniform float pixelVA;

// radius of middle layer blur kernel [in pixels]
const float middleKernelRad = 2.0;

// radius of outer layer blur kernel [in pixels]
const float outerKernelRad = 4.0;

// gaussian blur kernel for middle layer (5x5)
uniform float middleBlurKernel[int(middleKernelRad)*2+1];

// gaussian blur kernel for outer layer (9x9)
uniform float outerBlurKernel[int(outerKernelRad)*2+1];

// gaussian blur radius for middle layer (5)
const int middleBlurRad = int(middleKernelRad)*2+1;

// gaussian blur radius for outer layer (9)
const int outerBlurRad = int(outerKernelRad)*2+1;


void main() {
    // Convert gaze position to normalized texture coordinates
    vec2 gazePositionNorm = gazePosition / windowSize;
    
    // Calculate distance from current fragment to gaze position in normalized coordinates
    float distToGaze = distance(textureCoords, gazePositionNorm);
    
    // Convert distance to visual angle (using the visual angle of one pixel)
    float eccentricityAngle = distToGaze * windowSize.x * pixelVA;
    
    vec4 colorSum = vec4(0.0);
    float kernelWeightSum = 0.0;
    float blurRadius = 0.0;
    int kernelSize = 0;
    // float[] blurKernel;
	vec4 testVar = vec4(0.0, 0.0, 0.0, 1.0);

    // Determine the kernel to use based on eccentricity angle
    if (eccentricityAngle <= e1) {
        // Foveal region (no blur)
        colorSum = texture2D(textureMap, textureCoords);
		testVar = vec4(1.0, 0.0, 0.0, 1.0);
    } else if (eccentricityAngle > e1 && eccentricityAngle <= e2) {
        // Middle layer blur
		testVar = vec4(0.0, 1.0, 0.0, 1.0);
		// Loop over the blur kernel
        for (int i = -int(middleKernelRad); i <= int(middleKernelRad); i++) {
            for (int j = -int(middleKernelRad); j <= int(middleKernelRad); j++) {
                // Calculate the texture offset
                vec2 offset = vec2(float(i), float(j)) / windowSize;
                // Sample the texture and multiply by the corresponding kernel weight
                vec4 texColor = texture2D(textureMap, textureCoords + offset);
                float kernelValue = middleBlurKernel[i + int(middleKernelRad)] * middleBlurKernel[j + int(middleKernelRad)]; 
                colorSum += texColor * kernelValue;
                kernelWeightSum += kernelValue;
            }
        }
        // Normalize the sum by the weight sum
        colorSum /= kernelWeightSum;	
    } else {
        // Outer layer blur
		testVar = vec4(0.0, 0.5, 0.5, 1.0);
		// Loop over the blur kernel
        for (int i = -int(outerKernelRad); i <= int(outerKernelRad); i++) {
            for (int j = -int(outerKernelRad); j <= int(outerKernelRad); j++) {
                // Calculate the texture offset
                vec2 offset = vec2(float(i), float(j)) / windowSize;
                // Sample the texture and multiply by the corresponding kernel weight
                vec4 texColor = texture2D(textureMap, textureCoords + offset);
                float kernelValue = outerBlurKernel[i + int(outerKernelRad)] * outerBlurKernel[j + int(outerKernelRad)];
                colorSum += texColor * kernelValue;
                kernelWeightSum += kernelValue;
            }
        }
        // Normalize the sum by the weight sum
        colorSum /= kernelWeightSum;
    }

    // Output the final color
    gl_FragColor = colorSum;
}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
