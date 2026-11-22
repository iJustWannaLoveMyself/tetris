import { useEffect, useState } from "react";

export function useGameOverElapsed(
  active: boolean,
  duration: number,
): number | null {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;

    const start = performance.now();
    const id = setInterval(() => {
      const time = performance.now() - start;
      if (time >= duration) {
        clearInterval(id);
        setElapsed(duration);
      } else {
        setElapsed(time);
      }
    }, 16);

    return () => {
      clearInterval(id);
      setElapsed(0);
    };
  }, [active, duration]);

  return active ? elapsed : null;
}
