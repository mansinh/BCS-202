const TERRAIN_TOOL = 1;
const ERASE_TOOL = 2;
const FOOD_TOOL = 3;
const HAND_TOOL = 0;

const ANT_COUNT = 100;
var activeAnts = 10;
var activeAntsSlider = document.getElementById("activeAnts");
activeAntsSlider.oninput = function () {
    activeAnts = this.value;
}

var foodEvaporation =50;
var foodEvapSlider = document.getElementById("foodEvap");
foodEvapSlider.oninput = function () {
    foodEvaporation = parseFloat(this.value);
}
var homingEvaporation = 50;
var homingEvapSlider = document.getElementById("homingEvap");
homingEvapSlider.oninput = function () {
    homingEvaporation = parseFloat(this.value);
}
var timeScale = 1.0;
var timeScaleSlider = document.getElementById("timeScale");
timeScaleSlider.oninput = function () {
    timeScale = parseFloat(this.value)/10;
}

const WIDTH = 200;
const HEIGHT = 200;

var ants = [];
var cells = [];

var HOME;

class AntLab {
    constructor() {

        HOME = new Home();

        this.totalTime = 0.0;

        this.then = 0.0;
        this.dt = 0.0;
        this.isPlaying = false;

        this.usingTool = false;


        window.addEventListener('resize', function (event) {
            CANVAS.width = window.innerWidth - 200;
            CANVAS.height = window.innerHeight;
            GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        });



    }

    shader;
    tools;
    usingTool;
    CANVAS = document.getElementById("canvas");

    selectedTool;

    mousePosition = {
        x: -2,
        y: -2
    };



    init() {


        this.shader = new Shader();
        this.tools = new Tools();
        this.tools.ANT_LAB = this;
        this.selectedTool = 0;
        CANVAS.addEventListener("mousedown", (e) => {

            this.usingTool = true;
            this.useTool(e);
        });

        CANVAS.addEventListener("mouseup", (e) => {
            this.usingTool = false;
            HOME.selected = false;
        });

        CANVAS.addEventListener("mousemove", (e) => {

            this.useTool(e);

        });




        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        GL.clearColor(0, 0, 0, 1);

        this.createAnts();
        this.createTerrain();
        this.createVertices();
        this.setShaderProperties();
        this.update();
    }

    useTool(e) {
        this.mousePosition.x = this.remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
        this.mousePosition.y = -this.remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
        //console.log("selected tool " + this.selectedTool + this.usingTool);
        if (this.usingTool) {

            switch (this.selectedTool) {
                case HAND_TOOL:
                    this.tools.handTool(this.mousePosition.x, this.mousePosition.y);
                    break;
                case TERRAIN_TOOL:
                    this.tools.drawTerrain(this.mousePosition.x, this.mousePosition.y);
                    break;
                case FOOD_TOOL:
                    this.tools.drawFood(this.mousePosition.x, this.mousePosition.y);
                    break;
                case ERASE_TOOL:
                    this.tools.erase(this.mousePosition.x, this.mousePosition.y);
                    break;
            }
        }
    }

    createAnts() {

        for (let i = 0; i < ANT_COUNT * STRIDE / FLOAT_SIZE_BYTES; i += STRIDE / FLOAT_SIZE_BYTES) {
            let newAnt = new Ant();
            newAnt.x = HOME.x;
            newAnt.y = HOME.y;
            newAnt.direction = random() * Math.PI * 2;
            ants.push(newAnt);
        }
    }


    createTerrain() {
        for (let i = 0.0; i < WIDTH; i++) {
            for (let j = 0.0; j < HEIGHT; j++) {
                let newCell = new Cell();
                newCell.x = i / WIDTH * 2 - 1 + random() / WIDTH;
                newCell.y = j / HEIGHT * 2 - 1 + random() / HEIGHT;
                cells.push(newCell);
            }
        }
    }

