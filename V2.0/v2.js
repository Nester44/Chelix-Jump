/* eslint-disable camelcase */
'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.querySelector('.start-btn');
const skins = document.querySelectorAll('.skin-bar__option');

const skinSources = {
  oleg: './images/skins/doodOleg.png',
  gordon: './images/skins/gordon.png'
};

function adjustScreen() {
  canvas.height = window.innerHeight * 0.85;
  canvas.width = window.innerWidth * 0.45;
}
function chooseSkin(option) {
  for (const skin of skins) {
    skin.id = '';
  }
  option.id = 'selected';
  window.game.dood.skin.src = skinSources[option.value];
}

const getSettings = () => ({
  platGap: +document.getElementById('gap').value,
  platSpeed: +document.getElementById('speed').value,
  hardmode: document.getElementById('hardmode').checked,
});

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  dup() {
    return new Vector(this.x, this.y);
  }
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }
}

class Platform {
  constructor(y) {
    this.width = +document.getElementById('width').value;
    this.height = 20;
    const x = Math.random() * (canvas.clientWidth - this.width);
    this.position = new Vector(x, canvas.clientHeight - y - this.height);

    this.isMoving = false;

    // getting random direction
    Math.random() < 0.5 ?
      this.vel = 3 : this.vel = -3;
  }
  drawPlat() {
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.width, this.height);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = '#0175FF';
    ctx.fill();
  }
}

class Doodler {
  constructor(position) {
    this.width = 50;
    this.height = 80;

    this.position = position;
    this.position.x -= this.width / 2;
    this.position.y -= 50 + this.height;
    this.isAbove = false;

    this.left = false;
    this.right = false;
    this.isJump = false;
    this.isFall = false;

    this.acc_y = 0.5;
    this.vel_y = 0;

    this.vel_x = 0;
    this.acc_x = 0;
    this.acceleration = 1;
    this.jumpHeight = +document.getElementById('height').value;
    this.maxSpeed = 19;

    this.skin = new Image(50, 80);
    this.skin.src = './images/skins/doodOleg.png';

  }
  drawDood() {
    ctx.beginPath();
    ctx.drawImage(this.skin, this.position.x, this.position.y);
  }
  drawSpeed() {
    ctx.beginPath();
    ctx.font = '24px Arial';
    ctx.fillText(`Velocity: ${this.vel_y}`, 10, 80);
  }
}

class Game {
  constructor() {
    this.defineSettings();
    this.platforms = [];
    this.neededSpeed = 3;
    this.moveHeight = canvas.height * 0.6;

    this.friction = 0.1;

    this.score = 0;
  }

  defineSettings() {
    const { platGap, platSpeed, hardmode } = getSettings();
    this.platGap = platGap;
    this.platSpeed = platSpeed;
    this.hardmode = hardmode;
  }

