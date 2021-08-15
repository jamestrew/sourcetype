import { KeyboardEvent, FC, useState } from "react";
// import { invalidInputs } from "../utils/input";
import { Cursor } from "./Cursor";
import { Word } from "components/Word";

interface ICodeWrapper {
  codeBlock: string;
}

interface IWordListElement {
  currentWordId: number;
  current: {
    wordId: number;
    letter: string;
  }[];
}

// TODO: this will have to be tweaked based on font size
export const curXStep = 0.582;
export const curYStep = 7.5;
export const cursorStart = { x: 0, y: 0.1875 };

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  const [cursorPos, setCursorPos] = useState(cursorStart);
  const [typed, setTyped] = useState<IWordListElement>({
    currentWordId: 0,
    current: [],
  });

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCursorPos(getCursorMovement(event.key));
    setTyped(getNextTyped(event.key));
  };

  const getCursorMovement = (key: string) => {
    if (key === "Backspace") {
      if (typed.current.length === 0) return cursorPos;
      cursorPos.x -= curXStep;
    } else {
      cursorPos.x += curXStep;
    }
    return cursorPos;
  };

  const getNextTyped = (key: string) => {
    const getNextId = () => {
      const currLength = typed.current.length;
      if (currLength === 0) return 0;
      return typed.current[currLength - 1].wordId;
    };
    if (key === "Backspace") {
      typed.current.pop();
      typed.currentWordId = getNextId();
    } else {
      // Fetch the IWordListElement.wordId for this event.key
      let nextId = getNextId();
      if (key === " ") nextId += 1;
      typed.current.push({
        wordId: nextId,
        letter: key,
      });
      typed.currentWordId = nextId;
    }
    return { ...typed };
  };

  const bisectWord = (wordId: number) => {
    let result: IWordListElement["current"] = [];
    let [lo, hi] = [wordId, typed.current.length];

    if (wordId < 0) return result;
    while (lo < hi) {
      let mid = Math.floor((lo + hi) / 2);
      if (typed.current[mid].wordId < wordId) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    for (let i = lo; i < typed.current.length; ++i) {
      if (typed.current[i].wordId === wordId) {
        result.push(typed.current[i]);
      } else break;
    }
    return result.filter((i) => i.letter !== " ");
  };

  const isWordComplete = (wordId: number) => {
    return bisectWord(wordId + 1).length > 0;
  };

  const getLastWord = () => {
    return bisectWord(typed.currentWordId);
  };

  const getBareElements = (input: IWordListElement["current"]) => {
    return input.map((i) => i.letter).reduce((r, i) => r + i, "");
  };

  return (
    <>
      <div className="CodeWrapper">
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        <div className="WordList">
          {codeBlock.split(" ").map((wd, i) => (
            <Word
              key={i}
              text={wd}
              value={getBareElements(bisectWord(i)).split("")}
              isComplete={isWordComplete(i)}
            />
          ))}
        </div>
      </div>
      <div className="grid justify-items-center py-2">
        <p>&laquo;main content&raquo;</p>
        <input
          id="codeInput"
          data-testid="codeInput"
          tabIndex={0}
          defaultValue={getBareElements(getLastWord())}
          autoComplete="off"
          onKeyPress={handleKeyPress}
          onKeyDown={(e) => e.key === "Backspace" && handleKeyPress(e)}
          autoFocus
        />
      </div>
    </>
  );
};
