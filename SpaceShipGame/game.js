const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const spaceshipImage = new Image();
spaceshipImage.src = "static/images/SpaceShip.png"; // Path to the spaceship image

const missileAImage = new Image();
missileAImage.src = "static/images/MissileA.png"; // Path to the missile image

const missileBImage = new Image();
missileBImage.src = "static/images/MissileB.png"; // Path to the missile B image

const meteoriteAImage = new Image();
meteoriteAImage.src = "static/images/MeteoriteA.png"; // Path to the meteorite image

const meteoriteBImage = new Image();
meteoriteBImage.src = "static/images/MeteoriteB.png"; // Path to the MeteoriteB image

const explosionImage = new Image();
explosionImage.src = "static/images/Explosion.png"; // Path to the explosion image

const enemyImage = new Image();
enemyImage.src = "static/images/SpacePirateShip.png"; // Path to the enemy image

const shieldImage = new Image();
shieldImage.src = "static/images/shield.png"; // Path to the shield image

const missileLaunchSoundA = new Howl({
    src: ['static/sound/MissileLaunchA.mp3']
});

const missileLaunchSoundB = new Howl({
    src: ['static/sound/MissileLaunchB.mp3']
});

const explosionSoundA = new Howl({
    src: ['static/sound/ExplosionA.mp3']
});

const explosionSoundB = new Howl({
    src: ['static/sound/ExplosionB.mp3']
});

const playerCrash = new Howl({
    src: ['static/sound/PlayerCrash.mp3']
});

// Music by <a href="https://pixabay.com/users/music_unlimited-27600023/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=120280">Music Unlimited</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=120280">Pixabay</a>
// Load the background music
const backgroundMusic = new Howl({
    src: ['static/sound/BackgroundMusic.mp3'],
    loop: true, // Set the loop property to true to make it loop
});

const spaceship = {
    x: 50,
    y: 50,
    width: 90,
    height: 60,
    speed: 5,
};

let meteorites = [];
let missilesA = [];
let missilesB = [];
let explosions = [];
let enemies = [];

let lastEnemyCreationTime = 0; // Initialize this variable
let isArrowUpPressed = false;
let isArrowDownPressed = false;
let isArrowLeftPressed = false;
let isArrowRightPressed = false;
let isSpacePressed = false;
let canFireMissile = true;
let animationFrame;
let score = 0;
let gameStartTime = 0;
let firePerSecond = 5;

let baseIntervalA = 2500; // Initial base interval in milliseconds
let baseIntervalB = 5000; // Initial base interval in milliseconds
let canCreateMeteoriteA = true;
let canCreateMeteoriteB = true;

const scoreboard = document.getElementById("scoreboard");
const shieldElement = document.getElementById("shield");

const GameState = {
    START: "start",
    PLAYING: "playing",
    GAME_OVER: "gameOver",
};

let gameState = GameState.START; // Initialize the game state

// Define shield-related variables
let shieldActive = false; // Use a boolean to track the shield's state
let shieldEnergy = 100; // Initial shield energy
const maxShieldEnergy = 100;
const shieldEnergyCostPerSecond = 4; // Energy cost when the shield is active
let lastShieldActivationTime = 0;
let lastShieldEnergyRechargeTime = 0;

// Function to toggle the shield
function toggleShield() {
    if (shieldEnergy >= shieldEnergyCostPerSecond) {
        // Activate the shield if there's enough energy
        shieldActive = true;
        lastShieldActivationTime = Date.now();
    }
}

// Function to recharge the shield energy
function rechargeShield(amount) {
    if (shieldEnergy < maxShieldEnergy) {
        shieldEnergy = Math.min(shieldEnergy + amount, maxShieldEnergy);
    }
}

