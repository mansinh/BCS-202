import { Camera } from "./Camera";
import { MAIN } from "./Main";
import { Mesh } from "./Mesh";
import { SceneObject } from "./SceneObject";
import { Shader } from "./Shader";
import { TextureManager } from "./TextureManager";

export class WebGLApp {
    constructor() {
    }

    mesh:Mesh;
    sceneObjects:SceneObject[];
    textureManager:TextureManager;
    shader:Shader;
    camera:Camera;

    initialize() {
        this.setWebGL2Preferences();
        
        this.shader = new Shader();
        this.mesh = new Mesh();
        this.camera = new Camera();

        this.sceneObjects = [
            new SceneObject({x:0, y:0, z:1}, {x:45, y:45, z:0}, {x:0.5,y:0.5,z:0.5})
        ,   new SceneObject({x:0.75, y:0, z:1}, {x:0, y:0, z:90})
        ,   new SceneObject({x:-0.75, y:0, z:1})
        ];
        this.textureManager = new TextureManager();

        requestAnimationFrame(() => { this.update() });
    }

    setWebGL2Preferences() {
        MAIN.gl.viewport(0, 0, MAIN.canvas.clientWidth, MAIN.canvas.clientHeight);
        MAIN.gl.clearColor(0, 0, 0, 1);
        MAIN.gl.enable(MAIN.gl.DEPTH_TEST);
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

        this.camera.update();
        
        requestAnimationFrame(() => { this.update() });
    }

    draw() {
        MAIN.gl.clear(MAIN.gl.COLOR_BUFFER_BIT | MAIN.gl.DEPTH_BUFFER_BIT);
    }
}