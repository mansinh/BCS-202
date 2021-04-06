class Home {
    constructor() {
        this.init();
    }
    x;
    y;
    foodCollected;
    size;
    selected;

    init() {
        this.x = 0.1;
        this.y = 0.5;
        this.foodCollected = 0;
        this.size = 2.0 / WIDTH;
        this.selected = false;
        console.log(this.size);
    }

    collide(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        console.log("home sdfsdf" + dx + " " + dy + " " + (this.size * this.size > dx * dx + dy * dy));
        return this.size * this.size > dx * dx + dy * dy;
    }
}