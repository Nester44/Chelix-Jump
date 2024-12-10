const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.querySelector('.start-btn');
const skins = document.querySelectorAll('.skin-bar__option');
const rangeInputs = document.querySelectorAll('input[type=range]');
const settingsSwitch = document.getElementById('auto-settings');
const musicSwitcher = document.getElementById('music-switcher');

const gameMusic = new Audio('./sounds/gameMusic.mp3');
const menuMusic = new Audio('./sounds/menuMusic.mp3');

musicSwitcher.onclick = () => {
  gameMusic.pause();
  menuMusic.pause();
};

menuMusic.volume = 0.1;
gameMusic.volume = 0.1;

const changeMusic = (musicToStart, musicToStop) => {
  if (!musicSwitcher.checked) return;
  musicToStop.pause();
  musicToStart.play();
};

const autoSettings = () => {
  Array.from(rangeInputs).forEach((input) => input.disabled = !input.disabled);
};

const getSkinSrc = (value) => './images/skins/' + value + '.png';

const adjustScreen = () => {
  // adjusting gameScreen height to 85% of window height
  canvas.height = window.innerHeight * 0.85;
  if (window.innerWidth >= 600) { // 600px - min width when all panels fit
    // adjusting gameScreen height to 85% of window height
    canvas.width = window.innerWidth * 0.45;
  } else {
    canvas.width = window.innerWidth * 0.85;
  }
};

const initSizes = {
  screen: { width: 1440, height: 821 },
  dood: {
    width: 50,
    height: 80,
    accX: 1,
    accY: 0.5,
    jumpHeight: 15,
    maxVel: 19,
  },
  plat: {
    width: 120,
    height: 20,
    gap: 130,
    speed: 1.3,
  },
};

const getRelativeWidth = (width) => (
  width / initSizes.screen.width * window.innerWidth
);

const getRelativeHeight = (height) => (
  height / initSizes.screen.height * window.innerHeight
);

const getDimensions = () => ({
  dood: {
    width: getRelativeWidth(initSizes.dood.width),
    height: getRelativeHeight(initSizes.dood.height),
    accX: getRelativeWidth(initSizes.dood.accX),
    accY: getRelativeHeight(initSizes.dood.accY),
    jumpHeight: getRelativeHeight(initSizes.dood.jumpHeight),
    maxVel: getRelativeHeight(initSizes.plat.height) - 1,
  },
  plat: {
    width: getRelativeWidth(initSizes.plat.width),
    height: getRelativeHeight(initSizes.plat.height),
    gap: getRelativeHeight(initSizes.plat.gap),
    speed: getRelativeHeight(initSizes.plat.speed),
  }
});

const chooseSkin = (option) => {
  for (const skin of skins) {
    skin.id = '';
  }
  option.id = 'selected';
  window.game.dood.skin.src = getSkinSrc(option.value);
};

