import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeWrapper, Typed, testing } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
import { TAB, BACKSPACE, ENTER } from "../utils/constants";
const {
  curXStep,
  curYStep,
  curXStart,
  curYStart,
  getCursorMovement,
  getNewTyped,
  bisectWord,
  isWordComplete,
  getCurrentTyped,
  getBareElements,
  getCursorOffset,
  getWord,
  backspaceIgnore,
  prevTypedCheck,
  enterIgnore,
  countTabs,
} = testing;

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
  const sSplitSimple = [["foo", "bar", "baz"]];
  const bSplitSimple = ["foo", "bar", "baz"];

  it("enter letter at start", () => {
    const typedStart = { currentWordId: 0, current: [] };
    const expected = { x: curXStart + curXStep, y: curYStart };
    const result = getCursorMovement(
      "r",
      typedStart,
      sSplitSimple,
      bSplitSimple,
      { x: curXStart, y: curYStart }
    );
    expect(result).toEqual(expected);
  });

  it("delete letter", () => {
    const typedStart = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "i" }],
    };
    const curCurrent = { x: curXStart + curXStep, y: curYStart };
    const result = getCursorMovement(
      BACKSPACE,
      typedStart,
      sSplitSimple,
      bSplitSimple,
      curCurrent
    );
    expect(result.x).toBeCloseTo(curXStart);
    expect(result.y).toBeCloseTo(curYStart);
  });

  it("New line - no indentation", () => {
    const expected = { x: curXStart, y: curYStart + curYStep };
    const typedStart = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
      ],
    };
    const sSplit = [["foo"], ["bar"]];
    const bSplit = ["foo", "bar"];
    const cursor = {
      x: curXStart + 3 * curXStep,
      y: curYStart,
    };
    const result = getCursorMovement(ENTER, typedStart, sSplit, bSplit, cursor);
    expect(result.x).toBeCloseTo(expected.x);
    expect(result.y).toBeCloseTo(expected.y);
  });

  it("New line - autoindent", () => {
    const expected = {
      x: curXStart + 2 * curXStep,
      y: curYStart + curYStep,
    };
    const typedStart = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
      ],
    };
    const sSplit = [["foo"], [TAB, "bar"]];
    const bSplit = ["foo", "bar"];
    const cursor = {
      x: curXStart + 3 * curXStep,
      y: curYStart,
    };
    const result = getCursorMovement(ENTER, typedStart, sSplit, bSplit, cursor);
    expect(result.x).toBeCloseTo(expected.x);
    expect(result.y).toBeCloseTo(expected.y);
  });
});

/**
 * getNewTyped
 */
describe("getNewTyped", () => {
  it("single letter from start", () => {
    const next = getNewTyped("a", { currentWordId: 0, current: [] });
    const result = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "a" }],
    };
    expect(next).toEqual(result);
  });

  it("backspace on letter", () => {
    const next = getNewTyped(BACKSPACE, {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "i" },
        { wordId: 0, letter: "n" },
        { wordId: 0, letter: "t" },
      ],
    });
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
      next = getNewTyped("o", next);
    }
    expect(next).toEqual(result);
  });

  it("space increments wordId", () => {
    const next = getNewTyped(" ", {
      currentWordId: 0,
      current: [],
    });
    const result = {
      currentWordId: 1,
      current: [{ wordId: 1, letter: " " }],
    };
    expect(next).toEqual(result);
  });

  it.skip("overflow limiter simple", () => {
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
    next = getNewTyped("f", next);
    next = getNewTyped("o", next);
    next = getNewTyped("o", next);
    for (let i = 0; i < overflow_limit + 3; ++i) {
      next = getNewTyped("o", next);
    }
    expect(next).toEqual(result);
  });

  it.skip("overflow limiter newline", () => {
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
    next = getNewTyped("f", next);
    next = getNewTyped("o", next);
    next = getNewTyped("o", next);
    for (let i = 0; i < overflow_limit + 3; ++i) {
      next = getNewTyped("o", next);
    }
    expect(next).toEqual(result);
  });

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
    expect(getCursorOffset(next, ["foo", "bar"])).toEqual(3);
  });

  it("no offset", () => {
    expect(getCursorOffset(typed, ["foo", "bar"])).toEqual(0);
  });

  it("simple offset", () => {
    expect(getCursorOffset(typed, ["foo", "barbaz"])).toEqual(3);
  });

  it("simple offset with enter", () => {
    typed.current.splice(3, 1, { wordId: 1, letter: "\n" });
    expect(getCursorOffset(typed, ["foo", "barbaz"])).toEqual(3);
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
 * backspaceignore
 */
describe("backspaceignore", () => {
  it("cursor at start", () => {
    const typed = {
      currentWordId: 0,
      current: [],
    };
    expect(backspaceIgnore(curXStart, typed, ["foo"])).toEqual(true);
  });

  it("cursor not at start, prev typed right", () => {
    const typed = {
      currentWordId: 1,
      current: [{ wordId: 0, letter: "a" }],
    };
    expect(backspaceIgnore(curXStart + curXStep, typed, ["a", "b"])).toEqual(
      true
    );
  });

  it("cursor not at start, prev typed wrong", () => {
    const typed = {
      currentWordId: 1,
      current: [{ wordId: 0, letter: "b" }],
    };
    expect(backspaceIgnore(curXStart + curXStep, typed, ["a", "b"])).toEqual(
      false
    );
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
 * enterIgnore
 */
describe("enterIgnore", () => {
  it("mid line", () => {
    const sSplitCode = [["foo", "bar"]];
    expect(enterIgnore(0, sSplitCode)).toEqual(true);
  });

  it("end of line, no new line", () => {
    const sSplitCode = [["foo", "bar"]];
    expect(enterIgnore(1, sSplitCode)).toEqual(false);
  });

  it("end of line, new line", () => {
    const sSplitCode = [["foo"], ["bar"]];
    expect(enterIgnore(0, sSplitCode)).toEqual(false);
  });

  it("end of line, new line with indent", () => {
    const sSplitCode = [["foo"], [TAB, "bar"]];
    expect(enterIgnore(0, sSplitCode)).toEqual(false);
  });
});

/**
 * countTabs
 */
describe("countTabs", () => {
  it("one line - no indents", () => {
    const sCode = [["foo", "bar"]];
    expect(countTabs(0, sCode)).toEqual(0);
  });

  it("two line - no indents", () => {
    const sCode = [["foo"], ["bar"]];
    expect(countTabs(0, sCode)).toEqual(0);
  });

  it("two line - one indents", () => {
    const sCode = [["foo"], [TAB, "bar"]];
    expect(countTabs(0, sCode)).toEqual(1);
  });

  it("two line - two indents", () => {
    const sCode = [["foo"], [TAB, TAB, "bar"]];
    expect(countTabs(0, sCode)).toEqual(2);
  });
});
