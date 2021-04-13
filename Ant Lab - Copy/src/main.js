
const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
var isPortrait = false;


setCanvasSize();

window.addEventListener("resize", function () {
    setCanvasSize();

});



const OBSTACLE_TOOL = 1;

const ERASE_TOOL = 2;
const FOOD_TOOL = 3;
const PICKUP_TOOL = 0;
const SQUISH_TOOL = 4;
const HOMINGPH_TOOL = 5;
const FOODPH_TOOL = 6;

const ANT_COUNT = 100;
const GRAVITY = 1 / 10;

var maxTurn = Math.PI / 20;

var activeAnts = 1;
var activeAntsSlider = document.getElementById("activeAnts");
activeAntsSlider.oninput = function () {
    activeAnts = this.value;
    this.nextElementSibling.value = this.value;
    localStorage.setItem("activeAnts", "" + activeAnts);
}

var lifeSpan = 1;
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

var foodCollected = 0;

var width = 150;
var height = 150;

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




        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        GL.clearColor(0, 0, 0, 1);

        this.createAnts();
        this.createCells();
        this.createVertices();
        this.setShaderProperties();
        this.changedSize = false;
        this.update();
    }

    getMousePosition(e) {


        this.mousePosition.x = this.remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
        this.mousePosition.y = -this.remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);



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
                case HOMINGPH_TOOL:
                    this.tools.drawHomingPh(this.mousePosition.x, this.mousePosition.y);
                    break;
                case FOODPH_TOOL:
                    this.tools.drawFoodPh(this.mousePosition.x, this.mousePosition.y);
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

        }
    }
    clearPh() {
        console.log("CLEAR PH");
        for (let i = 0.0; i < cells.length; i++) {

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
        document.getElementById("foodCollected").innerHTML = "Food Collected: " + parseFloat(Math.round(foodCollected * 10)) / 10;
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
        GL.vertexAttrib1f(this.shader.propertyLocationPointSize,300/width)

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



const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 7 * FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3 * FLOAT_SIZE_BYTES;

const VERTEX_SRC =
    `#version 300 es

        in vec4 position;
        in vec4 color;
        in float pointSize;

        out vec4 linkedColor;
        out vec4 linkedPosition;
        void main(){
            
           gl_Position = position;
           
         if(position.z == 1.0){
              gl_PointSize = 3.0*pointSize;
              if(color.a == 2.0){
                gl_PointSize = 15.0*pointSize;
              }
              else if(color.b == 0.0){
                gl_PointSize = 8.0*pointSize;
              }
           }
           else if(position.z == 0.0){
               if(color.r > 0.0){
                  gl_PointSize = 7.0*pointSize;
               }
               else if(color.a > 0.0){
                gl_PointSize = 3.0*pointSize;
               }
               else{
                 gl_PointSize = 2.0*pointSize;
               }
           }
     
           linkedColor = color;
           linkedPosition = position;
        }        `
    ;
const FRAGMENT_SRC =
    `#version 300 es
        precision mediump float;

        in vec4 linkedColor;
        in vec4 linkedPosition;
        out vec4 color;

        void main(){
            vec2 coord = gl_PointCoord - vec2(0.5);
            if(length(coord) > 0.5 && (linkedColor.r ==0.0 || linkedPosition.z == 1.0)){                  //outside of circle radius?
                discard;
            }
            else{
                color = vec4(0.0,0.0,0.0,1.0);
        
                if(linkedPosition.z == 0.0 ){
                    if(linkedColor.r >0.0){
                     color = vec4(0.2,0.2,0.3,1.0);
                    }
                     else if(linkedColor.a >0.0){
                        color = vec4(0.8*linkedColor.a,0.7*linkedColor.a,0.0,1.0);
                    }
                
                    else if(linkedColor.g+linkedColor.b > 0.0){
                        color = vec4(linkedColor.b,0.8*(linkedColor.g+linkedColor.b),0.8*linkedColor.g ,1.0);
                        //color = linkedColor;
                    }
               
                }
                else{
                    color = linkedColor;
                }
            }
        }
        `
    ;

class Shader {
    constructor() {
        this.program = this.createShaders();
        this.getPropertyLocations();

    }

    program;
    propertyLocationPosition;
    propertyLocationColor;
    propertyLocationPointSize;

    getPropertyLocations() {
        this.propertyLocationPosition = GL.getAttribLocation(this.program, "position");
        this.propertyLocationColor = GL.getAttribLocation(this.program, "color");
        this.propertyLocationPointSize = GL.getAttribLocation(this.program, "pointSize");

        GL.enableVertexAttribArray(this.propertyLocationPosition)
        GL.enableVertexAttribArray(this.propertyLocationColor)
    }



    createShaders() {
        var vertexShader = this.getAndCompileShader(VERTEX_SRC, GL.VERTEX_SHADER);
        var fragmentShader = this.getAndCompileShader(FRAGMENT_SRC, GL.FRAGMENT_SHADER);

        var newShaderProgram = GL.createProgram();
        GL.attachShader(newShaderProgram, vertexShader);
        GL.attachShader(newShaderProgram, fragmentShader);

        GL.linkProgram(newShaderProgram);
        return newShaderProgram;
    }

    getAndCompileShader(source, shaderType) {
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


}

const FINDFOOD = 0;
const RETURNFOOD = 1;


class Ant {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.direction = new Vec2(0.0, 0.0);
        this.maxSpeed = 0.1;
        this.maxTurn = Math.PI / 30;
        this.distanceTravelled = 0;
        this.size = 10 / width;
        this.action = FINDFOOD;
        this.t = 0.0;
        this.senseRange = 3;
        this.selected = false;
        this.color = new Color();
        this.squished = false;
        //console.log(this.color);
    }

    init() {
        this.x = HOME.x;
        this.y = HOME.y;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        var angle = random() * Math.PI * 2;
        this.direction = new Vec2(Math.cos(angle), Math.sin(angle));
        this.distanceTravelled = 0;
        this.action = FINDFOOD;
        this.color.toWhite();

    }
    x; y; z; i; j;
    vx; vy; vz;
    direction; maxSpeed; maxTurn; size; senseRange;
    distanceTravelled;
    action;
    selected;
    color;
    timeActive; index;

    update(dt, isPlaying) {
        this.timeActive += dt;
        if (!this.selected) {
            if (this.squished) {
                this.color.fadeToBlack(2, dt);
                if (this.color.a <= 0) {
                    this.init();
                    this.squished = false;
                }
            }
            else if (this.vx == 0 && this.vy == 0 && this.vz == 0) {
                if (isPlaying) {
                    this.behaviour(dt)
                }
            }
            else {
                this.physics(dt);
            }
        }
    }

    behaviour(dt) {
        this.t += dt;
        this.worldBoundBehaviour();
        this.i = Math.min(Math.round((this.x + 1.0) * width / 2), width - 1);
        this.j = Math.min(Math.round((this.y + 1.0) * height / 2), height - 1);
        var sample = this.getCells(this.i, this.j, this.senseRange);
        var phDirection = this.sensePheromone(sample);

        if (this.obstacleBehaviour()) {

        }
        else if (this.action == FINDFOOD) {
            this.findFoodBehaviour(phDirection, sample);
        }
        else if (this.action == RETURNFOOD) {
            this.homingBehaviour(phDirection, sample);
        }

        this.move(dt);
        this.pheromoneBehaviour(this.i, this.j);
        if (this.distanceTravelled > lifeSpan) {
            this.init();
        }
    }

    sensePheromone(sample) {
        var phDirection = new Vec2(0.0, 0.0);
        var maxPh = 0;
        for (let k = 0; k < sample.length; k++) {
            if (k != parseInt(sample.length / 2)) {
                var cell = sample[k];
                var ph = cell.foodPh;
                if (this.action == RETURNFOOD) {
                    ph = cell.homingPh;
                }
                if (ph > maxPh && Math.random() < 0.9) {
                    var cellDirection = new Vec2(cell.x - this.x, cell.y - this.y).normal();
                    if (cellDirection.dot(this.direction) > 0) {
                        phDirection = cellDirection;
                        maxPh = ph;
                    }
                }
            }
        }
        return phDirection;
    }

    findFoodBehaviour(foodPhDirection, sample) {
        var foodCells = [];
        for (let k = 0; k < sample.length; k++) {
            if (sample[k].food > 0) {
                foodCells.push(sample[k]);
            }
        }
        var foodFound = this.getCell(this.i, this.j).food;
        if (foodFound > 0) {
            this.action = RETURNFOOD;
            this.distanceTravelled = 0;
            this.direction = this.direction.mul(-1);
            foodCollected += Math.min(foodFound, foodCapacity);
            this.getCell(this.i, this.j).food = Math.max(foodFound - foodCapacity, 0);

        }
        else if (foodCells.length > 0) {
            var randomFoodCell = foodCells[parseInt(foodCells.length * (Math.random() * 0.99))];
            this.direction = new Vec2(randomFoodCell.x - this.x, randomFoodCell.y - this.y).normal();
        }
        else if (foodPhDirection.sqMagnitude() > 0) {
            //console.log(foodPhDirection);
            this.direction = foodPhDirection;

        }
        else {
            this.randomTurn()
        }

    }

    homingBehaviour(homingPhDirection, sample) {

        if (homingPhDirection.sqMagnitude() > 0) {
            //console.log(homingPhDirection);
            this.direction = homingPhDirection;
        }
        if (HOME.collide(this.x, this.y)) {
            this.action = FINDFOOD;
            var angle = random() * Math.PI * 2;
            //this.direction = new Vec2(Math.cos(angle), Math.sin(angle));
            this.direction = this.direction.mul(-1);
            this.distanceTravelled = 0;

        }
    }

    obstacleBehaviour() {
        var sample = this.getCells(this.i, this.j, 1);
        var normal = new Vec2(0.0, 0.0);
        var tangent = new Vec2(0.0, 0.0);
        var collided = false;
        for (let k = 0; k < sample.length; k++) {
            var cell = sample[k];
            if (cell.obstacle > 0) {
                var cellDirection = new Vec2(cell.x - this.x, cell.y - this.y).normal();
                if (cellDirection.dot(this.direction) > 0.5) {
                    var cross = Math.sign(this.direction.x * cellDirection.y - this.direction.y * cellDirection.x);
                    tangent = tangent.add(cellDirection.perp(cross));
                    normal = normal.add(cellDirection);
                    collided = true;

                }
            }
        }

        if (collided) {
            this.direction = tangent.normal();
            tangent = tangent.normal();
            this.x -= normal.x / width;
            this.y -= normal.y / height;
            return true;
        }
        return false;
    }

    worldBoundBehaviour() {
        if (this.x > 1.0) {
            this.direction.x = - this.direction.x;
            this.x = 1.0;
        }
        if (this.x < -1.0) {
            this.direction.x = - this.direction.x;
            this.x = -1.0;
        }
        if (this.y > 1.0) {
            this.direction.y = - this.direction.y;
            this.y = 1.0;
        }
        if (this.y < -1.0) {
            this.direction.y = - this.direction.y;
            this.y = -1.0;
        }
    }

    pheromoneBehaviour(i, j) {
        if (j + i * height < cells.length && j + i * height > 0) {
            var phStrength = Math.exp(this.distanceTravelled * Math.log(0.1) / lifeSpan);
            //console.log(phStrength);
            switch (this.action) {
                case 0:
                    this.layHomingPh(i, j, phStrength);
                    break;
                case 1:
                    this.layFoodPh(i, j, phStrength);
                    break;
            }
        }
    }

    layHomingPh(i, j, phStrength) {
        var cell = cells[j + i * height];
        cell.homingPh = Math.max(cell.homingPh, phStrength);
        //cell.homingPhDirection = cell.homingPhDirection.add(this.direction.mul(-1));

    }
    layFoodPh(i, j, phStrength) {
        var cell = cells[j + i * height];
        cell.foodPh = Math.max(cell.foodPh, phStrength);
        //cell.foodPhDirection = cell.foodPhDirection.add(this.direction.mul(-1));

    }



    move(dt) {

        this.direction = this.direction.normal();
        var dvx = this.direction.x * this.maxSpeed * dt;
        var dvy = this.direction.y * this.maxSpeed * dt
        this.x += dvx;
        this.y += dvy;

        this.distanceTravelled += Math.sqrt(dvx * dvx + dvy * dvy)

        //this.z = (Math.sin(this.timeActive * 60 + this.index / ANT_COUNT * Math.PI) + 1) / 4 / height;
        this.z = 2 * Math.random() / 300;
    }

    randomTurn() {
        var angle = this.maxTurn * random();
        this.direction.x = this.direction.x * Math.cos(angle) + this.direction.y * Math.sin(angle);
        this.direction.y = -this.direction.x * Math.sin(angle) + this.direction.y * Math.cos(angle);
    }

    physics(dt) {
        this.vz += -GRAVITY * dt;
        this.z += this.vz;
        if (this.z <= 0) {
            this.vz = -this.vz * 0.6;
            this.vy = this.vy * 0.9;
            this.vx = this.vx * 0.9;
            this.z = 0;
        }
        if (this.x < -1) {
            this.x = -1;
            this.vx = -this.vx;
        }
        if (this.x > 1) {
            this.x = 1;
            this.vx = -this.vx;
        }
        if (this.y < -1) {
            this.y = -1;
            this.vy = -this.vy;
        }
        if (this.y > 1) {
            this.y = 1;
            this.vy = -this.vy;
        }
        if (Math.abs(this.vz) < 0.001) {
            this.vz = 0;

        }
        if (Math.abs(this.vy) < 0.001) {
            this.vy = 0;
        }
        if (Math.abs(this.vx) < 0.001) {
            this.vx = 0;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    getCells(x, y, size) {
        var selectedCells = [];

        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {

                selectedCells.push(this.getCell(x + i, y + j));

            }
        }

        return selectedCells;
    }

    getCell(x, y) {
        var i = y + x * height;
        if (i < cells.length && i > 0) {
            return cells[i];
        }
        return new Cell();
    }

    collide(x, y) {
        return this.size * this.size > this.sqDistance(x, y);
    }

    sqDistance(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        return dx * dx + dy * dy
    }

    squished;
    squish() {
        if (!this.squished) {
            this.color.toRed();
            this.squished = true;
        }
    }
}


class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;

    }
    x;
    y;

    sqMagnitude() {
        return (this.x * this.x + this.y * this.y);
    }
    magnitude() {
        return Math.sqrt(this.sqMagnitude());
    }

    normal() {
        var l = this.magnitude();
        if (l > 0) {
            return new Vec2(this.x / l, this.y / l);
        }
        return new Vec2(0.0, 0.0);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }
    perp(sign) {
        return new Vec2(this.y * sign, -this.x * sign);
    }

    dot(u) {
        return this.x * u.x + this.y * u.y;
    }

    toString() {
        return "vec2(" + this.x + "," + this.y + ")";
    }
    mul(a) {
        return new Vec2(a * this.x, a * this.y);
    }
    add(u) {
        return new Vec2(u.x + this.x, u.y + this.y);
    }
}

class Color {
    constructor() {
        this.r = 0.0;
        this.g = 0.0;
        this.b = 0.0;
        this.a = 1.0;
    }
    r;
    g;
    b;
    a;

    toWhite() {
        this.r = 1.0;
        this.g = 1.0;
        this.b = 1.0;
        this.a = 1.0;
    }
    toBlack() {
        this.r = 0.0;
        this.g = 0.0;
        this.b = 0.0;
        this.a = 0.0;
    }
    toRandom() {
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();
        this.a = 1.0;
    }
    toRed() {
        this.r = 0.5;
        this.g = 0;
        this.b = 0;
        this.a = 1.0;
    }
    fadeToBlack(fadeTime, dt) {
        this.r = Math.max(0, this.r - dt / fadeTime);
        this.g = Math.max(0, this.g - dt / fadeTime);
        this.b = Math.max(0, this.b - dt / fadeTime);
        this.a = Math.max(0, this.a - dt / fadeTime);


    }
    fadeToWhite(fadeTime, dt) {
        this.r = Math.min(1, this.r + dt / fadeTime);
        this.g = Math.min(1, this.g + dt / fadeTime);
        this.b = Math.main(1, this.b + dt / fadeTime);
        this.a = Math.min(1, this.a + dt / fadeTime);


    }


}

class Cell {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.homingPh = 0;
        //this.homingPhDirection = new Vec2(0.0, 0.0);
        this.foodPh = 0;
        //this.foodPhDirection = new Vec2(0.0, 0.0);
        this.obstacle = 0;
        this.food = 0;
    }
    x;
    y;
    homingPh;
    foodPh;
    obstacle;
    food;

    update() {

    }
}

