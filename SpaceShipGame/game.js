const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const spaceshipImage = new Image();
spaceshipImage.src = "static/images/SpaceShip.jpg"; // Path to the spaceship image

const missileImage = new Image();
missileImage.src = "static/images/MissileA.png"; // Path to the missile image

const meteoriteAImage = new Image();
meteoriteAImage.src = "static/images/MeteoriteA.png"; // Path to the meteorite image

const meteoriteBImage = new Image();
meteoriteBImage.src = "static/images/MeteoriteB.png"; // Path to the MeteoriteB image

const spaceship = {
    x: 50,
    y: 50,
    width: 150,
    height: 100,
    speed: 5,
};

let meteorites = [];
let missiles = [];

let isArrowUpPressed = false;
let isArrowDownPressed = false;
let isArrowLeftPressed = false;
let isArrowRightPressed = false;
let isSpacePressed = false;
let canFireMissile = true;
let animationFrame;
let score = 0;

let baseInterval = 5000; // Initial base interval in milliseconds
let canCreateMeteorite = true;

const scoreboard = document.getElementById("scoreboard");

const GameState = {
    START: "start",
    PLAYING: "playing",
    GAME_OVER: "gameOver",
};

let gameState = GameState.START; // Initialize the game state

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
        speedY: - 1.5 + Math.random() * 3, // No vertical movement for MeteoriteA
        image: meteoriteAImage, // Use the MeteoriteA image
        health: 1, // Initial health of 2
    });
}

function createMeteoriteB() {
    const minX = 0; // The minimum x-position (left of the canvas)
    const maxX = canvas.width - 80; // The maximum x-position (adjust the width as needed)

    const x = minX + Math.random() * (maxX - minX);

    meteorites.push({
        x: x,
        y: -200, // Start from the top
        width: 150, // Fixed width for meteorites
        height: 150, // Fixed height for meteorites
        speedX: - 0.5 + Math.random(), // No horizontal movement for MeteoriteB
        speedY: 0.5 + Math.random() * 2, // Move downward with random speed
        image: meteoriteBImage, // Use the MeteoriteB image
        rotation: 0, // Initial rotation angle
        health: 3, // Initial health of 3
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

function updateMissiles() {
    for (let i = 0; i < missiles.length; i++) {
        const missile = missiles[i];

        if (missile.isFired) {
            missile.x += missile.speed;

            if (missile.x > canvas.width) {
                missiles.splice(i, 1);
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

        if (meteorite.x + meteorite.width < 0 || meteorite.y > canvas.height) {
            meteorites.splice(i, 1);
            i--;
        }
    }

    // Calculate the number of meteorites based on the player's score
    const numMeteorites = Math.floor(score / 20) + 2; // +1 ensures there's always at least 2 meteorite

    // Create new meteorites with a dynamically adjusted interval
    if (canCreateMeteorite) {
        let randomInterval = baseInterval + Math.random() * baseInterval - 200 * Math.floor(score / 10); // Random interval within the baseInterval range
        randomInterval = randomInterval > 1000 ? randomInterval : 1000;
        setTimeout(function () {
            for (let j = 0; j < numMeteorites; j++) {
                if (Math.random() < 0.7) {
                    createMeteoriteA();
                } else {
                    createMeteoriteB();
                }
            }
            canCreateMeteorite = true;
        }, randomInterval);

        canCreateMeteorite = false;
    }
}

function drawMissiles() {
    for (const missile of missiles) {
        if (missile.isFired) {
            ctx.drawImage(missileImage, missile.x, missile.y, missile.width, missile.height);
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

function resetFireCooldown() {
    canFireMissile = true;
}

function checkCollisions() {
    for (let i = 0; i < meteorites.length; i++) {
        const meteorite = meteorites[i];

        // Check if a meteorite collides with the spaceship
        if (
            spaceship.x < meteorite.x + meteorite.width &&
            spaceship.x + spaceship.width > meteorite.x &&
            spaceship.y < meteorite.y + meteorite.height &&
            spaceship.y + spaceship.height > meteorite.y
        ) {
            // Collision detected, stop the game
            gameOver();
            return;
        }
    }
}

function checkMissileMeteoriteCollisions() {
    for (let i = 0; i < missiles.length; i++) {
        const missile = missiles[i];

        for (let j = 0; j < meteorites.length; j++) {
            const meteorite = meteorites[j];

            // Check if a missile collides with a meteorite
            if (
                missile.x < meteorite.x + meteorite.width &&
                missile.x + missile.width > meteorite.x &&
                missile.y < meteorite.y + meteorite.height &&
                missile.y + missile.height > meteorite.y
            ) {
                missiles.splice(i, 1);
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
        // Display a start message
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.fillText("Press Enter to Start", canvas.width / 2 - 160, canvas.height / 2);

        // Check for Enter key press to start the game
        document.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                gameState = GameState.PLAYING;
                startNewGame();
            }
        });
    } else if (gameState === GameState.PLAYING) {
        // Game logic when playing
        updateSpaceshipPosition();

        if (isSpacePressed && canFireMissile) {
            missiles.push({
                x: spaceship.x + spaceship.width,
                y: spaceship.y + spaceship.height / 2,
                width: 50,
                height: 20,
                speed: 5,
                isFired: true,
            });

            canFireMissile = false;
            setTimeout(resetFireCooldown, 125);
        }

        updateMissiles();
        updateMeteorites();
        drawSpaceship();
        drawMissiles();
        drawMeteorites();
        checkMissileMeteoriteCollisions();
        checkCollisions(); // Check for collisions at each frame
    } else if (gameState === GameState.GAME_OVER) {
        // Display game over message and allow starting a new game
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText("Press Enter to Start a New Game", canvas.width / 2 - 250, canvas.height / 2 + 40);
    }

    animationFrame = requestAnimationFrame(animate);
}

function startNewGame() {
    // Reset game variables here
    meteorites = [];
    missiles = [];
    spaceship.x = 50;
    spaceship.y = 50;
    baseInterval = 5000; // Reset the base interval
    canCreateMeteorite = true;
    canFireMissile = true;

    // Reset the score to 0
    score = 0;

    // Update the scoreboard display
    scoreboard.textContent = "Score: " + score;

    // Change the game state to "playing"
    gameState = GameState.PLAYING;
}

window.addEventListener("resize", resizeCanvas);
animate();
