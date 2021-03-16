
import { MAIN } from "./Main";

const VERTEX_SOURCE = 
    `#version 300 es
    precision mediump float;
    
    in vec4 position;
    in vec4 color;
    in float pointSize;
    in vec2 texCoord;

    uniform mat4 projectionMatrix;
    uniform mat4 modelMatrix;

    out vec4 linkedColor;
    out vec2 linkedTexCoord;

    void main() {
        gl_Position = projectionMatrix * modelMatrix * position;
        gl_PointSize = pointSize;
        linkedColor = color;
        linkedTexCoord = texCoord;
    }`
const FRAGMENT_SOURCE =
    `#version 300 es
    precision mediump float;

    in vec4 linkedColor;
    in vec2 linkedTexCoord;

    uniform sampler2D texture0;
    uniform sampler2D texture1;

    out vec4 color;

    void main() {
        color = mix(texture(texture0, linkedTexCoord), texture(texture1, linkedTexCoord), 0.5) * linkedColor;
    }`
;

export class Shader {
    constructor() {
        this.program = this.getNewShaderProgram();
        this.getPropertyLocations();
    }

    program:WebGLProgram;
    propertyLocationPosition:number ;
    propertyLocationPointSize:number ;
    propertyLocationColor:number ;
    propertyLocationTexCoord:number ;
    propertyLocationModelMatrix:WebGLUniformLocation;
    propertyLocationProjectionMatrix:WebGLUniformLocation;
    propertyLocationTextures:WebGLUniformLocation[] = [];

    getNewShaderProgram() {
        var vertexShader:WebGLShader = <WebGLShader>this.getAndCompileShader(VERTEX_SOURCE, MAIN.gl.VERTEX_SHADER);
        var fragmentShader:WebGLShader  = <WebGLShader>this.getAndCompileShader(FRAGMENT_SOURCE, MAIN.gl.FRAGMENT_SHADER);
    
        var newShaderProgram:WebGLProgram = <WebGLProgram>MAIN.gl.createProgram();
        MAIN.gl.attachShader(newShaderProgram, vertexShader);
        MAIN.gl.attachShader(newShaderProgram, fragmentShader);
        MAIN.gl.linkProgram(newShaderProgram);
        MAIN.gl.useProgram(newShaderProgram);
    
        return newShaderProgram;
    }

    getAndCompileShader(_shaderSource:string, _shaderType:number) {
        var newShader:WebGLShader = <WebGLShader>MAIN.gl.createShader(_shaderType);
        MAIN.gl.shaderSource(newShader, _shaderSource);
        MAIN.gl.compileShader(newShader);
    
        if (!MAIN.gl.getShaderParameter(newShader, MAIN.gl.COMPILE_STATUS)) {
            alert(MAIN.gl.getShaderInfoLog(newShader));
            return null;
        }
    
        return newShader;
    }

    getPropertyLocations() {
        this.propertyLocationPosition         = MAIN.gl.getAttribLocation(this.program   , "position");
        this.propertyLocationPointSize        = MAIN.gl.getAttribLocation(this.program   , "pointSize");
        this.propertyLocationColor            = MAIN.gl.getAttribLocation(this.program   , "color");
        this.propertyLocationTexCoord         = MAIN.gl.getAttribLocation(this.program   , "texCoord");

        this.propertyLocationModelMatrix      = <WebGLUniformLocation>MAIN.gl.getUniformLocation(this.program  , "modelMatrix");
        this.propertyLocationProjectionMatrix      = <WebGLUniformLocation>MAIN.gl.getUniformLocation(this.program  , "projectionMatrix");
        this.propertyLocationTextures = [
            <WebGLUniformLocation>MAIN.gl.getUniformLocation(this.program  , "texture0")
        ,   <WebGLUniformLocation>MAIN.gl.getUniformLocation(this.program  , "texture1")
        ]

        MAIN.gl.enableVertexAttribArray(this.propertyLocationPosition);
        MAIN.gl.enableVertexAttribArray(this.propertyLocationColor);
        MAIN.gl.enableVertexAttribArray(this.propertyLocationTexCoord);
    }
}