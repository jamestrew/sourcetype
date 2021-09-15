import { Typed, CursorPos } from "../components/CodeWrapper";
import { SPACE, TAB, BACKSPACE, ENTER } from "../utils/constants";

interface IKeyHandler {
  ignoreInput(): boolean;
  getCursorPos(): CursorPos;
  getTyped(): Typed;
}

const curXStep = 0.582;
const curYStep = 1.875;
const curXStart = 0;
const curYStart = -0.2;
const OVERFLOW_LIMIT = 10;
let tabSize = 2;

export class KeyHandler implements IKeyHandler {
  key: string;
  typed: Typed;
  cursorPos: CursorPos;
  sSplit: string[][];
  bSplit: string[];

  constructor(
    key: string,
    typed: Typed,
    cursorPos: CursorPos,
    sSplit: string[][],
    bSplit: string[]
  ) {
    this.key = key;
    this.typed = typed;
    this.cursorPos = cursorPos;
    this.sSplit = sSplit;
    this.bSplit = bSplit;
  }

  ignoreInput(): boolean {
    if (this.key === SPACE || this.key === BACKSPACE || this.key === ENTER)
      throw new Error(`${this.key} being handled by base KeyHandler`);

    // BUG: these won't aways match up (check out bSplit, too many empty strings)
    const currentTypedLen = getCurrentTyped(this.typed).length;
    const currentWordLen = this.bSplit[this.typed.currentWordId].length;
    return currentWordLen + OVERFLOW_LIMIT <= currentTypedLen;
  }

  getCursorPos(): CursorPos {
    return { x: this.cursorPos.x + curXStep, y: this.cursorPos.y };
  }

  getTyped(): Typed {
    this.typed.current.push({
      wordId: this.typed.currentWordId,
      letter: this.key,
    });
    return { ...this.typed };
  }

  prevTypedCorrectly(): boolean {
    if (this.typed.current.length === 0) return true;

    const prevTypedId = this.typed.currentWordId - 1;
    const prevTyped = stringifyTyped(bisectTyped(prevTypedId, this.typed));
    if (this.bSplit[prevTypedId] === prevTyped) return true;
    return false;
  }

  getWordId(): number {
    const currLength = this.typed.current.length;
    if (currLength === 0) return 0;
    return this.typed.current[currLength - 1].wordId;
  }

  getCursorOffset(): number {
    const currentWordLength = this.bSplit[this.typed.currentWordId].length;
    const currentTypedLength = getCurrentTyped(this.typed).length;
    return Math.max(0, currentWordLength, currentTypedLength);
  }

  atEndofLine(): boolean {
    let wordIdx = 0;
    for (let lineNum = 0; lineNum < this.sSplit.length; lineNum++) {
      for (let wordNum = 0; wordNum < this.sSplit[lineNum].length; wordNum++) {
        if (wordIdx > this.typed.currentWordId) return true;
        if (
          this.typed.currentWordId === wordIdx &&
          wordNum === this.sSplit[lineNum].length - 1
        )
          return false;
        if (this.sSplit[lineNum][wordNum] !== TAB) wordIdx++;
      }
    }
    return true;
  }

  cursorAtStart(): boolean {
    return this.cursorPos.x === curXStart;
  }
}

export class BackspaceHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    const startOfWord = getCurrentTyped(this.typed).length === 0;
    return this.cursorAtStart() || (this.prevTypedCorrectly() && startOfWord);
  }

  getCursorPos(): CursorPos {
    let offset = 0;
    if (getCurrentTyped(this.typed).length === 0) {
      offset = this.getCursorOffset() + 1;
    }
    this.cursorPos.x -= offset ? curXStep * offset : curXStep;
    return this.cursorPos;
  }

  getTyped(): Typed {
    this.typed.current.pop();
    this.typed.currentWordId = this.getWordId();
    return { ...this.typed };
  }
}
export class EnterHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return !this.atEndofLine();
  }

  getCursorPos(): CursorPos {
    this.cursorPos.y += curYStep;
    this.cursorPos.x += tabSize * curXStep * this.indentCount();
    return this.cursorPos;
  }

  getTyped(): Typed {
    this.typed.currentWordId += 1;
    this.typed.current.push({
      wordId: this.typed.currentWordId,
      letter: " ",
    });
    return { ...this.typed };
  }

  indentCount(): number {
    const lineLen = this.sSplit.length;
    let wordIdx = this.typed.currentWordId + 1;
    let idx = 0;
    let count = 0;
    for (let i = 0; i < lineLen; i++) {
      for (let j = 0; j < this.sSplit[i].length; j++) {
        if (idx > wordIdx) {
          i = lineLen;
          break;
        }
        if (idx === wordIdx && this.sSplit[i][j] === TAB) {
          idx++;
          count++;
          wordIdx++;
        }
        if (this.sSplit[i][j] !== TAB) idx++;
      }
    }
    return count;
  }
}

export class SpaceHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return this.atEndofLine();
  }

  getCursorPos(): CursorPos {
    return { x: 0, y: 0 };
  }

  getTyped(): Typed {
    this.typed.currentWordId += 1;
    this.typed.current.push({
      wordId: this.typed.currentWordId,
      letter: " ",
    });
    return { ...this.typed };
  }
}

const stringifyTyped = (input: Typed["current"]): string => {
  return input.map((i) => i.letter).reduce((r, i) => r + i, "");
};

const bisectTyped = (wordId: number, typed: Typed): Typed["current"] => {
  let result: Typed["current"] = [];
  let [lo, hi] = [wordId, typed.current.length];

  if (wordId < 0 || wordId > typed.current.length)
    throw new Error("wordId out of expected range for bisectTyped");

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
  return result.filter((i) => i.letter !== " " && i.letter !== "\n");
};

const getCurrentTyped = (typed: Typed): Typed["current"] => {
  return bisectTyped(typed.currentWordId, typed);
};

export const testing = {
  bisectTyped,
  stringifyTyped,
};
