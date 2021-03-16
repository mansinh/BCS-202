import { MAIN } from "./Main";
import { Shader } from "./Shader";

export class TextureManager {
    constructor() {
        this.readyCount = 0;
        this.textureBuffers = [
            this.createTexture("../images/Beagle.jpg")
        ,   this.createTexture("../images/Clouds.png")
        ];
    }

    textureBuffers:WebGLTexture[] = [];
    readyCount:number;

    createTexture(_url:string) {
        var textureBuffer:WebGLTexture = <WebGLTexture>MAIN.gl.createTexture();
        var image:HTMLImageElement = new Image();
        image.src = _url;
        image.onload = () => {
            MAIN.gl.bindTexture(MAIN.gl.TEXTURE_2D, textureBuffer);
            MAIN.gl.pixelStorei(MAIN.gl.UNPACK_FLIP_Y_WEBGL, true);
            MAIN.gl.texImage2D(MAIN.gl.TEXTURE_2D, 0, MAIN.gl.RGB, MAIN.gl.RGB, MAIN.gl.UNSIGNED_BYTE, image);
            
            MAIN.gl.texParameteri(MAIN.gl.TEXTURE_2D, MAIN.gl.TEXTURE_MAG_FILTER, MAIN.gl.NEAREST);
            MAIN.gl.texParameteri(MAIN.gl.TEXTURE_2D, MAIN.gl.TEXTURE_MIN_FILTER, MAIN.gl.NEAREST);

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
        var shader:Shader = MAIN.webGLApp.shader;
        MAIN.gl.useProgram(shader.program);

        this.textureBuffers;
        for (let i = 0; i < this.textureBuffers.length; i++) {
            MAIN.gl.activeTexture(MAIN.gl.TEXTURE0 + i);
            MAIN.gl.bindTexture(MAIN.gl.TEXTURE_2D, this.textureBuffers[i]);
            MAIN.gl.uniform1i(shader.propertyLocationTextures[i], i);
        }
    }
}