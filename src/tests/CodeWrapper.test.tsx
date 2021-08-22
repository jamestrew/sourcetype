import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeWrapper, Typed, testing } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
import { TAB, BACKSPACE, ENTER } from "../utils/constants";
const {
  curXStep,
  curYStep,
  // cursorStart,
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
} = testing;

const cursorStart = { x: 0, y: -0.2 };

describe("CodeWrapper", () => {
  beforeEach(() => {
    render(<CodeWrapper sSplitCode={[["foo"]]} bSplitCode={["foo"]} />);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("focus on codeWrapper", async () => {
    const codeWrapper = screen.getByTestId("codeWrapper");
    const codeInput = screen.getByTestId("codeInput");
    const focusWarning = screen.getByTestId("focusWarning");

    userEvent.click(codeWrapper);
    expect(codeInput).toHaveFocus();
    expect(focusWarning).toHaveClass("hidden");
    expect(codeWrapper).not.toHaveClass("");
  });

  it("focus away from codeWrapper", async () => {
    const codeWrapper = screen.getByTestId("codeWrapper");
    const codeInput = screen.getByTestId("codeInput");
    const focusWarning = screen.getByTestId("focusWarning");

    userEvent.click(focusWarning);
    await waitFor(
      () => {
        expect(codeInput).not.toHaveFocus();
        expect(focusWarning).not.toHaveClass("hidden");
        expect(codeWrapper).toHaveClass("blurred");
      },
      { interval: 100, timeout: 1500 }
    );
  });
});

/**
 * getCursorMovement
 */
describe("getCursorMovement", () => {
  const codeBlockSimple = "foo bar baz";

  it("backspace on start", () => {
    const typedStart = { currentWordId: 0, current: [] };
    const result = getCursorMovement(
      BACKSPACE,
      typedStart,
      codeBlockSimple,
      "foo",
      "bar",
      cursorStart
    );
    expect(result).toEqual(cursorStart);
  });

  it("enter letter at start", () => {
    const typedStart = { currentWordId: 0, current: [] };
    const expected = { x: cursorStart.x + curXStep, y: cursorStart.y };
    const result = getCursorMovement(
      "r",
      typedStart,
      codeBlockSimple,
      "foo",
      "bar",
      {
        x: cursorStart.x,
        y: cursorStart.y,
      }
    );
    expect(result).toEqual(expected);
  });

  it("delete letter", () => {
    const typedStart = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "i" }],
    };
    const curCurrent = { x: cursorStart.x + curXStep, y: cursorStart.y };
    const result = getCursorMovement(
      BACKSPACE,
      typedStart,
      codeBlockSimple,
      "foo",
      "bar",
      curCurrent
    );
    expect(result.x).toBeCloseTo(cursorStart.x);
    expect(result.y).toBeCloseTo(cursorStart.y);
  });

  // need to check the next word in wordList but maybe should simplify the args
  // for getCursorMovement first
  it("New line - no indentation", () => {
    const expected = { x: cursorStart.x, y: cursorStart.y + curYStep };
    const typedStart = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
      ],
    };
    const codeBlock = `
foo
boo
 `;
    const result = getCursorMovement(ENTER, typedStart, codeBlock, "foo", "", {
      x: cursorStart.x + 3 * curXStep,
      y: cursorStart.y,
    });
    expect(result.x).toBeCloseTo(expected.x);
    expect(result.y).toBeCloseTo(expected.y);
  });

  it("New line - autoindent", () => {
    const expected = {
      x: cursorStart.x + 2 * curXStep,
      y: cursorStart.y + curYStep,
    };
    const typedStart = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
      ],
    };
    const codeBlock = `
foo
  boo
 `;
    const result = getCursorMovement(ENTER, typedStart, codeBlock, "foo", TAB, {
      x: cursorStart.x + 3 * curXStep,
      y: cursorStart.y,
    });
    expect(result.x).toBeCloseTo(expected.x);
    expect(result.y).toBeCloseTo(expected.y);
  });

  it("New line - backspace immediately", () => {
    const expected = {
      x: cursorStart.x,
      y: cursorStart.y + curYStep,
    };
    const typedStart = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
      ],
    };
    const codeBlock = `
foo
boo
 `;
    const result = getCursorMovement(
      BACKSPACE,
      typedStart,
      codeBlock,
      "foo",
      "boo",
      {
        x: cursorStart.x,
        y: cursorStart.y + curYStep,
      }
    );
    expect(result.x).toBeCloseTo(expected.x);
    expect(result.y).toBeCloseTo(expected.y);
  });

  it("New line autoindented - backspace immediately", () => {
    const expected = {
      x: cursorStart.x + 2 * curXStep,
      y: cursorStart.y + curYStep,
    };
    const typedStart = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
      ],
    };
    const codeBlock = `
foo
  boo
 `;
    const result = getCursorMovement(
      BACKSPACE,
      typedStart,
      codeBlock,
      TAB,
      "boo",
      {
        x: cursorStart.x + 2 * curXStep,
        y: cursorStart.y + curYStep,
      }
    );
    expect(result.x).toBeCloseTo(expected.x);
    expect(result.y).toBeCloseTo(expected.y);
  });

  it.todo("space mid word jump to next word");
});

