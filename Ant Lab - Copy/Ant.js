const FINDFOOD = 0;
const RETURNFOOD = 1;


class Ant {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.direction = new Vec2(0.0, 0.0);
        this.maxSpeed = 0.2;
        this.maxTurn = Math.PI / 20;
        this.action = FINDFOOD;
        this.t = 0.0;
        this.senseRange = 2;
      
    }

    init(){
        this.x = HOME.x;
        this.y = HOME.y;
        var angle = random()*Math.PI*2;
        this.direction = new Vec2(Math.cos(angle), Math.sin(angle));
        this.action = FINDFOOD;
    }
    x;
    y;
    z;
 
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

     

        if (this.x > 1.0) {
            this.direction.x = - this.direction.x;
            this.x = 1.0;
        }
        if (this.x < -1.0) {
            this.direction.x = - this.direction.x;
            this.x = -1.0;
        }
        if (this.y > 1.0) {
            this.direction.y= - this.direction.y;
            this.y = 1.0;
        }
        if (this.y < -1.0) {
            this.direction.y = - this.direction.y;
            this.y = -1.0;
        }
    

        var i = Math.min(parseInt((this.x+ 1.0) * WIDTH / 2), WIDTH - 1);
        var j = Math.min(parseInt((this.y + 1.0) * HEIGHT / 2), HEIGHT - 1);


        var neighbours = this.getCells(i,j,this.senseRange);
        //console.log(neighbours.length);
        var foodCells = [];
        for(let k = 0; k < neighbours.length;k++){
            if(neighbours[k].food > 0){
                foodCells.push(neighbours[k]);
            }
        }


        
        if (this.action == FINDFOOD) {
            if(this.getCell(i,j).food>0){
                this.action = RETURNFOOD;
                //this.direction = this.direction.mul(-1);
            }      
            else if (foodCells.length>0){
                var randomFoodCell = foodCells[parseInt(foodCells.length*Math.random())];
                this.direction = new Vec2(randomFoodCell.x-this.x,randomFoodCell.y-this.y).normal();
            }

        }
        if (this.action == RETURNFOOD) {  
            var homingPhDirection = new Vec2(0.0,0.0);
            for(let k = 0; k < neighbours.length;k++){
                var cell = neighbours[k];
                if(cell.homingPh > 0){
                    var neighbourDirection = new Vec2(cell.x-this.x,cell.y-this.y);
                    //if(neighbourDirection.dot(this.direction)>=0){
                        //if(cell.homingPhDirection.dot(this.dirVector)>=0){
                            homingPhDirection = homingPhDirection.add(cell.homingPhDirection.mul(cell.homingPh));
                        //}
                    //}
                }
            }
            if(homingPhDirection.sqMagnitude()>0){
                //console.log(homingPhDirection);
                this.direction = homingPhDirection.normal();
            }
            if(HOME.collide(this.x,this.y)){
                this.action = FINDFOOD;
                var angle = random()*Math.PI*2;
                this.direction = new Vec2(Math.cos(angle), Math.sin(angle));
            }      
        }
        
        var angle = this.maxTurn*random();
        this.direction.x = this.direction.x*Math.cos(angle)+this.direction.y*Math.sin(angle);
        this.direction.y = -this.direction.x*Math.sin(angle)+this.direction.y*Math.cos(angle);
        this.direction = this.direction.normal();
        this.x +=this.direction.x*this.maxSpeed*dt;
        this.y+=this.direction.y*this.maxSpeed*dt;

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
        var cell = cells[j + i * HEIGHT];
        cell.homingPh +=1;
        cell.homingPhDirection = cell.homingPhDirection.add(this.direction.mul(-1));
      
    }
    layFoodPh(i, j) {
        var cell = cells[j + i * HEIGHT];
        cell.foodPh += 1;
        cell.foodPhDirection = cell.foodPhDirection.add(this.direction.mul(-1));
        
    }





    getCells(x, y, size) {
        var selectedCells = [];
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {
                
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