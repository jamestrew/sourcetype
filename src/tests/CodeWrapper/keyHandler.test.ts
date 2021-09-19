import {
  curXStart,
  curXStep,
  curYStart,
} from "components/CodeWrapper/CodeWrapper";
import { BACKSPACE, ENTER, SPACE, TAB } from "utils/constants";
import createKeyHandler, {
  testing,
} from "../../components/CodeWrapper/keyHandler";
const { KeyHandler, BackspaceHandler, EnterHandler, SpaceHandler } = testing;

const sCode = [
  ["if", "(true)", "{"],
  [TAB, "if", "(bar)", "{"],
  [TAB, TAB, "return", "'foo"],
  [TAB, "}"],
  ["}"],
];

// prettier-ignore
const bCode = [
  "if", "(true)", "{",
  "", "", "if", "(bar)", "{",
  "", "", "", "", "return", "'foo'",
  "", "", "}",
  "}",
];

describe("LETTERS", () => {
  it("letter", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new KeyHandler({
      key: "a",
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
      tabSize: 2,
    });

    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 0,
      current: [{ wordId: 0, letter: "a" }],
    });
    expect(handler.newCursorPos).toEqual({
      x: curXStart + curXStep,
      y: curYStart,
    });
  });
});

describe("SPACE", () => {
  it("at start", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new SpaceHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
      tabSize: 2,
    });

    expect(handler.ignoreInput()).toBe(false);
  });
});

describe("ENTER", () => {
  it("at start", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new EnterHandler({
      key: ENTER,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
      tabSize: 2,
    });

    expect(handler.ignoreInput()).toBe(true);
  });
});

describe("BACKSPACE", () => {
  it("at start", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
      tabSize: 2,
    });

    expect(handler.ignoreInput()).toBe(true);
  });
});
