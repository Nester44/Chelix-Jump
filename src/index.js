/* eslint-disable prefer-const */
'use strict';

const grid = document.querySelector('.grid');
const settingsWindow = document.querySelector('.wrapper');
const startBtn = document.querySelector('.start-btn');
const musicBtn = document.querySelector('.play-music');
const settingsBtn = document.querySelector('.settings-btn');

const menuMusic = new Audio('./sounds/menuMusic.mp3');
const gameMusic = new Audio('./sounds/gameMusic.mp3');
let currentMusic;
menuMusic.volume = 0.1;
gameMusic.volume = 0.1;

function onMusic(sound) {
  sound.play();
  currentMusic = sound;
  musicBtn.classList.remove('off');
  musicBtn.classList.add('on');
}

function offMusic() {
  currentMusic.pause();
  musicBtn.classList.remove('on');
  musicBtn.classList.add('off');
}

musicBtn.addEventListener('click', () => {
  if (musicBtn.classList.contains('off')) {
    onMusic(menuMusic);
  } else {
    offMusic();
  }
});

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

class Game {
  constructor() {
    this.doodler = document.createElement('div');
    this.scoreLog = document.createElement('div');
    this.scoreLog.classList.add('score');


    this.moveFrequency = 15;
    this.doodlerJumpSpeed = 10;
    this.doodlerStartFallSpeed = 2.5;
    this.doodlerFallSpeed = this.doodlerStartFallSpeed;
    this.acceleration = 1.025;
    this.doodlerHorizontalSpeed = 2.5;
    this.platformStartSpeed = 2.5;
    this.platformSpeed = this.platformStartSpeed;

    this.upTimerId;
    this.downTimerId;
    this.leftTimerId;
    this.rightTimerId;

    this.isJumping = true;
    this.isGoingLeft = false;
    this.isGoingRight = false;
    this.score = 0;

    this.startPoint = 150;
    this.doodlerLeftSpace = 50;
    this.doodlerBottomSpace = this.startPoint;
    this.isGameOver = false;
    this.platformCount = 5;
    this.platforms = [];
  }

  createDoodler() {
    grid.appendChild(this.doodler);
    this.doodler.classList.add('doodler');
    this.doodlerLeftSpace = this.platforms[0].left;
    this.doodler.style.left = this.doodlerLeftSpace + 'px';
    this.doodler.style.bottom = this.doodlerBottomSpace + 'px';
  }
  createPlatforms() {
    for (let i = 0; i < this.platformCount; i++) {
      let platGap = 600 / this.platformCount;
      let newPlatBottom = 100 + i * platGap;
      const newPlatform = new Platform(newPlatBottom);
      this.platforms.push(newPlatform);
      console.log(this.platforms);
    }
  }
  movePlatforms() {
    if (this.doodlerBottomSpace > 200) {
      this.platforms.forEach((platform) => {
        if (this.doodlerBottomSpace > 500) {
          this.platformSpeed = this.platformStartSpeed * 1.5;
        } else this.platformSpeed = this.platformStartSpeed;
        platform.bottom -= this.platformSpeed;
        const visual = platform.visual;
        visual.style.bottom = platform.bottom + 'px';

        if (platform.bottom < 10) {
          let firstPlatform = this.platforms[0].visual;
          firstPlatform.classList.remove('platform');
          this.platforms.shift();
          let newPlatform = new Platform(600);
          this.platforms.push(newPlatform);
        }
      });
    }
  }
  jump() {
    if (!this.isJumping) {
      clearInterval(this.downTimerId);
      this.isJumping = true;
    }
    this.upTimerId = setInterval(() => {
      this.doodlerBottomSpace += this.doodlerJumpSpeed;
      this.doodler.style.bottom = this.doodlerBottomSpace + 'px';
      if (this.doodlerBottomSpace > this.startPoint + 200) {
        this.fall();
      }
    }, this.moveFrequency);
  }

