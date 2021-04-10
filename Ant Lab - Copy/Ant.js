const FINDFOOD = 0;
const RETURNFOOD = 1;


class Ant {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.direction = 0;
        this.dirVector = new Vec2(0.0, 0.0);
        this.maxSpeed = 0.2;
        this.maxTurn = Math.PI / 20;
        this.action = FINDFOOD;
        this.t = 0.0;
        this.senseRange = 3;
      
    }
    x;
    y;
    z;
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
        var forward = new Vec2(dx, dy).mul(this.maxSpeed*dt);

        if (this.x > 1.0) {
            forward.x = - forward.x;
            this.x = 1.0;
        }
        if (this.x < -1.0) {
            forward.x = - forward.x;
            this.x = -1.0;
        }
        if (this.y > 1.0) {
            forward.y = - forward.y;
            this.y = 1.0;
        }
        if (this.y < -1.0) {
            forward.y = - forward.y;
            this.y = -1.0;
        }

        var i = Math.min(parseInt((this.x+ 1.0) * WIDTH / 2), WIDTH - 1);
        var j = Math.min(parseInt((this.y + 1.0) * HEIGHT / 2), HEIGHT - 1);


        var neighbours = this.getCells(i,j,1);
        if (this.action == FINDFOOD) {
            for(let k = 0; k < neighbours.length;k++){
                if(neighbours[k].food > 0){
                    this.action = RETURNFOOD;
                }
            }
                
        }
        else if (this.action == RETURNFOOD) {

                
            if(HOME.collide(this.x,this.y)){
                this.action = FINDFOOD;
                this.direction += random()*Math.PI*2;
            }
                
        }
        this.x +=forward.x;
        this.y+=forward.y;
        this.direction = forward.angle();
        this.direction += random() * this.maxTurn;



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
        cells[j + i * HEIGHT].homingPh +=1;
      
    }
    layFoodPh(i, j) {
        cells[j + i * HEIGHT].foodPh += 1;
        
    }





    getCells(x, y, size) {
        var selectedCells = [];
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j < size; j++) {
                
                    selectedCells.push(this.getCell(x+i, y+j));
                
            }
        }

        return selectedCells;
    }

    getCell(x, y) {
        var i = y  + x * HEIGHT;
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