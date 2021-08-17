import { render, fireEvent, screen } from "@testing-library/react";
import { CodeWrapper, testing } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
const {
  smartSplit,
  curXStep,
  cursorStart,
  tab,
  getCursorMovement,
  getNextTyped,
  bisectWord,
} = testing;

describe("CodeWrapper", () => {
  beforeEach(() => {
    render(<CodeWrapper codeBlock="foo" />);
  });

  it("verify backspace letters", async () => {
    // cursorStart is somehow mutated if put below inputs?!?!!?
    const xPos = cursorStart.x + curXStep;
    const yPos = cursorStart.y;
    const codeInput = screen.getByTestId("codeInput");
    const cursor = screen.getByTestId("cursor");
    fireEvent.keyPress(codeInput, { key: "a", charCode: 65 });
    fireEvent.keyPress(codeInput, { key: "b", charCode: 66 });
    fireEvent.keyDown(codeInput, { key: "Backspace", charCode: 8 });
    fireEvent.keyDown(codeInput, { key: "Backspace", charCode: 8 });
    fireEvent.keyPress(codeInput, { key: "c", charCode: 67 });

    expect(cursor).toHaveStyle(`left: ${xPos}em`);
    expect(cursor).toHaveStyle(`top: ${yPos}em`);
    expect(codeInput).toHaveValue("c");
  });

  it("backspace at start", async () => {
    const xPos = cursorStart.x;
    const yPos = cursorStart.y;
    const codeInput = screen.getByTestId("codeInput");
    const cursor = screen.getByTestId("cursor");
    fireEvent.keyDown(codeInput, { key: "Backspace", charCode: 8 });
    fireEvent.keyDown(codeInput, { key: "Backspace", charCode: 8 });

    expect(cursor).toHaveStyle(`left: ${xPos}em`);
    expect(cursor).toHaveStyle(`top: ${yPos}em`);
    expect(codeInput).toHaveValue("");
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

  it("codeblock: basic if", () => {
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
  it("backspace on start", () => {
    const typedStart = { currentWordId: 0, current: [] };
    const result = getCursorMovement("Backspace", typedStart, cursorStart);
    expect(result).toEqual(cursorStart);
  });

  it("enter letter at start", () => {
    const typedStart = { currentWordId: 0, current: [] };
    const expected = { x: cursorStart.x + curXStep, y: cursorStart.y };
    const result = getCursorMovement("r", typedStart, cursorStart);
    expect(result).toEqual(expected);
  });

  it("delete letter", () => {
    const typedStart = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "i" }],
    };
    const curCurrent = { x: cursorStart.x + curXStep, y: cursorStart.y };
    const result = getCursorMovement("Backspace", typedStart, curCurrent);
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
  const typedStart = { currentWordId: 0, current: [] };

  it("backspace on start", () => {
    const result = getNextTyped("Backspace", typedStart, codeBlockSimple);
    expect(result).toEqual(typedStart);
  });

  it("enter letter at start", () => {
    const result = getNextTyped("a", typedStart, codeBlockSimple);
    const expected = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "a" }],
    };
    expect(result).toEqual(expected);
  });

  it("delete letter", () => {
    const currentTyped = {
      currentWordId: 0,
      current: [{ wordId: 0, letter: "a" }],
    };
    const result = getNextTyped("Backspace", currentTyped, codeBlockSimple);
    expect(result).toEqual({ currentWordId: 0, current: [] });
  });

  it.todo("space mid word");
  it.todo("newline");
});

/**
 * bisectWord
 */
describe("bisectWord", () => {
  const typedStart = { currentWordId: 0, current: [] };

  it.todo("empty");
});
