console.log("2HTML!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");

start();

function start(){
    GL.viewport(0,0,CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0,0,0,1);

    var shaderProgram = createShaders();
    GL.useProgram(shaderProgram);

    draw();
    
}

function draw(){
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.drawArrays(GL.POINTS,0,1);
}

function createShaders(){
    var vertexShader = getAndCompileShader("vertexShader",GL.VERTEX_SHADER);
    var fragmentShader = getAndCompileShader("fragmentShader",GL.FRAGMENT_SHADER);

    var newShaderProgram = GL.createProgram();
    GL.attachShader(newShaderProgram,vertexShader);
    GL.attachShader(newShaderProgram,fragmentShader);

    GL.linkProgram(newShaderProgram);
    return newShaderProgram;
}

function getAndCompileShader(id, shaderType){
    var shaderElement = document.getElementById(id);
    var shaderText = shaderElement.text.trim();

    var newShader = GL.createShader(shaderType);
    GL.shaderSource(newShader, shaderText);
    GL.compileShader(newShader);

    return newShader;
}