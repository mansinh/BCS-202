console.log("!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 7 * FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3 * FLOAT_SIZE_BYTES;
const ANT_COUNT = 50;
const WIDTH = 500;
const HEIGHT = 250;
const RANGE = 0.3;
const ASPECT_RATIO_WIDTH_MULTIPLIER = CANVAS.clientWidth / CANVAS.clientHeight;

var ants = []

function ant() {
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.maxSpeed = 0.1;
    this.maxTurn = Math.PI / 10;
    this.color = 1;
}

var cells = []

function cell() {
    this.x = 0;
    this.y = 0;
    this.homingPh = 0;
    this.foodPh = 0;
    this.wall = 0;
    this.food = 0;
}
var vertices = [];
var vertexDataBuffer;

var shader = {
    program: null,
    propertyLocationPosition: null,
    propertyLocationColor: null,
    propertyLocationPointSize: null,
    vertexSrc:
        `#version 300 es

        in vec4 position;
        in vec4 color;
        in float pointSize;

        out vec4 linkedColor;

        void main(){
            
           gl_Position = position;
           if(color == vec4(0.0,0.0,0.0,2.0)){
            gl_Position.z = 1000.0;
           }
           if(color.a == 1.0){
                gl_PointSize = 2.0;
           }
           else{
               if(color.r >0.0){
                  gl_PointSize = 4.0;
               }
               else{
                 gl_PointSize = 1.0;
               }
           }
     
           linkedColor = color;
        }        `
    ,
    fragmentSrc:
        `#version 300 es
        precision mediump float;

        in vec4 linkedColor;
        out vec4 color;

        void main(){
            if(linkedColor.r >0.0 && linkedColor.a == 2.0){
                color = vec4(1.0,1.0,1.0,linkedColor.r);
            }
            else if(linkedColor.g > 0.0 &&  linkedColor.a == 2.0){
                color = vec4(0.0,0.8*linkedColor.g ,0.8*linkedColor.g ,1.0);
                //color = linkedColor;
            }
        }
        `
};

var mousePosition = {
    x: -2,
    y: -2
};

var drawingWall = false;
CANVAS.addEventListener("mousedown", (e) =>{
    drawingWall = true;
});

CANVAS.addEventListener("mouseup", (e) =>{
    drawingWall = false;
});

CANVAS.addEventListener("mousemove", (e) => {
    
    mousePosition.x = remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
    mousePosition.y = -remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
    if(drawingWall){
        drawWall(mousePosition.x,mousePosition.y);
    }
});

function drawFood(){
    var x = Math.min(parseInt((mouseX + 1.0) * WIDTH / 2), WIDTH - 1);
    var y = Math.min(parseInt((mouseY + 1.0) * HEIGHT / 2), HEIGHT - 1);
    cells[y + x * HEIGHT].food = 1
}




function drawWall(mouseX,mouseY) {
    var x = Math.min(parseInt((mouseX + 1.0) * WIDTH / 2), WIDTH - 1);
    var y = Math.min(parseInt((mouseY + 1.0) * HEIGHT / 2), HEIGHT - 1);
    cells[y + x * HEIGHT].wall = 1;
    N(x,y).wall = 1;
    S(x,y).wall = 1;
    E(x,y).wall = 1;
    W(x,y).wall = 1;
    
    NE(x,y).wall = 0.5;
    SE(x,y).wall = 0.5;
    NW(x,y).wall = 0.5;
    SW(x,y).wall = 0.5;
    
}


function N(x,y){return getCell(x,y,-1,0);}
function S(x,y){return getCell(x,y,1,0);}
function E(x,y){return getCell(x,y,0,-1);}
function W(x,y){return getCell(x,y,0,1);}
function NE(x,y){return getCell(x,y,-1,-1);}
function SE(x,y){return getCell(x,y,1,-1);}
function NW(x,y){return getCell(x,y,-1,1);}
function SW(x,y){return getCell(x,y,1,1);}

function getCell(x,y,a,b){
    var i = y+b + (x+a) * HEIGHT;
    if(i < cells.length && i>0){
        return cells[i];
    }
    return cells[y + x*HEIGHT];
}

var then = 0;
start();

function start() {
    GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0, 0, 0, 1);

    createAnts();
    createTerrain();
    createVertices();

    shader.program = createShaders();
    getPropertyLocations();
    setShaderProperties();

    then = performance.now()
    requestAnimationFrame(update);

}




