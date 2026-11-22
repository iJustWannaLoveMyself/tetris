interface ScoreBoardProps {
  score: number;
  highScore: number;
}

export function ScoreBoard({ score, highScore }: ScoreBoardProps) {
  return (
    <div className="score-board">
      <div>
        СЧЁТ: <span>{score}</span>
      </div>
      <div>
        РЕКОРД: <span>{highScore}</span>
      </div>
    </div>
  );
}
