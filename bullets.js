// bullet.js
const mat4 = glMatrix.mat4;

export class Bullet {
  constructor(gl, shaderProgram, x, y) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.x = x;
    this.y = y;
    this.speed = 0.04; // move speed upwards

    // Smaller bullet shape
    this.vertices = new Float32Array([
      -0.005, -0.005,
       0.005, -0.005,
       0.005,  0.005,
      -0.005,  0.005,
    ]);

    this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    // Buffers
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }

  update() {
    this.y += this.speed;
  }

  isVisible() {
    return this.y < 1.2; // off-screen upwards
  }

  draw(projMatrix) {
    const gl = this.gl;

    gl.useProgram(this.shaderProgram);

    const posLoc = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
    const uModel = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix');
    const uProj = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [this.x, this.y, -0.5]);

    gl.uniformMatrix4fv(uProj, false, projMatrix);
    gl.uniformMatrix4fv(uModel, false, modelMatrix);

    // Set Bullet Color Bright White
    const uColor = gl.getUniformLocation(this.shaderProgram, 'uColor');
    gl.uniform4fv(uColor, [1.0, 1.0, 1.0, 1.0]); // Pure white!

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}
