import { Tetris } from "./tetris";
import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  TETROMINOES,
  isTetrominoName,
} from "./utilities";
import type { ActiveTetromino, Playfield, TetrominoName } from "./utilities";

const SAVE_KEY = "tetris-save";
const HIGH_SCORE_KEY = "tetris-high-score";
const PLAYER_NAME_KEY = "tetris-player-name";

export const MAX_NAME_LENGTH = 10;

interface SavedGame {
  playfield: Playfield;
  tetromino: Pick<ActiveTetromino, "name" | "matrix" | "row" | "column">;
  nextQueue: TetrominoName[];
  isGameOver: boolean;
  score: number;
}

export function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (raw === null) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(value: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch {
    //
  }
}

export function saveGame(game: Tetris): void {
  saveHighScore(game.highScore);
  if (game.isGameOver) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  } catch {
    //
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    //
  }
}

export function loadGame(): Tetris {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return new Tetris(loadHighScore());

    const parsedData: unknown = JSON.parse(savedData);
    if (!isValidSave(parsedData)) throw new Error("повреждённое сохранение");

    const game = new Tetris(loadHighScore());
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
    clearSavedGame();
    return new Tetris(loadHighScore());
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInt(value: unknown): value is number {
  return Number.isInteger(value);
}

function isValidSave(data: unknown): data is SavedGame {
  if (!isRecord(data)) return false;

  const { playfield, tetromino, nextQueue, isGameOver, score } = data;

  if (
    !Array.isArray(playfield) ||
    playfield.length !== PLAYFIELD_ROWS ||
    !playfield.every(
      (row) =>
        Array.isArray(row) &&
        row.length === PLAYFIELD_COLUMNS &&
        row.every((cell) => cell === 0 || isTetrominoName(cell)),
    )
  ) {
    return false;
  }

  if (!isRecord(tetromino)) return false;
  const { name, matrix, row, column } = tetromino;

  if (
    !isTetrominoName(name) ||
    !Array.isArray(matrix) ||
    !isInt(row) ||
    !isInt(column) ||
    row < -4 ||
    row >= PLAYFIELD_ROWS ||
    column < -4 ||
    column >= PLAYFIELD_COLUMNS
  ) {
    return false;
  }

  const matrixSize = TETROMINOES[name].length;
  if (
    matrix.length !== matrixSize ||
    !matrix.every(
      (line) =>
        Array.isArray(line) &&
        line.length === matrixSize &&
        line.every((cell) => cell === 0 || cell === 1),
    )
  ) {
    return false;
  }

  const filledCells = matrix.flat().filter(Boolean).length;
  if (filledCells !== 4) return false;

  if (
    !Array.isArray(nextQueue) ||
    nextQueue.length !== 3 ||
    !nextQueue.every(isTetrominoName) ||
    new Set(nextQueue).size !== 3
  ) {
    return false;
  }

  if (
    isGameOver !== false ||
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    score < 0
  ) {
    return false;
  }

  return true;
}

export function loadPlayerName(): string {
  try {
    const value = localStorage.getItem(PLAYER_NAME_KEY);
    return typeof value === "string" ? value.slice(0, MAX_NAME_LENGTH) : "";
  } catch {
    return "";
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name.slice(0, MAX_NAME_LENGTH));
  } catch {
    //
  }
}
