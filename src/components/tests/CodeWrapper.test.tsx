import { render, fireEvent, screen } from "@testing-library/react";
import { CodeWrapper } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
import { testing } from "../CodeWrapper";
const { smartSplit, curXStep, cursorStart, tab } = testing;

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