// Function to update the shield system
function updateShield() {
    if (shieldActive) {
        // Calculate the time elapsed since the last update
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastShieldActivationTime;

        // Calculate the energy cost for the elapsed time
        const energyCost = (elapsedTime / 1000) * shieldEnergyCostPerSecond;

        // Check if there's enough energy to sustain the shield
        if (shieldEnergy >= energyCost) {
            // Deduct the energy cost
            shieldEnergy -= energyCost;
            lastShieldActivationTime = currentTime;
        } else {
            // Deactivate the shield if there's not enough energy
            shieldActive = false;
        }
    } else {
        // Implement shield energy recharge mechanism here
        // Recharge the shield 1 point every 1 second
        const currentTime = Date.now();
        if (currentTime - lastShieldEnergyRechargeTime >= 1000) {
            rechargeShield(1);
            lastShieldEnergyRechargeTime = currentTime;
        }
    }

    // Update the shield energy display in the HTML
    shieldElement.textContent = "Shield Energy: " + Math.floor(shieldEnergy);
}

function playBackgroundMusic() {
    backgroundMusic.play(undefined, true);
}

function stopBackgroundMusic() {
    backgroundMusic.stop(undefined, true);
}

function createMeteoriteA() {
    const minY = 0; // The minimum y-position (top of the canvas)
    const maxY = canvas.height - 50; // The maximum y-position (adjust the height as needed)

    const y = minY + Math.random() * (maxY - minY);

    meteorites.push({
        x: canvas.width + 500, // Start from the right edge
        y: y,
        width: 80, // Fixed width for meteorites
        height: 50, // Fixed height for meteorites
        speedX: -3.1 - Math.random() * 3, // Move left with random speed
        speedY: -1.5 + Math.random() * 3, // No vertical movement for MeteoriteA
        image: meteoriteAImage, // Use the MeteoriteA image
        health: 1, // Initial health of 2
        isExploding: false, // Add this property
        explosionTime: 0,   // Add this property
    });
}

function createMeteoriteB() {
    const minX = 0; // The minimum x-position (left of the canvas)
    const maxX = canvas.width; // The maximum x-position (adjust the width as needed)

    const x = minX + Math.random() * (maxX - minX);

    const isTopToBottom = Math.random() < 0.5; // 50% chance of top to bottom, 50% chance of bottom to top

    const speedY = isTopToBottom ? 0.5 + Math.random() * 2 : -0.5 - Math.random() * 2;

    const y = isTopToBottom ? -200 : canvas.height + 200;

    meteorites.push({
        x: x,
        y: y,
        width: 80, // Fixed width for meteorites
        height: 80, // Fixed height for meteorites
        speedX: -1 + Math.random() * 2, // No horizontal movement for MeteoriteB
        speedY: speedY, // Move upward or downward with random speed
        image: meteoriteBImage, // Use the MeteoriteB image
        rotation: 0, // Initial rotation angle
        health: 3, // Initial health of 3
        isExploding: false, // Add this property
        explosionTime: 0,   // Add this property
    });
}

function createEnemy() {
    const minY = 0; // The minimum y-position (top of the canvas)
    const maxY = canvas.height - 60; // The maximum y-position (adjust the height as needed)

    const y = minY + Math.random() * (maxY - minY);

    enemies.push({
        x: canvas.width + 100, // Start from the right edge with some offset
        y: y,
        width: 90, // Fixed width for enemies
        height: 60, // Fixed height for enemies
        image: enemyImage, // Use the enemy image
        speed: 0.5, // Set the speed to 0.5
        health: 5,
        lastMissileBFiredTime: Date.now() + 1500,
        targetY: spaceship.y
    });
}

document.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowUp":
            isArrowUpPressed = true;
            break;
        case "ArrowDown":
            isArrowDownPressed = true;
            break;
        case "ArrowLeft":
            isArrowLeftPressed = true;
            break;
        case "ArrowRight":
            isArrowRightPressed = true;
            break;
        case " ":
            if (canFireMissile) {
                isSpacePressed = true;
            }
            break;
    }
});

