import { useCallback, useEffect, useReducer, useState } from "react";
import { countFilledCells, getGameOverDuration } from "../game/getCellClasses";
import { clearSavedGame, loadGame, saveGame } from "../game/storage";
import { KEY_TO_ACTION, applyAction } from "../game/actions";
import { Tetris } from "../game/tetris";
import { useGameOverElapsed } from "./useGameOverElapsed";

const DROP_INTERVAL_MS = 700;

export function useTetris() {
  const [game, setGame] = useState(loadGame);
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const duration = game.isGameOver
    ? getGameOverDuration(countFilledCells(game))
    : 0;
  const gameOverElapsed = useGameOverElapsed(game.isGameOver, duration);
  const isGameOverFinished =
    gameOverElapsed !== null && gameOverElapsed >= duration;

  const commit = useCallback((current: Tetris) => {
    saveGame(current);
    if (current.isGameOver) clearSavedGame();
    rerender();
  }, []);

  useEffect(() => {
    if (game.isGameOver) return;

    let lastTime = performance.now();
    let sinceLastDrop = 0;
    let frameId = 0;

    const frame = (time: number) => {
      sinceLastDrop += Math.min(time - lastTime, 100);
      lastTime = time;

      if (sinceLastDrop >= DROP_INTERVAL_MS) {
        sinceLastDrop -= DROP_INTERVAL_MS;
        game.moveTetrominoDown();
        commit(game);
      }

      if (game.isGameOver) return;
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [game, commit]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      if (game.isGameOver) {
        if (isGameOverFinished) {
          clearSavedGame();
          setGame(new Tetris(game.highScore));
        }
        return;
      }

      const action = KEY_TO_ACTION[event.key];
      if (!action) return;
      applyAction(game, action);
      commit(game);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [game, isGameOverFinished, commit]);

  return { game, gameOverElapsed };
}
