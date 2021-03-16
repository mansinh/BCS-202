class WebGLApp {
    constructor() {
    }

    mesh;
    // Switch from triangle to an array of sceneObjects.
    sceneObjects;
    textureManager;
    shader;
    camera;

    initialize() {
        this.setWebGL2Preferences();
        
        this.shader = new Shader();
        // Create a new mesh. We'll use this in our GameObject.
        this.mesh = new Mesh();
        // Populate array with triangles.

        this.camera = new Camera();

        this.sceneObjects = [
            new SceneObject({x:0, y:0, z:-10}, {x:45, y:45, z:0}, {x:0.5,y:0.5,z:0.5})
        ,   new SceneObject({x:0.75, y:0, z:-10}, {x:0, y:0, z:90})
        ,   new SceneObject({x:-0.75, y:0, z:-10})
        ];
        this.textureManager = new TextureManager();

        requestAnimationFrame(() => { this.update() });
    }

    setWebGL2Preferences() {
        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        GL.clearColor(0, 0, 0, 1);
        GL.enable(GL.DEPTH_TEST);
    }

    update() {
        if (!this.textureManager.isReady()) {
            requestAnimationFrame(() => { this.update() });
            return;
        }

        this.draw();

        this.sceneObjects.forEach(element => {
            element.update();
        });
        
        requestAnimationFrame(() => { this.update() });
    }

    draw() {
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    }
}