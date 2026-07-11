const mat4 = glMatrix.mat4;

export class Meteor {
  constructor(gl, meteorProgram, texture) {
    this.gl = gl;
    this.program = meteorProgram;
    this.texture = texture;

    this.x = Math.random() * 2 - 1; // spawn randomly across x-axis
    this.y = 1.2;
    this.size = 0.2;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() * 0.05) + 0.01;
    this.speed = 0.001 + Math.random() * 0.01;
    this.health = 3;
    this.alive = true;

    this.modelMatrix = mat4.create();

    this.vertices = new Float32Array([
      -this.size, -this.size, 0, 0, 0,
       this.size, -this.size, 0, 1, 0,
       this.size,  this.size, 0, 1, 1,
      -this.size,  this.size, 0, 0, 1
    ]);

    this.indices = new Uint16Array([0,1,2, 0,2,3]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.positionLoc = gl.getAttribLocation(this.program, 'aVertexPosition');
    this.texcoordLoc = gl.getAttribLocation(this.program, 'aTextureCoord');
    this.uModel = gl.getUniformLocation(this.program, 'uModelViewMatrix');
    this.uProj = gl.getUniformLocation(this.program, 'uProjectionMatrix');
    this.uSampler = gl.getUniformLocation(this.program, 'uSampler');
  }

  update() {
    this.y -= this.speed;
    this.rotation += this.rotationSpeed;
  }

  draw(projMatrix) {
    const gl = this.gl;
    gl.useProgram(this.program);

    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, [this.x, this.y, -5]);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation);

    gl.uniformMatrix4fv(this.uModel, false, this.modelMatrix);
    gl.uniformMatrix4fv(this.uProj, false, projMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(this.positionLoc);

    gl.vertexAttribPointer(this.texcoordLoc, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(this.texcoordLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  hit() {
    this.health--;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  isOffScreen() {
    return this.y < -1.5;
  }
}
