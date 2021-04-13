const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
CANVAS.width = window.innerWidth - 200;
CANVAS.height = window.innerHeight;
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
    document.getElementById(tool).style.backgroundColor = "rgb(40, 40, 40)";
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

