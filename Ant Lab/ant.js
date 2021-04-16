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

    /*******************************************************************************************************************/
    physicsUpdate(dt){

        if (!this.selected) {
            // If squished, fade away. When gone respawn at home
            if (this.squished) {
                this.color.fadeToBlack(2, dt);
                if (this.color.a <= 0) {
                    this.init();
                    this.squished = false;
                }
            }
            // If velocity != 0 or if ant is abve ground, apply physics
            else if (!(this.vx == 0 && this.vy == 0 && this.vz == 0) || this.z > 0) {
                this.physics(dt);
            }
        }
    }

    physics(dt) {
        // Apply gravity
        this.vz += -GRAVITY * dt;
        this.z += this.vz;
        // Apply friction when in contact with the ground
        if (this.z <= 0) {
            this.vz = -this.vz * 0.6;
            this.vy = this.vy * 0.9;
            this.vx = this.vx * 0.9;
            this.z = 0;
        }
        // Bounce off the edges of the simulation space
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

        // Round velocity to zero when small enough
        if (Math.abs(this.vz) < 0.001) {
            this.vz = 0;

        }
        if (Math.abs(this.vy) < 0.001) {
            this.vy = 0;
        }
        if (Math.abs(this.vx) < 0.001) {
            this.vx = 0;
        }

        // Apply horizontal velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    // Update ant behaviour if ant is on ground and not squished
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
        // Convert canvas coordinate to cell coordinates
        this.i = Math.min(Math.round((this.x + 1.0) * width / 2), width - 1);
        this.j = Math.min(Math.round((this.y + 1.0) * height / 2), height - 1);

        // Sample neighbouring cells
        var sample = this.getCells(this.i, this.j, this.senseRange);

        // Detect the direction of food pheromones when finding food or homing pheromones when returning food
        var phDirection = this.sensePheromone(sample);

        // Detect and react to obstacles 
        if (this.obstacleBehaviour(dt)) {

        }
        // Detect and react to food and react to pheromones
        else if (this.action == FINDFOOD) {
            this.findFoodBehaviour(phDirection, sample);
        }
        else if (this.action == RETURNFOOD) {
            this.homingBehaviour(phDirection, sample);
        }

        // Apply movement
        this.move(dt);
        // Stay within bounds of map
        this.mapBoundsBehaviour();
        // Lay pheromones onto map
        this.layPheromoneTrail(this.i, this.j);

        // If the ant has been out of home without finding food for longer than its lifespan respawn at home
        if (this.distanceTravelled > lifeSpan) {
            this.init();
        }
        
    }

    /*******************************************************************************************************************/
    // Search cells in front of the ant for pheromones and pick the direction towards the cell with 
    //the highest pheromone strength
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

    /*******************************************************************************************************************/
    // Behaviours

    foodCarried = 0;
    findFoodBehaviour(foodPhDirection, sample) {
        // Search surrounding cells for any food
        var foodCells = [];
        for (let k = 0; k < sample.length; k++) {
            if (sample[k].food > 0) {
                foodCells.push(sample[k]);
            }
        }

        // If ant is on top of food, carry the food and start returning home
        var foodFound = this.getCell(this.i, this.j).food;
        if (foodFound > 0) {
            this.action = RETURNFOOD;
            this.distanceTravelled = 0;
            this.direction = this.direction.mul(-1);
            this.foodCarried = Math.min(foodFound, foodCapacity);
            this.getCell(this.i, this.j).food = Math.max(foodFound - foodCapacity, 0);

        }
        // If food is found in the surrounding cells, pick one and move towards it
        else if (foodCells.length > 0) {
            var randomFoodCell = foodCells[parseInt(foodCells.length * (Math.random() * 0.99))];
            this.direction = new Vec2(randomFoodCell.x - this.x, randomFoodCell.y - this.y).normal();
        }
        // If no food is found, follow the food pheromone trail if i exists
        else if (foodPhDirection.sqMagnitude() > 0) {
            //console.log(foodPhDirection);
            this.direction = foodPhDirection;

        }
        // If there is no food or pheromone trail then wander around randomly
        else {
            this.randomTurn();
        }

    }

    homingBehaviour(homingPhDirection, sample) {
        // If the ant has arrived home, deposit the food and go out searching for more food 
        if (HOME.collide(this.x, this.y)) {
            foodCollected += this.foodCarried;
            this.foodCarried = 0;
            this.action = FINDFOOD;
            var angle = random() * Math.PI * 2;
            //this.direction = new Vec2(Math.cos(angle), Math.sin(angle));
            this.direction = this.direction.mul(-1);
            this.distanceTravelled = 0;
            return;
        }
        
        // Follow a homing pheromone trail if it exist
        if (homingPhDirection.sqMagnitude() > 0) {
            this.direction = homingPhDirection;
        }
        // If there is no pheromone trail then wander around randomly
        else{
            this.randomTurn();
        }
        
        
        
    }


    obstacleBehaviour(dt) {
        var sample = this.getCells(this.i, this.j, 1);
        var tangent = new Vec2(0.0, 0.0);
        var normal = new Vec2(0.0, 0.0);
        var collided = false;
    
        // Search through cells in front of the ant for obstacles. If an obstacle is found, move left or right 
        // (perpendicular to obstacle direction) 
       
        for (let k = 0; k < sample.length; k++) {
            var cell = sample[k];
            if (cell.obstacle > 0) {
                var cellDirection = new Vec2(cell.x - this.x, cell.y - this.y).normal();
                // If obstacle is in front
                if (cellDirection.dot(this.direction) > 0.5) {
                     // Pick left or right depening on which will need the ant to turn less
                    cellDirection = cellDirection.add(cellDirection).normal();
                    var cross = Math.sign(this.direction.x * cellDirection.y - this.direction.y * cellDirection.x);
                    tangent =cellDirection.perp(cross);
                    normal = cellDirection.mul(-1);
                    collided = true;
                }
            }
        }
        // If a collision with an obstacle is detected move away from the obstacle and turn 
        if (collided) {
            this.direction = tangent.normal();
            normal = normal.normal();
            this.x += normal.x * this.maxSpeed * dt*2;
            this.y += normal.y * this.maxSpeed * dt*2;
            return true;
        }
        return false;
    }

    /*******************************************************************************************************************/
    // If ant is out of bounds, return the ant within bounds and turn it away from bounds
    mapBoundsBehaviour() {
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
/*******************************************************************************************************************/
    // Lay a homing pheromone trail when finding food or lay a food pheromone trail when returning home with food
    // Pheromone strength per cell is capped at 1
    layPheromoneTrail(i, j) {
        if (j + i * height < cells.length && j + i * height > 0) {
            // Decrease strength of pheromone laid exponentially such that it starts at the max of 1 at home and
            // 0.1 at the end of life span
            var phStrength = Math.exp(this.distanceTravelled * Math.log(0.1) / lifeSpan);
            
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
/*******************************************************************************************************************/

    move(dt) {
        // Apply movement speed to ant
        this.direction = this.direction.normal();
        var dvx = this.direction.x * this.maxSpeed * dt;
        var dvy = this.direction.y * this.maxSpeed * dt*2
        // Flip x and y coordinates if screen orientation is portrait
        if(isPortrait){
            dvx = this.direction.x * this.maxSpeed * dt*2;
            dvy = this.direction.y * this.maxSpeed * dt
        }
    
        this.x += dvx;
        this.y += dvy;

        // Calculate distance travelled that will be a measure of how long the ant has been out on the map
        this.distanceTravelled += Math.sqrt(dvx * dvx + dvy * dvy)

        // Have the ant bob up and down for a makeshift crawling animation
        //this.z = (Math.sin(this.timeActive * 60 + this.index / ANT_COUNT * Math.PI) + 1) / 4 / height;
        this.z = 2 * Math.random() / 300;
    }

    // Turn a random amount
    randomTurn() {
        var angle = this.maxTurn * random();
        this.direction.x = this.direction.x * Math.cos(angle) + this.direction.y * Math.sin(angle);
        this.direction.y = -this.direction.x * Math.sin(angle) + this.direction.y * Math.cos(angle);
    }

    /*******************************************************************************************************************/
    // Retrieve surroundng map cells
    getCells(x, y, size) {
        var selectedCells = [];

        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {

                selectedCells.push(this.getCell(x + i, y + j));

            }
        }

        return selectedCells;
    }

    // Retrieve a single map cell
    getCell(x, y) {
        var i = y + x * height;
        if (i < cells.length && i > 0) {
            return cells[i];
        }
        return new Cell();
    }

    // Detect collision for pick up tool
    toolCollide(x, y) {
        return this.size * this.size/zoom*2 > this.sqDistance(x, y);
    }

    sqDistance(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        return dx * dx + dy * dy
    }

    /*******************************************************************************************************************/
    // Stop, turn into a bloody pile and play squish sound when squished by squish tool
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