import { Tetris } from "./tetris.js";
import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  SAD,
  TETROMINOES,
  TETROMINO_NAMES,
  convertPositionToIndex,
} from "./utilities.js";

//=== DOM-элементы ===//

const gridElement = document.querySelector(".grid");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");
const nextQueueElement = document.querySelector(".next-queue");
const nameInput = document.querySelector("#player-name");

//=== Построение поля ===//

const totalCells = PLAYFIELD_COLUMNS * PLAYFIELD_ROWS;

for (let i = 0; i < totalCells; i++) {
  const div = document.createElement("div");
  gridElement.appendChild(div);
}

const cells = document.querySelectorAll(".grid>div");

//=== Состояние игры ===//

let tetris = loadGame();
let isGameOverFinished = false;
let playerName = loadPlayerName();

//=== Состояние цикла и отрисовки ===//

let dropInterval = 700;
let timeSinceLastDrop = 0;
let lastUpdateTime = performance.now();
let animationFrameId = null;
let renderedQueueKey = "";

//=== Запуск ===//

nameInput.value = playerName;
nameInput.addEventListener("input", onNameInput);

initKeydown();
draw();
startLoop();

//=== Игровой цикл ===//

function startLoop() {
  lastUpdateTime = performance.now();
  timeSinceLastDrop = 0;
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(update);
}

function stopLoop() {
  cancelAnimationFrame(animationFrameId);
}

function update(time) {
  const deltaTime = Math.min(time - lastUpdateTime, 100);
  lastUpdateTime = time;

  timeSinceLastDrop += deltaTime;
  if (timeSinceLastDrop >= dropInterval) {
    timeSinceLastDrop -= dropInterval;
    tetris.moveTetrominoDown();
    saveGame();
  }
  draw();

  if (tetris.isGameOver) {
    gameOver();
    return;
  }
  animationFrameId = requestAnimationFrame(update);
}

//=== Состояние игры ===//

function gameOver() {
  stopLoop();
  try {
    localStorage.removeItem("tetris-save");
  } catch {}
  gameOverAnimation();
}

function gameOverAnimation() {
  const filledCells = [...cells].filter((cell) => cell.classList.length > 0);
  filledCells.forEach((cell, i) => {
    setTimeout(() => cell.classList.add("hide"), i * 10);
    setTimeout(() => cell.removeAttribute("class"), i * 10 + 500);
  });
  setTimeout(
    () => {
      drawSad();
      isGameOverFinished = true;
    },
    filledCells.length * 10 + 1000,
  );
}

function restartGame() {
  isGameOverFinished = false;
  renderedQueueKey = "";
  try {
    localStorage.removeItem("tetris-save");
  } catch {}
  tetris = new Tetris();
  startLoop();
}

//=== Ввод ===//

function initKeydown() {
  document.addEventListener("keydown", onKeydown);
}

function onKeydown(event) {
  if (event.target.tagName === "INPUT") return;

  if (isGameOverFinished) {
    restartGame();
    return;
  }

  if (tetris.isGameOver) return;

  switch (event.key) {
    case "ArrowUp":
      tetris.rotateTetromino();
      break;
    case "ArrowDown":
      tetris.moveTetrominoDown();
      break;
    case "ArrowLeft":
      tetris.moveTetrominoLeft();
      break;
    case "ArrowRight":
      tetris.moveTetrominoRight();
      break;
    case " ":
      tetris.dropTetrominoDown();
      break;
    default:
      break;
  }
  saveGame();
}

function onNameInput(event) {
  playerName = event.target.value.slice(0, 10);
  try {
    localStorage.setItem("tetris-player-name", playerName);
  } catch {}
}

//=== Отрисовка ===//

function draw() {
  cells.forEach((cell) => cell.removeAttribute("class"));
  drawPlayfield();
  drawTetromino();
  drawGhostTetromino();
  drawScore();
  drawNextQueue();
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
  const size = tetris.tetromino.matrix.length;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.row + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.row + row,
        tetris.tetromino.column + column,
      );
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetromino() {
  const size = tetris.tetromino.matrix.length;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.ghostRow + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.ghostRow + row,
        tetris.tetromino.ghostColumn + column,
      );
      cells[cellIndex].classList.add("ghost");
    }
  }
}

