// boss.js
const mat4 = glMatrix.mat4;

export class Boss {
  constructor(gl, shaderProgram, texture) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.texture = texture;

    this.x = 0;
    this.y = 0.8; // Start near the top
    this.width = 0.3;
    this.height = 0.2;

    this.speedX = 0.01;   // Side to side hover speed
    this.speedY = 0.02;   // Rush downward speed
    this.health = 25;     // Tough boss!
    this.alive = true;

    this.rushing = false;
    this.rushCooldown = 300; // Frames until next rush
    this.bulletCooldown = 0;

    this.modelMatrix = mat4.create();

    // Setup buffers
    this.vertices = new Float32Array([
      -this.width, -this.height, 0.0,  0.0, 0.0,
       this.width, -this.height, 0.0,  1.0, 0.0,
       this.width,  this.height, 0.0,  1.0, 1.0,
      -this.width,  this.height, 0.0,  0.0, 1.0
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
  }

  update() {
    if (!this.alive) return;

    if (this.rushing) {
      this.y -= this.speedY;
      if (this.y <= -0.5) {  // After missing the player
        this.rushing = false;
        this.y = 0.8;  // Reset to top
      }
    } else {
      this.x += this.speedX;
      if (this.x > 0.7 || this.x < -0.7) {
        this.speedX = -this.speedX; // Bounce left and right
      }

      this.rushCooldown--;
      if (this.rushCooldown <= 0) {
        this.rushing = true;
        this.rushCooldown = 300 + Math.random() * 200; // Reset cooldown randomly
      }
    }

    if (!this.rushing) {
      this.bulletCooldown--;
    }
  }

  canShoot() {
    return this.bulletCooldown <= 0;
  }

  shoot() {
    this.bulletCooldown = 50; // Shoot every 50 frames
  }

  hit() {
    this.health--;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  draw(projMatrix) {
    if (!this.alive) return;

    const gl = this.gl;
    gl.useProgram(this.shaderProgram);

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

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
