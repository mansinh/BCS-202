console.log("textures!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 9*FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3*FLOAT_SIZE_BYTES;
const VERTEX_TEX_COORDS_OFFSET = 7*FLOAT_SIZE_BYTES;

var shader = {
    program: null,
    propertyLocationPosition:null,
    propertyLocationColor:null,
    propertyLocationPointSize:null,
    propertyLocationTexCoord:null,
    propertyLocationMainTex:null,
    vertexSrc :
        `#version 300 es
        precision mediump float;

        in vec4 position;
        in vec4 color;
        in float pointSize;
        in vec2 texCoord;

        out vec4 linkedColor;
        out vec2 linkedTexCoord;

        void main(){
           gl_Position = position;
           gl_PointSize = pointSize;
           linkedColor = color;
           linkedTexCoord = texCoord;
        }`
    ,
    fragmentSrc : 
        `#version 300 es
        precision mediump float;

        in vec4 linkedColor;
        in vec2 linkedTexCoord;

        uniform sampler2D mainTexture;

        out vec4 finalColor;

        void main(){
            finalColor = linkedColor*texture(mainTexture,linkedTexCoord);
        }`
};


var vertexDataBuffer;

var textureBufferA = GL.createTexture();
textureBufferA.image = new Image();
textureBufferA.image.src = "./images/Clouds.png";
textureBufferA.image.onload = function(){
    GL.bindTexture(GL.TEXTURE_2D,textureBufferA);
    GL.texImage2D(GL.TEXTURE_2D,0,GL.RGB,GL.RGB,GL.UNSIGNED_BYTE,textureBufferA.image);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER,GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER,GL.NEAREST);

    console.log(textureBufferA.image.complete);
    start();
}


function start(){
    if(!textureBufferA.image.complete) return;

    GL.viewport(0,0,CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0,0,0,1);

    createVertices();

    shader.program = createShaders();
    getPropertyLocations();
    setShaderProperties();

    draw();
    
}

function draw(){
    GL.clear(GL.COLOR_BUFFER_BIT);
    //GL.drawArrays(GL.LINE_LOOP,0,3);
    GL.drawArrays(GL.TRIANGLES,0,3);
}

function getPropertyLocations(){
    shader.propertyLocationPosition = GL.getAttribLocation(shader.program,"position");
    shader.propertyLocationColor  = GL.getAttribLocation(shader.program,"color");
    shader.propertyLocationPointSize  = GL.getAttribLocation(shader.program,"pointSize");
    shader.propertyLocationTexCoord = GL.getAttribLocation(shader.program,"texCoord");
    
    shader.propertyLocationMainTex = GL.getUniformLocation(shader.program,"mainTexture");



    GL.enableVertexAttribArray(shader.propertyLocationPosition);
    GL.enableVertexAttribArray(shader.propertyLocationColor);
    GL.enableVertexAttribArray(shader.propertyLocationTexCoord);
}



function createShaders(){
    var vertexShader = getAndCompileShader(shader.vertexSrc,GL.VERTEX_SHADER);
    var fragmentShader = getAndCompileShader(shader.fragmentSrc,GL.FRAGMENT_SHADER);

    var newShaderProgram = GL.createProgram();
    GL.attachShader(newShaderProgram,vertexShader);
    GL.attachShader(newShaderProgram,fragmentShader);

    GL.linkProgram(newShaderProgram);
    GL.useProgram(newShaderProgram);
    
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
    var vertices = [
        random(), random(), random(),   1.0,  0.0,  0.0, 1.0,   0.0, 0.0,
        random(), random(), random(),   0.0, 1.0, 0.0, 1.0,     1.0, 0.0,
        random(), random(), random(),   1.0,  1.0, 0.0, 1.0,    0.5, 1.0
    ];

    vertexDataBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexDataBuffer)
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);


}


function random(){
    return Math.random()*2-1
}


function setShaderProperties(){
    GL.useProgram(shader.program);
    
    
    GL.vertexAttribPointer(shader.propertyLocationPosition,3, GL.FLOAT,false,STRIDE,0);
    GL.vertexAttribPointer(shader.propertyLocationColor,4, GL.FLOAT,false,STRIDE,VERTEX_COLOR_OFFSET);

    GL.vertexAttribPointer(shader.propertyLocationTexCoord,2, GL.FLOAT,false,STRIDE,VERTEX_TEX_COORDS_OFFSET);

    GL.vertexAttrib1f(shader.propertyLocationPointSize,50);

    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D,textureBufferA);
    GL.uniform1i(shader.propertyLocationMainTex,0);

}