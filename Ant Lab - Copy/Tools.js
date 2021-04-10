var brushSize = 5;
var brushSizeSlider = document.getElementById("brushSize");

brushSizeSlider.oninput = function () {
    brushSize = parseInt(this.value);
}

var brushDensity = 1;
var brushDensitySlider = document.getElementById("brushDensity");

brushDensitySlider.oninput = function () {
    brushDensity = parseFloat(this.value) / 10 * parseFloat(this.value) / 10* parseFloat(this.value) / 10;

}

class Tools {
    constructor() {

    }


    handTool(mouseX, mouseY) {
        if (HOME.collide(mouseX, mouseY) || HOME.selected == true) {
            HOME.x = mouseX;
            HOME.y = mouseY;
            HOME.selected = true;
        }
        console.log(HOME.selected);
    }



    drawFood(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * WIDTH / 2), WIDTH - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * HEIGHT / 2), HEIGHT - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].food = 1;
            }
        }
    }

    drawTerrain(mouseX, mouseY) {

        var x = Math.min(parseInt((mouseX + 1.0) * WIDTH / 2), WIDTH - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * HEIGHT / 2), HEIGHT - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].terrain = 1;
                selectedCells[i].homingPh=0;
                selectedCells[i].foodPh=0;
                selectedCells[i].food=0;
            }
        }
    }

    erase(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * WIDTH / 2), WIDTH - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * HEIGHT / 2), HEIGHT - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].food = 0;
                selectedCells[i].terrain = 0;
                selectedCells[i].foodPh = 0;
                selectedCells[i].homingPh = 0;
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
        var i = y + b + (x + a) * HEIGHT;
        if (i < cells.length && i > 0) {
            return cells[i];
        }
        return new Cell();
    }


}