  drawScore() {
    ctx.beginPath();
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score}`, 10, 50);
  }

  createPlat() {
    const platAmount = Math.round(ctx.canvas.height / this.platGap);
    for (let i = 1; i < platAmount + 1; i++) {
      const plat = new Platform(this.platGap * i);
      // choosing mooving platforms
      if (this.hardmode) plat.isMoving = true;
      this.platforms.push(plat);
    }
  }

  movePlatX() {
    this.platforms.filter((plat) => plat.isMoving).forEach((plat) => {
      if (plat.position.x <= 0 ||
          plat.position.x + plat.width >= ctx.canvas.width) {
        plat.vel = -plat.vel;
      }
      plat.position.x += plat.vel;
    });

  }

  moveDownPlat() {
    this.dood.isAbove = this.dood.position.y < this.moveHeight;
    if (!this.dood.isAbove) return;
    this.platforms.forEach((p) => {
      p.position.y += this.platSpeed;
      if (p.position.y >= canvas.clientHeight) {
        const x = Math.random() * (canvas.clientWidth - p.width);
        const y = 0 - p.height;
        p.position = new Vector(x, y);
      }
    });
  }

  detColl() {
    const doodRight = this.dood.position.x + this.dood.width;
    const doodBottom = this.dood.position.y + this.dood.height;

    for (let i = 0; i < this.platforms.length; i++) {
      const p = this.platforms[i];
      const platRight = p.position.x + p.width;
      const platBottom = p.position.y + p.height;
      if (
        doodRight >= p.position.x &&
        this.dood.position.x <= platRight &&
        doodBottom <= platBottom &&
        doodBottom >= p.position.y &&
        this.dood.vel_y >= this.neededSpeed // magic needed falling speed
      ) {
        this.dood.isJump = true;
        return true;
      } else {
        this.dood.isJump = false;
      }
    }
    return false;
  }

  move() {
    // X moving
    if (this.dood.left) this.dood.acc_x = -this.dood.acceleration;
    if (this.dood.right) this.dood.acc_x = this.dood.acceleration;

    if (!this.dood.right && !this.dood.left) this.dood.acc_x = 0;

    this.dood.vel_x += this.dood.acc_x;
    this.dood.vel_x *= 1 - this.friction;
    // bouncing function
    if (this.detColl()) {
      this.dood.vel_y = -this.dood.jumpHeight;
      this.score++;
    } else if (this.dood.vel_y < this.dood.maxSpeed) {
      this.dood.vel_y += this.dood.acc_y;
    }

    this.dood.position.x += this.dood.vel_x;
    this.dood.position.y += this.dood.vel_y;

    // teleportation between edges
    if (this.dood.position.x + this.dood.width <= 0) {
      this.dood.position.x = ctx.canvas.width - this.dood.width / 2;
    }
    if (this.dood.position.x >= ctx.canvas.width) {
      this.dood.position.x = -this.dood.width / 2;
    }

    // gameOver check
    if (this.dood.position.y >= ctx.canvas.height) this.gameOver();
  }

  keyControl() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA') this.dood.left = true;
      if (e.code === 'KeyD') this.dood.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA') this.dood.left = false;
      if (e.code === 'KeyD') this.dood.right = false;
    });
  }

  mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    this.platforms.forEach((p) => {
      p.drawPlat();
      this.moveDownPlat();
    });
    this.keyControl();
    this.move();
    this.movePlatX();
    this.dood.drawDood();
    this.drawScore();
    this.animID = requestAnimationFrame(this.mainLoop.bind(this));
  }

  start() {
    this.createPlat();

    const firstPlat = this.platforms[0].position.dup();
    // get center of plat
    firstPlat.x += this.platforms[0].width / 2;
    this.dood = new Doodler(firstPlat);
    console.log({
      gap: this.platGap,
      speed: this.platSpeed,
      hardmode: this.hardmode,
      jumpHeight: this.dood.jumpHeight,
    });
    this.animID = requestAnimationFrame(this.mainLoop.bind(this));
  }

  gameOver() {
    cancelAnimationFrame(this.animID);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const txt = 'Game Over';
    const x = canvas.width / 2 - (ctx.measureText(txt).width / 2);
    ctx.fillText(txt, x, canvas.height / 2);
  }

  mainScreen() {
    const platform = new Platform(100);
    this.platforms.push(platform);
    platform.position.x = 100;
    const platPos = platform.position.dup();
    platPos.x += platform.width / 2;
    const doodler = new Doodler(platPos);
    this.dood = doodler;
    function loop() {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.font = '3vw Arial';
      const txt = 'Doodle Jump';
      const x = canvas.clientWidth / 2 - (ctx.measureText(txt).width / 2);
      const y = canvas.clientHeight * 0.175;
      ctx.fillText(txt, x, y);
      this.move();
      doodler.drawDood();
      platform.drawPlat();
      requestAnimationFrame(loop.bind(this));
    }
    requestAnimationFrame(loop.bind(this));
  }
}

adjustScreen();

startBtn.addEventListener('click', () => {
  window.game = new Game();
  window.game.start();
});
window.game = new Game();

skins.forEach((option) => {
  option.style.background = `url('${skinSources[option.value]}')`;
  option.addEventListener('click', (option) => chooseSkin(option.target));
});

setTimeout(() => window.game.mainScreen(), 150);
