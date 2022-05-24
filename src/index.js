'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const doodler = document.createElement('div');
  // eslint-disable-next-line prefer-const
  let doodlerLeftSpace = 50;
  // eslint-disable-next-line prefer-const
  let doodlerBottomSpace = 150;
  const isGameOver = false;
  // eslint-disable-next-line prefer-const
  let platformCount = 5;
  const platforms = [];


  function createDoodler() {
    grid.appendChild(doodler);
    doodler.classList.add('doodler');
    doodler.style.left = doodlerLeftSpace + 'px';
    doodler.style.bottom = doodlerBottomSpace + 'px';
  }

  class Platform {
    constructor(newPlatBottom) {
      this.bottom = newPlatBottom;
      this.left = Math.random() * 315;
      this.visual = document.createElement('div');

      const visual = this.visual;
      visual.classList.add('platform');
      visual.style.left = this.left + 'px';
      visual.style.bottom = this.bottom + 'px';
      grid.appendChild(visual);
    }
  }

  function createPlatforms() {
    for (let i = 0; i < platformCount; i++) {
      // eslint-disable-next-line prefer-const
      let platGap = 600 / platformCount;
      // eslint-disable-next-line prefer-const
      let newPlatBottom = 100 + i * platGap;
      const newPlatform = new Platform(newPlatBottom);
      platforms.push(newPlatform);
      console.log(platforms);
    }
  }

  function start() {
    if (!isGameOver) {
      createDoodler();
      createPlatforms();

    }
  }
  // attach to button
  start();

});
