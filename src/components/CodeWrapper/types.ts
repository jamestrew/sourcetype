export interface IKeyHandler {
  ignoreInput(): boolean;
  getCursorPos(): CursorPos;
  getTyped(): Typed;
  handleKey(): void;
  newCursorPos: CursorPos;
  newTyped: Typed;
}

export type KeyHandlerArgs = {
  key: string;
  typed: Typed;
  cursorPos: CursorPos;
  sSplit: string[][];
  bSplit: string[];
};

export interface ICodeWrapper {
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

export type CursorPos = {
  x: number;
  y: number;
};

export type Hidden = "hidden" | "";
export type Blurred = "blurred" | "";
