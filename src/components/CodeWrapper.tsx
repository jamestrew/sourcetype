import { KeyboardEvent, FC, useState, useRef } from "react";
import { Cursor } from "./Cursor";
import { Word } from "components/Word";
import { Tab } from "./Tab";
import { TAB, BACKSPACE, ENTER } from "../utils/constants";

interface ICodeWrapper {
  sSplitCode: string[][];
  bSplitCode: string[];
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
const curXStart = 0;
const curYStart = -0.2;
const OVERFLOW_LIMIT = 10;

export const CodeWrapper: FC<ICodeWrapper> = ({ sSplitCode, bSplitCode }) => {
  const [cursorPos, setCursorPos] = useState<CursorPos>({
    x: curXStart,
    y: curYStart,
  });
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
    console.log(
      ignoreInputCheck(event.key, sSplitCode, bSplitCode, typed, cursorPos)
    );
    if (ignoreInputCheck(event.key, sSplitCode, bSplitCode, typed, cursorPos))
      return;

    setCursorPos(
      getCursorMovement(event.key, typed, sSplitCode, bSplitCode, cursorPos)
    );
    setTyped(getNewTyped(event.key, typed));
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

  let wordIdx = 0;
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
        {sSplitCode.map((line, lineNum) => {
          return (
            <div className="flex flex-wrap WordList" key={lineNum}>
              {line.map((wd, wdNum) => {
                if (wd === TAB)
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
          onKeyDown={(e) => e.key === BACKSPACE && handleKeyPress(e)}
          onBlur={handleFocusOut}
          autoFocus
        />
      </div>
    </>
  );
};

const getCursorOffset = (typed: Typed, bSplitCode: string[]): number => {
  return Math.max(
    0,
    bSplitCode[typed.currentWordId].length - getCurrentTyped(typed).length
  );
};

/**
 * Check if key press is to be ignored
 * @param {string} key - pressed key
 * @param {string} bSplitCode - space and newline split code
 * @param {string[][]} sSplitCode - list of lines of list of words
 * @param {Typed} typed - current typed state
 * @param {CursorPos} cursorPos - current cursor position
 * @returns {boolean} true => key to be ignore, otherwise false
 */
const ignoreInputCheck = (
  key: string,
  sSplitCode: string[][],
  bSplitCode: string[],
  typed: Typed,
  cursorPos: CursorPos
): boolean => {
  if (key === BACKSPACE) {
    if (backspaceIgnore(cursorPos.x, typed, bSplitCode)) return true;
  } else if (key === ENTER) {
    if (enterIgnore(typed.currentWordId, sSplitCode)) return true;
  } else {
    const currentTypedLen = getCurrentTyped(typed).length;
    const currentWordLen = bSplitCode[typed.currentWordId].length;
    if (currentWordLen + OVERFLOW_LIMIT <= currentTypedLen) return true;
  }
  return false;
};

/**
 * Check if previous word was typed correctly
 * @param {Typed} typed - current typed state
 * @param {string[]} bSplitCode - space and newline split code
 * @returns {boolean} true => correct, otherwise false
 */
const prevTypedCheck = (typed: Typed, bSplitCode: string[]): boolean => {
  if (typed.current.length === 0) return true;
  const prevTypedId = typed.currentWordId - 1;
  const prevTyped = getBareElements(bisectWord(prevTypedId, typed));
  if (bSplitCode[prevTypedId] === prevTyped) return true;
  return false;
};

/**
 * Check if backspace input should be ignored by cursor/typed handling
 * @param {number} curXPos - current cursor position in x direction
 * @param {Typed} typed - current typed state
 * @param {string[]} bSplitCode - space and newline split code
 * @returns {boolean} true => bypass/ignore, otherwise false
 */
const backspaceIgnore = (
  curXPos: number,
  typed: Typed,
  bSplitCode: string[]
): boolean => {
  const prevCorrect = prevTypedCheck(typed, bSplitCode);
  const startOfWord = getCurrentTyped(typed).length === 0;
  if (curXPos === curXStart || (prevCorrect && startOfWord)) return true;
  return false;
};

/**
 * Check if enter input should be ignored by cursor/typed handling
 * @param {number} wordId - wordId to be checked against enter bypass
 * @param {string[][]} sSplitCode - list of lines of list of words
 * @returns {boolean} true => bypass/ignore, otherwise false
 */
const enterIgnore = (wordId: number, sSplitCode: string[][]): boolean => {
  let idx = 0;
  for (let i = 0; i < sSplitCode.length; i++) {
    for (let j = 0; j < sSplitCode[i].length; j++) {
      if (wordId === idx) {
        if (j === sSplitCode[i].length - 1) return false;
        break;
      }
      if (sSplitCode[i][j] !== TAB) idx++;
    }
  }
  return true;
};

/**
 * Gets a new cursorPos state when input is received
 * @param {string} key - keypress char
 * @param {Typed} typed - current typed state
 * @param {string[][]} sSplitCode - list of lines of list of words
 * @param {string[]} bSplitCode - space and newline split code
 * @param {CursorPos} cursorPos - current cursor position
 * @returns {CursorPos}
 */
const getCursorMovement = (
  key: string,
  typed: Typed,
  sSplitCode: string[][],
  bSplitCode: string[],
  cursorPos: CursorPos
): CursorPos => {
  let offset = 0;
  if (key === BACKSPACE) {
    if (getCurrentTyped(typed).length === 0) {
      // user is correcting previous word
      const next = {
        currentWordId: typed.currentWordId - 1,
        current: typed.current,
      };
      offset = getCursorOffset(next, bSplitCode) + 1;
    }
    cursorPos.x -= offset === 0 ? curXStep : offset * curXStep;
  } else if (key === ENTER) {
    const nextWord = getWord(typed.currentWordId + 1, sSplitCode);
    cursorPos.y += curYStep;
    cursorPos.x = nextWord !== TAB ? 0 : 2 * curXStep;
    return cursorPos;
  } else {
    if (key === " ") {
      offset = getCursorOffset(typed, bSplitCode) + 1;
    }
    if (offset === 0) {
      cursorPos.x += curXStep;
    } else {
      cursorPos.x += curXStep * offset;
    }
  }
  return cursorPos;
};

/**
 * Gets the WordListElement.wordId for the given event.key
 * @param {Typed} typed - current typed state
 * @returns {number} the next wordId
 */
const getNextId = (typed: Typed): number => {
  const currLength = typed.current.length;
  if (currLength === 0) return 0;
  return typed.current[currLength - 1].wordId;
};

/**
 * Gets a new typed state when input is received
 * @param {string} key - keypress char
 * @param {Typed} typed - current typed state
 * @param {string} codeBlock - code block to be typed
 * @returns {Typed} the new typed state
 */
const getNewTyped = (key: string, typed: Typed): Typed => {
  if (key === BACKSPACE) {
    typed.current.pop();
    typed.currentWordId = getNextId(typed);
  } else if (key === ENTER) {
    typed.currentWordId = getNextId(typed) + 1;
    typed.current.push({
      wordId: typed.currentWordId,
      letter: " ",
    });
    return { ...typed };
  } else {
    let nextId = getNextId(typed);
    if (key === " ") nextId += 1;
    // console.log({ nextId, typed });
    typed.current.push({ wordId: nextId, letter: key });
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
 * Gets word at a given index in sSplitCode
 * @param {number} wordIdx - id of the word to splice out
 * @param {string[][]} sSplitCode - nested list of words in the code snippet
 * @returns {string | null} the next word, new line == "", EOF = null
 */
const getWord = (wordIdx: number, sSplitCode: string[][]): string | null => {
  let idx = 0;
  for (let i = 0; i < sSplitCode.length; i++) {
    for (let j = 0; j < sSplitCode[i].length; j++) {
      if (idx > wordIdx) break;
      if (idx === wordIdx) return sSplitCode[i][j];
      idx++;
    }
  }
  return null;
};

export const testing = {
  curXStep,
  curYStep,
  curXStart,
  curYStart,
  getCursorMovement,
  getNewTyped,
  bisectWord,
  isWordComplete,
  getCurrentTyped,
  getBareElements,
  getCursorOffset,
  getWord,
  backspaceIgnore,
  prevTypedCheck,
  enterIgnore,
  ignoreInputCheck,
};