document.addEventListener("keyup", function (event) {
    switch (event.key) {
        case "ArrowUp":
            isArrowUpPressed = false;
            break;
        case "ArrowDown":
            isArrowDownPressed = false;
            break;
        case "ArrowLeft":
            isArrowLeftPressed = false;
            break;
        case "ArrowRight":
            isArrowRightPressed = false;
            break;
        case " ":
            isSpacePressed = false;
            break;
    }
});

// Check for Enter key press to start the game
document.addEventListener("keydown", function (event) {
    if (gameState === GameState.PLAYING) return;
    if (event.key === "Enter") {
        gameState = GameState.PLAYING;
        startNewGame();
    }
});

// Event listener for "Shift" keydown
document.addEventListener("keydown", function (event) {
    if (event.key === "Shift") {
        toggleShield();
    }
});

// Event listener for "Shift" keyup
document.addEventListener("keyup", function (event) {
    if (event.key === "Shift") {
        // Deactivate the shield when "Shift" key is released
        shieldActive = false;
    }
});

function increaseScore(num) {
    score += num; // Adjust the score increment as needed
    scoreboard.textContent = "Score: " + score;

}

function updateSpaceshipPosition() {
    let newX = spaceship.x;
    let newY = spaceship.y;

    if (isArrowUpPressed) {
        newY -= spaceship.speed;
    }
    if (isArrowDownPressed) {
        newY += spaceship.speed;
    }
    if (isArrowLeftPressed) {
        newX -= spaceship.speed;
    }
    if (isArrowRightPressed) {
        newX += spaceship.speed;
    }

    if (newX >= 0 && newX + spaceship.width <= canvas.width) {
        spaceship.x = newX;
    }
    if (newY >= 0 && newY + spaceship.height <= canvas.height) {
        spaceship.y = newY;
    }
}

function updateMissilesA() {
    for (let i = 0; i < missilesA.length; i++) {
        const missile = missilesA[i];

        if (missile.isFired) {
            missile.x += missile.speed;

            if (missile.x > canvas.width) {
                missilesA.splice(i, 1);
                i--;
            }
        }
    }
}

function updateMissilesB() {
    for (let i = 0; i < missilesB.length; i++) {
        const missileB = missilesB[i];

        if (missileB.isFired) {
            missileB.x -= missileB.speed;

            if (missileB.x < 0) {
                missilesB.splice(i, 1);
                i--;
            }
        }
    }
}

function updateMeteorites() {
    for (let i = 0; i < meteorites.length; i++) {
        const meteorite = meteorites[i];
        meteorite.x += meteorite.speedX; // Update horizontal position
        meteorite.y += meteorite.speedY; // Update vertical position

        // Increment the rotation angle for MeteoriteB (clockwise)
        if (meteorite.image === meteoriteBImage) {
            meteorite.rotation += 0.005; // Adjust the rotation speed as needed
        }

        // Check if meteorite A is out of bounds on the left
        if (meteorite.image === meteoriteAImage &&
            meteorite.x + meteorite.width < 0
        ) {
            meteorites.splice(i, 1);
            i--;
        }

        // Check if meteorite B is out of bounds in both directions (top and bottom)
        if (meteorite.image === meteoriteBImage &&
            ((meteorite.y > canvas.height + 100 && meteorite.speedY > 0) || // Meteorite moving from top to bottom and out of the canvas
                (meteorite.y < -100 && meteorite.speedY < 0)) // Meteorite moving from bottom to top and out of the canvas
        ) {
            meteorites.splice(i, 1);
            i--;
        }
    }

    // Calculate the number of meteorites based on the player's score
    const numMeteorites = Math.floor(score / 100) + 2; // +1 ensures there's always at least 2 meteorites

    // Create new meteorites with a dynamically adjusted interval for meteorite A
    if (canCreateMeteoriteA) {
        let randomInterval = baseIntervalA + Math.random() * (baseIntervalA - 200 * Math.floor(score / 10)); // Random interval within the baseInterval range
        randomInterval = randomInterval > 1000 ? randomInterval : 1000; // Ensure a minimum interval of 1000ms
        setTimeout(function () {
            for (let j = 0; j < numMeteorites; j++) {
                createMeteoriteA();
            }
            canCreateMeteoriteA = true;
        }, randomInterval);

        canCreateMeteoriteA = false;
    }

    // Create new meteorites with a dynamically adjusted interval for meteorite B
    if (canCreateMeteoriteB) {
        let randomInterval = baseIntervalB + Math.random() * (baseIntervalB - 200 * Math.floor(score / 10)); // Random interval within the baseInterval range
        randomInterval = randomInterval > 1000 ? randomInterval : 1000; // Ensure a minimum interval of 1000ms
        setTimeout(function () {
            for (let j = 0; j < numMeteorites; j++) {
                createMeteoriteB();
            }
            canCreateMeteoriteB = true;
        }, randomInterval);

        canCreateMeteoriteB = false;
    }
}

