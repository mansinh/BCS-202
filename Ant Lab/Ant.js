const FINDFOOD = 0;
const RETURNFOOD = 1;


class Ant {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.direction = 0;
        this.dirVector = new Vec2(0.0, 0.0);
        this.maxSpeed = 0.1;
        this.maxTurn = Math.PI / 15;
        this.action = FINDFOOD;
        this.t = 0.0;
        this.senseRange = 2;
        this.lastPh = 1.0;
    }
    x;
    y;
    dirVector;
    direction;
    maxSpeed;
    maxTurn;
    action; //0=findFood, 1=foodFound1, 2 = ...,
    t;
    senseRange;
    lastPh;
    ANT_LAB;

    update(dt) {
        this.t += dt;

        var dx = Math.cos(this.direction);
        var dy = Math.sin(this.direction);
        this.dirVector = new Vec2(dx, dy);

        var frontX = this.x + dt * this.maxSpeed * dx;
        var frontY = this.y + dt * this.maxSpeed * dy;



        if (frontX > 1.0) {
            this.direction = Math.PI;
            this.x = 1.0;
        }
        if (frontX < -1.0) {
            this.direction = 0;
            this.x = -1.0;
        }
        if (frontY > 1.0) {
            this.direction = -Math.PI / 2;
            this.y = 1.0;
        }
        if (frontY < -1.0) {
            this.direction = Math.PI / 2;
            this.y = -1.0;
        }

        var i = Math.min(parseInt((frontX + 1.0) * WIDTH / 2), WIDTH - 1);
        var j = Math.min(parseInt((frontY + 1.0) * HEIGHT / 2), HEIGHT - 1);



        var sense = this.sense(i, j);
        if (sense[0].sqMagnitude() > 0) {

            var terrainNormal = sense[0].normal();
            var spin = this.dirVector.x * terrainNormal.y - this.dirVector.y * terrainNormal.x;
            var terrainTangent = terrainNormal.perp(spin);
            this.x -= this.dirVector.x * dt * this.maxSpeed;
            this.y -= this.dirVector.y * dt * this.maxSpeed;
            this.direction = terrainTangent.direction() + random() * this.maxTurn;

        }
        else if (sense[1].sqMagnitude() > 0 && this.action == FINDFOOD) {
            this.action = RETURNFOOD;

            this.direction += Math.PI;
        }
        else {
            this.x = frontX;
            this.y = frontY;

            if (this.action == FINDFOOD) {



            }
            else if (this.action == RETURNFOOD) {

                if (sense[2].sqMagnitude() > 0) {
                    this.direction = (sense[2].add(this.dirVector)).direction();
                }
            }
            this.direction += random() * this.maxTurn;
        }


        // if (this.t > 0.05) {
        if (j + i * HEIGHT < cells.length && j + i * HEIGHT > 0) {
            switch (this.action) {
                case 0:
                    this.layHomingPh(i, j);
                    break;
                case 1:
                    this.layFoodPh(i, j);
                    break;
            }
        }
        // this.t = 0.0;
        //}


    }

    layHomingPh(i, j) {
        cells[j + i * HEIGHT].homingPh += 0.5;
        cells[j + i * HEIGHT].homingDirection = cells[j + i * HEIGHT].homingDirection.add(this.dirVector.mul(-1));
    }
    layFoodPh(i, j) {
        cells[j + i * HEIGHT].foodPh += 0.5;
        cells[j + i * HEIGHT].foodDirection = cells[j + i * HEIGHT].foodDirection.add(this.dirVector.mul(-1));
    }


    sense(i, j) {

        var selectedCells = this.getCells(i, j, this.senseRange);
        var terrainDirection = new Vec2(0.0, 0.0);
        var foodDirection = new Vec2(0.0, 0.0);
        var homingPhDirection = new Vec2(0.0, 0.0);
        var foodPhDirection = new Vec2(0.0, 0.0);

        //var currentCell = this.getCell(i, j, 0, 0);

        for (let k = 0; k < selectedCells.length; k++) {
            var d = new Vec2(selectedCells[k].x - this.x, selectedCells[k].y - this.y);
            if (selectedCells[k].terrain > 0) {
                terrainDirection.x += d.x;
                terrainDirection.y += d.y;
            }
            if (selectedCells[k].food > 0) {
                foodDirection.x += d.x;
                foodDirection.y += d.y;
            }
            if (selectedCells[k].homingPh > 0) {
                homingPhDirection = homingPhDirection.add(selectedCells[k].homingDirection.mul(selectedCells[k].homingPh));
            }
            if (selectedCells[k].foodPh > 0) {

            }
        }

        return [terrainDirection, foodDirection, homingPhDirection.normal(), foodPhDirection.normal()];

    }


    getCells(x, y, size) {
        var selectedCells = [];
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j < size; j++) {
                if (i * i + j * j < size * size) {
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

    direction() {
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