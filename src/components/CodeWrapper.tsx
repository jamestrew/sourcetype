import { KeyboardEvent, FC, useState } from "react";
import { Cursor } from "./Cursor";
import { WordList } from "components/WordList";

interface ICodeWrapper {
  codeBlock: string;
}

const curXStep = 0.582;
const curYStep = 7.5;
const cursorStart = { x: 0, y: 0.1875 };

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const [cursorPos, setCursorPos] = useState(cursorStart);
  const [typed, setTyped] = useState<string[]>([]);

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

const smartSplit = (str: string | null): string[] => {
  let words: string[] = [];
  if (str == null) return words;

  str = str.trim();

  let word = "";
  for (let i = 0; i <= str.length; i++) {
    if (str[i] === " " || i === str.length) {
      if (str[i + 1] === " ") {
        if (word) words.push(word);
        word = "&#x9;"; // https://www.compart.com/en/unicode/U+0009
        i++;
      }
      words.push(word);
      word = "";
    } else if (str[i] === "\n") {
      words.push(word);
      words.push("&#xA;"); // https://www.compart.com/en/unicode/U+000A
      word = "";
    } else {
      word += str[i];
    }
  }
  return words;
};

export const testing = {
  curXStep,
  curYStep,
  cursorStart,
  smartSplit,
};
