class TextureManager {
    constructor() {
        this.readyCount = 0;
        this.textureBuffers = [
            this.createTexture("../images/Beagle.jpg")
        ,   this.createTexture("../images/Clouds.png")
        ];
    }

    textureBuffers = [];
    readyCount;

    createTexture(_url) {
        var textureBuffer = GL.createTexture();
        textureBuffer.image = new Image();
        textureBuffer.image.src = _url;
        textureBuffer.image.onload = () => {
            GL.bindTexture(GL.TEXTURE_2D, textureBuffer);
            GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, GL.RGB, GL.UNSIGNED_BYTE, textureBuffer.image);
            
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);

            this.setIsReady();
        };

        return textureBuffer;
    }

    isReady() {
        return this.textureBuffers.length == this.readyCount;
    }

    setIsReady() {
        if (this.textureBuffers.length == ++this.readyCount) {
            this.setShaderProperties();
        }
    }

    setShaderProperties() {
        var shader = WEBGL_APP.shader;
        GL.useProgram(shader.program);

        this.textureBuffers;
        for (let i = 0; i < this.textureBuffers.length; i++) {
            GL.activeTexture(GL.TEXTURE0 + i);
            GL.bindTexture(GL.TEXTURE_2D, this.textureBuffers[i]);
            GL.uniform1i(shader.propertyLocationTextures[i], i);
        }
    }
}