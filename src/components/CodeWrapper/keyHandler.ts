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

type sIndex = {
  lineNum: number;
  wordNum: number;
};

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

    return this.wordLen() + OVERFLOW_LIMIT <= this.typedLen();
  }

  getCursorPos(): CursorPos {
    // TODO: convert to getter
    return { x: this.cursorPos.x + curXStep, y: this.cursorPos.y };
  }

  getTyped(): Typed {
    // TODO: convert to getter
    const result = this.typed;
    result.current.push({
      wordId: result.currentWordId,
      letter: this.key,
    });
    return { ...result };
  }

  handleKey(): void {
    // TODO: DEPRECATED - remove
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
      this.wordLen() === this.typedLen()
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

    const prevTyped = stringifyTyped(bisectTyped(this.prevWordId, this.typed));
    return this.bSplit[this.prevWordId] === prevTyped;
  }

  protected get latestWordId(): number {
    const currLength = this.typed.current.length;
    if (currLength === 0) return 0;
    return this.typed.current[currLength - 1].wordId;
  }

  protected get currentCursorOffset(): number {
    return Math.max(0, this.wordLen() - this.typedLen());
  }

  protected get prevCursorOffset(): number {
    return Math.max(0, this.prevWordLen - this.prevTypedLen);
  }

  protected atEndOfLine(wordId: number = this.typed.currentWordId): boolean {
    const indices = this.sIndices(wordId);
    const lineLength = this.sSplit[indices.lineNum].length;
    return indices.wordNum === lineLength - 1;
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

  protected get prevWordId(): number {
    for (let idx = this.typed.currentWordId - 1; idx >= 0; idx--) {
      if (this.typed.current[idx].letter !== ENTER_CODE) return idx;
    }
    return -1;
  }

  protected get currentTypedLen(): number {
    return this.typedLen(this.typed.currentWordId);
  }

  protected get currentWordLen(): number {
    return this.wordLen(this.typed.currentWordId);
  }

  protected get prevTypedLen(): number {
    return this.typedLen(this.prevWordId);
  }

  protected get prevWordLen(): number {
    return this.wordLen(this.prevWordId);
  }

  protected typedLen(wordId: number = this.typed.currentWordId): number {
    return bisectTypedClean(wordId, this.typed).length;
  }

  protected wordLen(wordId: number = this.typed.currentWordId): number {
    return this.bSplit[wordId].length;
  }

  protected get startNewLine(): boolean {
    return this.atEndOfLine(this.prevWordId);
  }

  protected lineLength(wordId: number): number {
    let result = -1; // counter act first += 1
    const line = this.sSplit[this.sIndices(wordId).lineNum];
    for (let wordNum = 0; wordNum < line.length; wordNum++) {
      result += 1; // space per word
      if (line[wordNum] === TAB_CODE) {
        result += 1;
      } else {
        result += line[wordNum].length;
      }
    }
    return result;
  }
}

class BackspaceHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return this.cursorAtStart || (this.prevTypedCorrectly && this.startOfWord);
  }

  getCursorPos(): CursorPos {
    // TODO: convert to getter
    const result: CursorPos = this.cursorPos;
    let xOffset = 1;
    let yOffset = 0;

    if (this.startOfWord && !this.prevTypedCorrectly) {
      if (this.startNewLine) {
        result.x = curXStart;
        xOffset = -this.lineLength(this.prevWordId);
        yOffset = 1;
      } else {
        xOffset = this.prevCursorOffset + 1;
      }
    }
    result.x -= xOffset * curXStep;
    result.y -= yOffset * curYStep;
    return result;
  }

  getTyped(): Typed {
    // TODO: convert to getter
    const result = this.typed;
    result.current.pop();
    result.currentWordId = this.latestWordId;
    return result;
  }
}

class EnterHandler extends KeyHandler implements IKeyHandler {
  ignoreInput(): boolean {
    return !this.atEndOfLine();
  }

  getCursorPos(): CursorPos {
    // TODO: convert to getter
    const result = this.cursorPos;
    result.y += curYStep;
    result.x = this.tabSize * curXStep * this.indentCount();
    return result;
  }

  getTyped(): Typed {
    // TODO: convert to getter
    const result = this.typed;
    result.currentWordId += 1;
    result.current.push({
      wordId: result.currentWordId,
      letter: ENTER_CODE,
    });
    return { ...result };
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
    return this.atEndOfLine() || this.startOfWord;
  }

  getCursorPos(): CursorPos {
    // TODO: convert to getter
    const result = this.cursorPos;
    const offset = this.currentCursorOffset + 1;
    result.x += curXStep * offset;
    return result;
  }

  getTyped(): Typed {
    // TODO: convert to getter
    const result = this.typed;
    result.currentWordId += 1;
    result.current.push({
      wordId: result.currentWordId,
      letter: " ",
    });
    return { ...result };
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