  fall() {
    clearInterval(this.upTimerId);
    this.isJumping = false;
    this.downTimerId = setInterval(() => {
      this.doodlerBottomSpace -= this.doodlerFallSpeed;
      this.doodlerFallSpeed *= this.acceleration;
      this.doodler.style.bottom = this.doodlerBottomSpace + 'px';
      if (this.doodlerBottomSpace <= 0) {
        this.gameOver();
      }
      this.platforms.forEach((platform) => {
        if (
          (this.doodlerBottomSpace >= platform.bottom) &&
          (this.doodlerBottomSpace <= platform.bottom + 15) &&
          ((this.doodlerLeftSpace + 60) >= platform.left) &&
          (this.doodlerLeftSpace <= (platform.left + 85)) &&
          !this.isJumping
        ) {
          console.log('landed');
          this.doodlerFallSpeed = this.doodlerStartFallSpeed;
          this.score++;
          this.scoreLog.textContent = this.score;
          this.startPoint = this.doodlerBottomSpace;
          this.jump();
        }
      });
    }, this.moveFrequency);
  }
  gameOver() {
    console.log('game over');
    startBtn.style.visibility = 'visible';
    this.isGameOver = true;
    grid.innerHTML = this.score;
    clearInterval(this.upTimerId);
    clearInterval(this.downTimerId);
    clearInterval(this.leftTimerId);
    clearInterval(this.rightTimerId);
    offMusic();
    onMusic(menuMusic);
  }

  moveLeft() {
    clearInterval(this.leftTimerId);
    if (this.isGoingRight) {
      clearInterval(this.rightTimerId);
      this.isGoingRight = false;
    }
    this.isGoingLeft = true;
    this.leftTimerId = setInterval(() => {
      if (this.doodlerLeftSpace >= 0) {
        this.doodlerLeftSpace -= this.doodlerHorizontalSpeed;
        this.doodler.style.left = this.doodlerLeftSpace + 'px';
      } else this.moveRight();
    }, this.moveFrequency);
  }
  moveRight() {
    clearInterval(this.rightTimerId);
    if (this.isGoingLeft) {
      clearInterval(this.leftTimerId);
      this.isGoingLeft = false;
    }
    this.isGoingRight = true;
    this.rightTimerId = setInterval(() => {
      if (this.doodlerLeftSpace <= 340) {
        this.doodlerLeftSpace += this.doodlerHorizontalSpeed;
        this.doodler.style.left = this.doodlerLeftSpace + 'px';
      } else this.moveLeft();
    }, this.moveFrequency);
  }

  moveStraight() {
    this.isGoingRight = false;
    this.isGoingLeft = false;
    clearInterval(this.rightTimerId);
    clearInterval(this.leftTimerId);
  }

  control(e) {
    if (e.key === 'ArrowLeft') {
      this.moveLeft();
    } else if (e.key === 'ArrowRight') {
      this.moveRight();
    } else if (e.key === 'ArrowUp') {
      this.moveStraight();
    }
  }



  cheatSkin(e) {
    if (e.code === 'BracketRight') {
      this.doodler.style.backgroundImage = 'url(\'../img/cheat-face.png\')';
    }
  }



  start() {
    if (!this.isGameOver) {
      if (currentMusic) offMusic();
      onMusic(gameMusic);
      this.createPlatforms();
      this.createDoodler();
      grid.append(this.scoreLog);
      setInterval(() => this.movePlatforms(), this.moveFrequency);
      this.jump();
      this.scoreLog.textContent = this.score;
      document.addEventListener('keyup', (e) => this.control(e));
      document.addEventListener('keyup', this.cheatSkin);
    }
  }
}

startBtn.addEventListener('click', () => {
  grid.innerHTML = ''; // removing score
  window.game = new Game();
  window.game.start();
  console.log(window.game);
  startBtn.style.visibility = 'hidden';
}
);

settingsBtn.addEventListener('click', () => {
  let visibility = settingsWindow.style.visibility;
  if (visibility === 'hidden') settingsWindow.style.visibility = 'visible';
  else settingsWindow.style.visibility = 'hidden';
});
