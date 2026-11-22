import { TETROMINOES } from "../game/utilities";
import type { TetrominoName } from "../game/utilities";

export function NextQueue({ queue }: { queue: readonly TetrominoName[] }) {
  return (
    <div className="next-queue">
      {queue.map((name, index) => {
        const matrix = TETROMINOES[name];
        return (
          <div className="next-item" key={name}>
            <div
              className="mini-grid"
              style={{ gridTemplateColumns: `repeat(${matrix.length}, 1fr)` }}
            >
              {matrix.flatMap((line, r) =>
                line.map((filled, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={filled ? `mini-cell ${name}` : "mini-cell"}
                  />
                )),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