var brushSize = 5;
var brushSizeSlider = document.getElementById("brushSize");

brushSizeSlider.oninput = function () {
    brushSize = parseInt(this.value);
    this.nextElementSibling.value = this.value;
    localStorage.setItem("brushSize", "" + this.value);
}

var brushDensity = 1;
var brushDensitySlider = document.getElementById("brushDensity");

brushDensitySlider.oninput = function () {
    brushDensity = parseFloat(this.value) / 10 * parseFloat(this.value) / 10 * parseFloat(this.value) / 10;
    this.nextElementSibling.value = parseFloat(this.value / 10);
    localStorage.setItem("brushDensity", "" + this.value);
}

class Tools {
    constructor() {
        this.selectedAnt = null;
        this.position = new Vec2(0.0, 0.0);
        this.lastPosition = new Vec2(0.0, 0.0);

    }
    selectedAnt;
    lastPosition; position;


    mouseUp(mouseX, mouseY) {

        HOME.selected = false;
        if (this.selectedAnt != null) {
            this.selectedAnt.selected = false;

            var flingVelocity = this.position.add(this.lastPosition.mul(-1));
            console.log("fling " + flingVelocity + " " + flingVelocity.sqMagnitude());
            if (flingVelocity.sqMagnitude() > 0.0001) {
                console.log("FLING");
                this.selectedAnt.vx = flingVelocity.normal().x;
                this.selectedAnt.vy = flingVelocity.normal().y;
                this.selectedAnt.vz = flingVelocity.magnitude() / 4;
            }
            this.position = new Vec2(0.0, 0.0);
            this.lastPosition = new Vec2(0.0, 0.0);


        }
        this.selectedAnt = null;

    }
    mouseDown(mouseX, mouseY) {
        if (ANT_LAB.selectedTool == PICKUP_TOOL) {
            if (HOME.collide(mouseX, mouseY) && !ANT_LAB.started) {
                HOME.selected = true;
                this.moveHome(mouseX, mouseY);
            }
            else if (this.selectedAnt == null) {
                for (let i = 0; i < ants.length; i++) {
                    if (ants[i].collide(mouseX, mouseY)) {
                        this.selectedAnt = ants[i];
                        this.selectedAnt.selected = true;
                        this.moveAnt(mouseX, mouseY);
                        break;
                    }
                }
            }
        }

        this.position = new Vec2(mouseX, mouseY);
        this.lastPosition = new Vec2(mouseX, mouseY);


    }

