import { render, fireEvent, screen } from "@testing-library/react";
import { CodeWrapper, curXStep, cursorStart } from "components/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";

describe("CodeWrapper", () => {
  beforeEach(() => {
    render(<CodeWrapper codeBlock="foo" />);
  });

  it("verify backspace letters", async () => {
    // cursorStart is somehow mutated if put below inputs?!?!!?
    const xPos = cursorStart.x + curXStep;
    const yPos = cursorStart.y
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
    const xPos = cursorStart.x
    const yPos = cursorStart.y
    const codeInput = screen.getByTestId("codeInput");
    const cursor = screen.getByTestId("cursor");
    fireEvent.keyDown(codeInput, { key: "Backspace", charCode: 8 });
    fireEvent.keyDown(codeInput, { key: "Backspace", charCode: 8 });

    expect(cursor).toHaveStyle(`left: ${xPos}em`);
    expect(cursor).toHaveStyle(`top: ${yPos}em`);
  });
});
