/**
 * Class representing a Minesweeper game.
 */
class Minesweeper {
    /**
     * Create a Minesweeper game.
     * @param {number} rows - Number of rows in the board.
     * @param {number} cols - Number of columns in the board.
     * @param {number} mines - Number of mines in the board.
     */
    constructor(rows, cols, mines) {
        /** @private {boolean} */
        this.leftMouseDown = false;
        /** @private {boolean} */
        this.rightMouseDown = false;
        /** @private {number} */
        this.rows = rows; // Number of rows
        /** @private {number} */
        this.cols = cols; // Number of columns
        /** @private {number} */
        this.mines = Math.min(mines, 255); // Number of mines
        /** @private {boolean} */
        this.gameOver = false;  // Flag to track if the game is over
        /** @private {boolean} */
        this.minesPlaced = false;  // Flag to indicate whether mines have been placed
        /** @private {Array<Array<number>>} */
        this.board = []; // The game board
        // Initialize count of revealed squares
        /** @private {number} */
        this.revealedCount = 0;
        /** @private {HTMLTableElement} */
        this.table = document.getElementById('board'); // HTML table element for the board

        this.renderBoard();
    }

    /**
     * Reset the game by reinitializing the board and game state.
     * @private
     */
    resetGame() {
        // Clear existing board
        this.board = [];
        this.table.innerHTML = '';

        // Reset revealed count
        this.revealedCount = 0;

        // Reset game-over flag
        this.gameOver = false;

        // Reset mines placed flag
        this.minesPlaced = false;

        // Just render the empty board
        this.renderBoard();
    }

