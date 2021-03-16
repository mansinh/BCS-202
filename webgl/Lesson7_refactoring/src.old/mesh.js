class Mesh {
    constructor() {
        this.createVertices();
        this.setShaderProperties();
    }

    vertices;
    vertexDataBuffer;

    createVertices() {
        this.vertices = [
            -1.0, -0.5, -1.0,   1.0, 0.0, 0.0, 1.0,    0.0, 0.0,
             1.0, -0.5, -1.0,   0.0, 1.0, 0.0, 1.0,    1.0, 0.0,
             0.0,  1.0,  0.0,   0.0, 0.0, 1.0, 1.0,    0.5, 1.0,

            -1.0, -0.5,  1.0,   0.0, 1.0, 0.0, 1.0,    0.0, 0.0,
             1.0, -0.5,  1.0,   1.0, 0.0, 0.0, 1.0,    1.0, 0.0,
             0.0,  1.0,  0.0,   0.0, 0.0, 1.0, 1.0,    0.5, 1.0,

            -1.0, -0.5, -1.0,   1.0, 0.0, 0.0, 1.0,    0.0, 0.0,
            -1.0, -0.5,  1.0,   0.0, 1.0, 0.0, 1.0,    1.0, 0.0,
             0.0,  1.0,  0.0,   0.0, 0.0, 1.0, 1.0,    0.5, 1.0,

             1.0, -0.5,  1.0,   1.0, 0.0, 0.0, 1.0,    0.0, 0.0,
             1.0, -0.5, -1.0,   0.0, 1.0, 0.0, 1.0,    1.0, 0.0,
             0.0,  1.0,  0.0,   0.0, 0.0, 1.0, 1.0,    0.5, 1.0,

            -1.0, -0.5, -1.0,   1.0, 0.0, 0.0, 1.0,    0.0, 0.0,
            -1.0, -0.5,  1.0,   0.0, 1.0, 0.0, 1.0,    0.0, 1.0,
             1.0, -0.5,  1.0,   1.0, 0.0, 0.0, 1.0,    1.0, 1.0,

            -1.0, -0.5, -1.0,   1.0, 0.0, 0.0, 1.0,    0.0, 0.0,
             1.0, -0.5,  1.0,   1.0, 0.0, 0.0, 1.0,    1.0, 1.0,
             1.0, -0.5, -1.0,   0.0, 1.0, 0.0, 1.0,    1.0, 0.0,
        ];
    
        this.vertexDataBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexDataBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);
    }

    setShaderProperties() {
        var shader = WEBGL_APP.shader;
        GL.useProgram(shader.program);
    
        GL.vertexAttribPointer(shader.propertyLocationPosition, 3, GL.FLOAT, false, STRIDE, 0);
        GL.vertexAttribPointer(shader.propertyLocationColor, 4, GL.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);
        GL.vertexAttribPointer(shader.propertyLocationTexCoord, 2, GL.FLOAT, false, STRIDE, VERTEX_TEX_COORDS_OFFSET);
    
        GL.vertexAttrib1f(shader.propertyLocationPointSize, 50);
    }
}