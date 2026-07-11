// enemy2.js
const mat4 = glMatrix.mat4;

export class Enemy2 {
  constructor(gl, shaderProgram, texture, startX = Math.random() * 1.8 - 0.9) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.texture = texture;
    this.x = startX;
    this.y = 1.2;
    this.speed = 0.0015 + Math.random() * 0.01; // Faster than Enemy1
    this.health = 10; // Needs 2 bullet hits
    this.modelMatrix = mat4.create();

    this.vertices = [
      -0.08, -0.08, 0,   0, 0,
       0.08, -0.08, 0,   1, 0,
       0.08,  0.08, 0,   1, 1,
      -0.08,  0.08, 0,   0, 1,
    ];
    this.indices = [0, 1, 2, 0, 2, 3];

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

    this.positionLoc = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    this.texCoordLoc = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
    this.uModel = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    this.uProj = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    this.uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');
  }

  update() {
    this.y -= this.speed;
  }

  draw(projMatrix) {
    const gl = this.gl;
    gl.useProgram(this.shaderProgram);

    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, [this.x, this.y, -3]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(this.positionLoc);

    gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(this.texCoordLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(this.uProj, false, projMatrix);
    gl.uniformMatrix4fv(this.uModel, false, this.modelMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  isOffScreen() {
    return this.y < -1.2;
  }

  hit() {
    this.health--;
  }

  get alive() {
    return this.health > 0;
  }
}
 