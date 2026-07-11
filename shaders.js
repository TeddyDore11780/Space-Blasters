export const vertexShaderSource = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
}
`;

export const fragmentShaderSource = `
precision mediump float;

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

// playerShaders.js

export const playerVertexShaderSource = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

export const playerFragmentShaderSource = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

export const bulletVertexShaderSource = `
attribute vec2 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 0.0, 1.0);
}
`;

export const bulletFragmentShaderSource = `
precision mediump float;

uniform vec4 uColor;

void main(void) {
    gl_FragColor = uColor;
}
`;


//enemies
export const meteorVertexShaderSource = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 vTextureCoord;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 0.0, 1.0);
  vTextureCoord = aTextureCoord;
}
`;

export const meteorFragmentShaderSource = `
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

//explosion
export const explosionVertexShaderSource = meteorVertexShaderSource; // same structure
export const explosionFragmentShaderSource = `
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;


//Enemy
export const enemyVertexShaderSource = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

export const enemyFragmentShaderSource = `
precision mediump float;

uniform sampler2D uSampler;
varying vec2 vTextureCoord;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;