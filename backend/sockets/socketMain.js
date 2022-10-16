const io = require("../servers").io;

let ballInfo = {
  x: 500,
  y: 300,
  radius: 10,
};

let ballVec = {
  xVec: -1,
  yVec: Math.random() * (Math.random() < 0.5 ? 1 : -1),
  speed: 1.5,
};

let players = [];

const upperBound = 10;
const lowerBound = 490;

const barHeight = 100;

let isGameOver = false;
let isPlayer1turn = true;

setInterval(() => {
  // console.log(players.length);
  if (2 <= players.length) {
    io.to("game").emit("updateGameInfo", {
      players,
      ballInfo,
    });
  }
}, 33);

io.sockets.on("connect", (socket) => {
  console.log(`Request from ${socket.id} has been received!`);

  let player = {};
  player.height = 220;

  // add the player to the game namespace
  socket.join("game");
  players.push(player);

  socket.on("barMove", (data) => {
    if (players.length === 1) return;
    res = player.height + data;
    if (res < upperBound) {
      player.height = upperBound;
    } else if (lowerBound < res) {
      player.height = lowerBound;
    } else {
      player.height = res;
    }

    if (ballVec.yVec < 0 && ballInfo.y < 10) {
      ballVec.yVec *= -1;
    } else if (0 < ballVec.yVec && 590 < ballInfo.y) {
      ballVec.yVec *= -1;
    }
    if (
      ballVec.xVec < 0 &&
      ballInfo.x < 50 &&
      players[0].height <= ballInfo.y &&
      ballInfo.y <= players[0].height + barHeight
    ) {
      ballVec.xVec = 1;
    } else if (
      0 < ballVec.xVec &&
      950 < ballInfo.x &&
      players[1].height <= ballInfo.y &&
      ballInfo.y <= players[1].height + barHeight
    ) {
      ballVec.xVec = -1;
    } else if (ballInfo.x < 50 || 950 < ballInfo.x) {
      isGameOver = true;
    }
    if (!isGameOver) {
      ballInfo.x += ballVec.xVec * ballVec.speed;
      ballInfo.y += ballVec.yVec * ballVec.speed;
    } else {
      ballInfo.x = 500;
      ballInfo.y = 300;
      isGameOver = false;
      ballVec.xVec = isPlayer1turn ? -1 : 1;
      ballVec.yVec = Math.random() * (Math.random() < 0.5 ? 1 : -1);
      isPlayer1turn = !isPlayer1turn;
    }
  });
});
