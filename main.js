// main.js
import { vertexShaderSource, fragmentShaderSource, playerVertexShaderSource, playerFragmentShaderSource, bulletVertexShaderSource, bulletFragmentShaderSource, meteorVertexShaderSource, meteorFragmentShaderSource } from './shaders.js';
import { Background } from './background.js';
import { Player } from './player.js';
import { Bullet } from './bullets.js';
import { Meteor } from './meteor.js';
import { Enemy } from './enemy.js';
import { Enemy2 } from './enemy2.js';
import { Boss } from './boss.js';

let gameStarted = false;
let paused = false;
const meteorDestroySound = document.getElementById('meteor-destroy-sound');
const bossExplosionSound = document.getElementById('boss-explosion-sound');
const bossMusic = document.getElementById('boss-background-music');
const normalMusic = document.getElementById('normal-background-music');
const playerHitSound = document.getElementById('player-hit-sound');
const gameOverSound = document.getElementById('game-over-sound');
const bossThemeSound = document.getElementById('boss-theme-sound');

const startText = document.getElementById('startText');
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
  alert('WebGL not supported!');
  throw new Error('WebGL not supported!');
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function createProgram(vsSource, fsSource) {
  const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

// === Programs
const backgroundProgram = createProgram(vertexShaderSource, fragmentShaderSource);
const playerProgram = createProgram(playerVertexShaderSource, playerFragmentShaderSource);
const bulletProgram = createProgram(bulletVertexShaderSource, bulletFragmentShaderSource);
const meteorProgram = createProgram(meteorVertexShaderSource, meteorFragmentShaderSource);

// === Matrices
const mat4 = glMatrix.mat4;
const projMatrix = mat4.create();
mat4.ortho(projMatrix, -1, 1, -1, 1, 0.1, 10);

// === Load Textures
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  const image = new Image();
  image.src = url;
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  };
  return texture;
}

const meteorTexture = loadTexture(gl, 'meteor.png');
const enemyTexture = loadTexture(gl, 'enemy.png');
const enemy2Texture = loadTexture(gl, 'enemy2.png');
const bossTexture = loadTexture(gl, 'boss.png');

// === Game Objects
const background = new Background(gl, backgroundProgram);
const player = new Player(gl, playerProgram);

const bullets = [];
const meteors = [];
const enemies = [];
const enemies2 = [];
const bossBullets = [];

let boss = null;
let enemy2Kills = 0;

const keys = {};
let fireCooldown = 0;
let gameOver = false;
let playerHealth = 5;
let score = 0;

// === UI
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const bulletSound = document.getElementById('bullet-sound');

// === Input
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' && fireCooldown <= 0) {
    bullets.push(new Bullet(gl, bulletProgram, player.x, player.y + 0.15));
    fireCooldown = 10;
    bulletSound.currentTime = 0;
    bulletSound.play();
  }
});

document.addEventListener('keyup', e => keys[e.key] = false);

// Restart Game (if dead)
document.addEventListener('keydown', e => {
  if (gameOver && e.key.toLowerCase() === 'r') {
    window.location.reload();
  }
});

document.addEventListener('keydown', e => {
    if (!gameStarted && e.key.toLowerCase() === 'r') {
      gameStarted = true;
      document.getElementById('startText').style.display = 'none'; // Hide "Press R to Start"
    }
  
    keys[e.key] = true;
  
    if (gameStarted && e.key === ' ' && fireCooldown <= 0) {
      bullets.push(new Bullet(gl, bulletProgram, player.x, player.y + 0.15));
      fireCooldown = 10;
      bulletSound.currentTime = 0;
      bulletSound.play();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p') {
      if (gameStarted && !gameOver) {
        paused = !paused; // Toggle
        const pauseText = document.getElementById('pauseText');
        pauseText.style.display = paused ? 'block' : 'none';
      }
    }
  
    if (!gameStarted && e.key.toLowerCase() === 'r') {
      gameStarted = true;
      document.getElementById('startText').style.display = 'none';
      document.getElementById('normal-background-music').play();
    }
  
    keys[e.key] = true;
  
    if (gameStarted && e.key === ' ' && fireCooldown <= 0 && !paused) {
      bullets.push(new Bullet(gl, bulletProgram, player.x, player.y + 0.15));
      fireCooldown = 10;
      bulletSound.currentTime = 0;
      bulletSound.play();
    }
  });
  