function update(now) {
    updateAnts();
    updateCells();
    draw();

    requestAnimationFrame(update);
}

function draw() {
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.bufferSubData(GL.ARRAY_BUFFER, 0, new Float32Array(vertices));
    GL.drawArrays(GL.POINTS, 0, ANT_COUNT + cells.length);
 
}

function getPropertyLocations() {
    shader.propertyLocationPosition = GL.getAttribLocation(shader.program, "position");
    shader.propertyLocationColor = GL.getAttribLocation(shader.program, "color");
    shader.propertyLocationPointSize = GL.getAttribLocation(shader.program, "pointSize");

    GL.enableVertexAttribArray(shader.propertyLocationPosition)
    GL.enableVertexAttribArray(shader.propertyLocationColor)
}

function setShaderProperties() {
    GL.useProgram(shader.program);

    GL.bindBuffer(GL.ARRAY_BUFFER, vertexDataBuffer)

    GL.vertexAttribPointer(shader.propertyLocationPosition, 3, GL.FLOAT, false, STRIDE, 0);

    GL.bindBuffer(GL.ARRAY_BUFFER, vertexDataBuffer)
    GL.vertexAttribPointer(shader.propertyLocationColor, 4, GL.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);

    GL.vertexAttrib1f(shader.propertyLocationPointSize, 1);

}

function createShaders() {
    var vertexShader = getAndCompileShader(shader.vertexSrc, GL.VERTEX_SHADER);
    var fragmentShader = getAndCompileShader(shader.fragmentSrc, GL.FRAGMENT_SHADER);

    var newShaderProgram = GL.createProgram();
    GL.attachShader(newShaderProgram, vertexShader);
    GL.attachShader(newShaderProgram, fragmentShader);

    GL.linkProgram(newShaderProgram);
    return newShaderProgram;
}

function getAndCompileShader(source, shaderType) {
    var shaderText = source.trim();
    var newShader = GL.createShader(shaderType);
    GL.shaderSource(newShader, shaderText);
    GL.compileShader(newShader);

    if (!GL.getShaderParameter(newShader, GL.COMPILE_STATUS)) {
        alert(GL.getShaderInfoLog(newShader));
        return null;
    }

    return newShader;
}

function createAnts() {
    for (let i = 0; i < ANT_COUNT * STRIDE / FLOAT_SIZE_BYTES; i += STRIDE / FLOAT_SIZE_BYTES) {
        let newAnt = new ant();
        newAnt.x = 0;
        newAnt.y = 0;
        newAnt.direction = random() * Math.PI * 2;
        ants.push(newAnt);
    }
}

function createTerrain() {
    for (let i = 0.0; i < WIDTH; i++) {
        for (let j = 0.0; j < HEIGHT; j++) {
            let newCell = new cell();
            newCell.x = i / WIDTH * 2 - 1 + random() / WIDTH;
            newCell.y = j / HEIGHT * 2 - 1+ random() / HEIGHT;
            cells.push(newCell);
        }
    }
}


function createVertices() {
    for (let i = 0.0; i < cells.length; i++) {
        //positions
        vertices.push(cells[i].x);
        vertices.push(cells[i].y);
        vertices.push(0.0);

        //color
        vertices.push(0.1 * cells[i].wall);
        vertices.push(0.1 * cells[i].homingPh);
        vertices.push(0.1 * cells[i].foodPh);
        vertices.push(2.0);
        //console.log(cells[i].x + " " + cells[i].y);
    }


    for (let i = 0; i < ANT_COUNT; i++) {
        //positions
        vertices.push(ants[i].x);
        vertices.push(ants[i].x);
        vertices.push(0.0);

        //color
        vertices.push(Math.random());
        vertices.push(Math.random());
        vertices.push(0.5);
        vertices.push(1.0);
    }


    vertexDataBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexDataBuffer)
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);

}
var frameCount = 0.0;
var totalTime = 0.0;


