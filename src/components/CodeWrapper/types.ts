export interface IKeyHandler {
  ignoreInput(): boolean;
  getCursorPos(): CursorPos;
  getTyped(): Typed;
}

export type KeyHandlerArgs = {
  key: string;
  typed: Typed;
  cursorPos: CursorPos;
  sSplit: string[][];
  bSplit: string[];
  tabSize: number;
};

export interface ICodeWrapper {
  sSplitCode: string[][];
  bSplitCode: string[];
  tabSize: number;
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

export type FocusWarning = "hidden" | "";
export type Blurred = "blurred" | "";
