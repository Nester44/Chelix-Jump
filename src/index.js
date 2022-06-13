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
    doodJumpSpeed: 10,
    doodStartFallSpeed: 3,
    doodHorizontalSpeed: 2.5,
    platformStartSpeed: 3,
  },
  'medium': {
    doodJumpSpeed: 12,
    doodStartFallSpeed: 4,
    doodHorizontalSpeed: 3,
    platformStartSpeed: 5,
  },
  'hard': {
    doodJumpSpeed: 12,
    doodStartFallSpeed: 5,
    doodHorizontalSpeed: 3.5,
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
    this.height = 15;
    this.width = 85;

    this.bottom = newPlatBottom;
    this.left = Math.random() * (grid.clientWidth - this.width);
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
    this.dood = document.createElement('div');
    this.scoreLog = document.createElement('div');
    this.scoreLog.classList.add('score');

    this.defineSettings(difficultLevel);

    this.moveFrequency = 15;
    this.doodFallSpeed = this.doodStartFallSpeed;
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
    this.doodLeftSpace = 50;
    this.doodBottomSpace = this.startPoint;
    this.isGameOver = false;
    this.platformCount = 5;
    this.platforms = [];
    this.platformDistance = 200;
    this.firstPlatformHeight = 100;

    this.moveHeight = 200;
    this.overHeight = 550;
    this.disappearBorder = 10;
  }

  defineSettings(difficultLevel) {
    const { doodJumpSpeed, doodStartFallSpeed, doodHorizontalSpeed,
      platformStartSpeed } = settingsConfig[difficultLevel];

    this.doodJumpSpeed = doodJumpSpeed;
    this.doodStartFallSpeed = doodStartFallSpeed;
    this.doodHorizontalSpeed = doodHorizontalSpeed;
    this.platformStartSpeed = platformStartSpeed;
  }

  createDoodler() {
    grid.appendChild(this.dood);
    this.dood.classList.add('doodler');
    this.doodLeftSpace = this.platforms[0].left;
    this.doodWidth = 60;

    this.dood.style.left = this.doodLeftSpace + 'px';
    this.dood.style.bottom = this.doodBottomSpace + 'px';
  }
  createPlatforms() {
    for (let i = 0; i < this.platformCount; i++) {
      const platGap = grid.clientHeight / this.platformCount;
      const newPlatBottom = this.firstPlatformHeight + i * platGap;
      const newPlatform = new Platform(newPlatBottom);
      this.platforms.push(newPlatform);
    }
  }
  movePlatforms() {
    if (this.doodBottomSpace > this.moveHeight) {
      this.platforms.forEach((platform) => {
        if (this.doodBottomSpace > this.overHeight) {
          this.platformSpeed = this.platformStartSpeed * 1.5;
        } else this.platformSpeed = this.platformStartSpeed;
        platform.bottom -= this.platformSpeed;
        const visual = platform.visual;
        visual.style.bottom = platform.bottom + 'px';

        if (platform.bottom < this.disappearBorder) {
          const firstPlatform = this.platforms[0].visual;
          firstPlatform.classList.remove('platform');
          this.platforms.shift();
          const newPlatform = new Platform(grid.clientHeight);
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
      this.doodBottomSpace += this.doodJumpSpeed;
      this.dood.style.bottom = this.doodBottomSpace + 'px';
      if (this.doodBottomSpace > this.startPoint + this.platformDistance) {
        this.fall();
      }
    }, this.moveFrequency);
  }

  fall() {
    clearInterval(this.upTimerId);
    this.isJumping = false;
    this.downTimerId = setInterval(() => {
      this.doodBottomSpace -= this.doodFallSpeed;
      this.doodFallSpeed *= this.acceleration;
      this.dood.style.bottom = this.doodBottomSpace + 'px';
      if (this.doodBottomSpace <= 0) {
        this.gameOver();
      }
      this.platforms.forEach((platform) => {
        const doodRightSpace = this.doodLeftSpace + this.doodWidth;

        const platformTop = platform.bottom + platform.height;
        const platformRight = platform.left + platform.width;

        const isDoodAbove = this.doodBottomSpace >= platform.bottom &&
                            this.doodBottomSpace <= platformTop;
        const isDoodBetweenEdges = doodRightSpace >= platform.left &&
                                   this.doodLeftSpace <= platformRight;

        if (isDoodAbove && isDoodBetweenEdges && !this.isJumping) {
          this.doodFallSpeed = this.doodStartFallSpeed;
          this.score++;
          this.scoreLog.textContent = this.score;
          this.startPoint = this.doodBottomSpace;
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
    try {
      currentMusic.pause();
    } catch {
      console.error('Music can not be paused because there is no music');
    }
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
      if (this.doodLeftSpace >= 0) {
        this.doodLeftSpace -= this.doodHorizontalSpeed;
        this.dood.style.left = this.doodLeftSpace + 'px';
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
      if (this.doodLeftSpace <= grid.clientWidth - this.doodWidth) {
        this.doodLeftSpace += this.doodHorizontalSpeed;
        this.dood.style.left = this.doodLeftSpace + 'px';
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
    switch (e.key) {
    case 'ArrowLeft':
      this.moveLeft();
      break;
    case 'ArrowRight':
      this.moveRight();
      break;
    case 'ArrowUp':
      this.moveStraight();
      break;
    }
  }



  cheatSkin(e) {
    if (e.code === 'BracketRight') {
      this.dood.style.backgroundImage = 'url(\'../img/cheat-face.png\')';
    }
  }



  start() {
    if (this.isGameOver) return;
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
  const display = settingsWindow.style.display;
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
