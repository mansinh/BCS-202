const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
var isPortrait = false;
var zoom;
setCanvasSize();
// Set canvas size if window is resized
window.addEventListener("resize", function () {
    setCanvasSize();
});
function setCanvasSize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    // Detect zoom
    zoom = window.outerWidth/window.innerWidth;
    // Detect if the screen orientation is portrait or landscape
    if (window.innerWidth < window.innerHeight) {
        isPortrait = true;
        console.log('portrait')

    }
    else {
        isPortrait = false;
        console.log('landscape')
    }
}
const ASPECT_RATIO_WIDTH_MULTIPLIER = CANVAS.clientWidth / CANVAS.clientHeight;

/*******************************************************************************************************************/
const ANT_LAB = new AntLab();
const SOUNDS = new Sounds();
loadSettings();
ANT_LAB.init();

onPickupTool();

/*******************************************************************************************************************/
// UI input
var toolsPanel = document.getElementById("tools");
var settingsPanel = document.getElementById("settings");
var toolsTab = document.getElementById("toolsTab")
var settingsTab = document.getElementById("settingsTab")
showTools();

// Switch between tools and simulation settings tab
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

// Control buttons
function play() {
    ANT_LAB.play();
}
function stop() {
    ANT_LAB.stop();
}

// Load settings from last visit
function loadSettings() {
    // Tool settingx
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

    // Load simulation size
    if (localStorage.getItem("width") != null) {
        width = localStorage.getItem("width");
        height = localStorage.getItem("height");
        document.getElementById("simWidth").value = width;
        document.getElementById("simHeight").value = height;
    }
    else{
        if (isPortrait){
            width = 100;
            height = 150;
        }
        else{
            width = 150;
            height = 100;
        }
        document.getElementById("simWidth").value = width;
        document.getElementById("simHeight").value = height;
    }

    // Load ant settings
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

    // Load pheromone settings
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

    // Load simulation speed
    if (localStorage.getItem("timeScale") != null) {
        timeScale = localStorage.getItem("timeScale");
        document.getElementById("timeScale").value = timeScale;
        document.getElementById("timeScale").nextElementSibling.value = timeScale;
    }
}

// Deselect tools UI
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

// Tools

// pick up or fling ants or home 
function onPickupTool() {
    this.clearTools();
    ANT_LAB.selectedTool = PICKUP_TOOL;
    document.getElementById("pickupTool").style.backgroundColor = "grey";
    document.getElementById("pickupTool").style.color = "white";
}

// squish ants to respawn ant at thome
function onSquishTool() {
    this.clearTools();
    ANT_LAB.selectedTool = SQUISH_TOOL;
    document.getElementById("squishTool").style.backgroundColor = "grey";
    document.getElementById("squishTool").style.color = "white";
}

// Draw food onto map
function onFoodTool() {
    this.clearTools();
    ANT_LAB.selectedTool = FOOD_TOOL;
    document.getElementById("foodTool").style.backgroundColor = "grey";
    document.getElementById("foodTool").style.color = "white";
}

// Draw obstacles onto map
function onObstacleTool() {
    this.clearTools();
    ANT_LAB.selectedTool = OBSTACLE_TOOL;
    document.getElementById("obstacleTool").style.backgroundColor = "grey";
    document.getElementById("obstacleTool").style.color = "white";
}

// Erase obstacle, food or pheromones from map
function onEraseTool() {
    this.clearTools();
    ANT_LAB.selectedTool = ERASE_TOOL;
    document.getElementById("eraseTool").style.backgroundColor = "grey";
    document.getElementById("eraseTool").style.color = "white";
}

// Draw homing pheromone on map
function onHomingPhTool() {
    this.clearTools();
    ANT_LAB.selectedTool = HOMINGPH_TOOL;
    document.getElementById("homingPhTool").style.backgroundColor = "grey";
    document.getElementById("homingPhTool").style.color = "white";
}

// Draw food pheromone on map
function onFoodPhTool() {
    this.clearTools();
    ANT_LAB.selectedTool = FOODPH_TOOL;
    document.getElementById("foodPhTool").style.backgroundColor = "grey";
    document.getElementById("foodPhTool").style.color = "white";
}

// Clear obstacles and food from map
function clearCells() {
    ANT_LAB.clearCells();
}

// Fill map with obstacles
function fillCells() {
    ANT_LAB.fillCells();
}

// Clear pheromones from map
function clearPh() {
    ANT_LAB.clearPh();
}


// Apply simulation map size and refresh the page
function applySize() {
    width = parseInt(document.getElementById("simWidth").value);
    localStorage.setItem("width", "" + width);
    height = parseInt(document.getElementById("simHeight").value);
    localStorage.setItem("height", "" + height);
    document.location.reload();
}

// Return a random number between -1 and 1
function random() {
    return Math.random() * 2 - 1;
}
