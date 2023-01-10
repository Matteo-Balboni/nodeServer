
// Add more levels (and possibly a level creator)
// possibly consider using p5.collide2D to more accurately calculate collisions
// Add powerups (like multiple balls, a shield, enlarge platform, vision, ecc..)
// Bosses? (this will be quite hard i feel)
// Add a leaderboard, maybe, idk

//register starting keystrokes
const key = 'a';
let startingKeys = '';
//console.log(key); //add back in case you want the secret to be more easily found
document.addEventListener("keydown", handleStart, false);
function handleStart(e) {
  //only register letters
  if (e.keyCode > 64 && e.keyCode < 91) {
    startingKeys = startingKeys + e.key;
    console.log(startingKeys); //add back in case you want the secret to be more easily found
    //if input == key starts the game
    if (startingKeys.toLowerCase() === key.toLowerCase()) {
      start();
      document.removeEventListener("keydown", handleStart, false);
    }
    //if input is longer than key, resets the input string
    if (startingKeys.length >= key.length) {
      startingKeys = '';
    }
  }
  if (e.keyCode === 8) {
    startingKeys = '';
  }
}

//classes (i'm sorry but i have to do them all in a single file)
class Brick {
  constructor(x, y, height, width, rotation) {
    this.pos = new p5.Vector(x, y);
    this.height = height;
    this.width = width;
    this.rotation = rotation;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "#ff6600";
    roundRect(ctx, this.pos.x, this.pos.y, this.width, this.height, 3, true);
    ctx.closePath();
  }
}

class Ball {
  constructor(x, y, radius, dx, dy) {
    this.pos = new p5.Vector(x, y);
    this.radius = radius;
    this.vel = new p5.Vector(dx, dy);
  }

  collides(rect) {
    let distX = Math.abs(this.pos.x - rect.pos.x-rect.width/2);
    let distY = Math.abs(this.pos.y - rect.pos.y-rect.height/2);

    if (distX > (rect.width/2 + this.radius)) { return false; }
    if (distY > (rect.height/2 + this.radius)) { return false; }

    if (distX <= (rect.width/2)) { return true; }
    if (distY <= (rect.height/2)) { return true; }

    return (this.vel.x * this.vel.x + this.vel.y * this.vel.y <= (this.radius * this.radius));
  }

  wallCollision(canvas) {
    if ( this.pos.x + this.vel.x > canvas.width - this.radius || this.pos.x + this.vel.x < this.radius ) {
      this.vel.x = -this.vel.x;
    }
    if ( this.pos.y + this.vel.y < this.radius ) {
      this.vel.y = -this.vel.y;
    } else if ( this.pos.y + this.vel.y + this.radius > canvas.height - this.radius) {
      return true;
    }
    return false;
  }

  bounce(br) {
    //this still loses a bit of speed sometimes, i don't know how to fix it yet
    let nearest = new p5.Vector();
    //calculating nearest points on rectangle
    nearest.x = ( Math.max(br.pos.x, Math.min(this.pos.x, br.pos.x + br.width)));
    nearest.y = ( Math.max(br.pos.y, Math.min(this.pos.y, br.pos.y + br.height)));
    let dist = new p5.Vector(this.pos.x - nearest.x, this.pos.y - nearest.y);

    //calculate overlap to compensate for errors
    let overlap = this.radius - dist.mag();
    if (isNaN(overlap)) {
      overlap = 0;
    }
    if (overlap > 0) {
      this.pos = this.pos.sub(dist.normalize() * overlap);
      // console.log("overlap: " + overlap);
    }

    //stuff needed to calculate rotation
    let dNormal = new p5.Vector(dist.x, -dist.y);
    let normalAngle = Math.atan2(dNormal.x, dNormal.y);
    let collisionAngle = Math.atan2(dist.y, dist.x);
    let incomingAngle = Math.atan2(this.vel.y, this.vel.x);
    let theta = normalAngle - incomingAngle;
    //console.log("Angle Stuff : na " + (normalAngle) + ", ia " + (incomingAngle) + ", theta " + (theta));

    //rotation
    this.vel = this.vel.rotate(2*theta);
  }

  startOnPaddle(paddle) {
    //sets ball to follow paddle
    this.vel.x = 0;
    this.vel.y = 0;
    this.pos.x = paddle.pos.x + paddle.width / 2;
  }

  launch(paddle, canvas) {
    //launches ball
    this.vel.x = 0
    this.vel.y = -2;
    let a = map(paddle.pos.x, 0, canvas.width - paddle.width / 2, -Math.PI/4, Math.PI/4);
    this.vel.rotate(a);
  }

  reset(canvas) {
    //resents ball to starting position
    this.pos.x = canvas.width / 2;
    this.pos.y = canvas.height - 31;
    this.vel.x = 0;
    this.vel.y = 0;
  }

  update(spd) {
    //update ball position
    this.pos.x += this.vel.x * spd;
    this.pos.y += this.vel.y * spd;
  }

  draw(ctx) {
    console.log(this.vel.mag());
    //draws the ball
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2); //a circle
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
}

class Paddle {
  constructor(x, y, height, width) {
    this.pos = new p5.Vector(x, y);
    this.height = height;
    this.width = width;
  }

  move(movement, speed, auto = false, ball) {
    //move the paddle, 1 = right, 2 = left, 3 = auto (follow the ball)
    //speed, the amount of pixels the paddle is moved
    if (movement === 1) {
      this.pos.x = Math.min(this.pos.x + speed, 480 - this.width);
    } else if (movement === 2) {
      this.pos.x = Math.max(this.pos.x - speed, 0);
    } else if (auto === true){
      this.pos.x = ball.pos.x + ball.vel.x - (this.width / 2);
    }
  }

