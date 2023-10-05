/**
 * Represents a basic game entity with an image, position, and size.
 */
class Entity {
    /**
     * Initializes the entity.
     * @param {string} imageSrc - The source URL of the entity's image.
     * @param {number} x - The X-coordinate of the top-left corner.
     * @param {number} y - The Y-coordinate of the top-left corner.
     * @param {number} width - The width of the entity.
     * @param {number} height - The height of the entity.
     * @param {HTMLCanvasElement} canvas - The HTML5 canvas element for rendering.
     */
    constructor(imageSrc, x, y, width, height, canvas) {
        // Create a new Image object for this entity and set its source.
        this.image = new Image();
        this.image.src = imageSrc;

        // Position and dimensions of the entity within the game world.
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Reference to the HTML5 canvas element and its 2D rendering context.
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    /**
     * Checks if this entity collides with another entity.
     * @param {Entity} otherEntity - The other entity to check collision with.
     * @returns {boolean} True if collision occurs, otherwise false.
     */
    isCollideWith(otherEntity) {
        return (
            this.x < otherEntity.x + otherEntity.width &&
            this.x + this.width > otherEntity.x &&
            this.y < otherEntity.y + otherEntity.height &&
            this.y + this.height > otherEntity.y
        );
    }

    /**
     * Draws the entity on the canvas.
     */
    draw() {
        this.ctx.drawImage(
            this.image,   // The image to be drawn.
            this.x,       // X-coordinate of the top-left corner.
            this.y,       // Y-coordinate of the top-left corner.
            this.width,   // Width of the entity.
            this.height   // Height of the entity.
        );
    }

    /**
     * Resize the canvas to match the window's inner dimensions.
     * @public
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");
    }
}

export default Entity;

