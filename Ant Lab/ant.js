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

    physicsUpdate(dt){
        if (!this.selected) {
            if (this.squished) {
                this.color.fadeToBlack(2, dt);
                if (this.color.a <= 0) {
                    this.init();
                    this.squished = false;
                }
            }
            else if (!(this.vx == 0 && this.vy == 0 && this.vz == 0) || this.z > 0) {
                this.physics(dt);
            }
        }
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


    update(dt) {
        this.timeActive += dt;
        if (!this.selected) {
            if (!this.squished) {
                if (this.vx == 0 && this.vy == 0 && this.vz == 0) {
                    this.behaviour(dt)
                }
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
            this.randomTurn();
        }

    }

    homingBehaviour(homingPhDirection, sample) {

        if (homingPhDirection.sqMagnitude() > 0) {
            //console.log(homingPhDirection);
            this.direction = homingPhDirection;
        }
        else{
            this.randomTurn();
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
        var dvy = this.direction.y * this.maxSpeed * dt*2
        if(isPortrait){
            dvx = this.direction.x * this.maxSpeed * dt*2;
            dvy = this.direction.y * this.maxSpeed * dt
        }
    
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

    toolCollide(x, y) {
        return this.size * this.size/zoom*2 > this.sqDistance(x, y);
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
            SOUNDS.playSquishSound();
        }
    }
}

/*******************************************************************************************************************/

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


/*******************************************************************************************************************/

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