function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        // If the enemy has reached its current target, generate a new random target
        if (Math.abs(enemy.y - enemy.targetY) < enemy.speed) {
            enemy.targetY = Math.random() * (canvas.height - enemy.height);
        }

        // Move the enemy towards its target
        if (enemy.y < enemy.targetY) {
            enemy.y += enemy.speed;
        } else if (enemy.y > enemy.targetY) {
            enemy.y -= enemy.speed;
        }

        // Check if enemy is out of bounds on the left
        if (enemy.x + enemy.width > canvas.width - 50) {
            enemy.x -= enemy.speed;
        } else {
            enemy.x += enemy.speed;
        }

        // Check if it's time for the enemy to fire missile B
        const currentTime = Date.now();
        if (currentTime - enemy.lastMissileBFiredTime > 3000) { // 3000 milliseconds (3 seconds) cooldown
            missilesB.push({
                x: enemy.x,
                y: enemy.y + enemy.height / 2 - 7,
                width: 40,
                height: 16,
                speed: 5,
                isFired: true,
            });
            missileLaunchSoundB.play(undefined, true);
            enemy.lastMissileBFiredTime = currentTime;
        }
    }

    // Create a new enemy every 10 seconds
    const currentTime = Date.now();
    if (currentTime - lastEnemyCreationTime > 10000) {
        createEnemy();
        lastEnemyCreationTime = currentTime;
    }
}

function drawMissilesA() {
    for (const missile of missilesA) {
        if (missile.isFired) {
            ctx.drawImage(missileAImage, missile.x, missile.y, missile.width, missile.height);
        }
    }
}

function drawMissilesB() {
    for (const missileB of missilesB) {
        if (missileB.isFired) {
            ctx.drawImage(missileBImage, missileB.x, missileB.y, missileB.width, missileB.height);
        }
    }
}

function drawMeteorites() {
    for (const meteorite of meteorites) {
        ctx.save(); // Save the current transformation state
        ctx.translate(meteorite.x + meteorite.width / 2, meteorite.y + meteorite.height / 2); // Translate to the center of the meteorite
        ctx.rotate(meteorite.rotation); // Apply rotation
        ctx.drawImage(
            meteorite.image,
            -meteorite.width / 2,
            -meteorite.height / 2,
            meteorite.width,
            meteorite.height
        );
        ctx.restore(); // Restore the previous transformation state
    }
}

