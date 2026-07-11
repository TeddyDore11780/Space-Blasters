// enemy.js
const mat4 = glMatrix.mat4;

export class Enemy {
  constructor(gl, program, texture) {
    this.gl = gl;
    this.program = program;
    this.texture = texture;

    this.x = Math.random() * 2 - 1; // Random X position between -1 and 1
    this.y = 1.2;                  // Start slightly off the top
    this.speed = 0.003;             // Start slow
    this.accelerated = false;
    this.alive = true;

    this.modelMatrix = mat4.create();

    // Setup vertices and buffers
    this.vertices = new Float32Array([
      -0.08, -0.08, 0.0, 0.0, 0.0,
       0.08, -0.08, 0.0, 1.0, 0.0,
       0.08,  0.08, 0.0, 1.0, 1.0,
      -0.08,  0.08, 0.0, 0.0, 1.0,
    ]);
    this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.positionLocation = gl.getAttribLocation(this.program, 'aVertexPosition');
    this.texcoordLocation = gl.getAttribLocation(this.program, 'aTextureCoord');
    this.uModel = gl.getUniformLocation(this.program, 'uModelViewMatrix');
    this.uProj = gl.getUniformLocation(this.program, 'uProjectionMatrix');
    this.uSampler = gl.getUniformLocation(this.program, 'uSampler');
  }

  update() {
    this.y -= this.speed;

    // If enemy reaches 3/4 down the screen, it speeds up
    if (!this.accelerated && this.y <= -0.5) {
      this.speed *= 3; // Increase speed
      this.accelerated = true;
    }

    // If off the bottom
    if (this.y < -1.2) {
      this.alive = false;
    }
  }

  draw(projMatrix) {
    const gl = this.gl;

    gl.useProgram(this.program);

    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, [this.x, this.y, -5]);

    gl.uniformMatrix4fv(this.uProj, false, projMatrix);
    gl.uniformMatrix4fv(this.uModel, false, this.modelMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(this.positionLocation);

    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(this.texcoordLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  isOffScreen() {
    return this.y < -1.2;
  }
}
