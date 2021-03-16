class Camera {
    constructor(){
        this.update();
    }

    near = 1;
    far = 200;
    fovRadians = 60 * Math.PI/180


    perspective(aspect){
        var f = Math.tan(Math.PI * 0.5 - 0.5 * this.fovRadians);
        var rangeInv = 1.0 / (this.near - this.far);


        return [
            f / aspect, 0, 0,                                   0,
            0,          f, 0,                                   0,
            0,          0, (this.near + this.far) * rangeInv,  -1,
            0,          0, this.near * this.far * rangeInv * 2, 0
        ];
    }

    update(){
        this.updateProjectionMatrix()
    }

    updateProjectionMatrix(){
        var aspect = CANVAS.clientWidth / CANVAS.clientHeight;
        var projectionMatrix = this.perspective(aspect);

        GL.uniformMatrix4fv(WEBGL_APP.shader.propertyLocationProjectionMatrix, false, projectionMatrix);
    }
}