console.log("2SHADER!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");

const VERTEX_SHADER_SRC = 
`void main(){
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;

}`
;

const FRAGMENT_SHADER_SRC = 
`void main(){
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}`
;

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
        return null
    }

    return newShader;
}