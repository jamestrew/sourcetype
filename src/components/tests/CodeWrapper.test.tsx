import { render, fireEvent, screen } from "@testing-library/react";
import { CodeWrapper } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
import { testing } from "../CodeWrapper";
const { smartSplit, curXStep, cursorStart } = testing;

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
  });
});

describe("smart splitting", () => {
  it("blank codeBlock", () => {
    expect(smartSplit("")).toEqual([""]);
  });

  it("one line basic sentence", () => {
    const str = "this app is sick";
    const result = ["this", "app", "is", "sick"];
    expect(smartSplit(str)).toEqual(result);
  });

  it("poorly spaced one line basic sentence", () => {
    const str = " this app is sick ";
    const result = ["this", "app", "is", "sick"];
    expect(smartSplit(str)).toEqual(result);
  });

  it("one line sentence with tabs", () => {
    const tab = "&#x9;";
    const str = "these  are  tab  spaced";
    const result = ["these", tab, "are", tab, "tab", tab, "spaced"];
    expect(smartSplit(str)).toEqual(result);
  });

  it("simply multiline", () => {
    const cr = "&#xA;";
    const str = `these
are
lines`;
    const result = ["these", cr, "are", cr, "lines"];
    expect(smartSplit(str)).toEqual(result);
  });

  it("codeblock: basic if", () => {
    const cr = "&#xA;";
    const tab = "&#x9;";
    const str = `if (true) {
  const foo = 'bar'
}`;
    const result = [
      "if",
      "(true)",
      "{",
      cr,
      tab,
      "const",
      "foo",
      "=",
      "'bar'",
      cr,
      "}",
    ];
    expect(smartSplit(str)).toEqual(result);
  });

  it("codeblock: basic if", () => {
    const cr = "&#xA;";
    const tab = "&#x9;";
    const str = `def func:
  if foo:
    return True

`;
    const result = [
      "def",
      "func:",
      cr,
      tab,
      "if",
      "foo:",
      cr,
      tab,
      tab,
      "return",
      "True",
    ];
    expect(smartSplit(str)).toEqual(result);
  });
});
