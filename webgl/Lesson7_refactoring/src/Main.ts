import { WebGLApp } from "./WebGLApp";

var canvas   : HTMLCanvasElement      = <HTMLCanvasElement>document.getElementById("canvas");
var gl       : WebGL2RenderingContext = <WebGL2RenderingContext>canvas.getContext("webgl2");
var webGLApp : WebGLApp               = new WebGLApp();


// Declare mat4 const.
export const MAIN = {
    canvas
,   gl
,   webGLApp
};

webGLApp.initialize();