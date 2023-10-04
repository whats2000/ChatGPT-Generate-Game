class GameControl {
    constructor() {
        this.setupEventListeners();
        this.isArrowUpPressed = false;
        this.isArrowDownPressed = false;
        this.isArrowLeftPressed = false;
        this.isArrowRightPressed = false;
        this.isSpacePressed = false;
        this.isEscapePressed = false;
        this.isShiftPressed = false;
        this.isEnterPressed = false;
    }

    setupEventListeners() {
        document.addEventListener("keyup", (event) => {
            this.handleKeyUp(event.key);
        });

        document.addEventListener("keydown", (event) => {
            this.handleKeyDown(event.key);
        });
    }

    handleKeyUp(key) {
        switch (key) {
            case "ArrowUp":
                this.isArrowUpPressed = false;
                break;
            case "ArrowDown":
                this.isArrowDownPressed = false;
                break;
            case "ArrowLeft":
                this.isArrowLeftPressed = false;
                break;
            case "ArrowRight":
                this.isArrowRightPressed = false;
                break;
            case " ":
                this.isSpacePressed = false;
                break;
            case "Escape":
                this.isEscapePressed = false;
                break;
            case "Shift":
                this.isShiftPressed = false;
                break;
            case "Enter":
                this.isEnterPressed = false;
                break;
        }
    }

    handleKeyDown(key) {
        switch (key) {
            case "ArrowUp":
                this.isArrowUpPressed = true;
                break;
            case "ArrowDown":
                this.isArrowDownPressed = true;
                break;
            case "ArrowLeft":
                this.isArrowLeftPressed = true;
                break;
            case "ArrowRight":
                this.isArrowRightPressed = true;
                break;
            case " ":
                this.isSpacePressed = true;
                break;
            case "Escape":
                this.isEscapePressed = true;
                break;
            case "Shift":
                this.isShiftPressed = true;
                break;
            case "Enter":
                this.isEnterPressed = true;
                break;
        }
    }
}

export default GameControl;
