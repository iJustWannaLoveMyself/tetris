import type { Tetris } from "./tetris";
import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  SAD,
  convertPositionToIndex,
} from "./utilities";
import type { Matrix } from "./utilities";

const TOTAL_CELLS = PLAYFIELD_COLUMNS * PLAYFIELD_ROWS;
const SAD_TOP_OFFSET = 5;

const STAGGER_MS = 10;
const HIDE_MS = 500;
const SAD_DELAY_MS = 1000;

const SAD_CELLS: number[] = [];
SAD.forEach((line, row) => {
  line.forEach((value, column) => {
    if (value) {
      SAD_CELLS.push(convertPositionToIndex(SAD_TOP_OFFSET + row, column));
    }
  });
});

function addPiece(
  cells: string[][],
  matrix: Matrix,
  top: number,
  left: number,
  className: string,
): void {
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix.length; column++) {
      if (!matrix[row][column]) continue;
      if (top + row < 0) continue;
      cells[convertPositionToIndex(top + row, left + column)]?.push(className);
    }
  }
}

function getBaseCells(game: Tetris): string[][] {
  const cells: string[][] = Array.from({ length: TOTAL_CELLS }, () => []);

  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      const name = game.playfield[row][column];
      if (name) cells[convertPositionToIndex(row, column)].push(name);
    }
  }

  const { tetromino } = game;
  addPiece(
    cells,
    tetromino.matrix,
    tetromino.row,
    tetromino.column,
    tetromino.name,
  );
  addPiece(
    cells,
    tetromino.matrix,
    tetromino.ghostRow,
    tetromino.ghostColumn,
    "ghost",
  );

  return cells;
}

export function countFilledCells(game: Tetris): number {
  return getBaseCells(game).filter((classes) => classes.length > 0).length;
}

export function getGameOverDuration(filledCount: number): number {
  return filledCount * STAGGER_MS + SAD_DELAY_MS;
}

export function getCellClasses(
  game: Tetris,
  gameOverElapsed: number | null = null,
): string[] {
  const cells = getBaseCells(game);

  if (gameOverElapsed === null) {
    return cells.map((classes) => classes.join(" "));
  }

  let order = 0;
  const result = cells.map((classes) => {
    if (classes.length === 0) return "";
    const startAt = order * STAGGER_MS;
    order++;
    if (gameOverElapsed >= startAt + HIDE_MS) return "";
    if (gameOverElapsed >= startAt) return [...classes, "hide"].join(" ");
    return classes.join(" ");
  });

  if (gameOverElapsed >= getGameOverDuration(order)) {
    SAD_CELLS.forEach((index) => {
      result[index] = "sad";
    });
  }

  return result;
}
