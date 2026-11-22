import { MAX_NAME_LENGTH } from "../game/storage";

interface PlayerNameProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlayerName({ value, onChange }: PlayerNameProps) {
  return (
    <div className="player">
      <label htmlFor="player-name">ИГРОК</label>
      <input
        id="player-name"
        type="text"
        maxLength={MAX_NAME_LENGTH}
        autoComplete="off"
        placeholder="Имя"
        value={value}
        onChange={(event) =>
          onChange(event.target.value.slice(0, MAX_NAME_LENGTH))
        }
      />
    </div>
  );
}
