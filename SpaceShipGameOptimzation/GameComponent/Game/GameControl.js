/**
 * Represents a controller for handling game input key states.
 */
class GameControl {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Set up event listeners to handle key presses and releases.
     */
    setupEventListeners() {
        document.addEventListener("keydown", (event) => this.handleKeyEvent(event, true));
        document.addEventListener("keyup", (event) => this.handleKeyEvent(event, false));
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
}

export default GameControl;
