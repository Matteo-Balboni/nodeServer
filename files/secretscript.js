function gameStart() {
  //shhh you cannot see me

  //recalculate physics so the ball always bounces in the right direction
  //if i want to add more levels, i need to change the way the bricks get handled and drawn
  //change the way to start to direct keyboard input
  //add support for splash screens to indicate game states

  $("canvas").remove();
  $("body").append('<canvas class="position-absolute start-50 top-50 translate-middle border border-primary rounded" id="gameArea" width="480" height="320" ></canvas>');

  const canvas = document.getElementById('gameArea');
  const ctx = canvas.getContext("2d");
  const ball = { radius: 10, x: canvas.width / 2, y: canvas.height - 30, dx: 2, dy: -2 };
  const paddle = { height: 10, width: 75, x: 0 };
  paddle.x = (canvas.width - paddle.width) / 2;

  let rightPressed = false;
  let leftPressed = false;

  let score = 0;
  let lives = 3;

  //bricks
  const brickRowCount = 3;
  const brickColumnCount = 5;
  const brick = { height: 20, width: 75, padding: 10, offsetTop: 30, offsetLeft: 30 };
  const bricks = [];
  //initialize the brick field
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1}
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
      paddle.x = relativeX - paddle.width / 2;
    }
  }

  function drawBall() {
    //draws the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); //a circle
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    //draws the paddle
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    //guess what this does
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
          const brickY = r * (brick.height + brick.padding) + brick.offsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brick.width, brick.height);
          ctx.fillStyle = "#ff6600";
          ctx.fill();
          ctx.closePath();
        }
      }
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
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if ( checkForCollision(b) ) {
            ball.dy = -ball.dy;
            b.status = 0;
            score++;
            if (score === brickRowCount * brickColumnCount) {
              confirm("You Win! Try again?");
              document.location.reload();
            }
          }
        }
      }
    }
  }

  function checkForCollision(rect) {
    var distX = Math.abs(ball.x - rect.x-brick.width/2);
    var distY = Math.abs(ball.y - rect.y-brick.height/2);

    if (distX > (brick.width/2 + ball.radius)) {return false;}
    if (distY > (brick.height/2 + ball.radius)) {return false;}

    if (distX <= (brick.width/2)) {return true;}
    if (distY <= (brick.height/2)) {return true;}

    let dix = distX - brick.width / 2;
    let diy = distY - brick.height / 2;
    return (ball.dx * ball.dx + ball.dy * ball.dy <= (ball.radius * ball.radius));
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


    //collision detection of the ball
    if ( ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius ) {
      ball.dx = -ball.dx;
    }
    if ( ball.y + ball.dy < ball.radius ) {
      ball.dy = -ball.dy;
    } else if ( ball.y + ball.dy + ball.radius > canvas.height - ball.radius) {
      //detect collision with paddle
      if ( ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
      } else {
        lives--;
        if (!lives) {
          alert("GAME OVER!");
          document.location.reload();
        } else {
          ball.x = canvas.width / 2;
          ball.y = canvas.height - 30;
          ball.dx = 2;
          ball.dy = -2;
          paddle.x = (canvas.width - paddle.width) / 2;
        }
      }
    }

    //move the paddle
    if (rightPressed) {
      paddle.x = Math.min(paddle.x + 7, canvas.width - paddle.width);
    } else if (leftPressed) {
      paddle.x = Math.max(paddle.x - 7, 0);
    }

    //move the ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
  }
  //Repeats draw every 10ms
  draw();
}
