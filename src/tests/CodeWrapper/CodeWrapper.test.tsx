import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeWrapper } from "../../components/CodeWrapper/CodeWrapper";
import "@testing-library/jest-dom/extend-expect";

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