const getValueById = (id) => Number(document.getElementById(id).value);

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
  constructor(y, dimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;
    const x = Math.random() * (canvas.clientWidth - this.width);
    y = canvas.clientHeight - y - this.height;
    this.position = new Vector(x, y);

    this.isMoving = false;

    this.vel = this.randomDirection(dimensions.height / 6);
  }

  randomDirection(velocity) {
    return Math.random() > 0.5 ? velocity : -velocity;
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
  constructor(position, dimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;

    this.position = position;
    this.position.x -= this.width / 2;
    this.position.y -= this.width + this.height;
    this.isAbove = false;

    this.left = false;
    this.right = false;
    this.isJump = false;
    this.isFall = false;

    this.accY = dimensions.accY;
    this.velY = 0;

    this.velX = 0;
    this.accX = 0;
    this.acceleration = dimensions.accX;
    this.jumpHeight = dimensions.jumpHeight;
    this.maxVel = dimensions.maxVel;

    this.skin = new Image(50, 80);
    const choosenSkin = document.getElementById('selected').value;
    this.skin.src = getSkinSrc(choosenSkin);
  }

  drawDood() {
    ctx.beginPath();
    ctx.drawImage(this.skin, this.position.x, this.position.y,
      this.width, this.height);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  drawSpeed() {
    ctx.beginPath();
    ctx.font = '24px Arial';
    ctx.fillText(`Velocity: ${this.velY}`, 10, 80);
  }
}

class Game {
  constructor() {
    this.defineSettings();

    this.platGap = this.dimensions.plat.gap;
    this.platSpeed = this.dimensions.plat.speed;
    this.platforms = [];
    this.neededSpeed = this.dimensions.plat.height / 5;
    this.moveHeight = canvas.height * 0.6;
    this.friction = 0.1;

    this.score = 0;
    this.over = false;
  }

  defineSettings() {
    if (settingsSwitch.checked) {
      console.log('auto');
      this.dimensions = getDimensions();
    } else {
      console.log('manual');
      this.dimensions = initSizes;

      this.dimensions.plat.gap = getValueById('gap');
      this.dimensions.plat.speed = getValueById('speed');
      this.dimensions.plat.width = getValueById('width');
      this.dimensions.dood.jumpHeight = getValueById('height');
    }
    this.hardmode = document.getElementById('hardmode').checked;

    console.log(this.dimensions);
  }

  drawScore() {
    ctx.beginPath();
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score}`, 10, 50);
  }

  createPlat() {
    const platAmount = Math.round(ctx.canvas.height / this.platGap);
    for (let i = 1; i < platAmount + 1; i++) {
      const plat = new Platform(this.platGap * i, this.dimensions.plat);
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
        this.dood.velY >= this.neededSpeed
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
    if (this.dood.left) this.dood.accX = -this.dood.acceleration;
    if (this.dood.right) this.dood.accX = this.dood.acceleration;

    if (!this.dood.right && !this.dood.left) this.dood.accX = 0;

    this.dood.velX += this.dood.accX;
    this.dood.velX *= 1 - this.friction;
    // bouncing function
    if (this.detColl()) {
      this.dood.velY = -this.dood.jumpHeight;
      this.score++;
    } else if (this.dood.velY < this.dood.maxVel) {
      this.dood.velY += this.dood.accY;
    }

    this.dood.position.x += this.dood.velX;
    this.dood.position.y += this.dood.velY;

    // teleportation between edges
    if (this.dood.position.x + this.dood.width <= 0) {
      this.dood.position.x = ctx.canvas.width - this.dood.width / 2;
    }
    if (this.dood.position.x >= ctx.canvas.width) {
      this.dood.position.x = -this.dood.width / 2;
    }

    // gameOver check
    if (this.dood.position.y >= ctx.canvas.height) {
      this.gameOver();
    }
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
    if (this.over) return cancelAnimationFrame(this.animID);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    this.platforms.forEach((p) => {
      p.drawPlat();
      this.moveDownPlat();
    });
    this.move();
    this.movePlatX();
    this.dood.drawDood();
    this.drawScore();
    this.animID = requestAnimationFrame(this.mainLoop.bind(this));
  }

  start() {
    changeMusic(gameMusic, menuMusic);
    this.createPlat();
    this.keyControl();

    const firstPlat = this.platforms[0].position.dup();
    // get center of plat
    firstPlat.x += this.platforms[0].width / 2;
    this.dood = new Doodler(firstPlat, this.dimensions.dood);
    this.animID = requestAnimationFrame(this.mainLoop.bind(this));
  }

  gameOver() {
    changeMusic(menuMusic, gameMusic);
    this.over = true;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const txt = 'Game Over';
    const x = canvas.width / 2 - (ctx.measureText(txt).width / 2);
    ctx.fillText(txt, x, canvas.height / 2);
  }

  mainScreen() {
    const platform = new Platform(100, this.dimensions.plat);
    this.platforms.push(platform);
    platform.position.x = 100;
    const platPos = platform.position.dup();
    platPos.x += platform.width / 2;
    const doodler = new Doodler(platPos, this.dimensions.dood);
    this.dood = doodler;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.font = '3vw Arial';
      const txt = 'Cheliks Jump';
      const x = canvas.clientWidth / 2 - (ctx.measureText(txt).width / 2);
      const y = canvas.clientHeight * 0.175;
      ctx.fillText(txt, x, y);
      this.move();
      doodler.drawDood();
      platform.drawPlat();
      this.animID = requestAnimationFrame(loop.bind(this));
    };
    this.animID = requestAnimationFrame(loop.bind(this));
  }
}

adjustScreen();
window.game = new Game();
window.game.mainScreen();

startBtn.addEventListener('click', () => {
  cancelAnimationFrame(window.game.animID);
  window.game = new Game();
  window.game.start();
});

// input handlers
settingsSwitch.addEventListener('click', () => autoSettings());

skins.forEach((option) => {
  option.style.background = `url('${getSkinSrc(option.value)}')`;
  option.addEventListener('click', (option) => chooseSkin(option.target));
});
