import { KeyboardEvent, FC, useState } from "react";
// import { invalidInputs } from "../utils/input";
import { Cursor } from "./Cursor";
import { WordList } from "components/WordList";

interface ICodeWrapper {
  codeBlock: string;
}

// TODO: this will have to be tweaked based on font size
export const curXStep = 0.582;
export const curYStep = 7.5;
export const cursorStart = { x: 0, y: 0.1875 };

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const [cursorPos, setCursorPos] = useState(cursorStart);
  const [typed, setTyped] = useState<string[]>([]);
  console.log(`[${typed}] - len: ${typed.length}`)

  const getCursorMovement = (key: string) => {
    if (key === "Backspace") {
      if (typed.length === 0) return cursorPos;
      cursorPos.x -= curXStep;
    } else {
      cursorPos.x += curXStep;
    }
    return cursorPos;
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCursorPos(getCursorMovement(event.key));

    if (event.key === "Backspace") {
      typed.pop();
    } else {
      typed.push(event.key);
    }
    setTyped([...typed]);
    console.log(typed.reduce((r, i) => r + i, ""));
  };

  return (
    <>
      <div className="CodeWrapper">
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        <WordList next={typed}>{codeBlock}</WordList>
      </div>
      <div className="grid justify-items-center py-2">
        <p>&laquo;main content&raquo;</p>
        <input
          id="codeInput"
          data-testid="codeInput"
          tabIndex={0}
          autoComplete="off"
          onKeyPress={handleKeyPress}
          onKeyDown={(e) => e.key === "Backspace" && handleKeyPress(e)}
          autoFocus
        />
      </div>
    </>
  );
};
