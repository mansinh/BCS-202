const FLOAT_SIZE_BYTES = 4;
const STRIDE = 9 * FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3 * FLOAT_SIZE_BYTES;
const VERTEX_TEX_COORDS_OFFSET = 7 * FLOAT_SIZE_BYTES;
const VERTEX_SOURCE = 
    `#version 300 es
    precision mediump float;
    
    in vec4 position;
    in vec4 color;
    in float pointSize;
    in vec2 texCoord;

    uniform mat4 modelMatrix;

    out vec4 linkedColor;
    out vec2 linkedTexCoord;

    void main() {
        gl_Position = modelMatrix * position;
        gl_PointSize = pointSize;
        linkedColor = color;
        linkedTexCoord = texCoord;
    }`
const FRAGMENT_SOURCE =
    `#version 300 es
    precision mediump float;

    in vec4 linkedColor;
    in vec2 linkedTexCoord;

    uniform sampler2D texture0;
    uniform sampler2D texture1;

    out vec4 color;

    void main() {
        color = mix(texture(texture0, linkedTexCoord), texture(texture1, linkedTexCoord), 0.5) * linkedColor;
    }`
;

class Shader {
    constructor() {
        this.program = this.getNewShaderProgram();
        this.getPropertyLocations();
    }

    program;
    propertyLocationPosition;
    propertyLocationPointSize;
    propertyLocationColor;
    propertyLocationTexCoord;
    propertyLocationModelMatrix
    propertyLocationTextures = [];

    getNewShaderProgram() {
        var vertexShader = this.getAndCompileShader(VERTEX_SOURCE, GL.VERTEX_SHADER);
        var fragmentShader = this.getAndCompileShader(FRAGMENT_SOURCE, GL.FRAGMENT_SHADER);
    
        var newShaderProgram = GL.createProgram();
        GL.attachShader(newShaderProgram, vertexShader);
        GL.attachShader(newShaderProgram, fragmentShader);
        GL.linkProgram(newShaderProgram);
        GL.useProgram(newShaderProgram);
    
        return newShaderProgram;
    }

    getAndCompileShader(_shaderSource, _shaderType) {
        var newShader = GL.createShader(_shaderType);
        GL.shaderSource(newShader, _shaderSource);
        GL.compileShader(newShader);
    
        if (!GL.getShaderParameter(newShader, GL.COMPILE_STATUS)) {
            alert(GL.getShaderInfoLog(newShader));
            return null;
        }
    
        return newShader;
    }

    getPropertyLocations() {
        this.propertyLocationPosition         = GL.getAttribLocation(this.program   , "position");
        this.propertyLocationPointSize        = GL.getAttribLocation(this.program   , "pointSize");
        this.propertyLocationColor            = GL.getAttribLocation(this.program   , "color");
        this.propertyLocationTexCoord         = GL.getAttribLocation(this.program   , "texCoord");

        this.propertyLocationModelMatrix      = GL.getUniformLocation(this.program  , "modelMatrix");
        this.propertyLocationTextures = [
            GL.getUniformLocation(this.program  , "texture0")
        ,   GL.getUniformLocation(this.program  , "texture1")
        ]

        GL.enableVertexAttribArray(this.propertyLocationPosition);
        GL.enableVertexAttribArray(this.propertyLocationColor);
        GL.enableVertexAttribArray(this.propertyLocationTexCoord);
    }
}