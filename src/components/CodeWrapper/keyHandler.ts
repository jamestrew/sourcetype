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
  private results: { cursorPos: CursorPos; typed: Typed } | null;

  constructor(args: KeyHandlerArgs) {
    this.key = args.key;
    this.typed = args.typed;
    this.cursorPos = args.cursorPos;
    this.sSplit = args.sSplit;
    this.bSplit = args.bSplit;
    this.tabSize = args.tabSize;
    this.results = null;
  }

  ignoreInput(): boolean {
    if (this.key === SPACE || this.key === BACKSPACE || this.key === ENTER)
      throw new Error(`${this.key} being handled by base KeyHandler`);

    return this.currentWordLen + OVERFLOW_LIMIT <= this.currentTypedLen;
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

  handleKey(): void {
    // deterministic call order
    this.results = {
      cursorPos: this.getCursorPos(),
      typed: this.getTyped(),
    };
  }

  get newCursorPos(): CursorPos {
    if (!this.results) throw new Error("New cursor not determined");
    return this.results.cursorPos;
  }

  get newTyped(): Typed {
    if (!this.results) throw new Error("New typed not determined");
    return this.results.typed;
  }

  get prevTypedCorrectly(): boolean {
    if (this.typed.current.length === 0) return true;

    const prevTypedId = this.typed.currentWordId - 1;
    const prevTyped = stringifyTyped(bisectTyped(prevTypedId, this.typed));
    if (this.bSplit[prevTypedId] === prevTyped) return true;
    return false;
  }

  get latestWordId(): number {
    const currLength = this.typed.current.length;
    if (currLength === 0) return 0;
    return this.typed.current[currLength - 1].wordId;
  }

  get cursorOffset(): number {
    return Math.max(0, this.currentWordLen, this.currentTypedLen);
  }

  get cursorAtEOL(): boolean {
    let wordIdx = 0;
    for (let lineNum = 0; lineNum < this.sSplit.length; lineNum++) {
      for (let wordNum = 0; wordNum < this.sSplit[lineNum].length; wordNum++) {
        if (wordIdx > this.typed.currentWordId) return false;
        if (
          this.typed.currentWordId === wordIdx &&
          wordNum === this.sSplit[lineNum].length - 1
        )
          return true;
        if (this.sSplit[lineNum][wordNum] !== TAB) wordIdx++;
      }
    }
    return false;
  }

  get cursorAtStart(): boolean {
    return this.cursorPos.x === curXStart;
  }

  // BUG: currentTypedLen and currentWordLen can be on different words
  get currentTypedLen(): number {
    return getCurrentTyped(this.typed).length;
  }

  get currentWordLen(): number {
    return this.bSplit[this.typed.currentWordId].length;
  }
}

class BackspaceHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    const startOfWord = getCurrentTyped(this.typed).length === 0;
    return this.cursorAtStart || (this.prevTypedCorrectly && startOfWord);
  }

  getCursorPos(): CursorPos {
    let offset = 0;
    if (getCurrentTyped(this.typed).length === 0) {
      offset = this.cursorOffset + 1;
    }
    this.cursorPos.x -= offset ? curXStep * offset : curXStep;
    return this.cursorPos;
  }

  getTyped(): Typed {
    this.typed.current.pop();
    this.typed.currentWordId = this.latestWordId;
    return { ...this.typed };
  }
}

class EnterHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return !this.cursorAtEOL;
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
    return this.cursorAtEOL;
  }

  getCursorPos(): CursorPos {
    const offset = this.cursorOffset + 1;
    this.cursorPos.x += curXStep * offset;
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

export const testing = {
  KeyHandler,
  BackspaceHandler,
  EnterHandler,
  SpaceHandler,
};
