console.log("!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 7 * FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3 * FLOAT_SIZE_BYTES;
const ANT_COUNT = 50;
const WIDTH = 512;
const HEIGHT = 256;
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
           if(color == vec4(0.0,0.0,0.0,1.0)){
            gl_Position.z = 1000.0;
           }
           gl_PointSize = pointSize;
     
           linkedColor = color;
        }        `
    ,
    fragmentSrc:
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
    x: -2,
    y: -2
};






CANVAS.addEventListener("mousemove", (e) => {
    mousePosition.x = remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
    mousePosition.y = -remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
});
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
            newCell.x = i / WIDTH * 2 - 1;
            newCell.y = j / HEIGHT * 2 - 1;
            cells.push(newCell);
        }
    }
}


function createVertices() {
    for (let i = 0.0; i < cells.length; i++) {
        //positions
        vertices.push(cells[i].x + random() / WIDTH);
        vertices.push(cells[i].y + random() / HEIGHT);
        vertices.push(0.0);

        //color
        vertices.push(0.1 * cells[i].wall);
        vertices.push(0.1 * cells[i].wall);
        vertices.push(0.1 * cells[i].wall);
        vertices.push(1.0);
        //console.log(cells[i].x + " " + cells[i].y);
    }


    for (let i = 0; i < ANT_COUNT; i++) {
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
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);

}
var frameCount = 0.0;
var totalTime = 0.0;



function updateAnts() {
    now = performance.now();
    var dt = now - then;
    dt *= 0.001;
    then = now;
    let j = 0;
    for (let i = 0; i < ants.length; i++) {
        updateAnt(i, dt);
        layHomingPh(i)
        updateAntVertices(i, j);
        j += STRIDE / FLOAT_SIZE_BYTES;
    }

    console.log(frameCount / totalTime)
    totalTime += dt;
    frameCount++;
}


function updateAnt(i, dt) {
    ants[i].x += dt * Math.cos(ants[i].direction) * ants[i].maxSpeed;
    ants[i].y += dt * Math.sin(ants[i].direction) * ants[i].maxSpeed;
    ants[i].direction = ants[i].direction + random() * ants[i].maxTurn;

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

}

function layHomingPh(i) {
    var x = Math.min(parseInt((ants[i].x + 1.0) * WIDTH / 2), WIDTH - 1);
    var y = Math.min(parseInt((ants[i].y + 1.0) * HEIGHT / 2), HEIGHT - 1);
    cells[y + x * HEIGHT].homingPh = 1
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

        vertices[i + 4] = cells[j].homingPh * 0.5;
        vertices[i + 5] = cells[j].homingPh * 0.5;
        vertices[i + 6] = 1;

        j++;
    }
}

function random() {
    return Math.random() * 2 - 1;
}


function remapValue(v, minSrc, maxSrc, minDst, maxDst) {
    return (v - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
}