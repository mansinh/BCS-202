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

    // Ant collision to check if an ant has returned home
    collide(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        return this.size * this.size > dx * dx + dy * dy;
    }

    // Tool collsiion to check if home has been picked up
    toolCollide(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        //console.log("home sdfsdf" + dx + " " + dy + " " + (this.size * this.size > dx * dx + dy * dy));
        return this.size * this.size/zoom*2 > dx * dx + dy * dy;
    }
    // Lay homing pheromone at home every 3 seconds
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