/**
 * getNewTyped
 */
describe("getNewTyped", () => {
  const codeBlockSimple = "foo bar baz";
  const typedStart: Typed = {
    currentWordId: 0,
    current: [],
  };

  it("backspace on start", () => {
    const next = getNewTyped(
      BACKSPACE,
      { currentWordId: 0, current: [] },
      codeBlockSimple
    );
    expect(next).toEqual(typedStart);
  });

  it("single letter from start", () => {
    const next = getNewTyped(
      "a",
      { currentWordId: 0, current: [] },
      codeBlockSimple
    );
    const result = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "a" }],
    };
    expect(next).toEqual(result);
  });

  it("backspace on letter", () => {
    const next = getNewTyped(
      BACKSPACE,
      {
        currentWordId: 0,
        current: [
          { wordId: 0, letter: "i" },
          { wordId: 0, letter: "n" },
          { wordId: 0, letter: "t" },
        ],
      },
      codeBlockSimple
    );
    const result = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "n" },
      ],
    };
    expect(next).toEqual(result);
  });

  it("consecutive identical letters", () => {
    const result = {
      currentWordId: 0,
      current: Array(9).fill({ wordId: 0, letter: "o" }),
    };
    let next: Typed = {
      currentWordId: 0,
      current: [],
    };

    for (let i = 0; i < 9; ++i) {
      next = getNewTyped("o", next, codeBlockSimple);
    }
    expect(next).toEqual(result);
  });

  it("space increments wordId", () => {
    const next = getNewTyped(
      " ",
      {
        currentWordId: 0,
        current: [],
      },
      codeBlockSimple
    );
    const result = {
      currentWordId: 1,
      current: [{ wordId: 1, letter: " " }],
    };
    expect(next).toEqual(result);
  });

  it("overflow limiter simple", () => {
    const overflow_limit = 10;
    const result: Typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
        ...Array(overflow_limit).fill({ wordId: 0, letter: "o" }),
      ],
    };
    let next: Typed = {
      currentWordId: 0,
      current: [],
    };
    next = getNewTyped("f", next, codeBlockSimple);
    next = getNewTyped("o", next, codeBlockSimple);
    next = getNewTyped("o", next, codeBlockSimple);
    for (let i = 0; i < overflow_limit + 3; ++i) {
      next = getNewTyped("o", next, codeBlockSimple);
    }
    expect(next).toEqual(result);
  });

  it("overflow limiter newline", () => {
    const overflow_limit = 10;
    const result: Typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
        ...Array(overflow_limit).fill({ wordId: 0, letter: "o" }),
      ],
    };
    let next: Typed = {
      currentWordId: 0,
      current: [],
    };
    next = getNewTyped("f", next, "\nfoo\n");
    next = getNewTyped("o", next, "\nfoo\n");
    next = getNewTyped("o", next, "\nfoo\n");
    for (let i = 0; i < overflow_limit + 3; ++i) {
      next = getNewTyped("o", next, "\nfoo\n");
    }
    expect(next).toEqual(result);
  });

  it.todo("enter on start");
  it.todo("enter skips multiple words");
  it.todo("enter at end-of-line");
  it.todo("many backspaces after new line");
  it.todo("goto next word on enter");
});

/**
 * bisectWord
 */
describe("bisectWord", () => {
  it("initial state", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    const word = bisectWord(0, next);
    expect(word).toEqual([]);
  });

  it("fetch out-of-range wordId", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    expect(bisectWord(-1, next)).toEqual([]);
    expect(bisectWord(1, next)).toEqual([]);
  });

  it("middle fetch", () => {
    const next = {
      currentWordId: 2,
      current: [
        { wordId: 0, letter: "a" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "b" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "c" },
      ],
    };
    const word = bisectWord(1, next);
    expect(word).toEqual([{ wordId: 1, letter: "b" }]);
  });
});

/**
 * isWordComplete
 */
describe("isWordComplete", () => {
  it("word is complete", () => {
    const next = {
      currentWordId: 1,
      current: [{ wordId: 1, letter: " " }],
    };
    expect(isWordComplete(0, next)).toEqual(true);
  });

  it("word is incomplete", () => {
    const next = {
      currentWordId: 1,
      current: [{ wordId: 1, letter: " " }],
    };
    expect(isWordComplete(1, next)).toEqual(false);
  });
});

/**
 * getLastWord
 */
