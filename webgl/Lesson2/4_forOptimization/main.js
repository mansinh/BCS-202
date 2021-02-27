console.log("2SHADER!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");

var shader = {
    program: null,
    propertyLocationPosition:null,
    propertyLocationColor:null,
    propertyLocationPointSize:null,
    vertexSrc :
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
    ,
    fragmentSrc : 
        `#version 300 es
        precision mediump float;

        in vec4 linkedColor;
        out vec4 color;

        void main(){
            color = vec4(1.0, 1.0, 0.0, 1.0);
        }
        `
};




start();

function start(){
    GL.viewport(0,0,CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0,0,0,1);

    shader.program = createShaders();
    getPropertyLocations();
    setShaderProperties();

    draw();
    
}

function draw(){
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.drawArrays(GL.POINTS,0,1);
}

function getPropertyLocations(){
    shader.propertyLocationPosition = GL.getAttribLocation(program,"position");
    shader.propertyLocationColor  = GL.getAttribLocation(program,"color");
    shader.propertyLocationPointSize  = GL.getAttribLocation(program,"pointSize");
}

function setShaderProperties(){
    GL.useProgram(shader.program);
    GL.vertexAttrib3f(shader.propertyLocationPosition,0,0.2,0);
    GL.vertexAttrib3f(shader.propertyLocationColor,0,1,1);
    GL.vertexAttrib1f(shader.propertyLocationPointSize,50);

}

function createShaders(){
    var vertexShader = getAndCompileShader(shader.vertexSrc,GL.VERTEX_SHADER);
    var fragmentShader = getAndCompileShader(shader.fragmentSrc,GL.FRAGMENT_SHADER);

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