function drawSpaceship() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(spaceshipImage, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

function drawExplosion() {
    // Remove expired explosions (older than 125 milliseconds)
    const currentTime = Date.now();
    for (let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];

        if (currentTime - explosion.timestamp > 250) {
            explosions.splice(i, 1);
            i--;
            continue;
        }

        const deltaTime = Date.now() - explosion.timestamp;

        // Calculate the scale factor based on deltaTime
        const scaleFactor = deltaTime / 250;

        // Calculate the scaled size and position
        const scaledWidth = 100 * scaleFactor;
        const scaledHeight = 100 * scaleFactor;
        const offsetX = (100 - scaledWidth) / 2;
        const offsetY = (100 - scaledHeight) / 2;

        ctx.drawImage(
            explosionImage,
            explosions[i].x + offsetX,
            explosions[i].y + offsetY,
            scaledWidth,
            scaledHeight
        );
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.drawImage(
            enemy.image,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
    }
}

function drawShield() {
    if (shieldActive) {
        ctx.drawImage(shieldImage, spaceship.x - 15, spaceship.y - 25, spaceship.width + 30, spaceship.height + 50);
    }
}

function resetFireCooldown() {
    canFireMissile = true;
}

function checkCollisions() {
    if (shieldActive) return; // Skip collisions when the shield is active
    // Check for collisions with meteorites
    for (let i = 0; i < meteorites.length; i++) {
        const meteorite = meteorites[i];

        // Check if a meteorite collides with the spaceship
        if (
            spaceship.x < meteorite.x + meteorite.width &&
            spaceship.x + spaceship.width > meteorite.x &&
            spaceship.y < meteorite.y + meteorite.height &&
            spaceship.y + spaceship.height > meteorite.y
        ) {
            // Add the explosion to the explosions array with a timestamp
            explosions.push({x: spaceship.x - 20, y: spaceship.y - 20, timestamp: Date.now()});
            playerCrash.play(undefined, true);
            // Collision detected, stop the game
            setTimeout(() => {
                gameOver();
            }, 250);
            return;
        }
    }

    // Check for collisions with enemy missiles B
    for (let i = 0; i < missilesB.length; i++) {
        const missileB = missilesB[i];

        // Check if an enemy missile B collides with the spaceship
        if (
            spaceship.x < missileB.x + missileB.width &&
            spaceship.x + spaceship.width > missileB.x &&
            spaceship.y < missileB.y + missileB.height &&
            spaceship.y + spaceship.height > missileB.y
        ) {
            // Add the explosion to the explosions array with a timestamp
            explosions.push({x: spaceship.x - 20, y: spaceship.y - 20, timestamp: Date.now()});
            playerCrash.play(undefined, true);
            // Collision detected, stop the game
            setTimeout(() => {
                gameOver();
            }, 250);
            return;
        }
    }

    // Check for collisions with enemies
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        // Check if an enemy collides with the spaceship
        if (
            spaceship.x < enemy.x + enemy.width &&
            spaceship.x + spaceship.width > enemy.x &&
            spaceship.y < enemy.y + enemy.height &&
            spaceship.y + spaceship.height > enemy.y
        ) {
            // Add the explosion to the explosions array with a timestamp
            explosions.push({x: spaceship.x - 20, y: spaceship.y - 20, timestamp: Date.now()});
            playerCrash.play(undefined, true);
            // Collision detected, stop the game
            setTimeout(() => {
                gameOver();
            }, 250);
            return;
        }
    }
}

function checkMissileMeteoriteCollisions() {
    for (let i = 0; i < missilesA.length; i++) {
        const missile = missilesA[i];
        if (!missile) continue;

        if (meteorites.length > 0) {
            for (let j = 0; j < meteorites.length; j++) {
                const meteorite = meteorites[j];

                // Check if a missile collides with a meteorite
                if (
                    missile.x < meteorite.x + meteorite.width &&
                    missile.x + missile.width > meteorite.x &&
                    missile.y < meteorite.y + meteorite.height &&
                    missile.y + missile.height > meteorite.y
                ) {
                    // Add the explosion to the explosions array with a timestamp
                    explosions.push({x: missile.x, y: missile.y - 40, timestamp: Date.now()});
                    explosionSoundB.play(undefined, true);

                    missilesA.splice(i, 1);
                    i--;

                    // Reduce the meteorite's health
                    meteorite.health--;

                    // If health reaches 0, remove the missile and meteorite
                    if (meteorite.health <= 0) {

                        meteorites.splice(j, 1);
                        j--;

                        // Increase the score
                        switch (meteorite.image) {
                            case meteoriteAImage:
                                increaseScore(1);
                                break;
                            case meteoriteBImage:
                                increaseScore(3);
                                break;
                            default:
                                increaseScore(1);
                        }
                    }
                }
            }
        }
    }
}

