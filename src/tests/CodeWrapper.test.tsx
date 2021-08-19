import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeWrapper, Typed, testing } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
const {
  smartSplit,
  curXStep,
  cursorStart,
  tab,
  getCursorMovement,
  getNextTyped,
  bisectWord,
  isWordComplete,
  getLastWord,
  getBareElements,
} = testing;

describe("CodeWrapper", () => {
  beforeEach(() => {
    render(<CodeWrapper codeBlock="foo" />);
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
    const timer = setTimeout(() => {
      expect(codeInput).not.toHaveFocus();
      expect(focusWarning).not.toHaveClass("hidden");
      expect(codeWrapper).toHaveClass("blurred");
    }, 1001);
    clearTimeout(timer);
  });
});

/**
 * smartSplit
 */
describe("smart splitting", () => {
  it("blank codeBlock", () => {
    expect(smartSplit("")).toEqual([]);
  });

  it("one line basic sentence", () => {
    const str = "this app is sick";
    const result = [["this", "app", "is", "sick"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("poorly spaced one line basic sentence", () => {
    const str = " this app is sick ";
    const result = [["this", "app", "is", "sick"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("one line sentence with tabs", () => {
    const str = "these  are  tab  spaced";
    const result = [["these", tab, "are", tab, "tab", tab, "spaced"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("simply multiline", () => {
    const str = `these
are
lines`;
    const result = [["these"], ["are"], ["lines"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("codeblock: basic if", () => {
    const str = `if (true) {
  const foo = 'bar'
}`;
    const result = [
      ["if", "(true)", "{"],
      [tab, "const", "foo", "=", "'bar'"],
      ["}"],
    ];
    expect(smartSplit(str)).toEqual(result);
  });

  it("codeblock: python func", () => {
    const str = `def func:
  if foo:
    return True

  `;
    const result = [
      ["def", "func:"],
      [tab, "if", "foo:"],
      [tab, tab, "return", "True"],
    ];
    expect(smartSplit(str)).toEqual(result);
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
      "Backspace",
      typedStart,
      codeBlockSimple,
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
      cursorStart
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
      "Backspace",
      typedStart,
      codeBlockSimple,
      curCurrent
    );
    expect(result.x).toBeCloseTo(cursorStart.x);
    expect(result.y).toBeCloseTo(cursorStart.y);
  });

  it.todo("space mid word jump to next word");
  it.todo("New line - no indentation");
  it.todo("New line - autoindent");
});

/**
 * getNextTyped
 */
describe("getNextTyped", () => {
  const codeBlockSimple = "foo bar baz";
  const typedStart: Typed = {
    currentWordId: 0,
    current: [],
  };

  it("backspace on start", () => {
    const next = getNextTyped(
      "Backspace",
      { currentWordId: 0, current: [] },
      codeBlockSimple
    );
    expect(next).toEqual(typedStart);
  });

  it("single letter from start", () => {
    const next = getNextTyped(
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
    const next = getNextTyped(
      "Backspace",
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
      next = getNextTyped("o", next, codeBlockSimple);
    }
    expect(next).toEqual(result);
  });

  it("space increments wordId", () => {
    const next = getNextTyped(
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
    next = getNextTyped("f", next, codeBlockSimple);
    next = getNextTyped("o", next, codeBlockSimple);
    next = getNextTyped("o", next, codeBlockSimple);
    for (let i = 0; i < overflow_limit + 3; ++i) {
      next = getNextTyped("o", next, codeBlockSimple);
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
    next = getNextTyped("f", next, "\nfoo\n");
    next = getNextTyped("o", next, "\nfoo\n");
    next = getNextTyped("o", next, "\nfoo\n");
    for (let i = 0; i < overflow_limit + 3; ++i) {
      next = getNextTyped("o", next, "\nfoo\n");
    }
    expect(next).toEqual(result);
  });

  it.todo("enter on start");
  it.todo("enter skips multiple words");
  it.todo("enter at end-of-line");
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
    expect(getLastWord(next)).toEqual([]);
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
    expect(getLastWord(next)).toEqual(result);
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
