import {Tetris} from "./tetris.js";
import {PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, SAD, convertPositionToIndex} from "./utilities.js";

let requestId;
let timeoutId;

let tetris = loadGame();

const gridElement = document.querySelector('.grid');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');

const totalCells = PLAYFIELD_COLUMNS * PLAYFIELD_ROWS;

for (let i = 0; i < totalCells; i++) {
    const div = document.createElement('div');
    gridElement.appendChild(div);
}

const cells = document.querySelectorAll('.grid>div');

let isGameOverFinished = false;

initKeydown();
draw();
moveDown();

function initKeydown() {
    document.addEventListener('keydown', onKeydown);
}

function onKeydown(event) {
    if (isGameOverFinished) {
        restartGame();
        return;
    }

    if (tetris.isGameOver) return;

    switch (event.key) {
        case 'ArrowUp':
            rotate();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case ' ':
            dropDown();
            break;
        default:
            break;
    }
}

function moveDown() {
    tetris.moveTetrominoDown();
    draw();
    saveGame();
    stopLoop();
    startLoop();

    if (tetris.isGameOver) {
        gameOver();
    }
}

function moveLeft() {
    tetris.moveTetrominoLeft();
    draw();
    saveGame();
}

function moveRight() {
    tetris.moveTetrominoRight();
    draw();
    saveGame();
}

function rotate() {
    tetris.rotateTetromino();
    draw();
    saveGame();
}

function dropDown() {
    tetris.dropTetrominoDown();
    draw();
    saveGame();
    stopLoop();
    startLoop();

    if (tetris.isGameOver) {
        gameOver();
    }
}

function startLoop() {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), 700);
}

function stopLoop() {
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}

function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayfield();
    drawTetromino();
    drawGhostTetromino();
    drawScore();
}

function drawScore() {
    scoreElement.textContent = tetris.score;
    highScoreElement.textContent = tetris.highScore;
}

function drawPlayfield() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (!tetris.playfield[row][column]) continue;
            const name = tetris.playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetris.tetromino.name;
    const tetrominoMatrixSize = tetris.tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetris.tetromino.matrix[row][column]) continue;
            if (tetris.tetromino.row + row < 0) continue;
            const cellIndex = convertPositionToIndex(tetris.tetromino.row + row, tetris.tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawGhostTetromino() {
    const tetrominoMatrixSize = tetris.tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetris.tetromino.matrix[row][column]) continue;
            if (tetris.tetromino.ghostRow + row < 0) continue;
            const cellIndex = convertPositionToIndex(tetris.tetromino.ghostRow + row, tetris.tetromino.ghostColumn + column);
            cells[cellIndex].classList.add('ghost');
        }
    }
}

function gameOver() {
    stopLoop();
    localStorage.removeItem('tetris-save');
    gameOverAnimation();
}

function gameOverAnimation() {
    const filledCells = [...cells].filter(cell => cell.classList.length > 0);
    filledCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('hide'), i * 10);
        setTimeout(() => cell.removeAttribute('class'), i * 10 + 500);
    });

    setTimeout(() => {
        drawSad();
        isGameOverFinished = true;
    }, filledCells.length * 10 + 1000);
}

function drawSad() {
    const TOP_OFFSET = 5;
    for (let row = 0; row < SAD.length; row++) {
        for (let column = 0; column < SAD[0].length; column++) {
            if (!SAD[row][column]) continue;
            const cellIndex = convertPositionToIndex(TOP_OFFSET + row, column);
            cells[cellIndex].classList.add('sad');
        }
    }
}

function restartGame() {
    isGameOverFinished = false;
    localStorage.removeItem('tetris-save');
    tetris = new Tetris();
    draw();
    moveDown();
}

function saveGame() {
    if (tetris.isGameOver) return;
    localStorage.setItem('tetris-save', JSON.stringify(tetris));
}

function loadGame() {
    const savedData = localStorage.getItem('tetris-save');
    if (!savedData) {
        return new Tetris();
    }

    try {
        const parsedData = JSON.parse(savedData);
        const game = new Tetris();
        game.playfield = parsedData.playfield;
        game.tetromino = parsedData.tetromino;
        game.isGameOver = parsedData.isGameOver;
        game.score = parsedData.score || 0;
        return game;
    } catch (e) {
        console.error('Ошибка при загрузке сохранения:', e);
        return new Tetris();
    }
}