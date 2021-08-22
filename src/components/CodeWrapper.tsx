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
const curYStep = 1.875;
const cursorStart = { x: 0, y: -0.2 };
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
    const nextWord = getWord(typed.currentWordId + 1, wordList);
    const prevWord = getWord(typed.currentWordId - 1, wordList);
    setCursorPos(
      getCursorMovement(
        event.key,
        typed,
        codeBlock,
        prevWord,
        nextWord,
        cursorPos
      )
    );
    setTyped(getNewTyped(event.key, typed, codeBlock));
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
          defaultValue={getBareElements(getCurrentTyped(typed))}
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

const getCursorOffset = (typed: Typed, codeBlock: string): number => {
  return Math.max(
    0,
    codeBlock.trim().split(/[\n ]/)[typed.currentWordId].length -
      getCurrentTyped(typed).length
  );
};

// NOTE: maybe pass wordList can eval prev & next word internally
/**
 * Gets a new cursorPos state when input is received
 * @param {string} key - keypress char
 * @param {Typed} typed - current typed state
 * @param {string} codeBlock - code block to be typed
 * @param {string | null} nextWord - next word to be typed
 * @param {string | null} prevWord - prev word typed
 * @param {CursorPos} cursorPos - current cursor position
 * @returns {CursorPos}
 */
const getCursorMovement = (
  key: string,
  typed: Typed,
  codeBlock: string,
  prevWord: string | null,
  nextWord: string | null,
  cursorPos: CursorPos
): CursorPos => {
  let offset = 0;
  if (key === "Backspace") {
    // prevent cursor floating out of bounds
    if (cursorPos.x === cursorStart.x || prevWord === tab) return cursorPos;
    if (getCurrentTyped(typed).length === 0) {
      // user is correcting previous word
      const next = {
        currentWordId: typed.currentWordId - 1,
        current: typed.current,
      };
      offset = getCursorOffset(next, codeBlock) + 1;
    }
    cursorPos.x -= offset === 0 ? curXStep : offset * curXStep;
  } else if (key === "Enter") {
    // TODO: add check to bypass "Enter" if mid line (same with getNewTyped)
    cursorPos.y += curYStep;
    cursorPos.x = nextWord !== tab ? 0 : 2 * curXStep;
    return cursorPos;
  } else {
    let isOverflow = false;
    if (key === " ") {
      // check for skipped letters
      offset = getCursorOffset(typed, codeBlock) + 1;
    } else if (
      getCurrentTyped(typed).length - overflow_limit >=
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
 * @returns {Typed} the new typed state
 */
const getNewTyped = (key: string, typed: Typed, codeBlock: string): Typed => {
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
  } else if (key === "Enter") {
    // TODO: add check to bypass "Enter" if mid line (same with getCursorMovement)
    typed.currentWordId = getNextId() + 1;
    // NOTE: do we push '\n' here? have to push something
    typed.current.push({
      wordId: typed.currentWordId,
      letter: "\n",
    });
    return { ...typed };
  } else {
    // Append the next letter from the event.key
    let nextId = getNextId();
    if (key === " ") nextId += 1;
    if (
      nextId !== typed.currentWordId ||
      getCurrentTyped(typed).length - overflow_limit <
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
 * @returns {Typed["current"]} the currently typed word
 */
const getCurrentTyped = (typed: Typed): Typed["current"] => {
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

/**
 * Gets word at a given index in wordList
 * @param {number} wordIdx - id of the word to splice out
 * @param {string[][]} wordList - nested list of words in the code snippet
 * @returns {string | null} the next word, new line == "", EOF = null
 */
const getWord = (wordIdx: number, wordList: string[][]): string | null => {
  if (wordList[0].length === 0) return null;
  let idx = 0;

  const lineCnt = wordList.length;
  for (let i = 0; i < lineCnt; i++) {
    const lineLength = wordList[i].length;
    for (let j = 0; j < lineLength; j++) {
      if (idx === wordIdx) {
        return wordList[i][j];
      } else if (idx > wordIdx) break;
      idx++;
    }
  }
  return null;
};

export const testing = {
  curXStep,
  curYStep,
  cursorStart,
  smartSplit,
  tab,
  getCursorMovement,
  getNewTyped,
  bisectWord,
  isWordComplete,
  getCurrentTyped,
  getBareElements,
  getCursorOffset,
  getWord,
};
