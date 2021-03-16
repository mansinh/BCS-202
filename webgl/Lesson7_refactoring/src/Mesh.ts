import { MAIN } from "./Main";

const FLOAT_SIZE_BYTES :number  = 4;
const STRIDE :number  = 9 * FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET:number  = 3 * FLOAT_SIZE_BYTES;
const VERTEX_TEX_COORDS_OFFSET:number  = 7 * FLOAT_SIZE_BYTES;

export class Mesh {
    constructor() {
        this.createVertices();
        this.setShaderProperties();
    }

    vertices:number[] = [
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


    vertexDataBuffer:WebGLBuffer = <WebGLBuffer>MAIN.gl.createBuffer();;

    

    createVertices() {
        MAIN.gl.bindBuffer(MAIN.gl.ARRAY_BUFFER, this.vertexDataBuffer);
        MAIN.gl.bufferData(MAIN.gl.ARRAY_BUFFER, new Float32Array(this.vertices), MAIN.gl.STATIC_DRAW);
    }

    setShaderProperties() {
        var shader = MAIN.webGLApp.shader;
        MAIN.gl.useProgram(shader.program);
    
        MAIN.gl.vertexAttribPointer(shader.propertyLocationPosition, 3, MAIN.gl.FLOAT, false, STRIDE, 0);
        MAIN.gl.vertexAttribPointer(shader.propertyLocationColor, 4, MAIN.gl.FLOAT, false, STRIDE, VERTEX_COLOR_OFFSET);
        MAIN.gl.vertexAttribPointer(shader.propertyLocationTexCoord, 2, MAIN.gl.FLOAT, false, STRIDE, VERTEX_TEX_COORDS_OFFSET);
    
        MAIN.gl.vertexAttrib1f(shader.propertyLocationPointSize, 50);
    }
}