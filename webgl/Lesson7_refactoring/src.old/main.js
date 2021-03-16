const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const WEBGL_APP = new WebGLApp();
// Declare mat4 const.
const { mat4 } = glMatrix;

WEBGL_APP.initialize();