    pickupTool(mouseX, mouseY) {
        //console.log(this.selectedAnt);
        if (this.selectedAnt == null) {
            if (HOME.selected) {
                this.moveHome(mouseX, mouseY);
            }
        }
        else {
            this.moveAnt(mouseX, mouseY);
        }
        this.lastPosition = this.position;
        this.position = new Vec2(mouseX, mouseY)
    }

    squishTool(mouseX, mouseY) {
        for (let i = 0; i < ants.length; i++) {
            var squishRadius = brushSize / width * 2;
            if (squishRadius * squishRadius > ants[i].sqDistance(mouseX, mouseY)) {
                ants[i].squish();
            }
        }
    }


    moveHome(mouseX, mouseY) {
        HOME.x = mouseX;
        HOME.y = mouseY;
    }

    moveAnt(mouseX, mouseY) {
        this.selectedAnt.x = mouseX;
        this.selectedAnt.y = mouseY;
        this.selectedAnt.vz = 0;
        this.selectedAnt.vy = 0;
        this.selectedAnt.vx = 0;
        this.selectedAnt.z = 5 / height;
    }


    drawFood(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].food = 1;
            }
        }
    }

    drawObstacle(mouseX, mouseY) {

        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].obstacle = 1;
                selectedCells[i].homingPh = 0;
                selectedCells[i].foodPh = 0;
                selectedCells[i].food = 0;
            }
        }
    }

    erase(mouseX, mouseY) {
        var x = Math.min(Math.round((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(Math.round((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].food = 0;
                selectedCells[i].obstacle = 0;
                selectedCells[i].foodPh = 0;
                selectedCells[i].homingPh = 0;
            }
        }
    }

    drawHomingPh(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].homingPh = 1;
            }
        }
    }

    drawFoodPh(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity && selectedCells[i].obstacle == 0) {
                selectedCells[i].foodPh = 1;
            }
        }
    }


    getCells(x, y) {
        var selectedCells = [];
        for (let i = -brushSize; i <= brushSize; i++) {
            for (let j = -brushSize; j < brushSize; j++) {
                if (i * i + j * j < brushSize * brushSize) {
                    selectedCells.push(this.getCell(x, y, i, j));
                }
            }
        }
        return selectedCells;
    }

    getCell(x, y, a, b) {
        var i = y + b + (x + a) * height;
        if (i < cells.length && i > 0) {
            return cells[i];
        }
        return new Cell();
    }


}

