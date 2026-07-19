const mat4 = glMatrix.mat4;

export class Player {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;

    this.x = 0;
    this.y = -0.55;
    this.speed = 0.02;

    this.width = 0.2;
    this.height = 0.2;

    this.vertices = new Float32Array([
      -0.1, -0.1, 0.0,  0.0, 1.0,
       0.1, -0.1, 0.0,  1.0, 1.0,
       0.1,  0.1, 0.0,  1.0, 0.0,
      -0.1,  0.1, 0.0,  0.0, 0.0
    ]);

    this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    this.texcoordLocation = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
    this.uModel = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    this.uProj = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    this.uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');

    this.modelMatrix = mat4.create();

    this.texture = this.loadTexture('player.png');

    this.flashTimer = 0; // Add a simple timer for flash effect

    // Enable blending for transparency 
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  loadTexture(url) {
    const gl = this.gl;
    const texture = gl.createTexture();
    const image = new Image();
    image.src = url;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    return texture;
  }

  move(keys) {
    if (keys['ArrowLeft']) this.x -= this.speed;
    if (keys['ArrowRight']) this.x += this.speed;
    if (keys['ArrowUp']) this.y += this.speed;
    if (keys['ArrowDown']) this.y -= this.speed;

    const limitX = 1.0 - this.width / 2;
    const limitY = 1.0 - this.height / 2;

    if (this.x > limitX) this.x = limitX;
    if (this.x < -limitX) this.x = -limitX;
    if (this.y > limitY) this.y = limitY;
    if (this.y < -limitY) this.y = -limitY;
  }

  flashRed() {
    this.flashTimer = 10; // Flash for ~10 frames
  }

  draw(projMatrix) {
    const gl = this.gl;
    gl.useProgram(this.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(this.positionLocation);

    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(this.texcoordLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, [this.x, this.y, -1.5]);

    gl.uniformMatrix4fv(this.uProj, false, projMatrix);
    gl.uniformMatrix4fv(this.uModel, false, this.modelMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uSampler, 0);

    if (this.flashTimer > 0) {
      gl.blendColor(1.0, 0.0, 0.0, 1.0); // Red Blend Color 
      gl.blendFunc(gl.CONSTANT_COLOR, gl.ONE_MINUS_SRC_ALPHA);
      this.flashTimer--;
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
