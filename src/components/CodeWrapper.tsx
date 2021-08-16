import { KeyboardEvent, FC, useState } from "react";
import { Cursor } from "./Cursor";
import { Word } from "components/Word";
import { Tab } from "./Tab";

interface ICodeWrapper {
  codeBlock: string;
}

type WordListElement = {
  currentWordId: number;
  current: {
    wordId: number;
    letter: string;
  }[];
};

const curXStep = 0.582;
const curYStep = 7.5;
const cursorStart = { x: 0, y: 0.1875 };

const tab = "&#x9;"; // https://www.compart.com/en/unicode/U+0009

const overflow_limit = 10;

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  let wordIdx = 0;
  const wordList = smartSplit(codeBlock);
  const [cursorPos, setCursorPos] = useState(cursorStart);
  const [typed, setTyped] = useState<WordListElement>({
    currentWordId: 0,
    current: [],
  });

  /**
   * Updates the state of CodeWrapper onKeyPress
   * @listens KeyboardEvent
   * @param {KeyboardEvent<HTMLInputElement>} event
   */
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCursorPos(getCursorMovement(event.key));
    setTyped(getNextTyped(event.key));
  };

  /**
   * Gets a new cursorPos state when input is received
   * @param {string} key - keypress char
   * @returns {{ x: number, y: number }}
   */
  const getCursorMovement = (key: string): { x: number; y: number } => {
    if (key === "Backspace") {
      if (typed.current.length === 0) return cursorPos;
      cursorPos.x -= curXStep;
    } else {
      cursorPos.x += curXStep;
    }
    return cursorPos;
  };

  /**
   * Gets a new typed state when input is received
   * @param {string} key - keypress char
   * @returns {WordListElement} the current typed state
   */
  const getNextTyped = (key: string): WordListElement => {
    /**
     * Gets the WordListElement.wordId for the given event.key
     * @inner
     * @default {number} 0
     * @returns {number} the next wordId
     */
    const getNextId = (): number => {
      const currLength = typed.current.length;
      if (currLength === 0) return 0;
      return typed.current[currLength - 1].wordId;
    };
    if (key === "Backspace") {
      // Remove letter from the current state
      typed.current.pop();
      typed.currentWordId = getNextId();
    } else {
      // Append the next letter from the event.key
      let nextId = getNextId();
      if (key === " ") nextId += 1;
      if (
        nextId !== typed.currentWordId ||
        getLastWord().length - overflow_limit <
          codeBlock.trim().split(/[\n ]/)[typed.currentWordId].length
      ) {
        typed.current.push({
          wordId: nextId,
          letter: key,
        });
      }
      typed.currentWordId = nextId;
    }
    return { ...typed };
  };

  /**
   * Splices a word with the given wordId by bisecting the typed state
   * @param {number} wordId - id of the word to splice out
   * @returns {WordListElement["current"]} word with id of wordId
   */
  const bisectWord = (wordId: number): WordListElement["current"] => {
    let result: WordListElement["current"] = [];
    let [lo, hi] = [wordId, typed.current.length];

    // wordId must be positive
    if (wordId < 0 || !isFinite(wordId) || !(Math.floor(wordId) === wordId))
      return result;
    // find beginning of word
    while (lo < hi) {
      let mid = Math.floor((lo + hi) / 2);
      if (typed.current[mid].wordId < wordId) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    // find end of word
    for (let i = lo; i < typed.current.length; ++i) {
      if (typed.current[i].wordId === wordId) {
        result.push(typed.current[i]);
      } else break;
    }
    return result.filter((i) => i.letter !== " " && i.letter !== "\n");
  };

  /**
   * Checks if a word with the given wordId has been passed in the current state
   * @param {number} wordId - id of the word to check if complete
   * @returns {boolean} true if complete; otherwise, false
   */
  const isWordComplete = (wordId: number): boolean => {
    return wordId < typed.currentWordId;
  };

  /**
   * Gets the current word being typed
   * @returns {WordListElement["current"]} the last word
   */
  const getLastWord = (): WordListElement["current"] => {
    return bisectWord(typed.currentWordId);
  };

  /**
   * Gets the string literal of a given input state
   * @param {WordListElement["current"]} input - a typed state
   * @returns {string} the given state
   */
  const getBareElements = (input: WordListElement["current"]): string => {
    return input.map((i) => i.letter).reduce((r, i) => r + i, "");
  };

  return (
    <>
      <div className="CodeWrapper">
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        {wordList.map((line, lineNum) => {
          return (
            <div className="flex flex-wrap" key={lineNum}>
              {line.map((wd, wdNum) => {
                if (wd === tab)
                  return (
                    <Tab key={`${lineNum}:${wdNum}`} spaceSize={curXStep} />
                  );
                const i = wordIdx;
                wordIdx++;
                return (
                  <Word
                    key={i}
                    text={wd}
                    value={getBareElements(bisectWord(i)).split("")}
                    isComplete={isWordComplete(i)}
                  />
                );
              })}
            </div>
          );
        })}
        <div className="WordList"></div>
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

/**
 * Tokenizes a formatted multi-line code block
 * @param {(string | null)} str - a code block
 * @returns {string[][]} array of words and format strings per line
 */
const smartSplit = (str: string | null): string[][] => {
  let words: string[][] = [];
  if (str == null || str === "") return words;

  str = str.trim();

  let word = "";
  let line = [];
  for (let i = 0; i <= str.length; i++) {
    if (str[i] === " " || i === str.length) {
      if (str[i + 1] === " ") {
        if (word) line.push(word);
        word = tab;
        i++;
      }
      line.push(word);
      word = "";
    } else if (str[i] === "\n") {
      line.push(word);
      words.push(line);
      line = [];
      word = "";
    } else {
      word += str[i];
    }
  }
  words.push(line);
  return words;
};

export const testing = {
  curXStep,
  curYStep,
  cursorStart,
  smartSplit,
  tab,
};
