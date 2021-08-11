import { KeyboardEvent, FC, useState } from "react";
import { invalidInputs } from "../utils/input";
import { Cursor } from "./Cursor";
import { Word } from "./Word";

interface ICodeWrapper {
  codeBlock: string;
}

const cursorJump = 7.5; // TODO: this will have to be tweaked based on font size

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const words = codeBlock.split(" "); // FIX: this fucks any spacing
  const [cursorPos, setCursorPos] = useState({ x: 1, y: 25 });
  const [typed, setTyped] = useState<string[]>([]); // TODO: this can be reduced to just an array
  console.log(typed);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (invalidInputs.includes(event.key) || typeof event.key === "undefined")
      return;
    console.log("detected keypress: ".concat(event.key));

    setCursorPos(() => {
      return {
        x:
          event.key === "Backspace"
            ? cursorPos.x - cursorJump
            : cursorPos.x + cursorJump,
        y: cursorPos.y,
      };
    });

    // eg. ['the ', 'quick ', ...]
    // TODO: add backpace support
    setTyped(() => {
      if (typed.length === 0) {
        return [event.key];
      } else {
        const oldWords = typed.slice(0, -1);
        const currWord = typed[typed.length - 1];
        const lastLetter = currWord.slice(-1)
        if (lastLetter !== " ") {
          const updatedWord = currWord + event.key;
          return [...oldWords, updatedWord];
        } else {
          console.log('brand new word')
          return [...typed, event.key];
          // TODO: check out below
          // let extraSpace = typed[typed.length - 1].length === 0
          // return (extraSpace ? [...oldWords, []] : [...oldWords, [...currWord], []]);
        }
      }
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
          <Word key={index} word={word + " "} typed={typed[index]} />
        ))}
      </div>
    </main>
  );
};
