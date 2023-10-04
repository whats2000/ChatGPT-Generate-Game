import Game from "./GameComponent/Game/Game.js";

const canvas = document.getElementById("gameCanvas");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const SpaceGame = new Game(canvas);
let animationFrame;

SpaceGame.addUpgradeModule(
    'fire-rate',
    10 * (SpaceGame.player.maxFirePerSecond - 3),
    () => SpaceGame.player.upgradeFirePerSecond(SpaceGame.score), // Pass the upgrade function here
    30,
);

SpaceGame.addUpgradeModule(
    'shield-efficiency',
    10 * SpaceGame.player.shield.maxShieldEfficiency,
    () => SpaceGame.player.shield.upgradeShieldEfficiency(SpaceGame.score), // Pass the upgrade function here
    30
);


function gameLoop() {
    SpaceGame.startPlay();
    animationFrame = requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", resizeCanvas);
gameLoop();
