const ExplosionSound = {
    "A": new Howl({
        src: ['static/sound/ExplosionA.mp3']
    }).volume(1),
    "B": new Howl({
        src: ['static/sound/ExplosionB.mp3']
    }).volume(1),
    "C": new Howl({
        src: ['static/sound/PlayerCrash.mp3']
    }).volume(1)
}

const explosionImage = new Image();
explosionImage.src = "static/images/Explosion.png"; // Path to the explosion image

class Explosion {
    constructor(type = "A", x, y, timestamp, canvas) {
        this.x = x;
        this.y = y;
        this.timestamp = timestamp;
        this.ctx = canvas.getContext("2d");

        if (Object.keys(ExplosionSound).includes(type)) {
            ExplosionSound[type].play(undefined, true);
        }
    }

    // Check if the explosion has expired (older than 250 milliseconds)
    isExpired() {
        return Date.now() - this.timestamp > 250;
    }

    draw() {
        const currentTime = Date.now();

        if (this.isExpired()) {
            return; // Skip drawing if the explosion has expired
        }

        this.ctx.drawImage(
            explosionImage,
            this.x + (100 - 100 * (currentTime - this.timestamp) / 250) / 2,
            this.y + (100 - 100 * (currentTime - this.timestamp) / 250) / 2,
            100 * (currentTime - this.timestamp) / 250,
            100 * (currentTime - this.timestamp) / 250
        );
    }
}

export default Explosion;