// === Spawning Enemies
setInterval(() => { if (!gameOver) meteors.push(new Meteor(gl, meteorProgram, meteorTexture)); }, 2000);
setInterval(() => { if (!gameOver) enemies.push(new Enemy(gl, playerProgram, enemyTexture)); }, 3000);
setInterval(() => {
  if (!gameOver) {
    const cluster = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < cluster; i++) enemies2.push(new Enemy2(gl, playerProgram, enemy2Texture));
  }
}, 5000);

// === Helpers
function checkCollision(a, b, radiusA, radiusB) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (radiusA + radiusB);
}

function playerHit() {
  playerHealth--;
  player.flashRed();
  if (playerHitSound) {
    playerHitSound.currentTime = 0;
    playerHitSound.play();
  }
  if (playerHealth <= 0) {
    gameOver = true;
    gameOverElement.style.display = 'block';
    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
      }
  }
}

function increaseScore(points) {
  score += points;
  scoreElement.innerText = "Score: " + score;
}

function spawnEnemy1(x, y) {
    const e1 = new Enemy(gl, playerProgram, enemyTexture);
    e1.x = x + (Math.random() - 0.5) * 0.2;
    e1.y = y + (Math.random() - 0.5) * 0.2;
    enemies.push(e1);
  }

// === Main Render
function render() {
  if (gameOver) return;

  if (!gameStarted) {
    requestAnimationFrame(render);
    return;
  }

  if (paused) {
    requestAnimationFrame(render);
    return;
  }
  
  if (gameOver) return;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  background.draw(projMatrix);
  player.move(keys);
  player.draw(projMatrix);

  if (keys[' ']) {
    if (fireCooldown <= 0) {
      bullets.push(new Bullet(gl, bulletProgram, player.x, player.y + 0.15));
      fireCooldown = 10;
      bulletSound.currentTime = 0;
      bulletSound.play();
    }
  }
  fireCooldown = Math.max(0, fireCooldown - 1);

  // --- Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw(projMatrix);
    if (!bullets[i].isVisible()) bullets.splice(i, 1);
  }

  // --- Meteors
  for (let i = meteors.length - 1; i >= 0; i--) {
    const meteor = meteors[i];
    meteor.update();
    meteor.draw(projMatrix);

    if (checkCollision(player, meteor, 0.12, 0.18)) {
      playerHit();
      meteors.splice(i, 1);
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (checkCollision(bullets[j], meteor, 0.02, 0.18)) {
        meteor.hit();
        bullets.splice(j, 1);
        if (!meteor.alive) {
          meteors.splice(i, 1);
          increaseScore(5);
          meteorDestroySound.currentTime = 0;
          meteorDestroySound.play();
        }
        break;
      }
    }
    if (meteor.isOffScreen()) meteors.splice(i, 1);
  }

  // --- Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();
    enemy.draw(projMatrix);

    if (checkCollision(player, enemy, 0.12, 0.12)) {
      playerHit();
      enemies.splice(i, 1);
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (checkCollision(bullets[j], enemy, 0.02, 0.12)) {
        const enemy1Sound = document.getElementById('enemy1-destroy-sound');
        if (enemy1Sound) {
          enemy1Sound.currentTime = 0;
          enemy1Sound.play();
        }
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        increaseScore(50);
        break;
      }
    }
    if (enemy.isOffScreen()) enemies.splice(i, 1);
  }

  // --- Enemy2
  for (let i = enemies2.length - 1; i >= 0; i--) {
    const enemy2 = enemies2[i];
    enemy2.update();
    enemy2.draw(projMatrix);

    if (checkCollision(player, enemy2, 0.12, 0.12)) {
      playerHit();
      enemies2.splice(i, 1);
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (checkCollision(bullets[j], enemy2, 0.02, 0.12)) {
        enemy2.hit();
        bullets.splice(j, 1);
        if (!enemy2.alive) {
            enemies.push(new Enemy(gl, playerProgram, enemyTexture));
            enemies.push(new Enemy(gl, playerProgram, enemyTexture));
            const enemy2Sound = document.getElementById('enemy2-destroy-sound');
            if (enemy2Sound) {
              enemy2Sound.currentTime = 0;
              enemy2Sound.play();
            }

          enemies2.splice(i, 1);
          enemy2Kills++;
          increaseScore(100);
          spawnEnemy1(enemy2.x, enemy2.y);
          spawnEnemy1(enemy2.x, enemy2.y);

          if (enemy2Kills >= 5 && !boss) {
            boss = new Boss(gl, playerProgram, bossTexture);
            if (bossThemeSound) {
                bossThemeSound.currentTime = 0;
                bossThemeSound.play();
              }

              // Stop normal music
  normalMusic.pause();
  normalMusic.currentTime = 0;

  // Play boss music
  bossMusic.currentTime = 0;
  bossMusic.play();
          }
        }
        break;
      }
    }
    if (enemy2.isOffScreen()) enemies2.splice(i, 1);
  }

  // --- Boss
  if (boss && boss.alive) {
    boss.update();
    boss.draw(projMatrix);

      //  Play explosion sound
  bossExplosionSound.currentTime = 0;
  bossExplosionSound.play();

  // Stop boss music
  bossMusic.pause();
  bossMusic.currentTime = 0;

  //  Resume normal background music
  normalMusic.currentTime = 0;
  normalMusic.play();

    if (boss.canShoot()) {
      bossBullets.push(new Bullet(gl, bulletProgram, boss.x, boss.y - 0.15));
      boss.shoot();
    }

    if (checkCollision(player, boss, 0.12, 0.25)) {
      playerHealth = 0;
      playerHit();
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (checkCollision(bullets[j], boss, 0.02, 0.25)) {
        boss.hit();
        bullets.splice(j, 1);
        increaseScore(50);
      }
    }
  }

  // --- Boss Bullets
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    bossBullets[i].update();
    bossBullets[i].draw(projMatrix);

    if (checkCollision(player, bossBullets[i], 0.12, 0.02)) {
      playerHit();
      bossBullets.splice(i, 1);
      continue;
    }
    if (!bossBullets[i].isVisible()) bossBullets.splice(i, 1);
  }

  requestAnimationFrame(render);
}
render();
//======================================================
// MOBILE CONTROLS
//======================================================