    createVertices() {
        this.vertices = [];
        for (let i = 0.0; i < cells.length; i++) {
            //positions
            this.vertices.push(cells[i].x);
            this.vertices.push(cells[i].y);
            this.vertices.push(0.0);

            //color
            this.vertices.push(cells[i].terrain);
            this.vertices.push(cells[i].homingPh);
            this.vertices.push(cells[i].foodPh);
            this.vertices.push(cells[i].food);
            //console.log(cells[i].x + " " + cells[i].y);
        }


        for (let i = 0; i < ANT_COUNT; i++) {
            //positions
            this.vertices.push(ants[i].x);
            this.vertices.push(ants[i].y);
            this.vertices.push(1.0);

            //color
            this.vertices.push(Math.random());
            this.vertices.push(Math.random());
            this.vertices.push(0.5);
            this.vertices.push(1.0);
        }


        this.vertices.push(HOME.x);
        this.vertices.push(HOME.y);
        this.vertices.push(2.0);

        //console.log("home " + this.vertices[(ANT_COUNT + cells.length) * 7]);

        //color
        this.vertices.push(Math.random());
        this.vertices.push(Math.random());
        this.vertices.push(0.5);
        this.vertices.push(1.0);


        this.vertexDataBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);

    }

    isPlaying = false;
    play() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.then = performance.now()
            document.getElementById("playButton").innerHTML = "PAUSE";
        }
        else {
            document.getElementById("playButton").innerHTML = "PLAY";
        }
    }

    stop() {
        this.isPlaying = false;
        for (let i = 0.0; i < ants.length; i++) {
            ants[i].direction = random() * Math.PI * 2;
            ants[i].x = HOME.x;
            ants[i].y = HOME.y;
            ants[i].action = FINDFOOD;
        }
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }
        document.getElementById("playButton").innerHTML = "PLAY";
        let j = 0;
        for (let i = 0; i < ants.length; i++) {
            this.updateAntVertices(i, j);
            j += STRIDE / FLOAT_SIZE_BYTES;
        }

    }


    clearCells() {
        console.log("CLEAR");
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].terrain = 0;
            cells[i].food = 0;
            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }


    }








    updateAnts() {
        let j = 0;
        for (let i = 0; i < activeAnts; i++) {
            ants[i].update(this.dt);

            this.updateAntVertices(i, j);
            j += STRIDE / FLOAT_SIZE_BYTES;
        }
    }
    updateAntVertices(i, j) {

        var length = cells.length;
        this.vertices[j + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].x;
        this.vertices[j + 1 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].y;
        this.vertices[j + 3 + length * STRIDE / FLOAT_SIZE_BYTES] = 1;
        this.vertices[j + 4 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color;
        this.vertices[j + 5 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color;
        this.vertices[j + 6 + length * STRIDE / FLOAT_SIZE_BYTES] = 2;

    }





    updateCells() {
        let j = 0;
        console.log(cells[j].homingPh+" "+(1000.0-homingEvaporation)*this.dt);
        for (let i = 0; i < cells.length * STRIDE / FLOAT_SIZE_BYTES; i += STRIDE / FLOAT_SIZE_BYTES) {
            cells[j].foodPh=Math.min(cells[j].foodPh,10);
            cells[j].homingPh=Math.min(cells[j].homingPh,10);
            if (this.isPlaying) {
                if(cells[j].homingPh>=0){
                cells[j].homingPh -= homingEvaporation/500*this.dt ;
                }
                if(cells[j].foodPh>=0){
                cells[j].foodPh -= foodEvaporation/500*this.dt;
                }
                
            }
            this.vertices[i + 3] = cells[j].terrain;
            this.vertices[i + 4] = cells[j].homingPh * 0.5;
            this.vertices[i + 5] = cells[j].foodPh * 0.5;
            this.vertices[i + 6] = cells[j].food;
            j++;
        }
    }

    updateHome() {
        let homeIndex = (cells.length + ANT_COUNT) * 7;
        this.vertices[homeIndex] = HOME.x;
        this.vertices[homeIndex + 1] = HOME.y;
        //console.log("home pos " + this.vertices[homeIndex] + " " + this.vertices[homeIndex + 1]);
        if (this.isPlaying) {

        }
        else {
            if(HOME.selected){
                let j = 0;
                for (let i = 0.0; i < ants.length; i++) {
                    ants[i].x = HOME.x;
                    ants[i].y = HOME.y;
                    this.updateAntVertices(i, j)
                    j += STRIDE / FLOAT_SIZE_BYTES;
                }
            }
        }
    }

    vertices = [];
    vertexDataBuffer;


    setShaderProperties() {
        GL.useProgram(this.shader.program);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)

        GL.vertexAttribPointer(this.shader.propertyLocationPosition, 3, GL.FLOAT, false, STRIDE, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)
        GL.vertexAttribPointer(this.shader.propertyLocationColor, 4, GL.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);

        GL.vertexAttrib1f(this.shader.propertyLocationPointSize, 1);

        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        GL.enable(GL.BLEND);

    }










    remapValue(v, minSrc, maxSrc, minDst, maxDst) {
        return (v - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
    }


    frameCount;
    totalTime;

    then;
    dt;
    isPlaying;

    update() {
        var now = performance.now();
        this.dt = (now - this.then) * 0.001*timeScale;
        this.then = now;
        if (!document.hasFocus()) {
            this.isPlaying = false;
            document.getElementById("playButton").innerHTML = "PLAY";
        }

        if (this.isPlaying) {

            this.updateAnts();
        }
        this.updateCells();
        this.updateHome();
        this.draw();


        //console.log(this.dt)
        //this.totalTime += this.dt;
        document.getElementById("fps").innerHTML = "" + parseInt(1 / this.dt) + " FPS";



        requestAnimationFrame(() => { this.update() });


    }

    draw() {
        GL.clear(GL.COLOR_BUFFER_BIT);

        GL.bufferSubData(GL.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
        GL.drawArrays(GL.POINTS, 0, ANT_COUNT + cells.length);

    }





}