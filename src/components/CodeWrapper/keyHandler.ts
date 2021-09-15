import { SPACE, TAB, BACKSPACE, ENTER } from "../../utils/constants";
import { curXStart, curXStep, curYStep } from "./CodeWrapper";
import { IKeyHandler, KeyHandlerArgs, Typed, CursorPos } from "./types";
import { bisectTyped, getCurrentTyped, stringifyTyped } from "./utils";

const OVERFLOW_LIMIT = 10;

class KeyHandler implements IKeyHandler {
  key: string;
  typed: Typed;
  cursorPos: CursorPos;
  sSplit: string[][];
  bSplit: string[];
  tabSize: number;

  constructor(args: KeyHandlerArgs) {
    this.key = args.key;
    this.typed = args.typed;
    this.cursorPos = args.cursorPos;
    this.sSplit = args.sSplit;
    this.bSplit = args.bSplit;
    this.tabSize = args.tabSize;
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

class BackspaceHandler extends KeyHandler implements IKeyHandler {
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

class EnterHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return !this.atEndofLine();
  }

  getCursorPos(): CursorPos {
    this.cursorPos.y += curYStep;
    this.cursorPos.x += this.tabSize * curXStep * this.indentCount();
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

class SpaceHandler extends KeyHandler implements IKeyHandler {
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

const createKeyHandler = (args: KeyHandlerArgs) => {
  switch (args.key) {
    case BACKSPACE:
      return new BackspaceHandler(args);
    case ENTER:
      return new EnterHandler(args);
    case SPACE:
      return new SpaceHandler(args);
    default:
      return new KeyHandler(args);
  }
};
export default createKeyHandler;
