const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
CANVAS.width = window.innerWidth - 200;
CANVAS.height = window.innerHeight;
const ASPECT_RATIO_WIDTH_MULTIPLIER = CANVAS.clientWidth / CANVAS.clientHeight;
const ANT_LAB = new AntLab();
ANT_LAB.init();
onPickupTool();

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

function clearTool(tool) {
    document.getElementById(tool).style.backgroundColor = "white";
    document.getElementById(tool).style.color = "black";
}
function clearTools() {
    this.clearTool("pickupTool");
    this.clearTool("squishTool");
    this.clearTool("obstacleTool");
    this.clearTool("eraseTool");
    this.clearTool("foodTool");
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

function random() {
    return Math.random() * 2 - 1;
}