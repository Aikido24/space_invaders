class Laser {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.height = this.game.height - 50;
  }
  render(context) {
    this.x =
      this.game.player.x + this.game.player.width * 0.5 - this.width * 0.5;
    this.game.player.energy -= this.damage;

    context.save();
    context.fillStyle = "gold";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "white";
    context.fillRect(
      this.x + this.width * 0.2,
      this.y,
      this.width * 0.6,
      this.height
    );
    context.restore();

    if (this.game.spriteUpdate) {
      this.game.waves.forEach((wave) => {
        wave.enemies.forEach((enemy) => {
          if (this.game.checkCollision(enemy, this)) {
            enemy.hit(this.damage);
          }
        });
      });
      this.game.bossArray.forEach((boss) => {
        if (this.game.checkCollision(boss, this) && boss.y > 0) {
          boss.hit(this.damage);
        }
      });
    }
  }
}

class SmallLaser extends Laser {
  constructor(game) {
    super(game);
    this.width = 5;
    this.damage = 0.3;
  }
  render(context) {
    if (this.game.player.energy > 1 && !this.game.player.cooldown) {
      super.render(context);
      this.game.player.frameX = 2;
    }
  }
}

class BigLaser extends Laser {
  constructor(game) {
    super(game);
    this.width = 25;
    this.damage = 0.7;
  }
  render(context) {
    if (this.game.player.energy > 1 && !this.game.player.cooldown) {
      super.render(context);
      this.game.player.frameX = 3;
    }
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.scale = game.screenWidth < 400 ? 0.5 : 1;
    this.width = 140 * this.scale;
    this.height = 120 * this.scale;
    this.imageWidth = 140;
    this.imageHeight = 120;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 10;
    this.lives = 3;
    this.maxLives = 10;
    this.image = document.getElementById("player");
    this.jets_image = document.getElementById("player_jets");
    this.frameX = 0;
    this.jetsFrame = 1;
    this.smallLaser = new SmallLaser(this.game);
    this.bigLaser = new BigLaser(this.game);
    this.energy = 50;
    this.maxEnergy = 100;
    this.cooldown = false;
  }
  draw(context) {
    // handle sprite frames

    if (this.game.keys.indexOf(" ") > -1) {
      this.frameX = 1;
    } else if (this.game.keys.indexOf("c") > -1) {
      this.smallLaser.render(context);
    } else if (this.game.keys.indexOf("z") > -1) {
      this.bigLaser.render(context);
    } else {
      this.frameX = 0;
    }
    context.drawImage(
      this.jets_image,
      this.jetsFrame * this.imageWidth,
      0,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    context.drawImage(
      this.image,
      this.frameX * this.imageWidth,
      0,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  update() {
    //energy
    if (this.energy < this.maxEnergy) this.energy += 0.05;
    if (this.energy < 1) this.cooldown = true;
    else if (this.energy > this.maxEnergy * 0.2) this.cooldown = false;
    // horizontal movement
    if (this.game.keys.indexOf("ArrowLeft") > -1) {
      this.x -= this.speed;
      this.jetsFrame = 0;
    } else if (this.game.keys.indexOf("ArrowRight") > -1) {
      this.x += this.speed;
      this.jetsFrame = 2;
    } else {
      this.jetsFrame = 1;
    }
    //1 if (this.game.keys.indexOf("1") > -1) this.game.player.shoot();
    // horizontal boundaries
    if (this.x < -this.width * 0.5) this.x = -this.width * 0.5;
    else if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5;
  }
  shoot() {
    const projectile = this.game.getProjectile();
    if (projectile) projectile.start(this.x + this.width * 0.5, this.y);
  }
  restart() {
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.lives = 3;
  }
}

class Projectile {
  constructor() {
    this.width = 3;
    this.height = 40;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }
  draw(context) {
    if (!this.free) {
      context.save();
      context.fillStyle = "gold";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.restore();
    }
  }
  update(context) {
    if (!this.free) {
      this.y -= this.speed;
      if (this.y < -this.height) {
        this.reset();
      }
    }
  }
  start(x, y) {
    this.x = x - this.width * 0.5;
    this.y = y;
    this.free = false;
  }
  reset() {
    this.free = true;
  }
}

class Enemy {
  constructor(game, positionX, positionY) {
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x = 0;
    this.y = 0;
    this.positionX = positionX;
    this.positionY = positionY;
    this.markedForDeletion = false;
    this.scale = game.screenWidth < 400 ? 2 : 1;
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.frameX * (this.width * this.scale),
      this.frameY * (this.height * this.scale),
      this.width * this.scale,
      this.height * this.scale,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  update(x, y) {
    this.x = x + this.positionX;
    this.y = y + this.positionY;
    // check collision enemies - projectiles
    this.game.projectilesPool.forEach((projectile) => {
      if (
        !projectile.free &&
        this.game.checkCollision(this, projectile) &&
        this.lives >= 1
      ) {
        this.hit(1);
        projectile.reset();
      }
    });
    if (this.lives < 1) {
      if (this.game.spriteUpdate) this.frameX++;
      if (this.frameX > this.maxFrame) {
        this.markedForDeletion = true;
        if (!this.game.gameOver) this.game.score += this.maxLives;
      }
    }
    //check collision enemis - player
    if (this.game.checkCollision(this, this.game.player) && this.lives >= 1) {
      this.lives = 0;
      this.game.player.lives--;
    }
    // lose condition
    if (this.y + this.height > this.game.height || this.game.player.lives < 1) {
      this.game.gameOver = true;
      //this.markedForDeletion = true;
    }
  }
  hit(damage) {
    this.lives -= damage;
  }
}
class Beetlemorph extends Enemy {
  constructor(game, positionX, positionY) {
    super(game, positionX, positionY);
    this.image = document.getElementById("beetlemorph");
    this.frameX = 0;
    this.maxFrame = 2;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 1;
    this.maxLives = this.lives;
  }
}
class Rhinomorph extends Enemy {
  constructor(game, positionX, positionY) {
    super(game, positionX, positionY);
    this.image = document.getElementById("rhinomorph");
    this.frameX = 0;
    this.maxFrame = 5;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 4;
    this.maxLives = this.lives;
  }
  hit(damage) {
    this.lives -= damage;
    this.frameX = this.maxLives - Math.floor(this.lives);
  }
}

class Boss {
  constructor(game, bossLives) {
    this.game = game;
    this.scale = game.screenWidth < 400 ? 0.5 : 1;
    this.width = 200 * this.scale;
    this.height = 200 * this.scale;
    this.imageWidth = 200;
    this.imageHeight = 200;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = -this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;
    this.lives = bossLives;
    this.maxLives = this.lives;
    this.markedForDeletion = false;
    this.image = document.getElementById("boss");
    this.frameX = 1;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 11;
  }

  draw(context) {
    context.drawImage(
      this.image,
      this.frameX * this.imageWidth,
      this.frameY * this.imageHeight,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.lives >= 1) {
      context.save();
      if (this.scale < 1) context.font = "20px Impact";
      context.textAlign = "center";
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.shadowColor = "black";
      context.fillText(
        Math.floor(this.lives),
        this.x + this.width * 0.5,
        this.y + 50
      );
      context.restore();
    }
  }

  update() {
    this.speedY = 0;
    if (this.game.spriteUpdate && this.lives >= 1) this.frameX = 0;
    if (this.y < 0) this.y += 4;
    if (
      this.x < 0 ||
      (this.x > this.game.width - this.width && this.lives >= 1)
    ) {
      this.speedX *= -1;
      this.speedY = this.height * 0.5;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    //collision detection boss/projectiles
    this.game.projectilesPool.forEach((projectile) => {
      if (
        this.game.checkCollision(this, projectile) &&
        !projectile.free &&
        this.lives >= 1 &&
        this.y >= 0
      ) {
        this.hit(1);
        projectile.reset();
      }
    });
    // collision detection boss/player
    if (this.game.checkCollision(this, this.game.player) && this.lives >= 1) {
      this.game.gameOver = true;
      this.lives = 0;
    }
    //boss destroyed
    if (this.lives < 1 && this.game.spriteUpdate) {
      this.frameX++;
      if (this.frameX > this.maxFrame) {
        this.markedForDeletion = true;
        this.game.score += this.maxLives;
        this.game.bossLives += 5;
        if (!this.game.gameOver) this.game.newWave();
      }
    }
    //lose condition
    if (this.y + this.height > this.game.height) {
      this.game.gameOver = true;
    }
  }

  hit(damage) {
    this.lives -= damage;
    if (this.lives >= 1) this.frameX = 1;
  }
}

class Wave {
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = -this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;
    this.enemies = [];
    this.nextWaveTrigger = false;
    this.markedForDeletion = false;
    this.create();
  }
  render(context) {
    if (this.y < 0) this.y += 5;
    this.speedY = 0;

    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    this.enemies.forEach((enemy) => {
      enemy.update(this.x, this.y);
      enemy.draw(context);
    });
    this.enemies = this.enemies.filter((object) => !object.markedForDeletion);
    if (this.enemies - length <= 0) this.markedForDeletion = true;
  }
  create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        let enemyX = x * this.game.enemySize;
        let enemyY = y * this.game.enemySize;
        if (Math.random() < 0.5) {
          this.enemies.push(new Rhinomorph(this.game, enemyX, enemyY));
        } else {
          this.enemies.push(new Beetlemorph(this.game, enemyX, enemyY));
        }
      }
    }
  }
}
class Game {
  constructor(canvas, screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.player = new Player(this);
    this.projectilesPool = [];
    this.numberOfProjectiles = 15;
    this.createProjectiles();
    this.fired = false;

    this.columns = 1;
    this.rows = 1;
    this.enemySize = this.screenWidth < 400 ? 40 : 80;

    this.waves = [];

    this.waveCount = 1;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 150;

    this.score = 0;
    this.gameOver = false;

    this.bossArray = [];
    this.bossLives = 10;
    this.restart();
    // event listeners
    window.addEventListener("keydown", (e) => {
      if (e.key === " " && !this.fired) this.player.shoot();
      this.fired = true;
      if (this.keys.indexOf(e.key) === -1) {
        this.keys.push(e.key);
      }

      if (e.key === "r" && this.gameOver) this.restart();
    });
    window.addEventListener("keyup", (e) => {
      this.fired = false;
      const index = this.keys.indexOf(e.key);
      if (index > -1) {
        this.keys.splice(index, 1);
      }
    });
    window.addEventListener("touchstart", (e) => {
      console.log(e);
      this.player.shoot();
    });
    window.addEventListener("touchmove", (e) => {
      console.log(e);
    });
  }

