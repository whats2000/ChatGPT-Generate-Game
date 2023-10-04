import SpaceShip from "../Entity/SpaceShip.js";
import Meteorite from "../Entity/Meteorite.js";
import Enemy from "../Entity/Enemy.js";
import GameControl from "./GameControl.js";
import GameUpgrade from "./GameUpgrade.js";

const GameState = {
    START: "start",
    PLAYING: "playing",
    GAME_OVER: "gameOver",
    PAUSED: "paused",
};

const BackgroundMusic = new Howl({
    src: ['static/sound/BackgroundMusic.mp3'],
    loop: true,
}).volume(0.8);

const instructionsDiv = document.getElementById("instructions");
const pauseBlock = document.getElementById("pause");
const gameOverBlock = document.getElementById("gameOver");

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.gameControl = new GameControl();

        this.player = new SpaceShip(canvas);
        this.meteorites = [];
        this.missilesA = [];
        this.missilesB = [];
        this.explosions = [];
        this.enemies = [];

        this.lastEnemyCreationTime = 0;
        this.score = 0;
        this.baseIntervalA = 2500;
        this.baseIntervalB = 5000;
        this.lastCreateMeteoriteTimeA = 0;
        this.lastCreateMeteoriteTimeB = 0;

        this.scoreboardElement = document.getElementById("scoreboard");
        this.shieldElement = document.getElementById("shield");

        this.gameState = GameState.START;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.upgrade = {};

        this.#addUpgradeModule(
            'fire-rate',
            this.player,
            30,
        );

        this.#addUpgradeModule(
            'shield-efficiency',
            this.player.shield,
            30
        );
    }

    #increaseScore(num) {
        this.score += num;
        this.scoreboardElement.textContent = "Score: " + this.score;
    }

    #updateMissiles() {
        for (let i = 0; i < this.missilesA.length; i++) {
            if (this.missilesA[i].updatePosition()) {
                this.missilesA.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.missilesB.length; i++) {
            if (this.missilesB[i].updatePosition()) {
                this.missilesB.splice(i, 1);
                i--;
            }
        }
    }

    #updateMeteorites() {
        for (let i = 0; i < this.meteorites.length; i++) {
            if (this.meteorites[i].updatePosition()) {
                this.meteorites.splice(i, 1);
                i--;
            }
        }

        // Calculate the time elapsed since the last meteorite creation
        const timeElapsedA = Date.now() - this.lastCreateMeteoriteTimeA;
        const timeElapsedB = Date.now() - this.lastCreateMeteoriteTimeB;

        // Calculate the number of meteorites based on the player's score
        const numMeteorites = Math.floor(this.score / 20) + 2; // +1 ensures there's always at least 2 meteorites

        // Create new meteorites with dynamically adjusted intervals for meteorite A
        if (timeElapsedA >= this.baseIntervalA) {
            for (let j = 0; j < numMeteorites; j++) {
                this.meteorites.push(new Meteorite("A", this.canvas));
            }
            this.lastCreateMeteoriteTimeA = Date.now();
        }

        // Create new meteorites with dynamically adjusted intervals for meteorite B
        if (timeElapsedB >= this.baseIntervalB) {
            for (let j = 0; j < numMeteorites; j++) {
                this.meteorites.push(new Meteorite("B", this.canvas));
            }
            this.lastCreateMeteoriteTimeB = Date.now();
        }
    }

    #updateEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].updatePosition();
            this.enemies[i].fire(this.missilesB);
        }

        // Create a new enemy every 10 seconds
        const currentTime = Date.now();
        if (currentTime - this.lastEnemyCreationTime > 10000) {
            this.enemies.push(new Enemy(this.canvas));
            this.lastEnemyCreationTime = currentTime;
        }
    }

    #drawMissiles() {
        for (const missileA of this.missilesA) {
            missileA.draw();
        }

        for (const missileB of this.missilesB) {
            missileB.draw();
        }
    }

    #drawMeteorites() {
        for (const meteorite of this.meteorites) {
            meteorite.draw();
        }
    }

    #drawExplosions() {
        for (let i = 0; i < this.explosions.length; i++) {
            if (this.explosions[i].isExpired()) {
                this.explosions.splice(i, 1);
                i--;
                continue;
            }

            this.explosions[i].draw();
        }
    }

    #drawEnemies() {
        for (const enemy of this.enemies) {
            enemy.draw();
        }
    }

    #checkMissileMeteoriteCollisions() {
        for (let i = 0; i < this.meteorites.length; i++) {
            const meteorite = this.meteorites[i];

            const missile = this.meteorites[i].checkCollisions(this.missilesA);
            // Check if a missile collides with a meteorite
            if (missile) {
                // Add the explosion to the explosions array with a timestamp
                this.meteorites[i].explode(missile, this.explosions);

                this.missilesA.splice(i, 1);
                this.missilesA.splice(this.missilesA.indexOf(missile), 1);


                // If health reaches 0, remove the missile and meteorite
                if (meteorite.health <= 0) {
                    this.meteorites.splice(i, 1);
                    i--;

                    // Increase the score
                    if (meteorite.type === "B") {
                        this.#increaseScore(3);
                    } else {
                        this.#increaseScore(1);
                    }
                }
            }
        }
    }

    #checkMissileEnemyCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            const missile = this.enemies[i].checkCollisions(this.missilesA);
            // Check if a missile collides with an enemy
            if (missile) {
                this.enemies[i].explode(missile, this.explosions);
                this.missilesA.splice(this.missilesA.indexOf(missile), 1);

                // If health reaches 0, remove the missile and enemy
                if (this.enemies[i].health <= 0) {
                    this.enemies.splice(i, 1);
                    i--;

                    // Increase the score (adjust as needed)
                    this.#increaseScore(5); // You can adjust the score increment
                    this.player.shield.recharge(10);
                }
            }
        }
    }

    #gameOver() {
        // Change the game state to "gameOver"
        this.gameState = GameState.GAME_OVER;
    }

    #startNewGame() {
        // Stop any previously playing background music
        BackgroundMusic.stop(undefined, true);

        // Start playing the background music
        BackgroundMusic.play(undefined, true);

        // Reset game variables here
        this.meteorites = [];
        this.missilesA = [];
        this.missilesB = [];
        this.enemies = [];
        this.player.x = 50;
        this.player.y = 50;
        this.player.canFireMissile = true;

        // Reset the base interval
        this.baseIntervalA = 2500;
        this.baseIntervalB = 5000;

        const GameStartTime = Date.now();
        this.lastCreateMeteoriteTimeA = GameStartTime + this.baseIntervalA;
        this.lastCreateMeteoriteTimeB = GameStartTime + this.baseIntervalB;
        this.lastEnemyCreationTime = GameStartTime;

        // Reset the score to 0
        this.score = 0;

        // Reset the Shield Energy to 100
        this.player.shield.energy = 100;

        // Update the scoreboard display
        this.scoreboardElement.textContent = "Score: " + this.score;

        // Change the game state to "playing"
        this.gameState = GameState.PLAYING;
    }

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

    startPlay() {
        const gameControl = this.gameControl;

        switch (this.gameState) {
            case GameState.PAUSED:
                pauseBlock.style.display = "block";

                if (gameControl.isEnterPressed) {
                    this.gameState = GameState.PLAYING;
                }
                break;
            case GameState.START:
                this.canvas.style.display = "none";
                instructionsDiv.style.display = "block";
                pauseBlock.style.display = "none";
                gameOverBlock.style.display = "none";

                if (gameControl.isEnterPressed) {
                    BackgroundMusic.play(undefined, true);
                    this.gameState = GameState.PLAYING;
                }
                break;
            case GameState.PLAYING:
                if (gameControl.isShiftPressed && !this.player.shield.active) {
                    this.player.shield.toggleShieldOn();
                }
                if (!gameControl.isShiftPressed && this.player.shield.active){
                    this.player.shield.toggleShieldOff();
                }

                this.canvas.style.display = "block";
                instructionsDiv.style.display = "none";
                pauseBlock.style.display = "none";
                gameOverBlock.style.display = "none";

                // Game logic when playing
                this.player.updatePosition(gameControl.isArrowUpPressed, gameControl.isArrowDownPressed, gameControl.isArrowLeftPressed, gameControl.isArrowRightPressed, this.canvas);
                this.player.fire(gameControl.isSpacePressed, this.missilesA);
                this.player.shield.updateState();

                this.#updateMissiles();
                this.#updateMeteorites();
                this.#updateEnemies();

                this.shieldElement.textContent = "Shield Energy: " + Math.floor(this.player.shield.energy);

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.player.draw();
                this.player.shield.draw();

                this.#drawMissiles();
                this.#drawMeteorites();
                this.#drawExplosions();
                this.#drawEnemies();

                this.#checkMissileMeteoriteCollisions();
                this.#checkMissileEnemyCollisions();

                if (this.player.checkCollisions(this.meteorites, this.missilesB, this.enemies)) {
                    this.player.explode(this.explosions);
                    this.#gameOver();
                }

                if (gameControl.isEscapePressed) {
                    this.#increaseScore(10000);
                    this.gameState = GameState.PAUSED;
                }
                break;
            case GameState.GAME_OVER:
                gameOverBlock.style.display = "block";
                pauseBlock.style.display = "none";

                if (this.explosions.length > 0) {
                    this.#drawExplosions();
                } else {
                    setTimeout(() => {
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                    }, 250);
                }

                if (gameControl.isEnterPressed) {
                    this.gameState = GameState.PLAYING;
                    this.#startNewGame();
                }
                break;
            default:
                this.gameState = GameState.START;
        }
    }
}

export default Game;