var t = 0;
function updateAnts() {
    now = performance.now();
    var dt = now - then;
    dt *= 0.001;
    then = now;
    let j = 0;
    for (let i = 0; i < ants.length; i++) {
        updateAnt(i, dt);       
        
        updateAntVertices(i, j);
        j += STRIDE / FLOAT_SIZE_BYTES;
    }
    if(t>0.15){
        t = 0;
    }
    t+=dt;

    //console.log(frameCount / totalTime)
    //totalTime += dt;
    //frameCount++;
}


function updateAnt(i, dt) {
    ants[i].direction = ants[i].direction + random() * ants[i].maxTurn;
    

    ants[i].x += dt * Math.cos(ants[i].direction) * ants[i].maxSpeed;
    ants[i].y += dt * Math.sin(ants[i].direction) * ants[i].maxSpeed;
   

    if (ants[i].x > 1.0) {
        ants[i].direction = Math.PI;
        ants[i].x = 1.0;
    }
    if (ants[i].x < -1.0) {
        ants[i].direction = 0;
        ants[i].x = -1.0;
    }
    if (ants[i].y > 1.0) {
        ants[i].direction = -Math.PI / 2;
        ants[i].y = 1.0;
    }
    if (ants[i].y < -1.0) {
        ants[i].direction = Math.PI / 2;
        ants[i].y = -1.0;
    }

    var x = Math.min(parseInt((ants[i].x + 1.0) * WIDTH / 2), WIDTH - 1);
    var y = Math.min(parseInt((ants[i].y + 1.0) * HEIGHT / 2), HEIGHT - 1);
    
    if(wallCollsion(x,y)){
        ants[i].direction+=Math.PI;
        ants[i].x += dt * Math.cos(ants[i].direction) * ants[i].maxSpeed*2.0;
        ants[i].y += dt * Math.sin(ants[i].direction) * ants[i].maxSpeed*2.0;
        ants[i].direction += random()*Math.PI/2;
        //console.log("wall");
    }

    if(t>0.15){
        layHomingPh(x,y)
    }
    

}

function layHomingPh(x,y) {
    cells[y + x * HEIGHT].homingPh = 1;
}

function wallCollsion(x,y) {
    //console.log(cells[y + x * HEIGHT].wall);
    if(cells[y + x * HEIGHT].wall == 1.0){
        return true;
    }
    if(N(x,y).wall == 1.0){
        return true;
    }
    if(S(x,y).wall == 1.0){
        return true;
    }
    if(E(x,y).wall == 1.0){
        return true;
    }
    if(W(x,y).wall == 1.0){
        return true;
    }
    if(NE(x,y).wall == 1.0){
        return true;
    }
    if(NW(x,y).wall == 1.0){
        return true;
    }
    if(SE(x,y).wall == 1.0){
        return true;
    }
    if(SW(x,y).wall == 1.0){
        return true;
    }
    return false;
}


function updateAntVertices(i, j) {
    vertices[j + cells.length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].x;
    vertices[j + 1 + cells.length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].y;
    vertices[j + 3 + cells.length * STRIDE / FLOAT_SIZE_BYTES] = 1;
    vertices[j + 4 + cells.length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color;
    vertices[j + 5 + cells.length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color;
    vertices[j + 6 + cells.length * STRIDE / FLOAT_SIZE_BYTES] = 1;
}




function updateCells() {
    let j = 0;
    for (let i = 0; i < cells.length * STRIDE / FLOAT_SIZE_BYTES; i += STRIDE / FLOAT_SIZE_BYTES) {
        cells[j].homingPh *= 0.999;
        vertices[i + 3] = cells[j].wall;
        vertices[i + 4] = cells[j].homingPh * 0.8;
        vertices[i + 5] = cells[j].foodPh * 0.8;
        j++;
    }
}

function random() {
    return Math.random() * 2 - 1;
}


function remapValue(v, minSrc, maxSrc, minDst, maxDst) {
    return (v - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
}