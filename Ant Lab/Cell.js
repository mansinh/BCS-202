class Cell {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.i=0;
        this.j=0;
        this.homingPh = 0;
        this.homingPhDirection = new Vec2(0.0, 0.0);
        this.foodPh = 0;
        this.foodPhDirection = new Vec2(0.0, 0.0);
        this.terrain = 0;
        this.food = 0;
    }
    x;
    y;
    i;
    j;
    homingPh;
    foodPh;
    terrain;
    food;

    update() {

    }
}