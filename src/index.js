'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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
    this.width = 60;
    this.height = 100;

    this.position = position;
    this.isAbove = true;
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
    this.platforms = [];
    this.createPlat();
    const firstPlat = this.platforms.at(0);
    this.dood = new Doodler(firstPlat.position);


  }

  createPlat() {
    for (let i = 0; i < 6; i++) {
      const plat = new Platform(this.platGap * i);
      this.platforms.push(plat);
    }
  }

  movePlat() {
    if (!this.dood.isAbove) return;
    this.platforms.forEach((p) => {
      p.position.y++;

      if (p.position.y === canvas.clientHeight) {
        const x = Math.random() * (canvas.clientWidth - p.width);
        const y = 0 - p.height;

        p.position = new Vector(x, y);
      }
    });
  }

  mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    this.platforms.forEach((p) => {
      p.drawPlat();

      this.movePlat();
    });
    // this.dood.drawDood();
    requestAnimationFrame(this.mainLoop.bind(this));
  }
  start() {
    requestAnimationFrame(this.mainLoop.bind(this));
  }
}

const game = new Game();
game.start();
