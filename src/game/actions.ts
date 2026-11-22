import type { Tetris } from "./tetris";

export type GameAction =
  "moveLeft" | "moveRight" | "moveDown" | "rotate" | "hardDrop";

export const KEY_TO_ACTION: Readonly<Partial<Record<string, GameAction>>> = {
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  ArrowDown: "moveDown",
  ArrowUp: "rotate",
  " ": "hardDrop",
};

export function applyAction(game: Tetris, action: GameAction): void {
  switch (action) {
    case "moveLeft":
      game.moveTetrominoLeft();
      break;
    case "moveRight":
      game.moveTetrominoRight();
      break;
    case "moveDown":
      game.moveTetrominoDown();
      break;
    case "rotate":
      game.rotateTetromino();
      break;
    case "hardDrop":
      game.dropTetrominoDown();
      break;
    default: {
      const unreachable: never = action;
      throw new Error(`Неизвестное действие: ${String(unreachable)}`);
    }
  }
}
