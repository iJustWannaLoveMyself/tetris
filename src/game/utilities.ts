import { sample } from "lodash-es";

export type TetrominoName = (typeof TETROMINO_NAMES)[number];
export type Matrix = number[][];
export type PlayfieldCell = 0 | TetrominoName;
export type Playfield = PlayfieldCell[][];

export interface ActiveTetromino {
  name: TetrominoName;
  matrix: Matrix;
  row: number;
  column: number;
  ghostRow: number;
  ghostColumn: number;
}

export const PLAYFIELD_COLUMNS = 10;
export const PLAYFIELD_ROWS = 20;
export const TETROMINO_NAMES = ["I", "J", "L", "O", "S", "Z", "T"] as const;
export const TETROMINOES: Record<TetrominoName, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export function isTetrominoName(value: unknown): value is TetrominoName {
  return (TETROMINO_NAMES as readonly unknown[]).includes(value);
}

export function getRandomElement<T>(array: readonly T[]): T {
  const element = sample(array);
  if (element === undefined) {
    throw new Error("getRandomElement: пустой массив");
  }
  return element;
}

export function convertPositionToIndex(row: number, column: number): number {
  return row * PLAYFIELD_COLUMNS + column;
}

export function rotateMatrix(matrix: Matrix): Matrix {
  const N = matrix.length;
  const rotatedMatrix: Matrix = [];
  for (let i = 0; i < N; i++) {
    rotatedMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotatedMatrix[i][j] = matrix[N - j - 1][i];
    }
  }
  return rotatedMatrix;
}

export const SAD: Matrix = [
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
];
