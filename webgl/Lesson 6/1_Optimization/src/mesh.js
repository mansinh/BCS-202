class Mesh {
    constructor() {
        this.createVertices();
        this.setShaderProperties();
    }

    vertices;
    vertexDataBuffer;

    update() {
        this.transform();
        this.draw();
    }

    draw() {
        GL.drawArrays(GL.TRIANGLES, 0, 3);
    }

    createVertices() {
        this.vertices = [
            -0.9, -0.9, 0.0,    1.0, 0.0, 0.0, 1.0,     0.0, 0.0,
             0.9, -0.9, 0.0,    0.0, 1.0, 0.0, 1.0,     1.0, 0.0,
             0.0,  0.9, 0.0,    0.0, 0.0, 1.0, 1.0,     0.5, 1.0
        ];

        this.vertexDataBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);
    }
    
    setShaderProperties() {
        // Woops... instead of shader... we were referencing "this".
        var shader = WEBGL_APP.shader;
        GL.useProgram(shader.program);
        
        GL.vertexAttribPointer(shader.propertyLocationPosition, 3, GL.FLOAT, false, STRIDE, 0);
        GL.vertexAttribPointer(shader.propertyLocationColor, 4, GL.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);
        GL.vertexAttribPointer(shader.propertyLocationTexCoord, 2, GL.FLOAT, false, STRIDE, VERTEX_TEX_COORDS_OFFSET);

        GL.vertexAttrib1f(shader.propertyLocationPointSize, 50);
    }

    

    transform(){
        this.time+=1
        var radians = (Math.PI*2)*(this.time/360)
        var sin = Math.sin(radians);
        var cos = Math.cos(radians)

        var tx = cos*0.5, ty = sin*0.5, tz = 0;
        var matrixTranslation = [
            1,      0,      0,      0
        ,   0,      1,      0,      0
        ,   0,      0,      1,      0
        ,   tx,     ty,     tz,     1
        ];

        var sx = 1, sy = 1, sz = 1;
        var matrixScale = [
            sx,      0,      0,      0
        ,   0,      sy,      0,      0
        ,   0,      0,      sz,      0
        ,   0,     0,     0,     1
        ];

        
        var matrixRotateZ = [
            cos,      sin,      0,      0
        ,   -sin,      cos,      0,      0
        ,   0,      0,      1,      0
        ,   0,     0,     0,     1
        ];

        var modelMatrixLocation = GL.getUniformLocation(WEBGL_APP.shader.program, "modelMatrix");
        GL.uniformMatrix4fv(modelMatrixLocation, false, matrixTranslation);
    }
}
