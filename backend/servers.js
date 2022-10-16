// This file is only for making the socketio server and the express server
const express = require("express");
const app = express();
app.use(express.static(__dirname + "../public"));
const socketio = require("socket.io");
const expressServer = app.listen(8080);
const io = socketio(expressServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const helmet = require("helmet");
app.use(helmet());

module.exports = {
  app,
  io,
};
