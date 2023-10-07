import SpaceShip from "../Entity/SpaceShip.js";
import Meteorite from "../Entity/Meteorite.js";
import Enemy from "../Entity/Enemy.js";
import GameControl from "./GameControl.js";
import GameUpgrade from "./GameUpgrade.js";
import EnemyBoss from "../Entity/EnemyBoss.js";
import GameSound from "./GameSound.js";

/**
 * Enum representing different game states.
 * @enum {string}
 */
const GameState = {
    START: "start",
    PLAYING: "playing",
    GAME_OVER: "gameOver",
    PAUSED: "paused",
};

// Get references to HTML elements by their IDs.
const instructionsDiv = document.getElementById("instructions");
const pauseBlock = document.getElementById("pause");
const gameOverBlock = document.getElementById("gameOver");

/**
 * Represents the main game class.
 */
class Game {
    /**
     * Create a Game instance.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(canvas) {
        // Store a reference to the canvas and get its 2D rendering context.
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Initialize game objects and variables.
        this.player = new SpaceShip(canvas); // Create the player's spaceship.
        this.meteorites = [];                // Initialize an array to store meteorite objects.
        this.missilesA = [];                 // Initialize an array to store player's missiles.
        this.missilesB = [];                 // Initialize an array to store enemy missiles.
        this.explosions = [];                // Initialize an array to store explosion effects.
        this.enemies = [];                   // Initialize an array to store enemy ships.
        this.boss = new EnemyBoss(canvas);   // Initialize enemy boss ships.

        // Initialize variables related to game timing and scoring.
        this.lastEnemyCreationTime = 0;      // Track the time of the last enemy creation.
        this.score = 0;                      // Initialize the player's score.
        this.baseIntervalA = 2500;           // Base interval for meteorite type A creation.
        this.baseIntervalB = 5000;           // Base interval for meteorite type B creation.
        this.lastCreateMeteoriteTimeA = 0;   // Track the time of the last meteorite type A creation.
        this.lastCreateMeteoriteTimeB = 0;   // Track the time of the last meteorite type B creation.
        this.lastGeneratedBossScore = 0;     // Track the last score at which a boss was generated.

        // Get references to HTML elements for displaying game information.
        this.scoreboardElement = document.getElementById("scoreboard");
        this.shieldElement = document.getElementById("shield");

        // Create an instance of the GameControl class to manage user input.
        this.gameControl = new GameControl();

        // Initialize the shield toggle state as false
        this.shieldToggleState = false;

        // Set the initial game state to "start."
        this.gameState = GameState.START;

        // Set the canvas dimensions to match the window size.
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Initialize the upgrade object to manage player upgrades.
        this.upgrade = {};

        // Resize the canvas
        this.resizeCanvas();

        // Add upgrade modules for the player's ship and shield.
        // These modules allow the player to enhance their ship's abilities.
        this.#addUpgradeModule(
            'fire-rate',          // Name of the upgrade module (fire rate).
            this.player,                // Target object for the upgrade (player's ship).
            30,       // Increment for upgrading the fire rate.
        );

        this.#addUpgradeModule(
            'shield-efficiency',  // Name of the upgrade module (shield efficiency).
            this.player.shield,         // Target object for the upgrade (player's shield).
            30        // Increment for upgrading shield efficiency.
        );

        GameSound.setUpVolumeControl(); // Initialize volume setting binding.

        // Resize the canvas when the window is resized.
        window.addEventListener("resize", () => {
            this.resizeCanvas();
        });
    }


    /**
     * Initiates a boss fight in the game.
     * This method displays a warning message and animation before starting the boss fight.
     * @private
     */
    #startBossFight() {
        if (this.boss.isInFight) return;

        // Reset Boss
        this.boss.reset();

        // Start the boss fight
        this.boss.isInFight = true;

        // Decrease the volume of BackgroundMusic smoothly
        GameSound.BackgroundMusic.decreaseVolume(5000, GameSound.BackgroundMusic.playerSetVolume * 3 / 8);

        // Play WarningSound and stop BackgroundMusic
        GameSound.WarningSound.play(undefined, true);

        // Play BossBackgroundMusic
        GameSound.BossBackgroundMusic.play(undefined, true)
        GameSound.BossBackgroundMusic.setVolume(0.01);
        GameSound.BossBackgroundMusic.increaseVolume(5000, GameSound.BackgroundMusic.playerSetVolume);

        // Get the warning block element
        const warningBlock = document.getElementById("warningBlock");

        // Display the warning block
        warningBlock.style.display = "flex";

