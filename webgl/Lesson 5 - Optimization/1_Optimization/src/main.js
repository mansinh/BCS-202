const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");
const WEBGL_APP = new WebGLApp();
WEBGL_APP.initialize();

var mousePosition = {
    x: -2,
    y: -2
};


brushSizeSlider.oninput = function () {
    brushSize = parseInt(this.value);
}

CANVAS.addEventListener("mousedown", (e) => {

    usingTool = true;
});

CANVAS.addEventListener("mouseup", (e) => {
    usingTool = false;
});

CANVAS.addEventListener("mousemove", (e) => {

    mousePosition.x = remapValue(e.clientX, 0, CANVAS.clientWidth, -1, 1);
    mousePosition.y = -remapValue(e.clientY, 0, CANVAS.clientHeight, -1, 1);
    if (usingTool) {
        switch (selectedTool) {
            case HAND_TOOL:
                break;
            case TERRAIN_TOOL:
                drawTerrain(mousePosition.x, mousePosition.y);
                break;
            case FOOD_TOOL:
                drawFood(mousePosition.x, mousePosition.y);
                break;
            case ERASE_TOOL:
                erase(mousePosition.x, mousePosition.y);
                break;
        }
    }
});

onHandTool();
function remapValue(v, minSrc, maxSrc, minDst, maxDst) {
    return (v - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
}