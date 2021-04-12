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
        this.maxTurn = Math.PI / 20;
        this.size = 10 / width;
        this.action = FINDFOOD;
        this.t = 0.0;
        this.senseRange = 2;
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
        this.action = FINDFOOD;
        this.color.toWhite();
        this.timeActive = 0;
    }
    x; y; z;
    vx; vy; vz;
    direction; maxSpeed; maxTurn; size; senseRange;
    action; //0=findFood, 1=foodFound1, 2 = ...,
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
        }
    }

    behaviour(dt) {
        this.t += dt;
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
        var i = Math.min(parseInt((this.x + 1.0) * width / 2), width - 1);
        var j = Math.min(parseInt((this.y + 1.0) * height / 2), height - 1);
        var neighbours = this.getCells(i, j, this.senseRange);
        //console.log(neighbours.length);
        var foodCells = [];
        for (let k = 0; k < neighbours.length; k++) {
            if (neighbours[k].food > 0) {
                foodCells.push(neighbours[k]);
            }
        }

        if (this.action == FINDFOOD) {
            if (this.getCell(i, j).food > 0) {
                this.action = RETURNFOOD;
                //this.direction = this.direction.mul(-1);
            }
            else if (foodCells.length > 0) {
                var randomFoodCell = foodCells[parseInt(foodCells.length * Math.random())];
                this.direction = new Vec2(randomFoodCell.x - this.x, randomFoodCell.y - this.y).normal();
            }

        }
        if (this.action == RETURNFOOD) {
            var homingPhDirection = new Vec2(0.0, 0.0);
            for (let k = 0; k < neighbours.length; k++) {
                var cell = neighbours[k];
                if (cell.homingPh > 0) {
                    var neighbourDirection = new Vec2(cell.x - this.x, cell.y - this.y);
                    //if(neighbourDirection.dot(this.direction)>=0){
                    //if(cell.homingPhDirection.dot(this.dirVector)>=0){
                    homingPhDirection = homingPhDirection.add(cell.homingPhDirection.mul(cell.homingPh));
                    //}
                    //}
                }
            }
            if (homingPhDirection.sqMagnitude() > 0) {
                //console.log(homingPhDirection);
                this.direction = homingPhDirection.normal();
            }
            if (HOME.collide(this.x, this.y)) {
                this.action = FINDFOOD;
                var angle = random() * Math.PI * 2;
                this.direction = new Vec2(Math.cos(angle), Math.sin(angle));
            }
        }

        var angle = this.maxTurn * random();
        this.direction.x = this.direction.x * Math.cos(angle) + this.direction.y * Math.sin(angle);
        this.direction.y = -this.direction.x * Math.sin(angle) + this.direction.y * Math.cos(angle);
        this.direction = this.direction.normal();
        this.x += this.direction.x * this.maxSpeed * dt;
        this.y += this.direction.y * this.maxSpeed * dt;

        //this.z = (Math.sin(this.timeActive * 60 + this.index / ANT_COUNT * Math.PI) + 1) / 4 / height;
        this.z = 2 * Math.random() / 300;


        if (j + i * height < cells.length && j + i * height > 0) {
            switch (this.action) {
                case 0:
                    this.layHomingPh(i, j);
                    break;
                case 1:
                    this.layFoodPh(i, j);
                    break;
            }

        }
    }

    layHomingPh(i, j) {
        var cell = cells[j + i * height];
        cell.homingPh += 1;
        cell.homingPhDirection = cell.homingPhDirection.add(this.direction.mul(-1));

    }
    layFoodPh(i, j) {
        var cell = cells[j + i * height];
        cell.foodPh += 1;
        cell.foodPhDirection = cell.foodPhDirection.add(this.direction.mul(-1));

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

