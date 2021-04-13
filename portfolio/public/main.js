console.log("!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 7*FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3*FLOAT_SIZE_BYTES;
const VERTEX_COUNT = 100000;
const RANGE = 0.3;
const ASPECT_RATIO_WIDTH_MULTIPLIER = CANVAS.clientWidth/CANVAS.clientHeight;


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

var mousePosition = {
    x:-2,
    y:-2
};



var vertices = [];
var vertexDataBuffer;

CANVAS.addEventListener("mousemove", (e) => {
    mousePosition.x = remapValue(e.clientX,0,CANVAS.clientWidth,-1,1);
    mousePosition.y = -remapValue(e.clientY,0,CANVAS.clientHeight,-1,1);
});

CANVAS.addEventListener('touchmove', (e) => {
    //e.preventDefault();
    const touches = e.targetTouches;
    mousePosition.x = remapValue(touches[0].x,0,CANVAS.clientWidth,-1,1);
    mousePosition.y = -remapValue(touches[0].y,0,CANVAS.clientHeight,-1,1);
}, false);

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

    GL.vertexAttrib1f(shader.propertyLocationPointSize,1);

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
        vertices.push(0.5);
        vertices.push(1.0);
    }

    vertexDataBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexDataBuffer)
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.DYNAMIC_DRAW);

}



function moveVertices(){
    for(let i = 0; i < vertices.length; i+=STRIDE/FLOAT_SIZE_BYTES){
        
        var d = {
            x: ASPECT_RATIO_WIDTH_MULTIPLIER*(vertices[i]-mousePosition.x),
            y: vertices[i+1]-mousePosition.y
        }
        var distance = Math.sqrt(d.x*d.x + d.y*d.y);
        var push = RANGE*1.1;

        //vertices[i] = Math.cos(frameCount+i*100)
        if(RANGE> distance){
            vertices[i] = mousePosition.x + d.x*push/distance;
            vertices[i+1] =mousePosition.y + d.y*push/distance;
            vertices[i+4] = 0;
            vertices[i+5] = 1;
            vertices[i+6] = 1;
        }
        else{

            for(let j = 0; j < 200; j+=1){
                vertices[i] += 0.0000001;
                distance = Math.sqrt(d.x*d.x + d.y*d.y);
            }
                
           
        }

    }
}

function random(){
    return Math.random()*2-1;
}


function remapValue(v, minSrc,maxSrc,minDst,maxDst){
    return (v-minSrc)/(maxSrc-minSrc)*(maxDst - minDst) + minDst;
}