describe("getLastWord", () => {
  it("initial state", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    expect(getCurrentTyped(next)).toEqual([]);
  });

  it("last word extracted", () => {
    const next = {
      currentWordId: 1,
      current: [
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "f" },
        { wordId: 1, letter: "o" },
        { wordId: 1, letter: "o" },
      ],
    };
    const result = [
      { wordId: 1, letter: "f" },
      { wordId: 1, letter: "o" },
      { wordId: 1, letter: "o" },
    ];
    expect(getCurrentTyped(next)).toEqual(result);
  });
});

/**
 * getBareElements
 */
describe("getBareElements", () => {
  it("initial state", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    expect(getBareElements(next.current)).toEqual("");
  });

  it("reduction of entire state", () => {
    const next = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "b" },
        { wordId: 1, letter: "a" },
        { wordId: 1, letter: "r" },
      ],
    };
    expect(getBareElements(next.current)).toEqual("foo bar");
  });
});

/**
 * getCursorOffset
 */
describe("getCursorOffset", () => {
  const typed = {
    currentWordId: 1,
    current: [
      { wordId: 0, letter: "f" },
      { wordId: 0, letter: "o" },
      { wordId: 0, letter: "o" },
      { wordId: 1, letter: " " },
      { wordId: 1, letter: "b" },
      { wordId: 1, letter: "a" },
      { wordId: 1, letter: "r" },
    ],
  };

  it("initial state", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    expect(getCursorOffset(next, "foo bar")).toEqual(3);
  });

  it("no offset", () => {
    expect(getCursorOffset(typed, "foo bar")).toEqual(0);
  });

  it("simple offset", () => {
    expect(getCursorOffset(typed, "foo barbaz")).toEqual(3);
  });

  it("simple offset with enter", () => {
    typed.current.splice(3, 1, { wordId: 1, letter: "\n" });
    expect(getCursorOffset(typed, "foo\nbarbaz")).toEqual(3);
  });
});

/**
 * getWord
 */
describe("getWord", () => {
  it("empty codeBlock", () => {
    expect(getWord(0, [[]])).toEqual(null);
  });

  it("prev word at start", () => {
    expect(getWord(-1, [["foo", "bar"]])).toEqual(null);
  });

  it("single line, first of two words", () => {
    expect(getWord(0, [["foo", "bar"]])).toEqual("foo");
  });

  it("single line, last word", () => {
    expect(getWord(1, [["foo", "bar"]])).toEqual("bar");
  });

  it("two words on two lines, last word", () => {
    expect(getWord(1, [["foo"], ["bar"]])).toEqual("bar");
  });

  it("two lines, last word + one", () => {
    expect(getWord(2, [["foo"], ["bar"]])).toEqual(null);
  });

  it("two lines, next word autoindent", () => {
    expect(getWord(1, [["foo"], [TAB, "bar"]])).toEqual(TAB);
  });

  it("two lines, next word newline", () => {
    expect(getWord(1, [["foo"], [""]])).toEqual("");
  });

  it("prev word TAB check", () => {
    expect(
      getWord(3, [
        ["if", "(true)", "{"],
        [TAB, "const", "foo", "=", "'bar'"],
        ["}"],
      ])
    ).toEqual(TAB);
  });
});

/**
 * backspaceBypass
 */
describe("backspaceBypass", () => {
  it("cursor at start", () => {
    expect(backspaceBypass(cursorStart.x, true)).toEqual(false);
  });

  it("cursor not at start, prev typed right", () => {
    expect(backspaceBypass(cursorStart.x + curXStep, true)).toEqual(false);
  });

  it("cursor not at start, prev typed wrong", () => {
    expect(backspaceBypass(cursorStart.x + curXStep, false)).toEqual(true);
  });
});

/**
 * prevTypedCheck
 */
describe("prevTypedCheck", () => {
  it("prev word at start", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    expect(prevTypedCheck(typed, ["foo"])).toEqual(true);
  });

  it("prev word correct - same line", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
        { wordId: 1, letter: " " },
      ],
    };
    expect(prevTypedCheck(typed, ["foo", "bar"])).toEqual(true);
  });

  it("prev word wrong - same line", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "b" },
        { wordId: 1, letter: " " },
      ],
    };
    expect(prevTypedCheck(typed, ["foo", "bar"])).toEqual(false);
  });

  it("prev word right - next line", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
        { wordId: 1, letter: "\n" },
      ],
    };
    expect(prevTypedCheck(typed, ["foo", "bar"])).toEqual(true);
  });
  it("prev word wrong - next line", () => {
    const typed = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "b" },
        { wordId: 1, letter: "\n" },
      ],
    };
    expect(prevTypedCheck(typed, ["foo", "bar"])).toEqual(false);
  });
});

/**
 * enterBypass
 */
describe("enterBypass", () => {
  it("mid line", () => {
    const sSplitCode = [["foo", "bar"]];
    expect(enterBypass(0, sSplitCode)).toEqual(true);
  });

  it("end of line", () => {
    const sSplitCode = [["foo", "bar"]];
    expect(enterBypass(1, sSplitCode)).toEqual(true);
  });
});