        // Apply the expandWarning animation
        warningBlock.style.animation = "expandWarning 5s forwards";

        // Set a timeout to hide the warning after the animation
        setTimeout(() => {
            // Hide the warning block
            warningBlock.style.display = "none";
            // Clear the animation
            warningBlock.style.animation = "";
        }, 5000);
    }

    /**
     * Private method to increase the game score.
     * @param {number} num - The amount to increase the score by.
     * @private
     */
    #increaseScore(num) {
        this.score += num;
        this.scoreboardElement.textContent = "Score: " + this.score;
    }

    /**
     * Private method to update the positions of missiles.
     * @private
     */
    #updateMissiles() {
        // Update the positions of player's missiles (type A).
        for (let i = 0; i < this.missilesA.length; i++) {
            if (this.missilesA[i].updatePosition()) {
                this.missilesA.splice(i, 1);
                i--;
            }
        }

        // Update the positions of enemy missiles (type B).
        for (let i = 0; i < this.missilesB.length; i++) {
            if (this.missilesB[i].updatePosition()) {
                this.missilesB.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Private method for updating meteorite positions, creation, and interval adjustment.
     * @private
     */
    #updateMeteorites() {
        // Iterate through the meteorites array.
        for (let i = 0; i < this.meteorites.length; i++) {
            // Check if a meteorite has moved off-screen.
            if (this.meteorites[i].updatePosition()) {
                this.meteorites.splice(i, 1);
                i--;
            }
        }

        // Calculate the time elapsed since the last creation of meteorite type A.
        const timeElapsedA = Date.now() - this.lastCreateMeteoriteTimeA;

        // Calculate the time elapsed since the last creation of meteorite type B.
        const timeElapsedB = Date.now() - this.lastCreateMeteoriteTimeB;

        // Calculate the number of meteorites to create based on the player's score.
        const numMeteorites = Math.min(Math.floor(this.score / 50) + 2, 6);

        // Create new meteorites of type A with dynamically adjusted intervals.
        if (timeElapsedA >= this.baseIntervalA) {
            for (let j = 0; j < numMeteorites; j++) {
                this.meteorites.push(new Meteorite("A", this.canvas));
            }
            this.lastCreateMeteoriteTimeA = Date.now();
        }

        // Create new meteorites of type B with dynamically adjusted intervals.
        if (timeElapsedB >= this.baseIntervalB) {
            for (let j = 0; j < numMeteorites; j++) {
                this.meteorites.push(new Meteorite("B", this.canvas));
            }
            this.lastCreateMeteoriteTimeB = Date.now();
        }
    }

    /**
     * Private method for updating enemies positions and creation.
     * @private
     */
    #updateEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].updatePosition();
            this.enemies[i].fire(this.missilesB);
        }

        const currentTime = Date.now();
        if (currentTime - this.lastEnemyCreationTime > 10000) {
            this.enemies.push(new Enemy(this.canvas));
            this.lastEnemyCreationTime = currentTime;
        }
    }

    /**
     * Private method for updating enemy boss position and attacks.
     * @private
     */
    #updateEnemyBoss() {
        if (!this.boss.isInFight) return;

        this.boss.updatePosition(this.player);
        this.boss.fire(this.missilesB);
        this.boss.shield.updateState();
    }

    /**
     * Private method to draw missiles.
     * @private
     */
    #drawMissiles() {
        // Draw player's missiles (type A).
        for (const missileA of this.missilesA) {
            missileA.draw();
        }

        // Draw enemy missiles (type B).
        for (const missileB of this.missilesB) {
            missileB.draw();
        }
    }

    /**
     * Private method to draw meteorites.
     * @private
     */
    #drawMeteorites() {
        // Draw all meteorites.
        for (const meteorite of this.meteorites) {
            meteorite.draw();
        }
    }

    /**
     * Private method to draw explosions.
     * @private
     */
    #drawExplosions() {
        for (let i = 0; i < this.explosions.length; i++) {
            if (this.explosions[i].isExpired()) {
                this.explosions.splice(i, 1);
                i--;
                continue;
            }

            // Draw active explosions.
            this.explosions[i].draw();
        }
    }

    /**
     * Private method to draw enemies.
     * @private
     */
    #drawEnemies() {
        // Draw all enemy entities.
        for (const enemy of this.enemies) {
            enemy.draw();
        }
    }

    /**
     * Draws the enemy boss and its shield if it is in the attacking state.
     * @private
     */
    #drawEnemyBoss() {
        if (!this.boss.isInFight) return;
        this.boss.draw();
        this.boss.shield.draw();
    }


    /**
     * Private method to check missile-meteorite collisions.
     * @private
     */
    #checkMissileMeteoriteCollisions() {
        for (let i = 0; i < this.meteorites.length; i++) {
            const meteorite = this.meteorites[i];

            const missile = this.meteorites[i].checkCollisions(this.missilesA);

            if (missile) {
                this.meteorites[i].explode(missile, this.explosions);

                this.missilesA.splice(i, 1);
                this.missilesA.splice(this.missilesA.indexOf(missile), 1);

                if (meteorite.health <= 0) {
                    this.meteorites.splice(i, 1);
                    i--;

                    if (meteorite.type === "B") {
                        this.#increaseScore(3);
                    } else {
                        this.#increaseScore(1);
                    }
                }
            }
        }
    }

    /**
     * Private method to check missile-enemy collisions.
     * @private
     */
    #checkMissileEnemyCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            const missile = this.enemies[i].checkCollisions(this.missilesA);

            if (missile) {
                this.enemies[i].explode(missile, this.explosions);
                this.missilesA.splice(this.missilesA.indexOf(missile), 1);

                if (this.enemies[i].health <= 0) {
                    this.enemies.splice(i, 1);
                    i--;

                    this.#increaseScore(5);
                    this.player.shield.recharge(10);
                }
            }
        }
    }

    /**
     * Private method to check missile-enemy-boss collisions.
     * @private
     */
    #checkMissileEnemyBossCollisions() {
        if (!this.boss.isInFight) return;

        const missile = this.boss.checkCollisions(this.missilesA);

        if (missile) {
            this.boss.explode(missile, this.explosions);
            this.missilesA.splice(this.missilesA.indexOf(missile), 1);

            if (this.boss.health <= 0) {
                this.boss.hugeExplosion(this.explosions);

                // Boss Background Music stop
                GameSound.BossBackgroundMusic.decreaseVolume(5000, 0.01);
                GameSound.BackgroundMusic.increaseVolume(5000, GameSound.BackgroundMusic.playerSetVolume);

                setTimeout(() => {
                    this.boss.reset();
                }, 500)

                this.#increaseScore(30);
            }
        }
    }

    /**
     * Private method to start a new game.
     * @private
     */
    #startNewGame() {
        // Stop any previously playing background music.
        GameSound.BackgroundMusic.stop(undefined, true);
        GameSound.BossBackgroundMusic.stop(undefined, true);

        // Start playing the background music.
        GameSound.BackgroundMusic.play(undefined, true);
        GameSound.BackgroundMusic.setVolume(GameSound.BackgroundMusic.playerSetVolume);

        // Reset game variables here.
        this.meteorites = [];
        this.missilesA = [];
        this.missilesB = [];
        this.enemies = [];
        this.player.x = 50;
        this.player.y = 50;
        this.player.lastMissileAFiredTime = Date.now();
        this.boss.reset();

        // Reset the base interval for meteorite creation.
        this.baseIntervalA = 2500;
        this.baseIntervalB = 5000;

        const GameStartTime = Date.now();
        this.lastCreateMeteoriteTimeA = GameStartTime + this.baseIntervalA;
        this.lastCreateMeteoriteTimeB = GameStartTime + this.baseIntervalB;
        this.lastEnemyCreationTime = GameStartTime;

        // Reset the generated boss score to 0.
        this.lastGeneratedBossScore = 0;

        // Reset the score to 0.
        this.score = 0;

        // Reset the Shield Energy to 100.
        this.player.shield.energy = 100;

        // Update the scoreboard display.
        this.scoreboardElement.textContent = "Score: " + this.score;

        // Change the game state to "playing."
        this.gameState = GameState.PLAYING;
    }


    /**
     * Adds an upgrade module to the game.
     * @private
     * @param {string} name - The name of the upgrade module.
     * @param {object} target - The target object to upgrade.
     * @param {number} progressBarIncrement - The increment value for the progress bar.
     */
    #addUpgradeModule(name, target, progressBarIncrement) {
        this.upgrade[name] = new GameUpgrade(
            this,
            `${name}-button`,
            `${name}-progress`,
            `${name}-cost`,
            target,
            progressBarIncrement
        );
    }

    /**
     * Starts the game loop and handles game state transitions.
     * @public
     */
    startPlay() {
        const gameControl = this.gameControl.keyStates;

        switch (this.gameState) {
            case GameState.PAUSED:
                // Display pause screen
                pauseBlock.style.display = "block";

                // Resume the game if Enter key is pressed
                if (gameControl.isEnterPressed) {
                    this.gameState = GameState.PLAYING;
                }
                break;
            case GameState.START:
                // Hide canvas and show instructions at the start
                this.canvas.style.display = "none";
                instructionsDiv.style.display = "block";
                pauseBlock.style.display = "none";
                gameOverBlock.style.display = "none";

                // Start the game when Enter key is pressed
                if (gameControl.isEnterPressed) {
                    GameSound.BackgroundMusic.play(undefined, true);
                    this.gameState = GameState.PLAYING;
                }
                break;
            case GameState.PLAYING:
                // Check if the player's score is greater than or equal to the next boss generation score
                const nextBossScore = this.lastGeneratedBossScore + 100;

                if (this.score >= nextBossScore) {
                    // Start the boss fight and update the last generated boss score
                    this.#startBossFight();
                    this.lastGeneratedBossScore = nextBossScore;
                }

                if (this.gameControl.toggleHold) {
                    // Toggle player's shield with Shift key or Left Click
                    if ((gameControl.isShiftPressed || this.gameControl.mouseLeftClick) && !this.player.shield.active) {
                        this.player.shield.toggleShieldOn();
                    }
                    if ((!gameControl.isShiftPressed && !this.gameControl.mouseLeftClick) && this.player.shield.active) {
                        this.player.shield.toggleShieldOff();
                    }
                } else {
                    // Change the shield activate state when both Shift key and Left Click are released
                    if (!gameControl.isShiftPressed && !this.gameControl.mouseLeftClick) {
                        if (this.shieldToggleState) {
                            if (!this.player.shield.active) {
                                this.player.shield.toggleShieldOn();
                            } else {
                                this.player.shield.toggleShieldOff();
                            }
                            this.shieldToggleState = false;
                        }
                    } else {
                        this.shieldToggleState = true;
                    }
                }

                // Display the game canvas and hide UI elements
                this.canvas.style.display = "block";
                instructionsDiv.style.display = "none";
                pauseBlock.style.display = "none";
                gameOverBlock.style.display = "none";

                // Game logic when playing
                this.player.updatePosition(this.gameControl);
                this.player.fire((gameControl.isSpacePressed || this.gameControl.alwaysFire), this.missilesA);
                this.player.shield.updateState();

                this.#updateMissiles();
                this.#updateMeteorites();
                this.#updateEnemies();
                this.#updateEnemyBoss();

                this.shieldElement.textContent = "Shield Energy: " + Math.floor(this.player.shield.energy);

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.player.draw();
                this.player.shield.draw();

                this.#drawMissiles();
                this.#drawMeteorites();
                this.#drawExplosions();
                this.#drawEnemies();
                this.#drawEnemyBoss();

                this.#checkMissileMeteoriteCollisions();
                this.#checkMissileEnemyCollisions();
                this.#checkMissileEnemyBossCollisions();

                // Check for player collision with obstacles
                if (this.player.checkCollisions(this.meteorites, this.missilesB, this.enemies)) {
                    this.player.explode(this.explosions);
                    this.gameState = GameState.GAME_OVER;
                } else if (gameControl.isEscapePressed) {
                    // Pause the game if Escape key is pressed
                    this.gameState = GameState.PAUSED;
                }
                break;
            case GameState.GAME_OVER:
                // Display game over screen
                gameOverBlock.style.display = "block";
                pauseBlock.style.display = "none";

                // Draw any remaining explosions
                if (this.explosions.length > 0) {
                    this.#drawExplosions();
                } else {
                    // Clear the canvas after explosions
                    setTimeout(() => {
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    }, 250);
                }

                // Restart the game if Enter key is pressed
                if (gameControl.isEnterPressed) {
                    this.gameState = GameState.PLAYING;
                    this.#startNewGame();
                }
                break;
            default:
                // Start a new game if the default state is encountered
                this.gameState = GameState.START;
        }
    }

    /**
     * Resize the canvas to match the window's inner dimensions.
     * @public
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Call resizeCanvas for each game object that extends Entity
        this.player.resizeCanvas();
        this.meteorites.forEach((meteorite) => meteorite.resizeCanvas());
        this.missilesA.forEach((missileA) => missileA.resizeCanvas());
        this.missilesB.forEach((missileB) => missileB.resizeCanvas());
        this.enemies.forEach((enemy) => enemy.resizeCanvas());
        this.boss.resizeCanvas();
    }
}

export default Game;
