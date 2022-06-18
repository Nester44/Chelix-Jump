/* eslint-disable camelcase */
'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  dup() {
    return new Vector(this.x, this.y);
  }
}

class Platform {
  constructor(y) {
    this.width = 115;
    this.height = 20;
    const x = Math.random() * (canvas.clientWidth - this.width);
    this.position = new Vector(x, canvas.clientHeight - y - this.height);
  }
  drawPlat() {
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.width, this.height);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'blue';
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
    this.isAbove = true;

    this.left = false;
    this.right = false;
    this.isJump = false;
    this.isFall = false;

    this.acc_y = 1;
    this.vel_y = 0;

    this.vel_x = 0;
    this.acc_x = 0;
    this.acceleration = 1;
  }
  drawDood() {
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.width, this.height);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.fill();
  }
}

class Game {
  constructor() {
    this.platGap = 100;
    this.platSpeed = 0.5;
    this.platforms = [];
    this.createPlat();

    const firstPlat = this.platforms[0].position.dup();
    firstPlat.x += this.platforms[0].width / 2;
    this.dood = new Doodler(firstPlat);

    this.friction = 0.1;


  }

  createPlat() {
    for (let i = 1; i < 7; i++) {
      const plat = new Platform(this.platGap * i);
      this.platforms.push(plat);
    }
  }

  movePlat() {
    if (!this.dood.isAbove) return;
    this.platforms.forEach((p) => {
      p.position.y += this.platSpeed;

      if (p.position.y === canvas.clientHeight) {
        const x = Math.random() * (canvas.clientWidth - p.width);
        const y = 0 - p.height;

        p.position = new Vector(x, y);
      }
    });
  }

  detColl() {
    console.log('detColl invoked');
    const doodRight = this.dood.position.x + this.dood.width;
    const doodBottom = this.dood.position.y + this.dood.height;

    for (let i = 0; i < this.platforms.length; i++) {
      const p = this.platforms[i];
      console.log(p);
      const platRight = p.position.x + p.width;
      const platBottom = p.position.y + p.height;
      if (
        doodRight >= p.position.x &&
        this.dood.position.x <= platRight &&
        doodBottom <= platBottom &&
        doodBottom >= p.position.y &&
        this.dood.vel_y >= 3
      ) {
        console.log('colission');
        this.dood.isJump = true;
        return true;
      } else {
        this.dood.isJump = false;
      }
    }
    return false;
  }

  keyControl() {
    canvas.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA') this.dood.left = true;
      if (e.code === 'KeyD') this.dood.right = true;
    });

    canvas.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA') this.dood.left = false;
      if (e.code === 'KeyD') this.dood.right = false;
    });
    // X moving
    if (this.dood.left) this.dood.acc_x = -this.dood.acceleration;
    if (this.dood.right) this.dood.acc_x = this.dood.acceleration;

    if (!this.dood.right && !this.dood.left) this.dood.acc_x = 0;

    this.dood.vel_x += this.dood.acc_x;
    this.dood.vel_x *= 1 - this.friction;

    this.dood.position.x += this.dood.vel_x;
    // bouncing function
    if (this.detColl()) {
      this.dood.vel_y = -15; // magic jmp height
    } else {
      this.dood.vel_y += 0.5; // magic Y speed
    }
    this.dood.position.y += this.dood.vel_y;

    // teleportation between edges
    if (this.dood.position.x + this.dood.width <= 0) {
      this.dood.position.x = ctx.canvas.width - this.dood.width / 2;
    }
    if (this.dood.position.x >= ctx.canvas.width) {
      this.dood.position.x = -this.dood.width / 2;
    }
  }

  mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    this.platforms.forEach((p) => {
      p.drawPlat();

      this.movePlat();
    });
    this.keyControl();
    this.dood.drawDood();
    requestAnimationFrame(this.mainLoop.bind(this));
  }
  start() {
    requestAnimationFrame(this.mainLoop.bind(this));
  }
}

const game = new Game();
game.start();
