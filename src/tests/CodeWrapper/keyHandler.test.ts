import {
  curXStart,
  curXStep,
  curYStart,
  curYStep,
} from "components/CodeWrapper/CodeWrapper";
import { KeyHandlerArgs } from "components/CodeWrapper/types";
import { BACKSPACE, ENTER, ENTER_CODE, SPACE, TAB_CODE } from "utils/constants";
import createKeyHandler, {
  testing,
} from "../../components/CodeWrapper/keyHandler";
const { KeyHandler, BackspaceHandler, EnterHandler, SpaceHandler } = testing;

const sCode = [
  ["if", "(true)", "{"],
  [TAB_CODE, "if", "(bar)", "{"],
  [TAB_CODE, TAB_CODE, "return", "'foo"],
  [TAB_CODE, "}"],
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
  it("at start", () => {
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

  it("at overflow limit", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
      ],
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
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("not letter - space", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new KeyHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(() => handler.ignoreInput()).toThrowError(
      `${SPACE} being handled by base KeyHandler`
    );
  });

  it("not letter - enter", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new KeyHandler({
      key: ENTER,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(() => handler.ignoreInput()).toThrowError(
      `${ENTER} being handled by base KeyHandler`
    );
  });
  it("not letter - BACKSPACE", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    const cursorPos = {
      x: curXStart,
      y: curYStart,
    };
    const handler = new KeyHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(() => handler.ignoreInput()).toThrowError(
      `${BACKSPACE} being handled by base KeyHandler`
    );
  });
});

describe("SPACE", () => {
  it("IGNORE: at very start", () => {
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
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("IGNORE: at start of word", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
      ],
    };
    const cursorPos = {
      x: curXStart + 3 * curXStart,
      y: curYStart,
    };
    const handler = new SpaceHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("IGNORE: at end of line", () => {
    const typed = {
      currentWordId: 2,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "(" },
        { wordId: 1, letter: "t" },
        { wordId: 1, letter: "r" },
        { wordId: 1, letter: "u" },
        { wordId: 1, letter: "e" },
        { wordId: 1, letter: ")" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "{" },
      ],
    };
    const cursorPos = {
      x: curXStart + 11 * curXStep,
      y: curYStart,
    };
    const handler = new SpaceHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("end of word space", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
      ],
    };
    const cursorPos = {
      x: curXStart + 2 * curXStep,
      y: curYStart,
    };
    const handler = new SpaceHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
      ],
    });
    expect(handler.newCursorPos).toEqual({
      x: curXStart + 3 * curXStep,
      y: curYStart,
    });
  });

  it("mid-word space", () => {
    const typed = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "i" }],
    };
    const cursorPos = {
      x: curXStart + curXStep,
      y: curYStart,
    };
    const handler = new SpaceHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 1, letter: " " },
      ],
    });
    expect(handler.newCursorPos).toEqual({
      x: curXStart + 3 * curXStep,
      y: curYStart,
    });
  });

  it("overtyped-word space", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "i" },
      ],
    };
    const cursorPos = {
      x: curXStart + 3 * curXStep,
      y: curYStart,
    };
    const handler = new SpaceHandler({
      key: SPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "i" },
        { wordId: 1, letter: " " },
      ],
    });
    expect(handler.newCursorPos).toEqual({
      x: curXStart + 4 * curXStep,
      y: curYStart,
    });
  });
});

describe("ENTER", () => {
  it("IGNORE: at start", () => {
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
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("IGNORE: mid line", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
      ],
    };
    const cursorPos = {
      x: curXStart + 2 * curXStep,
      y: curYStart,
    };
    const handler = new EnterHandler({
      key: ENTER,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("end of line", () => {
    const typed = {
      currentWordId: 2,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "(" },
        { wordId: 1, letter: "t" },
        { wordId: 1, letter: "r" },
        { wordId: 1, letter: "u" },
        { wordId: 1, letter: "e" },
        { wordId: 1, letter: ")" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "{" },
      ],
    };
    const cursorPos = {
      x: curXStart + 11 * curXStep,
      y: curYStart,
    };
    const handler = new EnterHandler({
      key: ENTER,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(false);
    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 3,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "(" },
        { wordId: 1, letter: "t" },
        { wordId: 1, letter: "r" },
        { wordId: 1, letter: "u" },
        { wordId: 1, letter: "e" },
        { wordId: 1, letter: ")" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "{" },
        { wordId: 3, letter: ENTER_CODE },
      ],
    });
    expect(handler.newCursorPos).toEqual({
      x: curXStart + 2 * curXStep,
      y: curYStart + curYStep,
    });
  });
});

