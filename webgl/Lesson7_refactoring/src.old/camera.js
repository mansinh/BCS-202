class Camera {
    constructor() {
        this.update();
    }
    
    // We don't need our special perspective() method anymore. Just make a matrix and give it data.
    projectionMatrix = mat4.create();
    near = 1;
    far = 200;
    fovRadians = 60 * Math.PI/180.0;

    update() {
        if (CANVAS.width != CANVAS.clientWidth || CANVAS.height != CANVAS.clientHeight) {
            this.updateViewport();
        }

        this.updateProjectionMatrix();
    }

    updateProjectionMatrix() {
        var aspect = CANVAS.clientWidth / CANVAS.clientHeight;
        
        // Declare projectionMatrix in global space instead.
        mat4.perspective(this.projectionMatrix, this.fovRadians, aspect, this.near, this.far);
        GL.uniformMatrix4fv(WEBGL_APP.shader.propertyLocationProjectionMatrix, false, this.projectionMatrix);
    }

    updateViewport() {
        CANVAS.width = CANVAS.clientWidth;
        CANVAS.height = CANVAS.clientHeight;
        GL.viewport(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
    }
}