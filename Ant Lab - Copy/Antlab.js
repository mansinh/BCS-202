const OBSTACLE_TOOL = 1;

const ERASE_TOOL = 2;
const FOOD_TOOL = 3;
const PICKUP_TOOL = 0;
const SQUISH_TOOL = 4;

const ANT_COUNT = 100;
const GRAVITY = 1 / 10;

var maxExplorationDistance = 5;
var maxTurn = Math.PI / 20;

var activeAnts = 1;
var activeAntsSlider = document.getElementById("activeAnts");
activeAntsSlider.oninput = function () {
    activeAnts = this.value;
    this.nextElementSibling.value = this.value;
    localStorage.setItem("activeAnts", "" + activeAnts);
}
var foodCapacity = 0;
var foodCapacitySlider = document.getElementById("foodCapacity");
foodCapacitySlider.oninput = function () {
    foodCapacity = parseFloat(this.value) / 10;
    this.nextElementSibling.value = foodCapacity;
    localStorage.setItem("foodCapacity", "" + foodCapacity);
}

var foodEvaporation = 50;
var foodEvapSlider = document.getElementById("foodEvap");
foodEvapSlider.oninput = function () {
    foodEvaporation = parseFloat(this.value);
    this.nextElementSibling.value = this.value;
    localStorage.setItem("foodEvap", "" + foodEvaporation);
}
var homingEvaporation = 25;
var homingEvapSlider = document.getElementById("homingEvap");

homingEvapSlider.oninput = function () {
    homingEvaporation = parseFloat(this.value);
    this.nextElementSibling.value = this.value;
    localStorage.setItem("homingEvap", "" + homingEvaporation);
}
var timeScale = 1.0;
var timeScaleSlider = document.getElementById("timeScale");
timeScaleSlider.oninput = function () {
    timeScale = parseFloat(this.value);
    this.nextElementSibling.value = this.value;
    localStorage.setItem("timeScale", "" + timeScale);
}

var width = 300;
var height = 300;

var ants = [];
var cells = [];

var HOME;