// ---------- Arrow Buttons ----------

function holdMovement(buttonID, key) {

    const button = document.getElementById(buttonID);

    if (!button) return;

    button.addEventListener("touchstart", (e) => {

        e.preventDefault();

        keys[key] = true;

    }, { passive: false });


    button.addEventListener("touchend", (e) => {

        e.preventDefault();

        keys[key] = false;

    }, { passive: false });

}


// ---------- FIRE BUTTON ----------

function holdFireButton() {

    const button = document.getElementById("fire-button");

    if (!button) return;


    button.addEventListener("touchstart", (e) => {

        e.preventDefault();

        keys[" "] = true;

    }, { passive: false });


    button.addEventListener("touchend", (e) => {

        e.preventDefault();

        keys[" "] = false;

    }, { passive: false });

}


// ---------- START GAME ----------

function setupStartButton() {

    const button = document.getElementById("start-button");

    if (!button) return;


    button.addEventListener("click", () => {

        if (!gameStarted) {

            gameStarted = true;

            startText.style.display = "none";

            normalMusic.play();

        }

        if (gameOver) {

            window.location.reload();

        }

    });

}



// ---------- PAUSE GAME ----------

function setupPauseButton() {

    const button = document.getElementById("pause-button");

    if (!button) return;


    button.addEventListener("click", () => {

        if (!gameStarted || gameOver) return;

        paused = !paused;

        const pauseText = document.getElementById("pauseText");


        if (paused) {

            pauseText.style.display = "block";

        }

        else {

            pauseText.style.display = "none";

        }

    });

}



// ---------- CANVAS RESIZE ----------

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport(

        0,
        0,
        canvas.width,
        canvas.height

    );

}


window.addEventListener(

    "resize",

    resizeCanvas

);


resizeCanvas();




// ---------- INITIALISE MOBILE ----------

function initialiseMobileControls() {

    holdMovement(

        "move-up",
        "ArrowUp"

    );


    holdMovement(

        "move-down",
        "ArrowDown"

    );


    holdMovement(

        "move-left",
        "ArrowLeft"

    );


    holdMovement(

        "move-right",
        "ArrowRight"

    );


    holdFireButton();


    setupStartButton();


    setupPauseButton();

}


initialiseMobileControls();
