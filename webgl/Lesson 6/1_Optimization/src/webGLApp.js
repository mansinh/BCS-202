class WebGLApp {
    constructor() {

    }

    mesh;
    textureManager;
    shader;

    initialize() {
        this.setWebGL2Preferences();

        this.shader = new Shader();
        this.mesh = new Mesh();
        this.textureManager = new TextureManager();

        requestAnimationFrame(() => { this.update() });
    }

    setWebGL2Preferences() {
        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        GL.clearColor(0, 0, 0, 1);
    }

    update() {
        if (!this.textureManager.isReady()) {
            //requestAnimationFrame(() => { this.update() });
            //return;
        }
        
        this.draw();
        
        this.mesh.update();

        requestAnimationFrame(() => { this.update() });
    }

    draw() {
        GL.clear(GL.COLOR_BUFFER_BIT);
    }
}