    /**
     * Initialize the game board with zeros and place mines randomly.
     * @private
     * @param {number} firstClickX - The x-coordinate of the first clicked square.
     * @param {number} firstClickY - The y-coordinate of the first clicked square.
     */
    initBoard(firstClickX, firstClickY) {
        // Initialize board with zeros
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(0);
            }
            this.board.push(row);
        }

        // Randomly place mines
        let placedMines = 0;
        while (placedMines < this.mines) {
            const x = Math.floor(Math.random() * this.rows);
            const y = Math.floor(Math.random() * this.cols);
            if (this.board[x][y] === 0 && (x !== firstClickX || y !== firstClickY)) {
                this.board[x][y] = 2;
                placedMines++;
            }
        }
    }

    /**
     * Render the HTML table based on the board array.
     * @private
     */
    renderBoard() {
        for (let i = 0; i < this.rows; i++) {
            const tableRow = document.createElement('tr');
            for (let j = 0; j < this.cols; j++) {
                const tableCell = document.createElement('td');
                tableCell.className = 'dark-gray';
                tableCell.addEventListener('click', () => this.handleLeftClick(i, j));
                tableCell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j, tableCell);
                });

                tableCell.addEventListener('mousedown', (e) => {
                    if (e.button === 0) {  // Left click
                        this.leftMouseDown = true;
                    } else if (e.button === 2) {  // Right click
                        this.rightMouseDown = true;
                    }

                    if (this.leftMouseDown && this.rightMouseDown) {
                        this.handleBothButtonsClick(i, j);
                    }
                });

                tableCell.addEventListener('mouseup', () => {
                    this.leftMouseDown = false;
                    this.rightMouseDown = false;
                });

                tableRow.appendChild(tableCell);
            }
            this.table.appendChild(tableRow);
        }
    }

    /**
     * Reveal all mines on the board when the game is over, and mark incorrect flags.
     * @private
     */
    revealAllMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const tableRow = this.table.rows[i];
                const tableCell = tableRow.cells[j];
                if (this.board[i][j] === 2) {
                    // If the cell is not flagged, reveal it as a mine
                    if (tableCell.className !== 'flag-mine') {
                        tableCell.className = 'mine';
                    }
                } else if (tableCell.className === 'flag-mine') {
                    // If the cell is incorrectly flagged, mark it
                    tableCell.className = 'flag-wrong';
                }
            }
        }
    }

    /**
     * Handle the left-click event on a cell.
     * @private
     * @param {number} x - The row index of the clicked cell.
     * @param {number} y - The column index of the clicked cell.
     */
    handleLeftClick(x, y) {
        // If mines haven't been placed yet, initialize the board now
        if (!this.minesPlaced) {
            this.initBoard(x, y);
            this.minesPlaced = true;  // Set the flag to true
        }

        // If the game is over, reset it before doing anything else
        if (this.gameOver) {
            this.resetGame();
            return;
        }

        const tableRow = this.table.rows[x];
        const tableCell = tableRow.cells[y];

        // Skip if the cell is flagged.
        if (tableCell.className === 'flag-mine') return;

        // If it's a bomb, end the game.
        if (this.board[x][y] === 2) {
            this.revealAllMines();  // Reveal all mines
            tableCell.className = 'explode';
            this.showModal('Game Over');  // Show modal
            this.gameOver = true;  // Set game-over flag
            return;
        }

        // Reveal the square
        this.revealSquare(x, y);

        // Check for a win
        if (this.revealedCount === (this.rows * this.cols) - this.mines) {
            this.showModal('You Win!');  // Show modal
            this.gameOver = true;  // Set game-over flag
        }
    }

    /**
     * Reveal a square and its adjacent squares if it's empty.
     * @private
     * @param {number} x - The row index.
     * @param {number} y - The column index.
     */
    revealSquare(x, y) {
        if (x < 0 || x >= this.rows || y < 0 || y >= this.cols) return;

        const tableRow = this.table.rows[x];
        const tableCell = tableRow.cells[y];

        if (tableCell.className !== 'dark-gray') return;  // Already revealed or flagged

        // Count adjacent mines
        let mineCount = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const newX = x + dx, newY = y + dy;
                if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.cols) {
                    if (this.board[newX][newY] === 2) mineCount++;
                }
            }
        }

        if (mineCount > 0) {
            tableCell.textContent = `${mineCount}`;
            tableCell.className = 'light-gray';
        } else {
            tableCell.className = 'light-gray';
            // Recursively reveal adjacent squares
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    this.revealSquare(x + dx, y + dy);
                }
            }
        }

        this.revealedCount++;
    }

    /**
     * Handle the right-click event on a cell.
     * @private
     * @param {number} x - The row index of the clicked cell.
     * @param {number} y - The column index of the clicked cell.
     * @param {HTMLElement} tableCell - The clicked HTML cell element.
     */
    handleRightClick(x, y, tableCell) {
        // If the game is over, reset it before doing anything else
        if (this.gameOver) {
            this.resetGame();
            return;
        }

        if (tableCell.className === 'dark-gray') {
            tableCell.className = 'flag-mine';
        } else if (tableCell.className === 'flag-mine') {
            tableCell.className = 'dark-gray';
        }
    }

    /**
     * Handle the simultaneous left and right-click on a cell.
     * @private
     * @param {number} x - The row index of the clicked cell.
     * @param {number} y - The column index of the clicked cell.
     */
    handleBothButtonsClick(x, y) {
        const tableRow = this.table.rows[x];
        const tableCell = tableRow.cells[y];

        // Count adjacent flags
        let flagCount = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const newX = x + dx, newY = y + dy;
                if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.cols) {
                    const adjacentCell = this.table.rows[newX].cells[newY];
                    if (adjacentCell.className === 'flag-mine') {
                        flagCount++;
                    }
                }
            }
        }

        // If the count of adjacent flags matches the number in the cell, reveal adjacent cells
        if (parseInt(tableCell.textContent, 10) === flagCount) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const newX = x + dx, newY = y + dy;
                    if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.cols) {
                        const adjacentCell = this.table.rows[newX].cells[newY];
                        if (adjacentCell.className !== 'flag-mine') {  // Skip flagged cells
                            this.handleLeftClick(newX, newY);
                        }

                        if (this.gameOver) return;
                    }
                }
            }
        }
    }

    /**
     * Show a modal popup with a message.
     * @private
     * @param {string} message - The message to display.
     */
    showModal(message) {
        const modal = document.getElementById('myModal');
        const span = document.getElementsByClassName('close')[0];
        const modalText = document.getElementById('modalText');

        modalText.innerHTML = message;
        modal.style.display = 'block';

        span.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Initialize the Minesweeper game with 16 rows, 16 columns, and 40 mines.
new Minesweeper(16, 16, 40);
