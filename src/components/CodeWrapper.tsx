import { KeyboardEvent, FC, useState } from "react";
import { invalidInputs } from "utils/input";
import { Cursor } from "./Cursor";
import { Word } from "./Word";

interface ICodeWrapper {
  codeBlock: string;
}

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const words = codeBlock.split(" "); // FIX: this fucks any spacing
  const [cursorPos, setCursorPos] = useState({ x: 1, y: 25 });
  const [typed, setTyped] = useState<string[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (invalidInputs.includes(event.key)) return;
    console.log("detected keypress: ".concat(event.key));

    // TODO: make conditions for backspace
    // do we allow arrow keys and if so handle delete
    setCursorPos((cursorPos) => {
      return { x: cursorPos.x + 7, y: cursorPos.y };
    });
    setTyped((typed) => {
      return [...typed, event.key];
    });
  };

  return (
    <main>
      <p>&laquo;main content&raquo;</p>
      <input
        id="codeInput"
        tabIndex={0}
        autoComplete="off"
        autoFocus
        onKeyDown={handleKeyDown}
      />
      <div className="word-wrapper">
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        {words.map((word, index) => (
          <Word key={index} word={word + " "} typed={typed} />
        ))}
      </div>
    </main>
  );
};
