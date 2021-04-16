// Tool types
const OBSTACLE_TOOL = 1;
const ERASE_TOOL = 2;
const FOOD_TOOL = 3;
const PICKUP_TOOL = 0;
const SQUISH_TOOL = 4;
const HOMINGPH_TOOL = 5;
const FOODPH_TOOL = 6;

/*******************************************************************************************************************/
// Simulation parameters
const ANT_COUNT = 100;
const GRAVITY = 1 / 10;

var maxTurn = Math.PI / 20;
var activeAnts = 1;
var foodCollected = 0;
var width = 150;
var height = 100;
// Get simulation parameters from UI
var activeAntsSlider = document.getElementById("activeAnts");
activeAntsSlider.oninput = function () {
    activeAnts = this.value;
    this.nextElementSibling.value = this.value;
    localStorage.setItem("activeAnts", "" + activeAnts);
}

var lifeSpan = 5;
var lifeSpanSlider = document.getElementById("lifeSpan");
lifeSpanSlider.oninput = function () {
    lifeSpan = this.value;
    this.nextElementSibling.value = this.value;
    localStorage.setItem("lifeSpan", "" + lifeSpan);
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


/*******************************************************************************************************************/
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

        // Resize canvas when window resized
        window.addEventListener('resize', function (event) {
            CANVAS.width = window.innerWidth;
            CANVAS.height = window.innerHeight;
            GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        });



    }

    CANVAS = document.getElementById("canvas");
    shader;
    
    // Initialize application
    init() {
        
        // Init tools
        this.tools = new Tools();
        this.tools.ANT_LAB = this;
        this.selectedTool = 0;


        // User input detection
        // mouse
        CANVAS.addEventListener("mousedown", (e) => {
            this.getMousePosition(e);
            this.usingTool = true;
            this.tools.mouseDown(this.mousePosition.x, this.mousePosition.y);
            this.useTool(e);
        });

        CANVAS.addEventListener("mouseup", (e) => {
            this.getMousePosition(e);
            this.usingTool = false;
            this.tools.mouseUp(this.mousePosition.x, this.mousePosition.y);
        });

        CANVAS.addEventListener("mousemove", (e) => {
            this.getMousePosition(e);
            this.useTool(e);

        });

        // touch screen 
        CANVAS.addEventListener("touchstart", (e) =>{
            e.preventDefault();
            this.getTouchPosition(e)
            this.usingTool = true;
            this.tools.mouseDown(this.mousePosition.x, this.mousePosition.y);
            this.useTool(e);
        },false);

        CANVAS.addEventListener("touchend", (e) =>{
            e.preventDefault();
            this.getTouchPosition(e);
            this.usingTool = false;
            this.tools.mouseUp(this.mousePosition.x, this.mousePosition.y);
        },false);

        CANVAS.addEventListener("touchmove", (e) =>{
            e.preventDefault();
            this.getTouchPosition(e);
            this.useTool(e);
        },false);

        // Create objects
        this.createAnts();
        this.createCells();
        this.createVertices();

        // Init drawing
        this.shader = new Shader();
        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        GL.clearColor(0, 0, 0, 1);
        this.setShaderProperties();
        this.changedSize = false;
        
        this.update();
    }

    /*******************************************************************************************************************/
    // User pointer input and tools

    mousePosition = {
        x: -2,
        y: -2
    };
    getMousePosition(e) {
        this.mousePosition.x = this.remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
        this.mousePosition.y = -this.remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
    }

    getTouchPosition(e) {
        if(e.targetTouches.length > 0){
            this.mousePosition.x = this.remapValue(e.changedTouches[0].pageX, 0, CANVAS.clientWidth, -1, 1);
            this.mousePosition.y = -this.remapValue(e.changedTouches[0].pageY, 0, CANVAS.clientHeight, -1, 1);
        }
    }

    remapValue(v, minSrc, maxSrc, minDst, maxDst) {
        return (v - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
    }
  
    tools;
    usingTool;
    selectedTool;
    
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
                case HOMINGPH_TOOL:
                    this.tools.drawHomingPh(this.mousePosition.x, this.mousePosition.y);
                    break;
                case FOODPH_TOOL:
                    this.tools.drawFoodPh(this.mousePosition.x, this.mousePosition.y);
                    break;
            }
        }
    }

    /*******************************************************************************************************************/
    // Create objects/vertices
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


        // Cell vertices
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

        // Ant vertices
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

        // Home vertices
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

        // Create and bind vertex buffers
        this.vertexDataBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer)
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.DYNAMIC_DRAW);

    }

    /*******************************************************************************************************************/
    // Buttons
    // On play button pressed, start simulation if it has not been started, pause simulation if it is playing and
    // resume simulation if it is paused
    started = false;
    isPlaying = false;
    play() {
        if (!this.started) {
            foodCollected = 0;
        }
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

    // On stop buton pressed, stop the simulation and reset the ants and pheromones
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

    // On clear cells button pressed, remove all obstacles and food from map cells
    clearCells() {
        console.log("CLEAR");
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].obstacle = 0;
            cells[i].food = 0;

        }
    }

     // On clear ph button pressed, remove all pheromones from map cells
    clearPh() {
        console.log("CLEAR PH");
        for (let i = 0.0; i < cells.length; i++) {

            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }
    }

    // On fill cells button pressed, fill the entire map with obstacles
    fillCells() {
        console.log("FILL");
        for (let i = 0.0; i < cells.length; i++) {
            cells[i].obstacle = 1;
            cells[i].food = 0;
            cells[i].foodPh = 0;
            cells[i].homingPh = 0;
        }
    }

    /*******************************************************************************************************************/
    // Updating simulation

    frameCount;
    totalTime;
    then;
    dt;
    isPlaying;

    // Update the simulation every frame per browser refresh rate
    update() {
        // Calculate time between frames
        var now = performance.now();
        var deltaTime = (now - this.then) / 1000;
        this.then = now;

        // Pause application if window or tab has changed
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
        this.updateAnts();
        // Update cells at simulation speed (timeScale)
        for (let i = 0; i < timeScale; i++) {
            this.updateCells();
        }
        this.draw();

        // Display FPS and food collected 
        document.getElementById("fps").innerHTML = "" + parseInt(1 / deltaTime) + " FPS";
        document.getElementById("foodCollected").innerHTML = "Food Collected: " + parseFloat(Math.round(foodCollected * 10)) / 10;
        
        // Continue with simulation if the map sized has not been changed
        if (!this.changedSize) {
            requestAnimationFrame(() => { this.update() });
        }
    }

    updateAnts() {
        let j = 0;
        for (let i = 0; i < activeAnts; i++) {
            // If the simulation is playing, update ants at simulation speed 
            if(this.isPlaying){
                for (let k = 0; k < timeScale; k++) {
                    ants[i].update(this.dt);
                }
            }
            // Apply physics to ants
            ants[i].physicsUpdate(this.dt);
        
            this.updateAntVertices(i, j);
            j += STRIDE / FLOAT_SIZE_BYTES;
        }
    }

    updateAntVertices(i, j) {

        var length = cells.length;
        if(CANVAS.width > CANVAS.height){
            this.vertices[j + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].x;
            this.vertices[j + 1 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].y + ants[i].z;
        }
        else{
            this.vertices[j + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].x- ants[i].z;
            this.vertices[j + 1 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].y ;
        }
        this.vertices[j + 3 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color.r;
        this.vertices[j + 4 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color.g;
        this.vertices[j + 5 + length * STRIDE / FLOAT_SIZE_BYTES] = ants[i].color.b;
        this.vertices[j + 6 + length * STRIDE / FLOAT_SIZE_BYTES] = 1;
    }

    updateCells() {
        let j = 0;
        //console.log(cells[j].homingPh+" "+(1000.0-homingEvaporation)*this.dt);
        for (let i = 0; i < cells.length * STRIDE / FLOAT_SIZE_BYTES; i += STRIDE / FLOAT_SIZE_BYTES) {
    
            // Simulate pheromone evaporation by decreasing cell pheromone strength linearly
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

        if (this.isPlaying) {
            HOME.update(this.dt);
        }
        else {
            // If home is picked up and moved, move the ants along with it
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


    /*******************************************************************************************************************/
    // Drawing
    setShaderProperties() {
        GL.useProgram(this.shader.program);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer);
        GL.vertexAttribPointer(this.shader.propertyLocationPosition, 3, GL.FLOAT, false, STRIDE, 0);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer);
        GL.vertexAttribPointer(this.shader.propertyLocationColor, 4, GL.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);
        GL.vertexAttrib1f(this.shader.propertyLocationPointSize,300/Math.max(width,height));
    }

    draw() {
        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.bufferSubData(GL.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
        GL.drawArrays(GL.POINTS, 0, ANT_COUNT + cells.length + 1);
    }

}
