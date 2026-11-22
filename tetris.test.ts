import { describe, it, expect } from "vitest";
import { Tetris } from "./src/game/tetris";

describe("Правила", () => {
  it("1) Метод moveTetrominoLeft смещает фигуру влево и не выводит её за границу поля", () => {
    const game = new Tetris();
    const initialColumn = game.tetromino.column;

    game.moveTetrominoLeft();
    expect(game.tetromino.column).toBe(initialColumn - 1);

    for (let i = 0; i < 10; i++) {
      game.moveTetrominoLeft();
    }

    const minColumnAfterWallHit = game.tetromino.column;

    game.moveTetrominoLeft();
    expect(game.tetromino.column).toBe(minColumnAfterWallHit);

    const matrixSize = game.tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (game.tetromino.matrix[row][column]) {
          const absoluteColumn = game.tetromino.column + column;
          expect(absoluteColumn).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("2) Метод rotateTetromino изменяет матрицу текущей фигуры", () => {
    const game = new Tetris();
    const oldMatrix = JSON.stringify(game.tetromino.matrix);
    game.rotateTetromino();
    const newMatrix = JSON.stringify(game.tetromino.matrix);

    if (game.tetromino.name !== "O") {
      expect(newMatrix).not.toBe(oldMatrix);
    } else {
      expect(newMatrix).toBe(oldMatrix);
    }
  });

  it("3) Метод dropTetrominoDown фиксирует фигуру и генерирует новую", () => {
    const game = new Tetris();
    const previousTetromino = game.tetromino;

    game.dropTetrominoDown();

    expect(game.tetromino).not.toBe(previousTetromino);
  });
});
