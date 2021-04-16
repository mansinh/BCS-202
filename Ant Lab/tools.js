// Brush settings
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

    // On pointer up, fling/drop ant if holding an ant. Drop home if holding
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
            // Pick up home if pointer over home and the sumulation has not started
            if (HOME.toolCollide(mouseX, mouseY) && !ANT_LAB.started) {
                HOME.selected = true;
                this.moveHome(mouseX, mouseY);
            }
            // Pick up ant if pointer over ant if the simulation has started
            else if (this.selectedAnt == null && ANT_LAB.started) {
                for (let i = 0; i < ants.length; i++) {
                    if (ants[i].toolCollide(mouseX, mouseY)) {
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
        if (this.selectedAnt == null  ) {
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

 


    moveHome(mouseX, mouseY) {
        // move home to pointer if in screen orientation is landscape 
        if(!isPortrait){
            HOME.x = mouseX;
            HOME.y = mouseY;
            
        }
        // if screen orientation is portrait, assume mobile device and move home to just above finger
        else{
            HOME.x = mouseX - 20/width/zoom;
            HOME.y = mouseY;
        }   
    }

    moveAnt(mouseX, mouseY) {
        // move ant to pointer and ant velocity to zero
        this.selectedAnt.x = mouseX;
        this.selectedAnt.y = mouseY;
        this.selectedAnt.vz = 0;
        this.selectedAnt.vy = 0;
        this.selectedAnt.vx = 0;
        // if portrait, assume mobile device set ant height such that the ant is just above finger
        if(!isPortrait){
            this.selectedAnt.z = 20 / height/zoom;
        }
        else{
            this.selectedAnt.z = 20 / width/zoom;
        }
    }

    // Stop an ant and return ant to home
    squishTool(mouseX, mouseY) {
        for (let i = 0; i < ants.length; i++) {
            var squishRadius = brushSize / width * 2;
            if (squishRadius * squishRadius > ants[i].sqDistance(mouseX, mouseY)) {
                ants[i].squish();
            }
        }
    }

    // Draw food onto the map
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

    // Draw obstacles onto the map
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

    // Erase obstacles, food and pheromone from the map
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

    // Draw homing pheromone onto the map
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

    // Draw food pheromone onto the map
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

    // Get map cells under brush
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