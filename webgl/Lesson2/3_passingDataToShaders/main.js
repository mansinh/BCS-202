console.log("2SHADER!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");

const VERTEX_SHADER_SRC = 
`#version 300 es

in vec4 position;
in vec4 color;
in float pointSize;

out vec4 linkedColor;

void main(){
    gl_Position = position;
    gl_PointSize = pointSize;
    linkedColor = color;
}
`
;

const FRAGMENT_SHADER_SRC = 
`#version 300 es
precision mediump float;

in vec4 linkedColor;
out vec4 color;

void main(){
    color = vec4(1.0, 1.0, 0.0, 1.0);
}
`
;

var program;
var propertyLocationPosition;
var propertyLocationColor;
var propertyLocationPointSize;



start();

function start(){
    GL.viewport(0,0,CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0,0,0,1);

    program = createShaders();
    getPropertyLocations();
    setShaderProperties();

    draw();
    
}

function draw(){
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.drawArrays(GL.POINTS,0,1);
}

function getPropertyLocations(){
    propertyLocationPosition = GL.getAttribLocation(program,"position");
    propertyLocationColor  = GL.getAttribLocation(program,"color");
    propertyLocationPointSize  = GL.getAttribLocation(program,"pointSize");
}

function setShaderProperties(){
    GL.useProgram(program);
    GL.vertexAttrib3f(propertyLocationPosition,0,0.2,0);
    GL.vertexAttrib3f(propertyLocationColor,0,1,1);
    GL.vertexAttrib1f(propertyLocationPointSize,50);

}

function createShaders(){
    var vertexShader = getAndCompileShader(VERTEX_SHADER_SRC,GL.VERTEX_SHADER);
    var fragmentShader = getAndCompileShader(FRAGMENT_SHADER_SRC,GL.FRAGMENT_SHADER);

    var newShaderProgram = GL.createProgram();
    GL.attachShader(newShaderProgram,vertexShader);
    GL.attachShader(newShaderProgram,fragmentShader);

    GL.linkProgram(newShaderProgram);
    return newShaderProgram;
}

function getAndCompileShader(source, shaderType){
    var shaderText = source.trim();
    var newShader = GL.createShader(shaderType);
    GL.shaderSource(newShader, shaderText);
    GL.compileShader(newShader);

    if(!GL.getShaderParameter(newShader,GL.COMPILE_STATUS)){
        alert(GL.getShaderInfoLog(newShader));
        return null;
    }

    return newShader;
}