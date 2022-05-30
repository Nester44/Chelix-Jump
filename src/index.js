/* eslint-disable prefer-const */
'use strict';

const grid = document.querySelector('.grid');
const settingsWindow = document.querySelector('.wrapper');
const startBtn = document.querySelector('.start-btn');
const musicBtn = document.querySelector('.play-music');
const settingsBtn = document.querySelector('.settings-btn');
const applyBtn = document.querySelector('#apply-btn');

const menuMusic = new Audio('./sounds/menuMusic.mp3');
const gameMusic = new Audio('./sounds/gameMusic.mp3');
let currentMusic;
menuMusic.volume = 0.1;
gameMusic.volume = 0.1;

const settingsConfig = {
  'easy': {
    doodlerJumpSpeed: 10,
    doodlerStartFallSpeed: 3,
    doodlerHorizontalSpeed: 2.5,
    platformStartSpeed: 3,
  },
  'medium': {
    doodlerJumpSpeed: 12,
    doodlerStartFallSpeed: 4,
    doodlerHorizontalSpeed: 3,
    platformStartSpeed: 5,
  },
  'hard': {
    doodlerJumpSpeed: 12,
    doodlerStartFallSpeed: 5,
    doodlerHorizontalSpeed: 3.5,
    platformStartSpeed: 6,
  }
};

let difficultLevel;

let isMusicOn = false;

function switchMusic() {
  if (isMusicOn) {
    musicBtn.classList.remove('on');
    musicBtn.classList.add('off');
    currentMusic.pause();
    isMusicOn = false;
  } else {
    musicBtn.classList.remove('off');
    musicBtn.classList.add('on');
    isMusicOn = true;
    playMusic(menuMusic);
  }
}

function playMusic(sound) {
  if (isMusicOn)   {
    sound.play();
    currentMusic = sound;
  }
}

musicBtn.addEventListener('click', switchMusic);

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
  constructor(difficultLevel) {
    this.doodler = document.createElement('div');
    this.scoreLog = document.createElement('div');
    this.scoreLog.classList.add('score');

    this.defineSettings(difficultLevel);

    this.moveFrequency = 15;
    this.doodlerFallSpeed = this.doodlerStartFallSpeed;
    this.acceleration = 1.025;
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

  defineSettings(difficultLevel) {
    const {
      doodlerJumpSpeed,
      doodlerStartFallSpeed,
      doodlerHorizontalSpeed,
      platformStartSpeed,
    } = settingsConfig[difficultLevel];

    this.doodlerJumpSpeed = doodlerJumpSpeed;
    this.doodlerStartFallSpeed = doodlerStartFallSpeed;
    this.doodlerHorizontalSpeed = doodlerHorizontalSpeed;
    this.platformStartSpeed = platformStartSpeed;
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
    }
  }
  movePlatforms() {
    if (this.doodlerBottomSpace > 200) {
      this.platforms.forEach((platform) => {
        if (this.doodlerBottomSpace > 550) {
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
    startBtn.style.visibility = 'visible';
    this.isGameOver = true;
    grid.innerHTML = this.score;
    clearInterval(this.upTimerId);
    clearInterval(this.downTimerId);
    clearInterval(this.leftTimerId);
    clearInterval(this.rightTimerId);
    currentMusic.pause();
    playMusic(menuMusic);
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
      if (currentMusic)   currentMusic.pause();

      playMusic(gameMusic);
      this.createPlatforms();
      this.createDoodler();
      grid.append(this.scoreLog);
      setInterval(() => this.movePlatforms(), this.moveFrequency);
      this.jump();
      this.scoreLog.textContent = this.score;
      document.addEventListener('keydown', (e) => this.control(e));
      document.addEventListener('keyup', (e) => this.cheatSkin(e));
    }
  }
}

startBtn.addEventListener('click', () => {
  grid.innerHTML = ''; // removing score
  try {
    window.game = new Game(difficultLevel);
    window.game.start();
    startBtn.style.visibility = 'hidden';
  } catch (error) {
    alert('Select difficulty');
  }
}
);

function hideSettings() {
  let display = settingsWindow.style.display;
  if (display === 'none') {
    settingsWindow.style.display = 'flex';
    startBtn.style.visibility = 'hidden';
  } else {
    settingsWindow.style.display = 'none';
    startBtn.style.visibility = 'visible';
  }
}

settingsBtn.addEventListener('click', hideSettings);
applyBtn.addEventListener('click', () => {
  const chosenOption = document.querySelector('input[name="level"]:checked');
  if (chosenOption) {
    difficultLevel = chosenOption.value;
    hideSettings();
  }
});
