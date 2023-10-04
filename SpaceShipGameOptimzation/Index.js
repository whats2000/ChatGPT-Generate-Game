import Game from "./GameComponent/Game/Game.js";

const canvas = document.getElementById("gameCanvas");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const SpaceGame = new Game(canvas);
let animationFrame;

function gameLoop() {
    SpaceGame.startPlay();
    animationFrame = requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", resizeCanvas);
gameLoop();
