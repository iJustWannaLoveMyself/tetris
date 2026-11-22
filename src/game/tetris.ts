import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  TETROMINO_NAMES,
  TETROMINOES,
  getRandomElement,
  rotateMatrix,
} from "./utilities";
import type {
  ActiveTetromino,
  Playfield,
  PlayfieldCell,
  TetrominoName,
} from "./utilities";

const POINTS_BY_LINES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export class Tetris {
  playfield: Playfield = [];
  tetromino!: ActiveTetromino;
  nextQueue: TetrominoName[] = [];
  isGameOver = false;
  score = 0;
  highScore: number;

  constructor(highScore = 0) {
    this.highScore = highScore;
    this.init();
  }

  init(): void {
    this.generatePlayfield();
    while (this.nextQueue.length < 3) {
      this.addUniqueRandomTetromino();
    }
    this.generateTetromino();
  }

  private createEmptyRow(): PlayfieldCell[] {
    return new Array<PlayfieldCell>(PLAYFIELD_COLUMNS).fill(0);
  }

  generatePlayfield(): void {
    this.playfield = Array.from({ length: PLAYFIELD_ROWS }, () =>
        this.createEmptyRow(),
    );
  }

  addUniqueRandomTetromino(): void {
    const availableNames = TETROMINO_NAMES.filter(
        (name) => !this.nextQueue.includes(name),
    );
    const pool = availableNames.length > 0 ? availableNames : TETROMINO_NAMES;
    const name = getRandomElement(pool);
    this.nextQueue.push(name);
  }

  generateTetromino(): void {
    const name = this.nextQueue.shift();
    if (name === undefined) {
      throw new Error("Очередь фигур пуста");
    }
    this.addUniqueRandomTetromino();

    const matrix = TETROMINOES[name];
    const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const row = -2;

    this.tetromino = {
      name,
      matrix,
      row,
      column,
      ghostColumn: column,
      ghostRow: row,
    };

    this.calculateGhostPosition();
  }

  moveTetrominoDown(): void {
    this.tetromino.row += 1;
    if (!this.isValid()) {
      this.tetromino.row -= 1;
      this.placeTetromino();
    }
  }

  moveTetrominoLeft(): void {
    this.tetromino.column -= 1;
    if (!this.isValid()) {
      this.tetromino.column += 1;
    } else {
      this.calculateGhostPosition();
    }
  }

  moveTetrominoRight(): void {
    this.tetromino.column += 1;
    if (!this.isValid()) {
      this.tetromino.column -= 1;
    } else {
      this.calculateGhostPosition();
    }
  }

  rotateTetromino(): void {
    const oldMatrix = this.tetromino.matrix;
    this.tetromino.matrix = rotateMatrix(oldMatrix);
    if (!this.isValid()) {
      this.tetromino.matrix = oldMatrix;
    } else {
      this.calculateGhostPosition();
    }
  }

  dropTetrominoDown(): void {
    this.tetromino.row = this.tetromino.ghostRow;
    this.placeTetromino();
  }

  isValid(): boolean {
    const matrixSize = this.tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (!this.tetromino.matrix[row][column]) continue;
        if (this.isOutsideOfGameBoard(row, column)) return false;
        if (this.isCollides(row, column)) return false;
      }
    }
    return true;
  }

  isOutsideOfGameBoard(row: number, column: number): boolean {
    return (
        this.tetromino.column + column < 0 ||
        this.tetromino.column + column >= PLAYFIELD_COLUMNS ||
        this.tetromino.row + row >= this.playfield.length
    );
  }

  isCollides(row: number, column: number): boolean {
    return Boolean(
        this.playfield[this.tetromino.row + row]?.[
        this.tetromino.column + column
            ],
    );
  }

  placeTetromino(): void {
    const matrixSize = this.tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (!this.tetromino.matrix[row][column]) continue;
        if (this.isOutsideOfTopBoard(row)) {
          this.isGameOver = true;
          return;
        }

        this.playfield[this.tetromino.row + row][
        this.tetromino.column + column
            ] = this.tetromino.name;
      }
    }

    this.processFilledRows();
    this.generateTetromino();
  }

  isOutsideOfTopBoard(row: number): boolean {
    return this.tetromino.row + row < 0;
  }

  processFilledRows(): void {
    const filledLines = this.findFilledRows();
    if (filledLines.length > 0) {
      this.calculateScore(filledLines.length);
      this.removeFilledRows(filledLines);
    }
  }

  calculateScore(clearedLines: number): void {
    this.score += POINTS_BY_LINES[clearedLines] ?? 0;

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  findFilledRows(): number[] {
    const filledRows: number[] = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
      if (this.playfield[row].every((cell) => Boolean(cell))) {
        filledRows.push(row);
      }
    }
    return filledRows;
  }

  removeFilledRows(filledRows: number[]): void {
    filledRows.forEach((row) => {
      this.dropRowsAbove(row);
    });
  }

  dropRowsAbove(rowToDelete: number): void {
    for (let row = rowToDelete; row > 0; row--) {
      this.playfield[row] = this.playfield[row - 1];
    }
    this.playfield[0] = this.createEmptyRow();
  }

  calculateGhostPosition(): void {
    const tetrominoRow = this.tetromino.row;
    this.tetromino.row++;
    while (this.isValid()) {
      this.tetromino.row++;
    }
    this.tetromino.ghostRow = this.tetromino.row - 1;
    this.tetromino.ghostColumn = this.tetromino.column;
    this.tetromino.row = tetrominoRow;
  }
}