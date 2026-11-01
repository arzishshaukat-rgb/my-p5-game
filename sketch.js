// Catch the Falling Objects
// Controls: mouse or LEFT/RIGHT arrows (or A/D) to move the basket.
// Catch fruit for points, avoid bombs. Missing fruit or catching a bomb costs a life.

const W = 480;
const H = 640;

let basket;
let objects = [];
let score;
let lives;
let highScore = 0;
let spawnTimer;
let gameOver;

function setup() {
  createCanvas(W, H);
  textFont("sans-serif");
  resetGame();
}

function resetGame() {
  basket = { x: W / 2, y: H - 40, w: 90, h: 30, speed: 7 };
  objects = [];
  score = 0;
  lives = 3;
  spawnTimer = 0;
  gameOver = false;
}

function draw() {
  background(27, 31, 42);

  if (!gameOver) {
    updateGame();
  }

  drawObjects();
  drawBasket();
  drawHUD();

  if (gameOver) drawGameOver();
}

function updateGame() {
  // Basket movement: keyboard, otherwise follow the mouse
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    basket.x -= basket.speed;
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    basket.x += basket.speed;
  } else if (mouseX > 0 && mouseX < width) {
    basket.x = lerp(basket.x, mouseX, 0.3);
  }
  basket.x = constrain(basket.x, basket.w / 2, W - basket.w / 2);

  // Spawn objects; gets faster as score grows
  const spawnRate = max(20, 55 - floor(score / 50) * 3);
  spawnTimer++;
  if (spawnTimer >= spawnRate) {
    spawnTimer = 0;
    objects.push(makeObject());
  }

  // Update objects
  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i];
    o.y += o.vy;

    // Caught?
    const caught =
      o.y + o.r > basket.y - basket.h / 2 &&
      o.y - o.r < basket.y + basket.h / 2 &&
      o.x > basket.x - basket.w / 2 - o.r / 2 &&
      o.x < basket.x + basket.w / 2 + o.r / 2;

    if (caught) {
      if (o.bomb) {
        lives--;
      } else {
        score += 10;
      }
      objects.splice(i, 1);
    } else if (o.y - o.r > H) {
      // Missed
      if (!o.bomb) lives--;
      objects.splice(i, 1);
    }
  }

  if (lives <= 0) {
    gameOver = true;
    highScore = max(highScore, score);
  }
}

function makeObject() {
  const bomb = random() < 0.2;
  const baseSpeed = 2.5 + score / 150;
  return {
    x: random(20, W - 20),
    y: -20,
    r: bomb ? 14 : random(11, 16),
    vy: baseSpeed + random(0, 1.5),
    bomb: bomb,
    col: bomb ? color(60) : color(random([[255, 80, 80], [255, 200, 50], [120, 220, 90]])),
  };
}

function drawObjects() {
  noStroke();
  for (const o of objects) {
    if (o.bomb) {
      fill(50);
      circle(o.x, o.y, o.r * 2);
      stroke(255, 160, 0);
      strokeWeight(2);
      line(o.x, o.y - o.r, o.x + 5, o.y - o.r - 7);
      noStroke();
      fill(255, 60, 60);
      circle(o.x + 5, o.y - o.r - 7, 5);
    } else {
      fill(o.col);
      circle(o.x, o.y, o.r * 2);
      fill(255, 255, 255, 120);
      circle(o.x - o.r / 3, o.y - o.r / 3, o.r / 2);
    }
  }
}

function drawBasket() {
  noStroke();
  fill(200, 140, 70);
  rectMode(CENTER);
  rect(basket.x, basket.y, basket.w, basket.h, 4, 4, 14, 14);
  fill(160, 105, 50);
  rect(basket.x, basket.y - basket.h / 2 + 3, basket.w, 6, 3);
}

function drawHUD() {
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 12, 10);
  textAlign(RIGHT, TOP);
  text("Lives: " + "♥".repeat(max(lives, 0)), W - 12, 10);
  textAlign(CENTER, TOP);
  textSize(14);
  fill(180);
  text("Best: " + highScore, W / 2, 14);
}

function drawGameOver() {
  fill(0, 0, 0, 170);
  rectMode(CORNER);
  rect(0, 0, W, H);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("Game Over", W / 2, H / 2 - 40);
  textSize(22);
  text("Score: " + score, W / 2, H / 2 + 5);
  textSize(16);
  fill(200);
  text("Click or press SPACE to play again", W / 2, H / 2 + 45);
}

function mousePressed() {
  if (gameOver) resetGame();
}

function keyPressed() {
  if (gameOver && key === " ") resetGame();
}