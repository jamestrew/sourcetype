import { KeyboardEvent, FC, useState } from "react";
// import { invalidInputs } from "../utils/input";
// import { Cursor } from "./Cursor";
import { WordList } from "components/WordList";

interface ICodeWrapper {
  codeBlock: string;
}

const cursorJump = 7.5; // TODO: this will have to be tweaked based on font size

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const [cursorPos, setCursorPos] = useState({ x: 1, y: 25 });
  const [typed, setTyped] = useState<string[]>([]);

  const handleCursorMovement = (key: string) => {
    setCursorPos({
      x:
        key === "Backspace"
          ? cursorPos.x - cursorJump
          : cursorPos.x + cursorJump,
      y: cursorPos.y,
    });
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    handleCursorMovement(event.key);
    if (event.key === "Backspace") {
      typed.pop();
    } else {
      typed.push(event.key);
    }
    setTyped([...typed]);
    console.log(typed.reduce((r, i) => r + i, ""));
  };

  return (
    <main>
      <p>&laquo;main content&raquo;</p>
      <input
        id="codeInput"
        tabIndex={0}
        autoComplete="off"
        onKeyPress={handleKeyPress}
        onKeyDown={(e) => e.key === "Backspace" && handleKeyPress(e)}
        autoFocus
      />
      {/* <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} /> */}
      <WordList next={typed}>{codeBlock}</WordList>
    </main>
  );
};