class AntLab {
    constructor() {

        HOME = new Home();

        this.totalTime = 0.0;

        this.then = 0.0;
        this.dt = 1 / 30;


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
            this.mousePosition.x = this.remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
            this.mousePosition.y = -this.remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
            this.usingTool = true;
            this.tools.mouseDown(this.mousePosition.x, this.mousePosition.y);
            this.useTool(e);
        });

        CANVAS.addEventListener("mouseup", (e) => {
            this.mousePosition.x = this.remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
            this.mousePosition.y = -this.remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
            this.usingTool = false;
            this.tools.mouseUp(this.mousePosition.x, this.mousePosition.y);
        });

        CANVAS.addEventListener("mousemove", (e) => {
            this.mousePosition.x = this.remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
            this.mousePosition.y = -this.remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
            this.useTool(e);

        });




        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        GL.clearColor(0, 0, 0, 1);

        this.createAnts();
        this.createCells();
        this.createVertices();
        this.setShaderProperties();
        this.changedSize = false;
        this.update();
    }



    useTool(e) {

        //console.log("selected tool " + this.selectedTool + this.usingTool);
        if (this.usingTool) {

            switch (this.selectedTool) {
                case PICKUP_TOOL:
                    this.tools.pickupTool(this.mousePosition.x, this.mousePosition.y);
                    break;
                case SQUISH_TOOL:
                    this.tools.squishTool(this.mousePosition.x, this.mousePosition.y);
                    break;
                case OBSTACLE_TOOL:
                    this.tools.drawObstacle(this.mousePosition.x, this.mousePosition.y);
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
            newAnt.index = i;
            newAnt.init();
            ants.push(newAnt);
        }
    }


    createCells() {
        this.cells = [];
        for (let i = 0.0; i < width; i++) {
            for (let j = 0.0; j < height; j++) {
                let newCell = new Cell();
                newCell.x = i / width * 2 - 1 + random() / width;
                newCell.y = j / height * 2 - 1 + random() / height;
                cells.push(newCell);
            }
        }
    }

    vertices = [];
    vertexDataBuffer;

    createVertices() {
        this.vertices = [];

        for (let i = 0.0; i < cells.length; i++) {
            //positions
            this.vertices.push(cells[i].x);
            this.vertices.push(cells[i].y);
            this.vertices.push(0.0);

            //color
            this.vertices.push(cells[i].obstacle);
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
            this.vertices.push(1);
            this.vertices.push(1);
            this.vertices.push(1);
            this.vertices.push(1.0);
        }
        this.vertices.push(0);
        this.vertices.push(0);

        this.vertices.push(1.0);

        //color
        this.vertices.push(1);
        this.vertices.push(1);
        this.vertices.push(0.5);
        this.vertices.push(1.0);

        this.vertices.push(HOME.x);
        this.vertices.push(HOME.y);

        this.vertices.push(1.0);

        //color
        this.vertices.push(1);
        this.vertices.push(1);
        this.vertices.push(0.5);
        this.vertices.push(1.0);




        this.vertexDataBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.DYNAMIC_DRAW);

    }

    started = false;
    isPlaying = false;
    play() {
        this.started = true;
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.then = performance.now()
            HOME.init();
            document.getElementById("playButton").innerHTML = "Pause";

        }
        else {
            if (this.started) {
                document.getElementById("playButton").innerHTML = "Resume";
            }
            else {

                document.getElementById("playButton").innerHTML = "Start";
            }
        }
    }

    stop() {
        this.started = false;
        this.isPlaying = false;
        for (let i = 0.0; i < ants.length; i++) {
            ants[i].init();
        }
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }
        document.getElementById("playButton").innerHTML = "Start";
        let j = 0;
        for (let i = 0; i < ants.length; i++) {
            this.updateAntVertices(i, j);
            j += STRIDE / FLOAT_SIZE_BYTES;
        }

    }


    clearCells() {
        console.log("CLEAR");
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].obstacle = 0;
            cells[i].food = 0;
            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }
    }

    fillCells() {
        console.log("FILL");
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].obstacle = 1;
            cells[i].food = 0;
            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }
    }

    update() {
        var now = performance.now();
        var deltaTime = (now - this.then) / 1000;
        this.then = now;

        if (!document.hasFocus()) {
            this.isPlaying = false;
            if (this.started) {
                document.getElementById("playButton").innerHTML = "Resume";
            }
            else {
                document.getElementById("playButton").innerHTML = "Start";
            }
        }
        this.updateHome();
        for (let i = 0; i < timeScale; i++) {

            this.updateAnts();

            this.updateCells();
        }



        this.draw();
        document.getElementById("fps").innerHTML = "" + parseInt(1 / deltaTime) + " FPS";

        if (!this.changedSize) {
            requestAnimationFrame(() => { this.update() });
        }
    }

    updateAnts() {
        let j = 0;
        for (let i = 0; i < activeAnts; i++) {
            ants[i].update(this.dt, this.isPlaying);

            this.updateAntVertices(i, j);
            j += STRIDE / FLOAT_SIZE_BYTES;
        }
    }
    updateAntVertices(i, j) {

        var length = cells.length;
        this.vertices[j + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].x;
        this.vertices[j + 1 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].y + ants[i].z;
        this.vertices[j + 3 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color.r;
        this.vertices[j + 4 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color.g;
        this.vertices[j + 5 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color.b;
        this.vertices[j + 6 + length * STRIDE / FLOAT_SIZE_BYTES] = 1;

    }





    updateCells() {
        let j = 0;
        //console.log(cells[j].homingPh+" "+(1000.0-homingEvaporation)*this.dt);
        for (let i = 0; i < cells.length * STRIDE / FLOAT_SIZE_BYTES; i += STRIDE / FLOAT_SIZE_BYTES) {
            //cells[j].foodPh = Math.min(cells[j].foodPh, 10);
            //cells[j].homingPh = Math.min(cells[j].homingPh, 10);
            if (this.isPlaying) {
                if (cells[j].homingPh > 0) {
                    cells[j].homingPh -= homingEvaporation / 5000 * this.dt;
                }
                else {
                    cells[j].homingPh = 0;
                }
                if (cells[j].foodPh >= 0) {
                    cells[j].foodPh -= foodEvaporation / 5000 * this.dt;
                }
                else {
                    cells[j].foodPh = 0;
                }
            }
            this.vertices[i + 3] = cells[j].obstacle;
            this.vertices[i + 4] = cells[j].homingPh;
            this.vertices[i + 5] = cells[j].foodPh;
            this.vertices[i + 6] = cells[j].food;
            j++;
        }
    }

    updateHome() {
        var length = cells.length + ANT_COUNT;
        this.vertices[length * STRIDE / FLOAT_SIZE_BYTES] = HOME.x;
        this.vertices[1 + length * STRIDE / FLOAT_SIZE_BYTES] = HOME.y;
        this.vertices[3 + length * STRIDE / FLOAT_SIZE_BYTES] = 1;
        this.vertices[4 + length * STRIDE / FLOAT_SIZE_BYTES] = 1;
        this.vertices[5 + length * STRIDE / FLOAT_SIZE_BYTES] = 1;
        this.vertices[6 + length * STRIDE / FLOAT_SIZE_BYTES] = 2;

        //console.log("home pos " + this.vertices[homeIndex] + " " + this.vertices[homeIndex + 1]);
        if (this.isPlaying) {
            HOME.update(this.dt);
        }
        else {
            if (HOME.selected) {
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



    setShaderProperties() {
        GL.useProgram(this.shader.program);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)

        GL.vertexAttribPointer(this.shader.propertyLocationPosition, 3, GL.FLOAT, false, STRIDE, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)
        GL.vertexAttribPointer(this.shader.propertyLocationColor, 4, GL.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);


    }










    remapValue(v, minSrc, maxSrc, minDst, maxDst) {
        return (v - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
    }


    frameCount;
    totalTime;

    then;
    dt;
    isPlaying;



    draw() {
        GL.clear(GL.COLOR_BUFFER_BIT);

        GL.bufferSubData(GL.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
        GL.drawArrays(GL.POINTS, 0, ANT_COUNT + cells.length + 1);


    }

}

