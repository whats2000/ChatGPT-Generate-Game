/**
 * Main entry point for the SpaceGame application.
 */

// Import the Game class from the specified location.
import Game from "./GameComponent/Game/Game.js";

// Get the canvas element with the ID "gameCanvas".
const canvas = document.getElementById("gameCanvas");

/**
 * Resize the canvas to match the window's inner dimensions.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize the canvas size.
resizeCanvas();

// Create a new instance of the Game class, passing the canvas as a parameter.
const SpaceGame = new Game(canvas);

// Initialize a variable to store the animation frame ID.
let animationFrame;

/**
 * The main game loop.
 */
function gameLoop() {
    // Start the game's play logic.
    SpaceGame.startPlay();

    // Request the next animation frame.
    animationFrame = requestAnimationFrame(gameLoop);
}

// Add a listener to handle window resizing.
window.addEventListener("resize", resizeCanvas);

// Start the game loop.
gameLoop();
