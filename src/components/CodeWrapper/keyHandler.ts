import {
  SPACE,
  TAB_CODE,
  BACKSPACE,
  ENTER,
  ENTER_CODE,
} from "../../utils/constants";
import { curXStart, curXStep, curYStep } from "./CodeWrapper";
import { IKeyHandler, KeyHandlerArgs, Typed, CursorPos } from "./types";
import {
  bisectTyped,
  bisectTypedClean,
  getCurrentTyped,
  stringifyTyped,
} from "./utils";

const OVERFLOW_LIMIT = 10;

class KeyHandler implements IKeyHandler {
  key: string;
  typed: Typed;
  cursorPos: CursorPos;
  sSplit: string[][];
  bSplit: string[];
  private results: { cursorPos: CursorPos; typed: Typed } | null;
  readonly tabSize = 2;

  constructor(args: KeyHandlerArgs) {
    this.key = args.key;
    this.typed = args.typed;
    this.cursorPos = args.cursorPos;
    this.sSplit = args.sSplit;
    this.bSplit = args.bSplit;
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

  isEnd(): boolean {
    if (!this.results) throw new Error("Inputs not yet handled");
    if (this.key === SPACE || this.key === BACKSPACE || this.key === ENTER) {
      return false;
    }

    return (
      this.typed.currentWordId === this.bSplit.length - 1 &&
      this.currentWordLen === this.currentTypedLen
    );
  }

  get newCursorPos(): CursorPos {
    if (!this.results) throw new Error("New cursor not determined");
    return this.results.cursorPos;
  }

  get newTyped(): Typed {
    if (!this.results) throw new Error("New typed not determined");
    return this.results.typed;
  }

  protected get prevTypedCorrectly(): boolean {
    if (this.typed.current.length === 0) return true;

    const prevTypedId = this.typed.currentWordId - 1;
    const prevTyped = stringifyTyped(bisectTyped(prevTypedId, this.typed));
    return this.bSplit[prevTypedId] === prevTyped;
  }

  protected get latestWordId(): number {
    const currLength = this.typed.current.length;
    if (currLength === 0) return 0;
    return this.typed.current[currLength - 1].wordId;
  }

  protected get currentCursorOffset(): number {
    return Math.max(0, this.currentWordLen - this.currentTypedLen);
  }

  protected get prevCursorOffset(): number {
    return Math.max(0, this.prevWordLen - this.prevTypedLen);
  }

  protected get cursorAtEOL(): boolean {
    let wordIdx = 0;
    for (let lineNum = 0; lineNum < this.sSplit.length; lineNum++) {
      for (let wordNum = 0; wordNum < this.sSplit[lineNum].length; wordNum++) {
        if (wordIdx > this.typed.currentWordId) return false;
        if (
          this.typed.currentWordId === wordIdx &&
          wordNum === this.sSplit[lineNum].length - 1
        )
          return true;
        if (this.sSplit[lineNum][wordNum] !== TAB_CODE) wordIdx++;
      }
    }
    return false;
  }

  protected sIndices(wordId: number = this.typed.currentWordId): sIndex {
    let wordIdx = 0;
    for (let lineNum = 0; lineNum < this.sSplit.length; lineNum++) {
      for (let wordNum = 0; wordNum < this.sSplit[lineNum].length; wordNum++) {
        if (wordId === wordIdx) return { lineNum, wordNum };
        if (this.sSplit[lineNum][wordNum] !== TAB_CODE) wordIdx++;
      }
    }
    return { lineNum: -1, wordNum: -1 };
  }

  protected get cursorAtStart(): boolean {
    return this.cursorPos.x === curXStart;
  }

  protected get startOfWord(): boolean {
    return getCurrentTyped(this.typed).length === 0;
  }

  protected get currentTypedLen(): number {
    return this.typedLen(this.typed.currentWordId);
  }

  protected get currentWordLen(): number {
    return this.wordLen(this.typed.currentWordId);
  }

  protected get prevTypedLen(): number {
    return this.typedLen(this.typed.currentWordId - 1);
  }

  protected get prevWordLen(): number {
    return this.wordLen(this.typed.currentWordId - 1);
  }

  protected typedLen(wordId: number): number {
    return bisectTypedClean(wordId, this.typed).length;
  }

  protected wordLen(wordId: number): number {
    return this.bSplit[wordId].length;
  }
}

class BackspaceHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return this.cursorAtStart || (this.prevTypedCorrectly && this.startOfWord);
  }

  getCursorPos(): CursorPos {
    let offset = 0;

    if (
      this.startOfWord &&
      !this.prevTypedCorrectly &&
      this.typed.currentWordId !== 0
    ) {
      offset = this.prevCursorOffset + 1;
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
    this.cursorPos.x = this.tabSize * curXStep * this.indentCount();
    return this.cursorPos;
  }

  getTyped(): Typed {
    this.typed.currentWordId += 1;
    this.typed.current.push({
      wordId: this.typed.currentWordId,
      letter: ENTER_CODE,
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
        if (idx === wordIdx && this.sSplit[i][j] === TAB_CODE) {
          idx++;
          count++;
          wordIdx++;
        }
        if (this.sSplit[i][j] !== TAB_CODE) idx++;
      }
    }
    return count;
  }
}

class SpaceHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return this.cursorAtEOL || this.startOfWord;
  }

  getCursorPos(): CursorPos {
    const offset = this.currentCursorOffset + 1;
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
