'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const doodler = document.createElement('div');
  // eslint-disable-next-line prefer-const
  let doodlerLeftSpace = 50;
  // eslint-disable-next-line prefer-const
  let doodlerBottomSpace = 150;
  let isGameOver = false;
  // eslint-disable-next-line prefer-const
  let platformCount = 5;
  const platforms = [];
  let upTimerId;
  let downTimerId;


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
  function movePlatforms() {
    if (doodlerBottomSpace > 200) {
      platforms.forEach((platform) => {
        platform.bottom -= 4;
        const visual = platform.visual;
        visual.style.bottom = platform.bottom + 'px';
      });
    }
  }
  function jump() {
    clearInterval(downTimerId);
    upTimerId = setInterval(() => {
      doodlerBottomSpace += 20;
      doodler.style.bottom = doodlerBottomSpace + 'px';
      if (doodlerBottomSpace > 350) {
        fall();
      }
    }, 30);
  }
  function fall() {
    clearInterval(upTimerId);
    downTimerId = setInterval(() => {
      doodlerBottomSpace -= 5;
      doodler.style.bottom = doodlerBottomSpace + 'px';
      if (doodlerBottomSpace <= 0) {
        gameOver();
      }
      platforms.forEach((platform) => {
        if (
          (doodlerBottomSpace >= platform.bottom) &&
              (doodlerBottomSpace <= platform.bottom + platform.bottom + 15) &&
              ((doodlerLeftSpace + 60) >= platform.left) &&
              (doodlerLeftSpace <= (platform.left + 85)) &&
              !isJumping
        ) {
          console.log('landed');
          startPoint = doodlerBottomSpace;
          jump();
        }
      });
    }, 30);
  }

  function gameOver() {
    console.log('game over');
    isGameOver = true;
    clearInterval(upTimerId);
    clearInterval(downTimerId);
  }

  function control(e) {
    if (e.key === 'ArrowLeft') {
      //move left
    } else if (e.key === 'ArrowRight') {
      // move right
    } else if (e.key === 'ArrowUp') {
      // moveStraight
    }
  }

  function start() {
    if (!isGameOver) {
      createDoodler();
      createPlatforms();
      createDoodler();
      setInterval(movePlatforms, 30);
      jump();

    }
  }
  // attach to button
  start();

});
