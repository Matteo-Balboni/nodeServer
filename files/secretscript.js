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
      gameStart();
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
    this.status = 1;
  }
}

class Ball {
  constructor(x, y, radius, dx, dy) {
    this.pos = new p5.Vector(x, y);
    this.radius = radius;
    this.vel = new p5.Vector(dx, dy);
  }
}

function gameStart() {
  //shhh you cannot see me

  //when ball hits right side of brick, it bounces upwards instead of downwards
  //if i want to add more levels, i need to change the way the bricks get handled and drawn
  //add support for splash screens to indicate game states

  $("canvas").remove();
  $("body").append('<canvas class="position-absolute start-50 top-50 translate-middle border border-primary rounded" id="gameArea" width="480" height="320" ></canvas>');

  const canvas = document.getElementById('gameArea');
  const ctx = canvas.getContext("2d");
  const speed = 1;
  const ball = new Ball(canvas.width / 2, canvas.height - 30, 10, speed, -speed); //{ radius: 10, x: canvas.width / 2, y: canvas.height - 30, dx: speed, dy: -speed };
  const paddle = new Brick(10, canvas.height - 20, 10, 75); //{ height: 10, width: 75, x: 0 };
  paddle.pos.x = (canvas.width - paddle.width) / 2;

  let rightPressed = false;
  let leftPressed = false;
  let auto = true;
  let stop = false;

  let score = 0;
  let lives = 3;

  //bricks
  const brick = { height: 20, width: 75, padding: 10, offsetTop: 30, offsetLeft: 30 };
  var bricks = [];
  initializeBricks();

  function initializeBricks() {
    //initialize the brick field
    for (let i = 0, x = brick.offsetLeft, y = brick.offsetTop; i < 15; i++) {
      bricks.push(new Brick(x, y, brick.height, brick.width, 0));
      if ( (i + 1) % 5 == 0 ) {
        x = brick.offsetLeft;
        y = y + brick.height + brick.padding;
      } else {
        x = x + brick.width + brick.padding;
      }
    }
  }

  //listen for button presses
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  document.addEventListener("mousemove", mouseMoveHandler, false);
  function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft"){
      leftPressed = true;
    } else if (e.key === "Escape") {
      //starts and stops game
      stop = !stop;
      if (stop === false) {
        $("canvas").show();
        draw();
      }
    } else if (e.key === "à") {
      auto = !auto;
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

  function drawBall() {
    //draws the ball
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2); //a circle
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    //draws the paddle
    ctx.beginPath();
    ctx.rect(paddle.pos.x, paddle.pos.y, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    if (bricks.length == 0 && ball.pos.y > 150) {
      initializeBricks();
    }
    //guess what this does
    for (let i = 0; i < bricks.length; i++) {
      // ctx.beginPath();
      // ctx.rect(bricks[i].pos.x, bricks[i].pos.y, bricks[i].width, bricks[i].height);
      // ctx.fillStyle = "#ff6600";
      // ctx.fill();
      // ctx.closePath();
      ctx.beginPath();
      ctx.fillStyle = "#ff6600";
      roundRect(ctx, bricks[i].pos.x, bricks[i].pos.y, bricks[i].width, bricks[i].height, 3, true);
      ctx.closePath();
    }
  }

  function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
  }
  function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
  }

  function collisionDetection() {
    //checks all the bricks for collision with the ball
    for (let c = 0; c < bricks.length; c++) {
      const b = bricks[c];
      if (b.status === 1) {
        if ( checkForCollision(b) ) {
          collisionReaction(b);
          bricks.splice(c, 1);
          score++;
          // if (score === 15) {
          //   confirm("You Win! Try again?");
          //   document.location.reload();
          // }
        }
      }
    }
  }

  function collisionReaction(br) {
    let nearest = new p5.Vector();
    nearest.x = ( Math.max(br.pos.x, Math.min(ball.pos.x, br.pos.x + br.width)));
    nearest.y = ( Math.max(br.pos.y, Math.min(ball.pos.y, br.pos.y + br.height)));
    // let nearestX = Math.max( b.pos.x, ball.pos.x );
    // let nearestY = Math.max( b.pos.y, ball.pos.y );
    // let nearestX = Math.abs(Math.sqrt((b.pos.x - ball.pos.x) + (b.pos.y - ball.pos.y)) - ball.radius); //https://www.varsitytutors.com/hotmath/hotmath_help/topics/shortest-distance-between-a-point-and-a-circle
    // let nearestY = ball.pos.y - b.pos.y;

    let dist = new p5.Vector(ball.pos.x - nearest.x, ball.pos.y - nearest.y);
    let overlap = ball.radius - dist.mag();
    if (isNaN(overlap)) {
      overlap = 0;
    }
    if (overlap > 0) {
      ball.pos = ball.pos.sub(dist.normalize() * overlap);
      console.log("overlap: " + overlap);
    }
    let dNormal = new p5.Vector(dist.x, -dist.y);
    let normalAngle = Math.atan2(dNormal.x, dNormal.y);
    let collisionAngle = Math.atan2(dist.y, dist.x);
    let incomingAngle = Math.atan2(ball.vel.y, ball.vel.x);
    let theta = normalAngle - incomingAngle;
    console.log("Angle Stuff : na " + (normalAngle) + ", ia " + (incomingAngle) + ", theta " + (theta));

    //rotation
    ball.vel = ball.vel.rotate(2*theta);
    if (Math.abs(ball.vel.x) + Math.abs(ball.vel.y) != speed * 2) {
      console.error(ball.vel, {dist: dist, nearest:nearest, br:br}, "Lost speed: " + (speed * 2 - (Math.abs(ball.vel.x) + Math.abs(ball.vel.y))));
    } else {
      console.log(ball.vel, {dist: dist, nearest:nearest, br:br}, "Lost speed: " + (speed * 2 - (Math.abs(ball.vel.x) + Math.abs(ball.vel.y))));
    }
  }

  function checkForCollision(rect) {
    var distX = Math.abs(ball.pos.x - rect.pos.x-rect.width/2);
    var distY = Math.abs(ball.pos.y - rect.pos.y-rect.height/2);

    if (distX > (rect.width/2 + ball.radius)) { return false; }
    if (distY > (rect.height/2 + ball.radius)) { return false; }

    if (distX <= (rect.width/2)) { return true; }
    if (distY <= (rect.height/2)) { return true; }

    let dix = distX - rect.width / 2; //these do not get used anywhere
    let diy = distY - rect.height / 2;
    return (ball.vel.x * ball.vel.x + ball.vel.y * ball.vel.y <= (ball.radius * ball.radius));
  }

  function showBanner() {
    stop = true;
    ctx.rect(canvas.width / 4, canvas.height / 4, canvas.width - canvas.width / 4, canvas.height - canvas.height / 4);
  }

  function draw() {
    // the canvas and draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    drawScore();
    drawLives();

    //collision detection of the ball with walls
    if ( ball.pos.x + ball.vel.x > canvas.width - ball.radius || ball.pos.x + ball.vel.x < ball.radius ) {
      ball.vel.x = -ball.vel.x;
    }
    if ( ball.pos.y + ball.vel.y < ball.radius ) {
      ball.vel.y = -ball.vel.y;
    } else if ( ball.pos.y + ball.vel.y + ball.radius > canvas.height - ball.radius) {
      //detect collision with bottom of screen (lose ball)
      lives--;
      if (!lives) {
        alert("GAME OVER!");
        document.location.reload();
      } else {
        ball.pos.x = canvas.width / 2;
        ball.pos.y = canvas.height - 30;
        ball.vel.x = speed;
        ball.vel.y = -speed;
        paddle.pos.x = (canvas.width - paddle.width) / 2;
      }
    }
    if ( ball.pos.x > paddle.pos.x && ball.pos.x < paddle.pos.x + paddle.width && ball.pos.y + ball.vel.y + ball.radius > paddle.pos.y) {
      collisionReaction(paddle);
    }

    //move the paddle
    if (rightPressed) {
      paddle.pos.x = Math.min(paddle.pos.x + 7, canvas.width - paddle.width);
    } else if (leftPressed) {
      paddle.pos.x = Math.max(paddle.pos.x - 7, 0);
    } else if (auto){
      paddle.pos.x = ball.pos.x + ball.vel.x - (paddle.width / 2);
    }

    //move the ball
    ball.pos.x += ball.vel.x * 3;
    ball.pos.y += ball.vel.y * 3;

    //stop execution of code on escape otherwise keep drawing
    if (!stop) {
      requestAnimationFrame(draw);
    } else {
      $("canvas").hide();
    }
  }
  //Repeats draw every 10ms
  draw();
}

// function dot(a, b) {
//   //dot product
//   return a.x * b.x + a.y * b.y;
// }
// function mag(vector) {
//   //calculate magnitude of vector
//   return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
// }
// function norm(vector) {
//   let m = mag(vector);
//   if (m > 0) {
//     vector.x = vector.x / m;
//     vector.y = vector.y / m;
//   }
//
//   return vector;
// }
// function mult(v, n) {
//   return {x: v.x * n, y: v.y * n};
// }
// function sub(v1, v2) {
//   return {x: v1.x - v2.x, y: v1.y - v2.y};
// }
// function toDegrees(angle) {
//   return angle * 180 / Math.PI;
// }
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
