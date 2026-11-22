import { getCellClasses } from "../game/getCellClasses";
import type { Tetris } from "../game/tetris";

interface BoardProps {
  game: Tetris;
  gameOverElapsed: number | null;
}

export function Board({ game, gameOverElapsed }: BoardProps) {
  const classes = getCellClasses(game, gameOverElapsed);

  return (
    <div className="grid">
      {classes.map((className, index) => (
        <div key={index} className={className || undefined} />
      ))}
    </div>
  );
}