  draw(ctx) {
    //draws the paddle
    ctx.beginPath();
    ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
}

class Level {
  constructor(offsetLeft, offsetTop, padding, brickHeight, brickWidth) {
    this.brickField = [];
    this.offsetLeft = offsetLeft;
    this.offsetTop = offsetTop;
    this.padding = padding;
    this.brickHeight = brickHeight;
    this.brickWidth = brickWidth;
    //just to try this out, i'll change this later
    for (let i = 0, x = offsetLeft, y = offsetTop; i < 15; i++) {
      this.brickField.push(new Brick(x, y, brickHeight, brickWidth, 0));
      if ( (i + 1) % 5 == 0 ) {
        x = offsetLeft;
        y = y + brickHeight + padding;
      } else {
        x = x + brickWidth + padding;
      }
    }
  }

  initializeBricks() {
    for (let i = 0, x = this.offsetLeft, y = this.offsetTop; i < 15; i++) {
      this.brickField.push(new Brick(x, y, this.brickHeight, this.brickWidth, 0));
      if ( (i + 1) % 5 == 0 ) {
        x = this.offsetLeft;
        y = y + this.brickHeight + this.padding;
      } else {
        x = x + this.brickWidth + this.padding;
      }
    }
  }

  removeBrick(position) {
    this.brickField.splice(position, 1);
  }
}

function start(){
  $("canvas").remove();
  $("body").append('<canvas class="position-absolute start-50 top-50 translate-middle border border-primary rounded" id="gameArea" width="480" height="320" ></canvas>');

  const canvas = document.getElementById('gameArea');
  const ctx = canvas.getContext("2d");
  const speed = 2;
  const ball = new Ball(canvas.width / 2, canvas.height - 31, 10, 0, -speed);
  const paddle = new Paddle(10, canvas.height - 20, 10, 75);
  paddle.pos.x = (canvas.width - paddle.width) / 2;

  let paddleMove = 0;
  let auto = false;
  let stop = false;
  let launched = false;

  let score = 0;
  let lives = 3;

  let offsetTop = 30;
  let offsetLeft = 30;
  let brickHeight = 20;
  let brickWidth = 75;
  let padding = 10;

  let brickField = [];
  let level = new Level(offsetLeft, offsetTop, padding, brickHeight, brickWidth);

  //listen for button presses
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  document.addEventListener("mousemove", mouseMoveHandler, false);
  document.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      launched = true;
      ball.launch(paddle, canvas);
    }
  });
  function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      paddleMove = 1;
    } else if (e.key === "Left" || e.key === "ArrowLeft"){
      paddleMove = 2;
    } else if (e.key === "Escape") {
      //starts and stops game
      stop = !stop;
      if (stop === false) {
        $("canvas").show();
        draw();
      }
    } else if (e.key === "à") {
      auto = !auto;
    } else if (e.key ===" ") {
      launched = true;
      ball.launch(paddle, canvas);
    }
  }
  function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft"){
      leftPressed = false;
    }
  }
  function mouseMoveHandler(e) {
    const relativeX = e.clientX - ((document.documentElement.clientWidth / 2) - 240); //240 is half the canvas width, this will cause problems in the future
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.pos.x = relativeX - paddle.width / 2;
    }
  }

  function draw() {
    //clear the canvas and draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw the bricks
    level.brickField.forEach((brick) => {
      brick.draw(ctx);
    });
    //check for collisions //these are two separate loops to avoid brick flickering
    level.brickField.forEach((brick, i) => {
      if (ball.collides(brick)) {
        ball.bounce(brick);
        level.removeBrick(i);
        score++;
      }
    });

    if (!launched) {
      ball.startOnPaddle(paddle);
    }

    //draw the ball and paddle
    ball.draw(ctx);
    paddle.draw(ctx);

    drawScore(ctx, score);
    drawLives(ctx, lives, canvas.width);

    //redraw bricks to keep testing
    if (level.brickField.length == 0 && ball.pos.y > 150) {
      level.initializeBricks();
    }

    //collision detection of the ball with walls
    if (ball.wallCollision(canvas) === true) {
      //if the ball collides with bottom wall lose lives
      lives--;
      if (lives === 0) {
        alert("GAME OVER!");
        document.location.reload();
      } else {
        ball.reset(canvas);
        paddle.pos.x = (canvas.width - paddle.width) / 2;
        launched = false;
      }
    }

    //collision detection with paddle
    if (ball.collides(paddle)) {
      ball.bounce(paddle);
    }

    //move the paddle
    paddle.move(paddleMove, 7, auto, ball);

    //move the ball by that speed
    ball.update(3);

    //stop execution of code on escape otherwise keep drawing
    if (!stop) {
      requestAnimationFrame(draw);
    } else {
      $("canvas").hide();
    }
  }
  //Calls draw to start the loop
  draw();
}


function drawScore(ctx, score) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${score}`, 8, 20);
}
function drawLives(ctx, lives, width) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Lives: ${lives}`, width - 65, 20);
}
function roundDecimal(num) {
  return +(Math.round(num + "e+2") + "e-2");
}
function roundRect(ctx, x, y, width, height, radius = 5, fill = true, stroke = false) {
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
function map(n, start1, stop1, start2, stop2) {
  //Map function from p5.js, copied here because instanciating the whole p5.js to just call this was very inefficient
  return ((n - start1)/(stop1 - start1))*(stop2 - start2) + start2;
}
