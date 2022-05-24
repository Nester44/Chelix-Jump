/* eslint-disable prefer-const */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const doodler = document.createElement('div');
  const startBtn = document.querySelector('.start-btn');
  const musicBtn = document.querySelector('.play-music');
  let doodlerLeftSpace = 50;
  let startPoint = 150;
  let doodlerBottomSpace = startPoint;
  let isGameOver = false;
  let platformCount = 5;
  const platforms = [];
  let platformSpeed = 4;
  let upTimerId;
  let downTimerId;
  let isJumping = true;
  let isGoingLeft = false;
  let isGoingRight = false;
  let leftTimerId;
  let rightTimerId;
  let score = 0;
  const menuMusic = new Audio('../sounds/menuMusic.mp3');
  const gameMusic = new Audio('../sounds/gameMusic.mp3');
  menuMusic.volume = 0.025;
  gameMusic.volume = 0.025;

  startBtn.addEventListener('click', () => {
    if (!isGameOver)
      start();
    startBtn.style.visibility = 'hidden';
  }
  );
  function onMusic(sound) {
    sound.play();
    musicBtn.classList.remove('off');
    musicBtn.classList.add('on');
  }

  function offMusic(sound) {
    sound.pause();
    musicBtn.classList.remove('on');
    musicBtn.classList.add('off');
  }

  musicBtn.addEventListener('click', () => {
    if (musicBtn.classList.contains('off')) {
      onMusic(menuMusic);
    } else {
      offMusic(menuMusic);
    }
  });

  function createDoodler() {
    grid.appendChild(doodler);
    doodler.classList.add('doodler');
    doodlerLeftSpace = platforms[0].left;
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
      let platGap = 600 / platformCount;
      let newPlatBottom = 100 + i * platGap;
      const newPlatform = new Platform(newPlatBottom);
      platforms.push(newPlatform);
      console.log(platforms);
    }
  }
  function movePlatforms() {
    if (doodlerBottomSpace > 200) {
      platforms.forEach((platform) => {
        platform.bottom -= platformSpeed;
        const visual = platform.visual;
        visual.style.bottom = platform.bottom + 'px';

        if (platform.bottom < 10) {
          let firstPlatform = platforms[0].visual;
          firstPlatform.classList.remove('platform');
          platforms.shift();
          let newPlatform = new Platform(600);
          platforms.push(newPlatform);
        }
      });
    }
  }
  function jump() {
    if (!isJumping) {
      clearInterval(downTimerId);
      isJumping = true;
    }
    upTimerId = setInterval(() => {
      doodlerBottomSpace += 20;
      doodler.style.bottom = doodlerBottomSpace + 'px';
      if (doodlerBottomSpace > startPoint + 200) {
        fall();
      }
    }, 30);
  }
  function fall() {
    clearInterval(upTimerId);
    isJumping = false;
    downTimerId = setInterval(() => {
      doodlerBottomSpace -= 5;
      doodler.style.bottom = doodlerBottomSpace + 'px';
      if (doodlerBottomSpace <= 0) {
        gameOver();
      }
      platforms.forEach((platform) => {
        if (
          (doodlerBottomSpace >= platform.bottom) &&
          (doodlerBottomSpace <= platform.bottom + 15) &&
          ((doodlerLeftSpace + 60) >= platform.left) &&
          (doodlerLeftSpace <= (platform.left + 85)) &&
          !isJumping
        ) {
          console.log('landed');
          score++;
          startPoint = doodlerBottomSpace;
          jump();
        }
      });
    }, 30);
  }

  function gameOver() {
    console.log('game over');
    isGameOver = true;
    grid.innerHTML = score;
    clearInterval(upTimerId);
    clearInterval(downTimerId);
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
    offMusic(gameMusic);
    onMusic(menuMusic);
  }

  function control(e) {
    if (e.key === 'ArrowLeft') {
      moveLeft();
    } else if (e.key === 'ArrowRight') {
      moveRight();
    } else if (e.key === 'ArrowUp') {
      moveStraight();
    }
  }

  function moveLeft() {
    clearInterval(leftTimerId);
    if (isGoingRight) {
      clearInterval(rightTimerId);
      isGoingRight = false;
    }
    isGoingLeft = true;
    leftTimerId = setInterval(() => {
      if (doodlerLeftSpace >= 0) {
        doodlerLeftSpace -= 5;
        doodler.style.left = doodlerLeftSpace + 'px';
      } else moveRight();
    }, 30);
  }
  function moveRight() {
    clearInterval(rightTimerId);
    if (isGoingLeft) {
      clearInterval(leftTimerId);
      isGoingLeft = false;
    }
    isGoingRight = true;
    rightTimerId = setInterval(() => {
      if (doodlerLeftSpace <= 340) {
        doodlerLeftSpace += 5;
        doodler.style.left = doodlerLeftSpace + 'px';
      } else moveLeft();
    }, 30);
  }

  function moveStraight() {
    isGoingRight = false;
    isGoingLeft = false;
    clearInterval(rightTimerId);
    clearInterval(leftTimerId);
  }

  function cheatSkin(e) {
    if (e.code === 'BracketRight') {
      doodler.style.backgroundImage = 'url(\'../img/cheat-face.png\')';
    }
  }



  function start() {
    if (!isGameOver) {
      offMusic(menuMusic);
      onMusic(gameMusic);
      createPlatforms();
      createDoodler();
      setInterval(movePlatforms, 30);
      jump();
      document.addEventListener('keyup', control);
      document.addEventListener('keyup', cheatSkin);
    }
  }
});
