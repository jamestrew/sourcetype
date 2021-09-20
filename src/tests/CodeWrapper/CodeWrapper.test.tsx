import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeWrapper, testing } from "../../components/CodeWrapper/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";
import { ENTER_CODE } from "utils/constants";
const { currentTypedWord } = testing;

describe("CodeWrapper", () => {
  beforeEach(() => {
    render(
      <CodeWrapper sSplitCode={[["foo"]]} bSplitCode={["foo"]} tabSize={2} />
    );
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

describe("currentTypedWord", () => {
  it("basic", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "a" },
        { wordId: 0, letter: "b" },
        { wordId: 0, letter: "c" },
      ],
    };
    expect(currentTypedWord(typed, 0)).toEqual(["a", "b", "c"]);
  });

  it("new line word", () => {
    const typed = {
      currentWordId: 0,
      current: [
        { wordId: 0, letter: "a" },
        { wordId: 0, letter: "b" },
        { wordId: 0, letter: "c" },
        { wordId: 1, letter: ENTER_CODE },
        { wordId: 1, letter: "d" },
        { wordId: 1, letter: "e" },
        { wordId: 1, letter: "f" },
      ],
    };
    expect(currentTypedWord(typed, 1)).toEqual(["d", "e", "f"]);
  });
});
