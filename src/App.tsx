import { useState } from "react";
import { Board } from "./components/Board";
import { NextQueue } from "./components/NextQueue";
import { PlayerName } from "./components/PlayerName";
import { ScoreBoard } from "./components/ScoreBoard";
import { loadPlayerName, savePlayerName } from "./game/storage";
import { useTetris } from "./hooks/useTetris";

export default function App() {
  const { game, gameOverElapsed } = useTetris();
  const [playerName, setPlayerName] = useState(loadPlayerName);

  function handleNameChange(value: string) {
    setPlayerName(value);
    savePlayerName(value);
  }

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <ScoreBoard score={game.score} highScore={game.highScore} />
        <Board game={game} gameOverElapsed={gameOverElapsed} />
      </div>
      <div className="sidebar">
        <PlayerName value={playerName} onChange={handleNameChange} />
        <h3>ДАЛЕЕ</h3>
        <NextQueue queue={game.nextQueue} />
      </div>
    </div>
  );
}