function drawNextQueue() {
  if (!nextQueueElement) return;

  const queueKey = tetris.nextQueue.join("");
  if (queueKey === renderedQueueKey) return;
  renderedQueueKey = queueKey;
  nextQueueElement.replaceChildren();

  tetris.nextQueue.forEach((shapeName) => {
    const matrix = TETROMINOES[shapeName];
    const container = document.createElement("div");
    container.className = "next-item";

    const miniGrid = document.createElement("div");
    miniGrid.className = "mini-grid";
    miniGrid.style.gridTemplateColumns = `repeat(${matrix.length}, 1fr)`;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const cell = document.createElement("div");
        cell.className = "mini-cell";
        if (matrix[r][c]) {
          cell.classList.add(shapeName);
        }
        miniGrid.appendChild(cell);
      }
    }
    container.appendChild(miniGrid);
    nextQueueElement.appendChild(container);
  });
}

function drawSad() {
  const TOP_OFFSET = 5;
  for (let row = 0; row < SAD.length; row++) {
    for (let column = 0; column < SAD[0].length; column++) {
      if (!SAD[row][column]) continue;
      const cellIndex = convertPositionToIndex(TOP_OFFSET + row, column);
      cells[cellIndex].classList.add("sad");
    }
  }
}

//=== Сохранение и загрузка ===//

function saveGame() {
  if (tetris.isGameOver) return;
  try {
    localStorage.setItem("tetris-save", JSON.stringify(tetris));
  } catch {}
}

function loadGame() {
  try {
    const savedData = localStorage.getItem("tetris-save");
    if (!savedData) return new Tetris();

    const parsedData = JSON.parse(savedData);
    if (!isValidSave(parsedData)) throw new Error("повреждённое сохранение");

    const game = new Tetris();
    game.playfield = parsedData.playfield;
    game.tetromino = {
      ...parsedData.tetromino,
      ghostRow: parsedData.tetromino.row,
      ghostColumn: parsedData.tetromino.column,
    };
    game.nextQueue = parsedData.nextQueue;
    game.isGameOver = parsedData.isGameOver;
    game.score = parsedData.score;

    if (!game.isValid()) throw new Error("некорректное положение фигуры");
    game.calculateGhostPosition();
    return game;
  } catch {
    try {
      localStorage.removeItem("tetris-save");
    } catch {}
    return new Tetris();
  }
}

function isValidSave(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  if (
    !Array.isArray(data.playfield) ||
    data.playfield.length !== PLAYFIELD_ROWS ||
    !data.playfield.every(
      (row) =>
        Array.isArray(row) &&
        row.length === PLAYFIELD_COLUMNS &&
        row.every((cell) => cell === 0 || TETROMINO_NAMES.includes(cell)),
    )
  ) {
    return false;
  }

  const piece = data.tetromino;
  if (
    !piece ||
    !TETROMINO_NAMES.includes(piece.name) ||
    !Array.isArray(piece.matrix) ||
    !Number.isInteger(piece.row) ||
    !Number.isInteger(piece.column) ||
    piece.row < -4 ||
    piece.row >= PLAYFIELD_ROWS ||
    piece.column < -4 ||
    piece.column >= PLAYFIELD_COLUMNS
  ) {
    return false;
  }

  const matrixSize = TETROMINOES[piece.name].length;
  if (
    piece.matrix.length !== matrixSize ||
    !piece.matrix.every(
      (row) =>
        Array.isArray(row) &&
        row.length === matrixSize &&
        row.every((cell) => cell === 0 || cell === 1),
    )
  ) {
    return false;
  }

  const cellsCount = piece.matrix.flat().filter(Boolean).length;
  if (cellsCount !== 4) return false;

  if (
    !Array.isArray(data.nextQueue) ||
    data.nextQueue.length !== 3 ||
    !data.nextQueue.every((name) => TETROMINO_NAMES.includes(name))
  ) {
    return false;
  }

  if (
    typeof data.isGameOver !== "boolean" ||
    !Number.isFinite(data.score) ||
    data.score < 0
  ) {
    return false;
  }
  return true;
}

function loadPlayerName() {
  try {
    const value = localStorage.getItem("tetris-player-name");
    return typeof value === "string" ? value.slice(0, 10) : "";
  } catch {
    return "";
  }
}
