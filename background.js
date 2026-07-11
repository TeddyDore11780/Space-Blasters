// background.js
const mat4 = glMatrix.mat4;

export class Background {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;

    this.vertices = [
      -1.0, -1.0, 0.0,  0.0, 0.0,
       1.0, -1.0, 0.0,  1.0, 0.0,
       1.0,  1.0, 0.0,  1.0, 1.0,
      -1.0,  1.0, 0.0,  0.0, 1.0
    ];
    this.indices = [0, 1, 2, 0, 2, 3];

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

    this.positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    this.texcoordLocation = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
    this.uModel = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    this.uProj = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    this.uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');

    this.modelMatrix = mat4.create();

    this.scrollYNear = 0;  // Near layer scroll
    this.scrollYFar = 0;   // Far layer scroll

    this.nearTexture = this.loadTexture('background_near.png');
    this.farTexture = this.loadTexture('background_far.png');
  }

  loadTexture(url) {
    const gl = this.gl;
    const texture = gl.createTexture();
    const image = new Image();
    image.src = url;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
    return texture;
  }

  drawLayer(texture, scrollY, projMatrix) {
    const gl = this.gl;

    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, [0, scrollY, -5]);

    gl.uniformMatrix4fv(this.uProj, false, projMatrix);
    gl.uniformMatrix4fv(this.uModel, false, this.modelMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(this.positionLocation);

    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(this.texcoordLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  draw(projMatrix) {
    const gl = this.gl;
    gl.useProgram(this.shaderProgram);

    // 🎨 Update scroll
    this.scrollYNear -= 0.008;
    this.scrollYFar -= 0.004;  // Far layer scrolls slower

    if (this.scrollYNear <= -2.0) this.scrollYNear += 2.0;
    if (this.scrollYFar <= -2.0) this.scrollYFar += 2.0;

    // 🌌 Draw Far first (deeper)
    this.drawLayer(this.farTexture, this.scrollYFar, projMatrix);
    this.drawLayer(this.farTexture, this.scrollYFar + 2.0 - 0.001, projMatrix);
    this.drawLayer(this.farTexture, this.scrollYFar - 2.0 + 0.001, projMatrix);

    // 🚀 Draw Near second
    this.drawLayer(this.nearTexture, this.scrollYNear, projMatrix);
    this.drawLayer(this.nearTexture, this.scrollYNear + 2.0 - 0.001, projMatrix);
    this.drawLayer(this.nearTexture, this.scrollYNear - 2.0 + 0.001, projMatrix);
  }
}
