class Entity {
    constructor(imageSrc, x, y, width, height, canvas) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    isCollideWith(otherEntity) {
        return (
            this.x < otherEntity.x + otherEntity.width &&
            this.x + this.width > otherEntity.x &&
            this.y < otherEntity.y + otherEntity.height &&
            this.y + this.height > otherEntity.y
        );
    }

    draw() {
        this.ctx.drawImage(
            this.image,
            this.x, this.y,
            this.width, this.height
        );
    }
}

export default Entity;
