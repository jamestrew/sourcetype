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
const cursorStart = { x: 0, y: -0.2 };
const overflow_limit = 10;

export const CodeWrapper: FC<ICodeWrapper> = ({ sSplitCode, bSplitCode }) => {
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
    // TODO: probably should handle bypass key logic here (ignoring backspace, space, enter)

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
        {sSplitCode.map((line, lineNum) => {
          let wordIdx = 0;
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

const getCursorOffset = (typed: Typed, codeBlock: string): number => {
  return Math.max(
    0,
    codeBlock.trim().split(/[\n ]/)[typed.currentWordId].length -
      getCurrentTyped(typed).length
  );
};

/**
 * Check if key press is to be processed or bypassed
 * @param {string} key - pressed key
 * @param {string} bSplitCode - space and newline split code
 * @param {string[][]} sSplitCode - list of lines of list of words
 * @param {Typed} typed - current typed state
 * @param {CursorPos} cursorPos - current cursor position
 * @returns {boolean} true => correct, otherwise false
 */
const bypassCheck = (
  key: string,
  sSplitCode: string[][],
  bSplitCode: string[],
  typed: Typed,
  cursorPos: CursorPos
): boolean => {
  if (key === BACKSPACE || key === ENTER) return true;
  const prevTypedCorrect = prevTypedCheck(typed, bSplitCode);

  if (key === BACKSPACE) {
    if (backspaceBypass(cursorPos.x, prevTypedCorrect)) return true;
  } else if (key === ENTER) {
    if (enterBypass(typed.currentWordId, sSplitCode)) return true;
  }
  return false;
};

/**
 * Check if previous word was typed correctly
 * @param {Typed} typed - current typed state
 * @param {string} bSplitCode - space and newline split code
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
 * Check if backspace input should bypass cursor/typed handling (be ignored)
 * @param {number} curXPos - current cursor position in x direction
 * @param {boolean} prevCorrect - whether previous word was typed correctly
 * @returns {boolean} true => bypass/ignore, otherwise false
 */
const backspaceBypass = (curXPos: number, prevCorrect: boolean): boolean => {
  if (curXPos === cursorStart.x || prevCorrect) return false;
  return true;
};

/**
 * Check if enter input should bypass cursor/typed handling (be ignored)
 * @param {number} wordId - wordId to be checked against enter bypass
 * @param {string[][]} sSplitCode - list of lines of list of words
 * @returns {boolean} true => bypass/ignore, otherwise false
 */
const enterBypass = (wordId: number, sSplitCode: string[][]): boolean => {
  let idx = 0;
  for (let i = 0; i < sSplitCode.length; i++) {
    for (let j = 0; j < sSplitCode.length; j++) {
      if (wordId === idx) {
        if (j === sSplitCode[i].length) return false;
        break;
      }
      if (sSplitCode[i][j] !== TAB) idx++;
    }
  }
  return true;
};

// NOTE: maybe pass sSplitCode can eval prev & next word internally
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
  if (key === BACKSPACE) {
    // prevent cursor floating out of bounds
    // TODO: backspace after after new word/line should be skipped unless prev word is wrong
    if (cursorPos.x === cursorStart.x || prevWord === TAB) return cursorPos;
    if (getCurrentTyped(typed).length === 0) {
      // user is correcting previous word
      const next = {
        currentWordId: typed.currentWordId - 1,
        current: typed.current,
      };
      offset = getCursorOffset(next, codeBlock) + 1;
    }
    cursorPos.x -= offset === 0 ? curXStep : offset * curXStep;
  } else if (key === ENTER) {
    // TODO: add check to bypass "Enter" if mid line (same with getNewTyped)
    cursorPos.y += curYStep;
    cursorPos.x = nextWord !== TAB ? 0 : 2 * curXStep;
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
    // TODO: backspace after after new word/line should be skipped unless prev word is wrong
    // Remove letter from the current state
    typed.current.pop();
    typed.currentWordId = getNextId();
  } else if (key === ENTER) {
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
  cursorStart,
  getCursorMovement,
  getNewTyped,
  bisectWord,
  isWordComplete,
  getCurrentTyped,
  getBareElements,
  getCursorOffset,
  getWord,
  backspaceBypass,
  prevTypedCheck,
  enterBypass,
};
