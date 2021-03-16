class Transform {
    constructor(_position, _rotation, _scale) {
        this.position = _position;
        this.scale = _scale;
        this.rotation = _rotation;
        // Create matrix in global space.
        this.modelMatrix = mat4.create();
    }
    
    position = { x:0, y:0, z:0 };
    rotation = { x:0, y:0, z:0 };
    scale    = { x:1, y:1, z:1 };
    // Create matrix in global space.
    modelMatrix;

    applyTransforms() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [this.position.x, this.position.y, this.position.z]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation.z);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation.y);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation.x);
        mat4.scale(this.modelMatrix, this.modelMatrix, [this.scale.x, this.scale.y, this.scale.z]);
        
        GL.uniformMatrix4fv(WEBGL_APP.shader.propertyLocationModelMatrix, false, this.modelMatrix);
    }
    
    multiplyMat4(_a, _b) {
        var a00=_a[0*4+0],   a01=_a[0*4+1],   a02=_a[0*4+2],   a03=_a[0*4+3]
        ,   a10=_a[1*4+0],   a11=_a[1*4+1],   a12=_a[1*4+2],   a13=_a[1*4+3]
        ,   a20=_a[2*4+0],   a21=_a[2*4+1],   a22=_a[2*4+2],   a23=_a[2*4+3]
        ,   a30=_a[3*4+0],   a31=_a[3*4+1],   a32=_a[3*4+2],   a33=_a[3*4+3]

        ,   b00=_b[0*4+0],   b01=_b[0*4+1],   b02=_b[0*4+2],   b03=_b[0*4+3]
        ,   b10=_b[1*4+0],   b11=_b[1*4+1],   b12=_b[1*4+2],   b13=_b[1*4+3]
        ,   b20=_b[2*4+0],   b21=_b[2*4+1],   b22=_b[2*4+2],   b23=_b[2*4+3]
        ,   b30=_b[3*4+0],   b31=_b[3*4+1],   b32=_b[3*4+2],   b33=_b[3*4+3]
        
        return new Float32Array([
            a00*b00 + a10*b01 + a20*b02 + a30*b03,
            a01*b00 + a11*b01 + a21*b02 + a31*b03,
            a02*b00 + a12*b01 + a22*b02 + a32*b03,
            a03*b00 + a13*b01 + a23*b02 + a33*b03,

            a00*b10 + a10*b11 + a20*b12 + a30*b13,
            a01*b10 + a11*b11 + a21*b12 + a31*b13,
            a02*b10 + a12*b11 + a22*b12 + a32*b13,
            a03*b10 + a13*b11 + a23*b12 + a33*b13,

            a00*b20 + a10*b21 + a20*b22 + a30*b23,
            a01*b20 + a11*b21 + a21*b22 + a31*b23,
            a02*b20 + a12*b21 + a22*b22 + a32*b23,
            a03*b20 + a13*b21 + a23*b22 + a33*b23,

            a00*b30 + a10*b31 + a20*b32 + a30*b33,
            a01*b30 + a11*b31 + a21*b32 + a31*b33,
            a02*b30 + a12*b31 + a22*b32 + a32*b33,
            a03*b30 + a13*b31 + a23*b32 + a33*b33
        ]);
    }

    getMatrixTranslation(_tx, _ty, _tz) {
        return [
              1,   0,   0,  0, 
              0,   1,   0,  0,
              0,   0,   1,  0,
            _tx, _ty, _tz,  1
        ];
    }

    getMatrixRotationX(_angleInRadians) {
        var c = Math.cos((Math.PI * 2) * (_angleInRadians / 360));
        var s = Math.sin((Math.PI * 2) * (_angleInRadians / 360));
        return [
            1,  0,  0,  0,
            0,  c,  s,  0,
            0, -s,  c,  0,
            0,  0,  0,  1
        ];
    }

    getMatrixRotationY(_angleInRadians) {
        var c = Math.cos((Math.PI * 2) * (_angleInRadians / 360));
        var s = Math.sin((Math.PI * 2) * (_angleInRadians / 360));
        return [
            c,  0,  s,  0,
            0,  1,  0,  0,
           -s,  0,  c,  0,
            0,  0,  0,  1
        ];
    }

    getMatrixRotationZ(_angleInRadians) {
        var c = Math.cos((Math.PI * 2) * (_angleInRadians / 360));
        var s = Math.sin((Math.PI * 2) * (_angleInRadians / 360));
        return [
            c,  s,  0,  0,
           -s,  c,  0,  0,
            0,  0,  1,  0,
            0,  0,  0,  1
        ];
    }

    getMatrixScaleNonUniform(_sx, _sy, _sz) {
        return [
            _sx,  0,  0,  0,
             0, _sy,  0,  0,
             0,  0, _sz,  0,
             0,  0,  0,  1
        ];
    }

    getMatrixScaleUniform(_s) {
        return [
             1,  0,  0,  0,
             0,  1,  0,  0,
             0,  0,  1,  0,
             0,  0,  0,  1/_s
        ];
    }
}