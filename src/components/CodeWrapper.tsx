import { KeyboardEvent, FC, useState, useRef } from "react";
import { Cursor } from "./Cursor";
import { Word } from "components/Word";
import { Tab } from "./Tab";

interface ICodeWrapper {
  codeBlock: string;
}

export type Typed = {
  currentWordId: number;
  current: {
    wordId: number;
    letter: string;
  }[];
};

type CursorPos = {
  x: number;
  y: number;
};

type FocusWarning = "hidden" | "";
type Blurred = "blurred" | "";

const curXStep = 0.582;
const curYStep = 7.5;
const cursorStart = { x: 0, y: 0.1875 };
const tab = "&#x9;";
const overflow_limit = 10;

export const CodeWrapper: FC<ICodeWrapper> = ({ codeBlock }) => {
  let wordIdx = 0;
  const wordList = smartSplit(codeBlock);
  const [cursorPos, setCursorPos] = useState(cursorStart);
  const [typed, setTyped] = useState<Typed>({
    currentWordId: 0,
    current: [],
  });
  const focusInputRef = useRef<HTMLInputElement>(null);
  const blurCodeRef = useRef<HTMLParagraphElement>(null);
  const [focusWarning, setFocusWarning] = useState<FocusWarning>("hidden");
  const [blurred, setBlurred] = useState<Blurred>("");

  /**
   * Updates the state of CodeWrapper onKeyPress
   * @listens KeyboardEvent
   * @param {KeyboardEvent<HTMLInputElement>} event
   */
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCursorPos(getCursorMovement(event.key, typed, codeBlock, cursorPos));
    setTyped(getNextTyped(event.key, typed, codeBlock));
  };

  const handleClickToFocus = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!focusInputRef || !focusInputRef.current) return;
    focusInputRef.current.focus();
    setFocusWarning("hidden");
    setBlurred("");
  };

  const handleFocusOut = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    setTimeout(() => {
      if (focusInputRef.current !== document.activeElement) {
        setFocusWarning("");
        setBlurred("blurred");
      }
    }, 1000);
  };

  return (
    <>
      <div
        id="focusWarning"
        data-testid="focusWarning"
        className={focusWarning}
      >
        Click to focus
      </div>
      <div
        id="codeWrapper"
        data-testid="codeWrapper"
        className={blurred}
        onClick={handleClickToFocus}
        ref={blurCodeRef}
      >
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        {wordList.map((line, lineNum) => {
          return (
            <div className="flex flex-wrap WordList" key={lineNum}>
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
                    value={getBareElements(bisectWord(i, typed)).split("")}
                    isComplete={isWordComplete(i, typed)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="grid justify-items-center py-2">
        <input
          id="codeInput"
          data-testid="codeInput"
          ref={focusInputRef}
          tabIndex={0}
          defaultValue={getBareElements(getLastWord(typed))}
          autoComplete="off"
          onKeyPress={handleKeyPress}
          onKeyDown={(e) => e.key === "Backspace" && handleKeyPress(e)}
          onBlur={handleFocusOut}
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

const getCursorOffset = (typed: Typed, codeBlock: string) => {
  return Math.max(
    0,
    codeBlock.trim().split(/[\n ]/)[typed.currentWordId].length -
      getLastWord(typed).length
  );
};

/**
 * Gets a new cursorPos state when input is received
 * @param {string} key - keypress char
 * @param {Typed} typed - current typed state
 * @param {string} codeBlock - code block to be typed
 * @param {CursorPos} cursorPos - current cursor position
 * @returns {CursorPos}
 */
const getCursorMovement = (
  key: string,
  typed: Typed,
  codeBlock: string,
  cursorPos: CursorPos
): CursorPos => {
  let offset = 0;
  if (key === "Backspace") {
    // prevent cursor floating out of bounds
    if (typed.current.length === 0) return cursorPos;
    if (getLastWord(typed).length === 0) {
      // user is correcting previous word
      const next = {
        currentWordId: typed.currentWordId - 1,
        current: typed.current,
      };
      offset = getCursorOffset(next, codeBlock) + 1;
    }
    cursorPos.x -= offset === 0 ? curXStep : offset * curXStep;
  } else {
    let isOverflow = false;
    if (key === " ") {
      // check for skipped letters
      offset = getCursorOffset(typed, codeBlock) + 1;
    } else if (
      getLastWord(typed).length - overflow_limit >=
      codeBlock.trim().split(/[\n ]/)[typed.currentWordId].length
    ) {
      // prevent cursor floating past words
      isOverflow = true;
    }
    if (offset === 0) {
      cursorPos.x += isOverflow ? 0 : curXStep;
    } else {
      cursorPos.x += curXStep * offset;
    }
  }
  return cursorPos;
};

/**
 * Gets a new typed state when input is received
 * @param {string} key - keypress char
 * @param {Typed} typed - current typed state
 * @param {string} codeBlock - code block to be typed
 * @returns {Typed} the current typed state
 */
const getNextTyped = (key: string, typed: Typed, codeBlock: string): Typed => {
  /**
   * Gets the WordListElement.wordId for the given event.key
   * @inner
   * @default 0
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
      getLastWord(typed).length - overflow_limit <
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
 * @param {Typed} typed - current typed state
 * @returns {Typed["current"]} word with id of wordId
 */
const bisectWord = (wordId: number, typed: Typed): Typed["current"] => {
  let result: Typed["current"] = [];
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
 * @param {Typed} typed - current typed state
 * @returns {boolean} true if complete; otherwise, false
 */
const isWordComplete = (wordId: number, typed: Typed): boolean => {
  return wordId < typed.currentWordId;
};

/**
 * Gets the current word being typed
 * @returns {Typed["current"]} the last word
 */
const getLastWord = (typed: Typed): Typed["current"] => {
  return bisectWord(typed.currentWordId, typed);
};

/**
 * Gets the string literal of a given input state
 * @param {Typed["current"]} input - a typed state
 * @returns {string} the given state
 */
const getBareElements = (input: Typed["current"]): string => {
  return input.map((i) => i.letter).reduce((r, i) => r + i, "");
};

export const testing = {
  curXStep,
  curYStep,
  cursorStart,
  smartSplit,
  tab,
  getCursorMovement,
  getNextTyped,
  bisectWord,
  isWordComplete,
  getLastWord,
  getBareElements,
};
