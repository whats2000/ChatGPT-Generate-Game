/**
 * Represents a controller for handling game input key states.
 */
class GameControl {
    /**
     * Initializes the GameControl instance.
     */
    constructor() {
        this.setupEventListeners();

        this.useMouseControl = false; // Indicates whether the game uses mouse control.
        this.alwaysFire = false;      // Indicates whether the player always fires missiles.

        // Initialize mouse state
        this.mouseLeftClick = false;  // Indicates whether the left mouse button is currently clicked.
        this.currentMouseX = 0;       // The current X-coordinate of the mouse cursor.
        this.currentMouseY = 0;       // The current Y-coordinate of the mouse cursor.
    }


    /**
     * Set up event listeners to handle key presses and releases.
     */
    setupEventListeners() {
        document.addEventListener("keydown", (event) => this.handleKeyEvent(event, true));
        document.addEventListener("keyup", (event) => this.handleKeyEvent(event, false));
        document.addEventListener("mousedown", (event) => this.handleMouseDown(event));
        document.addEventListener("mouseup", (event) => this.handleMouseUp(event));
        document.addEventListener("mousemove", (event) => this.handleMouseMove(event));
        document.getElementById("mouse-control-toggle").addEventListener("change", this.toggleMouseControl.bind(this));
        document.getElementById("always-fire-toggle").addEventListener("change", this.toggleAlwaysFire.bind(this));
    }

    /**
     * Handle key events and update key states accordingly.
     * @param {KeyboardEvent} event - The keyboard event.
     * @param {boolean} isPressed - Indicates if the key is pressed (true) or released (false).
     */
    handleKeyEvent(event, isPressed) {
        const key = this.getKeyName(event);

        if (key) {
            this.keyStates[key] = isPressed;
        }
    }

    /**
     * Handle mouse down event.
     * @param {MouseEvent} event - The mouse event.
     */
    handleMouseDown(event) {
        if (event.button === 0) {
            // Left mouse button click
            this.mouseLeftClick = true;
        }
    }

    /**
     * Handle mouse up event.
     * @param {MouseEvent} event - The mouse event.
     */
    handleMouseUp(event) {
        if (event.button === 0) {
            // Left mouse button release
            this.mouseLeftClick = false;
        }
    }

    /**
     * Handle mouse move event to update the current mouse position.
     * @param {MouseEvent} event - The mouse event.
     */
    handleMouseMove(event) {
        this.currentMouseX = event.clientX;
        this.currentMouseY = event.clientY;
    }

    /**
     * Map a keyboard event to its corresponding key state property.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {string|null} - The name of the corresponding key state property or null if not mapped.
     */
    getKeyName(event) {
        const keyMap = {
            ArrowUp: "isArrowUpPressed",
            ArrowDown: "isArrowDownPressed",
            ArrowLeft: "isArrowLeftPressed",
            ArrowRight: "isArrowRightPressed",
            " ": "isSpacePressed",
            Escape: "isEscapePressed",
            Shift: "isShiftPressed",
            Enter: "isEnterPressed"
        };

        return keyMap[event.key] || null;
    }

    /**
     * Default values for key states.
     * @type {Object}
     */
    keyStates = {
        isArrowUpPressed: false,
        isArrowDownPressed: false,
        isArrowLeftPressed: false,
        isArrowRightPressed: false,
        isSpacePressed: false,
        isEscapePressed: false,
        isShiftPressed: false,
        isEnterPressed: false
    };

    /**
     * Handle the change event for the mouse control toggle.
     */
    toggleMouseControl() {
        this.useMouseControl = document.getElementById("mouse-control-toggle").checked;
    }

    /**
     * Handle the change event for the always-fire mode toggle.
     */
    toggleAlwaysFire() {
        this.alwaysFire = document.getElementById("always-fire-toggle").checked;
    }
}

export default GameControl;