  render(context, deltaTime) {
    // sprite timing
    if (this.spriteTimer > this.spriteInterval) {
      this.spriteUpdate = true;
      this.spriteTimer = 0;
    } else {
      this.spriteUpdate = false;
      this.spriteTimer += deltaTime;
    }
    this.drawStatusText(context);
    this.projectilesPool.forEach((projectile) => {
      projectile.update();
      projectile.draw(context);
    });
    this.player.draw(context);
    this.player.update();
    this.bossArray.forEach((boss) => {
      boss.draw(context);
      boss.update();
    });
    this.bossArray = this.bossArray.filter(
      (object) => !object.markedForDeletion
    );

    this.waves.forEach((wave) => {
      wave.render(context);
      if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver) {
        this.newWave();

        wave.nextWaveTrigger = true;
      }
    });
  }
  // create projectiles object pool
  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }
  // get free projectile object from the pool
  getProjectile() {
    for (let i = 0; i < this.projectilesPool.length; i++) {
      if (this.projectilesPool[i].free) return this.projectilesPool[i];
    }
  }
  // collision detection between 2 rectangles
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  drawStatusText(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "black";
    context.fillText("Score:  " + this.score, 20, 65);
    context.fillText("Wave:  " + this.waveCount, 20, 95);
    for (let i = 0; i < this.player.maxLives; i++) {
      context.strokeRect(20 + 20 * i, 100, 10, 15);
    }
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(20 + 20 * i, 100, 10, 15);
    }
    // energy
    context.save();
    this.player.cooldown
      ? (context.fillStyle = "red")
      : (context.fillStyle = "gold");
    for (let i = 0; i < this.player.energy; i++) {
      context.fillRect(20 + 2 * i, 130, 2, 15);
    }
    context.restore();
    if (this.gameOver) {
      context.textAlign = "center";

      context.font = this.screenWidth < 400 ? "50px Impact" : "100px Impact";
      context.fillText("GAME OVER!", this.width * 0.5, this.height * 0.5);
      context.font = "20px Impact";
      context.fillText(
        "Press R to restart!",
        this.width * 0.5,
        this.height * 0.5 + 30
      );
    }
    context.restore();
  }
  newWave() {
    this.waveCount++;
    if (this.player.lives < this.player.maxLives) this.player.lives++;
    if (this.waveCount % 2 !== 0) {
      this.bossArray.push(new Boss(this, this.bossLives));
    } else {
      if (
        Math.random() < 0.5 &&
        this.columns * this.enemySize < this.width * 0.8
      ) {
        this.columns++;
      } else if (this.rows * this.enemySize < this.height * 0.6) {
        this.rows++;
      }

      this.waves.push(new Wave(this));
    }

    this.waves = this.waves.filter((object) => !object.markedForDeletion);
  }
  restart() {
    this.player.restart();
    this.columns = 2;
    this.rows = 2;
    this.waves = [];
    this.bossArray = [];
    this.bossLives = 10;
    //this.waves.push(new Wave(this));
    this.bossArray.push(new Boss(this, this.bossLives));
    this.waveCount = 1;
    this.score = 0;
    this.gameOver = false;
  }
}

window.addEventListener("load", function () {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  //console.log(`El ancho de la pantalla es: ${screenWidth}px`);
  //console.log(`El alto de la pantalla es: ${screenHeight}px`);
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  if (screenWidth < 400) {
    canvas.width = 300;
    canvas.height = 600;
  } else {
    canvas.width = 600;
    canvas.height = 800;
  }

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";

  ctx.font = "30px Impact";
  const game = new Game(canvas, screenWidth, screenHeight);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    window.requestAnimationFrame(animate);
  }
  animate(0);
});
