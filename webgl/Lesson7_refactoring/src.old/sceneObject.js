class SceneObject extends Transform {
    constructor(_position = {x:0,y:0,z:0}, _rotation = {x:0,y:0,z:0}, _scale = {x:1,y:1,z:1}) {
        super(_position, _rotation, _scale);
        
        this.initialPosition = _position;
    }

    angle       = Math.random() * (180 - -180) + -180;
    // Random speed between 0.5~3.0
    angleSpeed  = Math.random() * (3 - 0.5) + 0.5;
    // Add a speed property.
    offset      = 0;
    // Add a speed property.
    offsetSpeed = Math.random() * (0.1 - 0.005) + 0.005;
    initialPosition;

    update() {
        this.transform();
        this.applyTransforms();

        this.draw();
    }

    draw() {
        GL.bindBuffer(GL.ARRAY_BUFFER, WEBGL_APP.mesh.vertexBuffer);
        GL.drawArrays(GL.TRIANGLES, 0, 18);
    }

    transform() {
        this.offset += this.offsetSpeed;
        this.position = {
            x: this.initialPosition.x + Math.sin(this.offset)
        ,   y: this.initialPosition.y + Math.cos(this.offset)
        ,   z: -3
        };
        
        // Output desired angle increment in radians.
        this.angle += (Math.PI * 2) * (0.5 / 360) * this.angleSpeed;
        this.rotation = {
            x: this.angle
        ,   y: this.angle * 2
        ,   z: 0
        }

        this.scale = {
            x: Math.sin(this.angle)
        ,   y: Math.cos(this.angle)
        ,   z: 1
        };
    }
}