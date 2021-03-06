class TextureManager {
    constructor() {
        this.textureBuffers = [
            this.createTexture("../images/Clouds.png"),
            this.createTexture("../images/Beagle.jpg")
        ];
    }

    textureBuffers = [];

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

            console.log("Image loaded: " + _url);
        }

        return textureBuffer;
    }

    isReady() {
        this.textureBuffers.forEach(element => {
            if (!element.image.complete) {
                console.log(element.image, element.image.complete);
                return false;
            }
        });
 
        this.setShaderProperties();
 
        return true;
    }

    setShaderProperties() {
        var shader = WEBGL_APP.shader;
        GL.useProgram(shader.program);

        // Demonstrate the conversion to how we WERE loading textures.
        this.textureBuffers;
        for (let i = 0; i < this.textureBuffers.length; i++) {
            GL.activeTexture(GL.TEXTURE0 + i);
            GL.bindTexture(GL.TEXTURE_2D, this.textureBuffers[i]);
            GL.uniform1i(shader.propertyLocationTextures[i], i);
        }
    }
}