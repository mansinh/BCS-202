const FINDFOOD = 0;
const RETURNFOOD = 1;

class Ant {
    constructor() {
        this.N = new Vec2(0, 1);
        this.NE = new Vec2(1, 1);
        this.E = new Vec2(1, 0);
        this.SE = new Vec2(1, -1);
        this.S = new Vec2(0, -1);
        this.SW = new Vec2(-1, -1);
        this.W = new Vec2(-1, 0);
        this.NW = new Vec2(-1, 1);
        this.DIRECTIONS = [this.E, this.NE, this.N, this.NW, this.W, this.SW, this.S, this.SE];

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.i = 0.0;
        this.j = 0.0;

        this.size = 5;
        this.direction = 0;
        this.maxTurn = Math.PI / 20;
        this.action = FINDFOOD;
        this.selected = false;
        this.t = 0.0;
        this.senseRange = 3;


    }

    N;
    NE;
    E;
    SE;
    S;
    SW;
    W;
    NW;
    DIRECTIONS;

    i; j; x; y; z;
    size;
    direction; maxTurn; senseRange;
    action; //0=findFood, 1=foodFound1, 2 = ...,
    selected;

    init() {
        this.direction = Math.PI * 2 * Math.random();
        this.x = HOME.x;
        this.y = HOME.y;
        this.i = Math.min(parseInt((this.x + 1.0) * WIDTH / 2), WIDTH - 1);
        this.j = Math.min(parseInt((this.y + 1.0) * HEIGHT / 2), HEIGHT - 1);
        this.action = FINDFOOD;
    }


    range(index, length) {
        if (index >= length) {
            return index - length;
        }
        if (index < 0) {
            return index + length;
        }
        return index;
    }

    angleRange(a) {
        if (a >= Math.PI * 2) {
            return a - Math.PI * 2;
        }
        if (a < 0) {
            return a + Math.PI * 2;
        }
        return a;
    }
    physics() {

    }

    update() {
        if (!this.selected) {
            this.behaviour();
        }
    }

    behaviour() {
        var neighbours = this.getNeighbouringCells(this.i, this.j);
        var foodCells = [];
        var homingPhDirection = this.getCell(this.i, this.j).homingPhDirection;
        var foodPhDirection = this.getCell(this.i, this.j).foodPhDirection;

        for (let k = 0; k < 8; k++) {
            if (neighbours[k].food > 0) {
                foodCells.push(neighbours[k]);
                this.action = RETURNFOOD;
            }
            /*
            if(neighbours[k].homingPh>0){
                homingPhDirection = homingPhDirection.add(neighbours[k].homingPhDirection);
            }*/
            if (neighbours[k].foodPh > 0) {
                foodPhDirection = foodPhDirection.add(neighbours[k].foodPhDirection);
            }
        }


        if (this.action == FINDFOOD) {
            this.direction += random() * this.maxTurn;
        }
        else if (this.action == RETURNFOOD) {
            if (homingPhDirection.sqMagnitude() > 0) {
                this.direction = homingPhDirection.angle();
            }

        }
        this.direction = this.angleRange(this.direction);

        var d = this.range(parseInt(this.direction / (Math.PI / 4)), 8);

        var nexti = this.i + this.DIRECTIONS[d].x;
        var nextj = this.j + this.DIRECTIONS[d].y;

        //Terrain Collision
        if (this.getCell(nexti, nextj).terrain > 0) {

            for (let k = 1; k < 4; k++) {
                var left = neighbours[this.range(d + k, 8)];
                var right = neighbours[this.range(d - k, 8)];

                if (left.terrain == 0 && right.terrain == 0) {
                    if (Math.random() < 0.5) {
                        nexti = left.i;
                        nextj = left.j;
                        this.direction = this.range(d + k, 8) * Math.PI / 4;
                    }
                    else {
                        nexti = right.i;
                        nextj = right.j;
                        this.direction = this.range(d - k, 8) * Math.PI / 4;
                    }
                    break;
                }
                else if (left.terrain == 0) {
                    nexti = left.i;
                    nextj = left.j;
                    this.direction = this.range(d + k, 8) * Math.PI / 4;
                    break;
                }
                else if (right.terrain == 0) {
                    nexti = right.i;
                    nextj = right.j;
                    this.direction = this.range(d - k, 8) * Math.PI / 4;
                    break;
                }

            }
        }

        this.i = nexti;
        this.j = nextj;

        if (this.i > WIDTH - 1) {
            this.i = WIDTH - 1

        }
        if (this.i < 0) {
            this.i = 0

        }
        if (this.j > HEIGHT - 1) {
            this.j = HEIGHT - 1

        }
        if (this.j < 0) {
            this.j = 0

        }

        this.x = (this.i / WIDTH - 0.5) * 2;
        this.y = (this.j / HEIGHT - 0.5) * 2;



        if (this.j + this.i * HEIGHT < cells.length && this.j + this.i * HEIGHT > 0) {
            switch (this.action) {
                case 0:
                    this.layHomingPh(this.i, this.j);
                    break;
                case 1:
                    this.layFoodPh(this.i, this.j);
                    break;
            }

        }
    }

