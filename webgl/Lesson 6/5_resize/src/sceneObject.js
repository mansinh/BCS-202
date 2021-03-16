// Rename to SceneObject.
class SceneObject extends Transform {
    // Receive the transforms
    constructor(_position = {x:0,y:0,z:0}, _rotation = {x:0,y:0,z:0}, _scale = {x:1,y:1,z:1}) {
        // Pass transforms to Transform.
        super(_position, _rotation, _scale);
        
        // Keep the starting position in mind.
        this.initialPosition = _position;
    }

    // Randomize our object.
    angle = Math.random() * (180 - -180) + -180;
    // Store an initial position so that we can add to it later.
    initialPosition;

    update() {
        this.transform();
        this.applyTransforms();

        // The draw method draws whatever it finds in the bound buffer.
        // Thanks to the transform() and applyTransform, matrices and shader data have been updated since the last time we draw a triangle.
        this.draw();
    }

    draw() {
        // Draw arrays will draw triangles according to the data it points to when you bind the buffer.
        // Notice, we're pointing to that vertex data from our mesh.
        GL.bindBuffer(GL.ARRAY_BUFFER, WEBGL_APP.mesh.vertexBuffer);
        GL.drawArrays(GL.TRIANGLES, 0, 18);
    }

    transform() {
        this.angle += 0.5;

        // Add to their position, rather than simply assign it.
        this.position = {
            x: this.initialPosition.x + Math.sin(this.angle * 0.05) * 0.5
        ,   y: this.initialPosition.y + Math.cos(this.angle * 0.05) * 0.5
        ,   z: 1
        };

        this.rotation = {
            x: this.angle
        ,   y: this.angle * 2
        ,   z: 0
        }

        this.scale = {
            x: Math.sin(this.angle * 0.05) * 0.3 + 1
        ,   y: Math.sin(this.angle * 0.05) * 0.3 + 1
        ,   z: 1
        };
    }
}