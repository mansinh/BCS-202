class Cell {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.homingPh = 0;
        this.homingDirection = new Vec2(0.0, 0.0);
        this.foodPh = 0;
        this.foodDirection = new Vec2(0.0, 0.0);
        this.terrain = 0;
        this.food = 0;
    }
    x;
    y;
    homingPh;
    foodPh;
    terrain;
    food;

    update() {

    }
}