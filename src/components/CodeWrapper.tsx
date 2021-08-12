import { KeyboardEvent, FC, useState } from "react";
// import { invalidInputs } from "../utils/input";
import { Cursor } from "./Cursor";
import { WordList } from "components/WordList";

interface ICodeWrapper {
  codeBlock: string;
}

const cursorJump = 0.582; // TODO: this will have to be tweaked based on font size

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0.1875 });
  const [typed, setTyped] = useState<string[]>([]);

  const getCursorMovement = (key: string) => {
    if (key === "Backspace") {
      cursorPos.x -= cursorJump;
    } else {
      cursorPos.x += cursorJump;
    }
    return cursorPos;
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (event.key === "Backspace") {
      typed.pop();
    } else {
      typed.push(event.key);
    }
    setTyped([...typed]);
    setCursorPos(getCursorMovement(event.key));
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