class Home {
    constructor() {
        this.x = 0; this.y = 0;
        this.init();
    }
    x; y;
    foodCollected;
    size;
    selected;

    init() {
        console.log("INIT");
        this.foodCollected = 0;
        this.size = 10 / 300;
        this.selected = false;
        console.log(this.size);
        this.layHomingPh();
        this.time = 0;
    }

    collide(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        //console.log("home sdfsdf" + dx + " " + dy + " " + (this.size * this.size > dx * dx + dy * dy));
        return this.size * this.size > dx * dx + dy * dy;
    }

    time;
    update(dt) {
        var i = Math.min(parseInt((this.x + 1.0) * width / 2), width - 1);
        var j = Math.min(parseInt((this.y + 1.0) * height / 2), height - 1);
        this.time += dt;
        if (this.time > 3) {
            this.layHomingPh();
            this.time = 0;
        }
    }

    layHomingPh() {
        var i = Math.min(Math.round((this.x + 1.0) * width / 2), width - 1);
        var j = Math.min(Math.round((this.y + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(i, j, 2)
        console.log(selectedCells.length);
        for (let k = 0; k < selectedCells.length; k++) {
            selectedCells[k].homingPh = 1.0;
        }
    }


    getCells(x, y, size) {
        var selectedCells = [];
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {
                if (i * i + j * j < size * size) {
                    selectedCells.push(this.getCell(x + i, y + j));

                }
            }
        }

        return selectedCells;
    }

    getCell(x, y) {
        var i = y + x * height;
        if (i < cells.length && i > 0) {

            return cells[i];
        }
        return new Cell();
    }
}

const ASPECT_RATIO_WIDTH_MULTIPLIER = CANVAS.clientWidth / CANVAS.clientHeight;
const ANT_LAB = new AntLab();

loadSettings();
ANT_LAB.init();
onPickupTool();

var toolsPanel = document.getElementById("tools");

var settingsPanel = document.getElementById("settings");
var toolsTab = document.getElementById("toolsTab")
var settingsTab = document.getElementById("settingsTab")
showTools();

function setCanvasSize() {
    console.log('Resize')
    if (window.innerWidth < window.innerHeight) {
        CANVAS.width = window.innerWidth;
        CANVAS.height = window.innerHeight;
        isPortrait = true;
        console.log('portrait')
    }
    else {
        CANVAS.width = window.innerWidth;
        CANVAS.height = window.innerHeight;
        isPortrait = false;
        console.log('landscape')

    }

}
function play() {
    ANT_LAB.play();
}

function stop() {
    ANT_LAB.stop();
}


function clearCells() {
    ANT_LAB.clearCells();
}
function fillCells() {
    ANT_LAB.fillCells();
}
function clearPh() {
    ANT_LAB.clearPh();
}

function applySize() {
    width = parseInt(document.getElementById("simWidth").value);
    localStorage.setItem("width", "" + width);
    height = parseInt(document.getElementById("simHeight").value);
    localStorage.setItem("height", "" + height);
    document.location.reload();
}


function clearTool(tool) {
    document.getElementById(tool).style.backgroundColor = "rgba(0, 0, 0,0.5)";
    document.getElementById(tool).style.color = "rgb(190, 190, 190)";
}
function clearTools() {
    this.clearTool("pickupTool");
    this.clearTool("squishTool");
    this.clearTool("obstacleTool");
    this.clearTool("eraseTool");
    this.clearTool("foodTool");
    this.clearTool("homingPhTool");
    this.clearTool("foodPhTool");
}

function onPickupTool() {
    this.clearTools();
    ANT_LAB.selectedTool = PICKUP_TOOL;
    document.getElementById("pickupTool").style.backgroundColor = "grey";
    document.getElementById("pickupTool").style.color = "white";
}

function onSquishTool() {
    this.clearTools();
    ANT_LAB.selectedTool = SQUISH_TOOL;
    document.getElementById("squishTool").style.backgroundColor = "grey";
    document.getElementById("squishTool").style.color = "white";
}

function onFoodTool() {
    this.clearTools();
    ANT_LAB.selectedTool = FOOD_TOOL;
    document.getElementById("foodTool").style.backgroundColor = "grey";
    document.getElementById("foodTool").style.color = "white";
}

function onObstacleTool() {
    this.clearTools();
    ANT_LAB.selectedTool = OBSTACLE_TOOL;
    document.getElementById("obstacleTool").style.backgroundColor = "grey";
    document.getElementById("obstacleTool").style.color = "white";
}

function onEraseTool() {
    this.clearTools();
    ANT_LAB.selectedTool = ERASE_TOOL;
    document.getElementById("eraseTool").style.backgroundColor = "grey";
    document.getElementById("eraseTool").style.color = "white";
}

function onHomingPhTool() {
    this.clearTools();
    ANT_LAB.selectedTool = HOMINGPH_TOOL;
    document.getElementById("homingPhTool").style.backgroundColor = "grey";
    document.getElementById("homingPhTool").style.color = "white";
}

function onFoodPhTool() {
    this.clearTools();
    ANT_LAB.selectedTool = FOODPH_TOOL;
    document.getElementById("foodPhTool").style.backgroundColor = "grey";
    document.getElementById("foodPhTool").style.color = "white";
}


function showTools() {
    console.log("TOOLS");
    toolsPanel.style.display = "block";
    settingsPanel.style.display = "none";
    settingsTab.style.backgroundColor = "rgb(20,20,20)";
    toolsTab.style.backgroundColor = "rgb(40,40,40)";
}

function showSettings() {
    console.log("SETTINGS");

    toolsPanel.style.display = "none";
    settingsPanel.style.display = "block";
    settingsTab.style.backgroundColor = "rgb(40,40,40)";
    toolsTab.style.backgroundColor = "rgb(20,20,20)";
}

function random() {
    return Math.random() * 2 - 1;
}

function loadSettings() {
    if (localStorage.getItem("brushSize") != null) {
        brushSize = localStorage.getItem("brushSize");
        document.getElementById("brushSize").value = brushSize;
        document.getElementById("brushSize").nextElementSibling.value = brushSize;
    }
    if (localStorage.getItem("brushDensity") != null) {
        brushDensity = Math.pow(parseFloat(localStorage.getItem("brushDensity")) / 10, 3);
        document.getElementById("brushDensity").value = localStorage.getItem("brushDensity");
        document.getElementById("brushDensity").nextElementSibling.value = parseFloat(localStorage.getItem("brushDensity") / 10);
    }
    if (localStorage.getItem("width") != null) {
        width = localStorage.getItem("width");
        height = localStorage.getItem("height");
        document.getElementById("simWidth").value = width;
        document.getElementById("simHeight").value = height;
    }
    if (localStorage.getItem("activeAnts") != null) {
        activeAnts = localStorage.getItem("activeAnts");
        document.getElementById("activeAnts").value = activeAnts;
        document.getElementById("activeAnts").nextElementSibling.value = activeAnts;
    }
    if (localStorage.getItem("lifeSpan") != null) {
        lifeSpan = localStorage.getItem("lifeSpan");
        document.getElementById("lifeSpan").value = lifeSpan;
        document.getElementById("lifeSpan").nextElementSibling.value = lifeSpan;
    }
    if (localStorage.getItem("foodCapacity") != null) {
        foodCapacity = localStorage.getItem("foodCapacity");
        document.getElementById("foodCapacity").value = foodCapacity * 10;
        document.getElementById("foodCapacity").nextElementSibling.value = foodCapacity;
    }
    if (localStorage.getItem("foodEvap") != null) {
        foodEvaporation = localStorage.getItem("foodEvap");
        document.getElementById("foodEvap").value = foodEvaporation;
        document.getElementById("foodEvap").nextElementSibling.value = foodEvaporation;
    }
    if (localStorage.getItem("homingEvap") != null) {
        homingEvaporation = localStorage.getItem("homingEvap");
        document.getElementById("homingEvap").value = homingEvaporation;
        document.getElementById("homingEvap").nextElementSibling.value = homingEvaporation;
    }
    if (localStorage.getItem("timeScale") != null) {
        timeScale = localStorage.getItem("timeScale");
        document.getElementById("timeScale").value = timeScale;
        document.getElementById("timeScale").nextElementSibling.value = timeScale;
    }
}

