import React, { useRef, useEffect, useCallback, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

export const Canvas = (props) => {
  const canvasRef = useRef(null);
  // const startingHeight = 20;
  const barWidth = 20;
  const barHeight = 100;
  const speed = 20;

  const draw = useCallback((ctx, y1, y2, ballInfo) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fillStyle = "#000000";
    ctx.fillRect(20, y1, barWidth, barHeight);
    ctx.fillRect(960, y2, barWidth, barHeight);

    // draw upper side line
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(50, 10);
    ctx.lineTo(950, 10);

    // draw bottom side line
    ctx.moveTo(50, 590);
    ctx.lineTo(950, 590);
    ctx.stroke();

    // draw center line
    ctx.beginPath();
    ctx.setLineDash([20, 5]);
    ctx.moveTo(500, 10);
    ctx.lineTo(500, 590);
    ctx.stroke();

    // draw ball
    ctx.beginPath();
    ctx.moveTo(ballInfo.x, ballInfo.y);
    ctx.arc(ballInfo.x, ballInfo.y, ballInfo.radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;
    let y1 = 220;
    let y2 = 220;
    let move = 0;
    let ballInfo = {
      x: 500,
      y: 300,
      radius: 10,
    };

    const onKeyDown = (e) => {
      const key = e.keyCode;
      console.log(`key ${key} is pressed!`);
      if (key === 40) {
        move += speed;
      } else if (key === 38) {
        move -= speed;
      }
      console.log(move);
    };

    // TODO: prioritize bar move than screen move when the screen height is
    // smaller than the canvas height
    document.addEventListener("keydown", onKeyDown);

    const render = () => {
      draw(context, y1, y2, ballInfo);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    socket.on("updateGameInfo", (data) => {
      // console.log(data);
      y1 = data.players[0].height;
      y2 = data.players[1].height;
      ballInfo = data.ballInfo;
    });

    setInterval(() => {
      socket.emit("barMove", move);
      move = 0;
    }, 33);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} {...props} />;
};