describe("BACKSPACE", () => {
  it("IGNORE: at start", () => {
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
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("IGNORE: at start of word - prev word correct", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
      ],
    };
    const cursorPos = {
      x: curXStart + 3 * curXStep,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("IGNORE: at start of word - prev word incorrect", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "r" },
        { wordId: 1, letter: " " },
      ],
    };
    const cursorPos = {
      x: curXStart + 3 * curXStep,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(false);
  });

  it("IGNORE: at start of new line - prev word correct", () => {
    const typed = {
      currentWordId: 3,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "(" },
        { wordId: 1, letter: "t" },
        { wordId: 1, letter: "r" },
        { wordId: 1, letter: "u" },
        { wordId: 1, letter: "e" },
        { wordId: 1, letter: ")" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "{" },
        { wordId: 3, letter: " " },
      ],
    };
    const cursorPos = {
      x: curXStart + 2 * curXStep,
      y: curYStart + curYStep,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(true);
  });

  it("IGNORE: at start of new line - prev word incorrect", () => {
    const typed = {
      currentWordId: 3,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "(" },
        { wordId: 1, letter: "t" },
        { wordId: 1, letter: "r" },
        { wordId: 1, letter: "u" },
        { wordId: 1, letter: "e" },
        { wordId: 1, letter: ")" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "}" },
        { wordId: 3, letter: " " },
      ],
    };
    const cursorPos = {
      x: curXStart + 2 * curXStep,
      y: curYStart + curYStep,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    const cursorPosResult = {
      x: curXStart + 11 * curXStep,
      y: curYStart,
    };
    expect(handler.ignoreInput()).toBe(false);
    handler.handleKey();
    expect(handler.getTyped()).toEqual(typed);
    expect(handler.newCursorPos.x).toBeCloseTo(cursorPosResult.x);
    expect(handler.newCursorPos.y).toBeCloseTo(cursorPosResult.y);
  });

  it("delete letter", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
      ],
    };
    const cursorPos = {
      x: curXStart + 2 * curXStep,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(false);
    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 0,
      current: [{ wordId: 0, letter: "i" }],
    });
    expect(handler.newCursorPos).toEqual({
      x: curXStart + curXStep,
      y: curYStart,
    });
  });

  it("one letter word typed wrong", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "?" },
      ],
    };
    const cursorPos = {
      x: curXStart + 4 * curXStep,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(false);
    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 1, letter: " " },
      ],
    });
    expect(handler.newCursorPos.x).toBeCloseTo(curXStart + 3 * curXStep, 6);
    expect(handler.newCursorPos.y).toBeCloseTo(curYStart);
  });

  it("jump to next word mid word> backspace back a word to last letter", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 1, letter: " " },
      ],
    };
    const cursorPos = {
      x: curXStart + 3 * curXStep,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(false);
    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 0,
      current: [{ wordId: 0, letter: "i" }],
    });
    expect(handler.newCursorPos.x).toBeCloseTo(curXStart + 1 * curXStep, 6);
    expect(handler.newCursorPos.y).toBeCloseTo(curYStart);
  });

  it("type past word length", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
      ],
    };
    const cursorPos = {
      x: curXStart + 6 * curXStep,
      y: curYStart,
    };
    const handler = new BackspaceHandler({
      key: BACKSPACE,
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });

    expect(handler.ignoreInput()).toBe(false);
    handler.handleKey();
    expect(handler.newTyped).toEqual({
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
        { wordId: 0, letter: "z" },
      ],
    });
    expect(handler.newCursorPos.x).toBeCloseTo(curXStart + 5 * curXStep, 6);
    expect(handler.newCursorPos.y).toBeCloseTo(curYStart);
  });
});

describe("createKeyHandler", () => {
  const typed = {
    currentWordId: 0,
    current: [],
  };
  const cursorPos = { x: 0, y: 0 };
  let arg: KeyHandlerArgs = {
    key: "",
    typed,
    cursorPos,
    sSplit: sCode,
    bSplit: bCode,
  };

  it("letters", () => {
    arg.key = "a";
    expect(createKeyHandler(arg)).toBeInstanceOf(KeyHandler);
  });

  it("space", () => {
    arg.key = SPACE;
    expect(createKeyHandler(arg)).toBeInstanceOf(SpaceHandler);
  });

  it("enter", () => {
    arg.key = ENTER;
    expect(createKeyHandler(arg)).toBeInstanceOf(EnterHandler);
  });

  it("backspace", () => {
    arg.key = BACKSPACE;
    expect(createKeyHandler(arg)).toBeInstanceOf(BackspaceHandler);
  });
});

describe("isEnd", () => {
  const bCode = ["foo"];
  const cursorPos = { x: 0, y: 0 };

  it("at end", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
      ],
    };
    const handler = new KeyHandler({
      key: "o",
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });
    handler.handleKey();
    expect(handler.isEnd()).toBe(true);
  });

  it("not at end", () => {
    const typed = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "f" }],
    };
    const handler = new KeyHandler({
      key: "o",
      typed,
      cursorPos,
      sSplit: sCode,
      bSplit: bCode,
    });
    handler.handleKey();
    expect(handler.isEnd()).toBe(false);
  });
});