    layHomingPh(i, j) {
        var d = this.range(parseInt(this.direction / (2 * Math.PI) * 8), 8);
        cells[j + i * HEIGHT].homingPh += 1;
        cells[j + i * HEIGHT].homingPhDirection = cells[j + i * HEIGHT].homingPhDirection.add(this.DIRECTIONS[d].mul(-1));
    }
    layFoodPh(i, j) {
        var d = this.range(parseInt(this.direction / (2 * Math.PI) * 8), 8);
        cells[j + i * HEIGHT].foodPh += 1;
        cells[j + i * HEIGHT].foodPhDirection = cells[j + i * HEIGHT].foodPhDirection.add(this.DIRECTIONS[d].mul(-1));
    }



    sense(i, j) {

        var selectedCells = this.getCells(i, j, this.senseRange);


        var homingPhDirection = new Vec2(0.0, 0.0);
        var foodPhDirection = new Vec2(0.0, 0.0);

        //var currentCell = this.getCell(i, j, 0, 0);

        for (let k = 0; k < selectedCells.length; k++) {
            var d = new Vec2(selectedCells[k].x - this.x, selectedCells[k].y - this.y);

            if (selectedCells[k].homingPh > 0) {
                homingPhDirection = homingPhDirection.add(selectedCells[k].homingDirection.mul(selectedCells[k].homingPh));
            }
            if (selectedCells[k].foodPh > 0) {
                foodPhDirection = foodPhDirection.add(selectedCells[k].foodDirection.mul(selectedCells[k].foodPh));
            }
        }

        return [homingPhDirection.normal(), foodPhDirection.normal()];

    }

    collide(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        //console.log("home sdfsdf" + dx + " " + dy + " " + (this.size * this.size > dx * dx + dy * dy));
        return this.size * this.size > dx * dx + dy * dy;
    }


    getNeighbouringCells(x, y) {
        var selectedCells = [];
        selectedCells.push(this.getCell(x + 1, y));
        selectedCells.push(this.getCell(x + 1, y + 1));
        selectedCells.push(this.getCell(x, y + 1));
        selectedCells.push(this.getCell(x - 1, y + 1));
        selectedCells.push(this.getCell(x - 1, y));
        selectedCells.push(this.getCell(x - 1, y - 1));
        selectedCells.push(this.getCell(x, y - 1));
        selectedCells.push(this.getCell(x + 1, y - 1));

        return selectedCells;
    }

    getCell(x, y) {
        var i = y + x * HEIGHT;
        if (i < cells.length && i > 0) {
            return cells[i];
        }
        return new Cell();
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