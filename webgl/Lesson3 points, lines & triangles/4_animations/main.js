console.log("!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 7*FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3*FLOAT_SIZE_BYTES;
const VERTEX_COUNT = 5000;

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
        }        `
    ,
    fragmentSrc : 
        `#version 300 es
        precision mediump float;

        in vec4 linkedColor;
        out vec4 color;

        void main(){
            color = linkedColor;
        }
        `
};

var vertices = [];

var vertexDataBuffer;


start();

function start(){
    GL.viewport(0,0,CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0,0,0,1);

    createVertices();

    shader.program = createShaders();
    getPropertyLocations();
    setShaderProperties();

    requestAnimationFrame(draw);
    
}

var frameCount = 0;

function draw(){
    GL.clear(GL.COLOR_BUFFER_BIT);

    moveVertices();
    GL.bufferSubData(GL.ARRAY_BUFFER,0,new Float32Array(vertices));

    GL.drawArrays(GL.POINTS,0,VERTEX_COUNT);
    //GL.drawArrays(GL.LINE_LOOP,0,3);
    //GL.drawArrays(GL.TRIANGLES,0,3);
    frameCount += 1/60;
    requestAnimationFrame(draw);
}

function getPropertyLocations(){
    shader.propertyLocationPosition = GL.getAttribLocation(shader.program,"position");
    shader.propertyLocationColor  = GL.getAttribLocation(shader.program,"color");
    shader.propertyLocationPointSize  = GL.getAttribLocation(shader.program,"pointSize");

    GL.enableVertexAttribArray(shader.propertyLocationPosition)
    GL.enableVertexAttribArray(shader.propertyLocationColor)
}

function setShaderProperties(){
    GL.useProgram(shader.program);
    
    GL.bindBuffer(GL.ARRAY_BUFFER,vertexDataBuffer)
    
    GL.vertexAttribPointer(shader.propertyLocationPosition,3, GL.FLOAT,false,STRIDE,0);

    GL.bindBuffer(GL.ARRAY_BUFFER,vertexDataBuffer)
    GL.vertexAttribPointer(shader.propertyLocationColor,4, GL.FLOAT,false,STRIDE,VERTEX_COLOR_OFFSET);

    GL.vertexAttrib1f(shader.propertyLocationPointSize,2);

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

function createVertices(){

    for(let i = 0; i < VERTEX_COUNT; i++){
        //positions
        vertices.push(random());
        vertices.push(random());
        vertices.push(0.0);

        //color
        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(1.0);
    }

    vertexDataBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexDataBuffer)
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.DYNAMIC_DRAW);

}

function moveVertices(){
    for(let i = 0; i < vertices.length; i+=STRIDE/FLOAT_SIZE_BYTES){
         vertices[i] += random()/500;
        //vertices[i+1] += random()/500;
        vertices[i+1] = Math.cos(frameCount+i*100)
    }
}

function random(){
    return Math.random()*2-1;
}


