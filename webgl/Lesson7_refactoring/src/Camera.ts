import { mat4 } from "gl-matrix";
import { MAIN } from "./Main";

export class Camera {
    constructor() {
        this.update();
    }
    
    // We don't need our special perspective() method anymore. Just make a matrix and give it data.
    projectionMatrix:mat4 = mat4.create();
    near:number = 1;
    far:number = 200;
    fovRadians:number = 60 * Math.PI/180.0;

    update() {
        if (MAIN.canvas.width != MAIN.canvas.clientWidth || MAIN.canvas.height != MAIN.canvas.clientHeight) {
            this.updateViewport();
        }

        this.updateProjectionMatrix();
    }

    updateProjectionMatrix() {
        var aspect = MAIN.canvas.clientWidth / MAIN.canvas.clientHeight;
        
        // Declare projectionMatrix in global space instead.
        mat4.perspective(this.projectionMatrix, this.fovRadians, aspect, this.near, this.far);
        MAIN.gl.uniformMatrix4fv(MAIN.webGLApp.shader.propertyLocationProjectionMatrix, false, this.projectionMatrix);
    }

    updateViewport() {
        MAIN.canvas.width = MAIN.canvas.clientWidth;
        MAIN.canvas.height = MAIN.canvas.clientHeight;
        MAIN.gl.viewport(0, 0, MAIN.canvas.clientWidth, MAIN.canvas.clientHeight);
    }
}