function checkMissileEnemyCollisions() {
    for (let i = 0; i < missilesA.length; i++) {
        const missile = missilesA[i];
        if (!missile) continue;

        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            // Check if a missile collides with an enemy
            if (
                missile.x < enemy.x + enemy.width &&
                missile.x + missile.width > enemy.x &&
                missile.y < enemy.y + enemy.height &&
                missile.y + missile.height > enemy.y
            ) {
                // Add the explosion to the explosions array with a timestamp
                explosions.push({x: missile.x, y: missile.y - 40, timestamp: Date.now()});
                explosionSoundA.play(undefined, true);

                missilesA.splice(i, 1);
                i--;

                // Reduce the enemy's health
                enemy.health--;

                // If health reaches 0, remove the missile and enemy
                if (enemy.health <= 0) {
                    enemies.splice(j, 1);
                    j--;

                    // Increase the score (adjust as needed)
                    increaseScore(5); // You can adjust the score increment
                    rechargeShield(10);
                }
            }
        }
    }
}

function gameOver() {
    // Change the game state to "gameOver"
    gameState = GameState.GAME_OVER;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Display a game over message
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);

    // Optionally, you can reset other game variables or perform other actions here.
}

function animate() {
    if (gameState === GameState.START) {
        // Display the instructions div
        const instructionsDiv = document.getElementById("instructions");
        instructionsDiv.style.display = "block";

        // Hide the canvas
        canvas.style.display = "none";
    } else {
        // Hide the instructions div when not in START state
        const instructionsDiv = document.getElementById("instructions");
        instructionsDiv.style.display = "none";

        // Show the canvas
        canvas.style.display = "block";

        if (gameState === GameState.PLAYING) {
            // Game logic when playing
            updateSpaceshipPosition();

            if (isSpacePressed && canFireMissile) {
                missilesA.push({
                    x: spaceship.x + spaceship.width,
                    y: spaceship.y + spaceship.height / 2 - 7,
                    width: 40,
                    height: 16,
                    speed: 5,
                    isFired: true,
                });
                missileLaunchSoundA.play(undefined, true);
                canFireMissile = false;
                setTimeout(resetFireCooldown, 1000 / firePerSecond);
            }

            updateMissilesA();
            updateMissilesB();
            updateMeteorites();
            updateEnemies();
            updateShield();
            drawSpaceship();
            drawMissilesA();
            drawMissilesB();
            drawMeteorites();
            drawExplosion();
            drawEnemies();
            drawShield();
            checkMissileMeteoriteCollisions();
            checkMissileEnemyCollisions();
            checkCollisions(); // Check for collisions at each frame
        } else if (gameState === GameState.GAME_OVER) {
            // Display game over message and allow starting a new game
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "36px Arial";
            ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
            ctx.fillText("Press Enter to Start a New Game", canvas.width / 2 - 250, canvas.height / 2 + 40);
        }
    }

    animationFrame = requestAnimationFrame(animate);
}

function startNewGame() {
    // Stop any previously playing background music
    stopBackgroundMusic();

    // Start playing the background music
    playBackgroundMusic();

    // Reset game variables here
    meteorites = [];
    missilesA = [];
    missilesB = [];
    enemies = [];
    spaceship.x = 50;
    spaceship.y = 50;
    baseIntervalA = 5000; // Reset the base interval
    canCreateMeteoriteA = true;
    canCreateMeteoriteB = true;
    canFireMissile = true;
    gameStartTime = Date.now();

    // Reset the score to 0
    score = 0;

    // Reset the Shield Energy to 100
    shieldEnergy = 100;

    // Update the scoreboard display
    scoreboard.textContent = "Score: " + score;

    // Change the game state to "playing"
    gameState = GameState.PLAYING;
}

window.addEventListener("resize", resizeCanvas);
animate();
