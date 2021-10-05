import { KeyboardEvent, FC, useState, useRef } from "react";
import { Cursor } from "../Cursor";
import { Word } from "../Word";
import { Tab } from "../Tab";
import { TAB_CODE, BACKSPACE, ENTER_CODE } from "../../utils/constants";
import createKeyHandler from "./keyHandler";
import {
  isWordComplete,
  stringifyTyped,
  bisectTyped,
  getCurrentTyped,
} from "./utils";

import { Blurred, CursorPos, Hidden, ICodeWrapper, Typed } from "./types";

export const curXStep = 0.582;
export const curYStep = 1.875;
export const curXStart = 0;
export const curYStart = -0.2;

export const CodeWrapper: FC<ICodeWrapper> = ({ sSplitCode, bSplitCode }) => {
  const [cursorPos, setCursorPos] = useState<CursorPos>({
    x: curXStart,
    y: curYStart,
  });
  const [typed, setTyped] = useState<Typed>({
    currentWordId: 0,
    current: [],
  });
  const focusInputRef = useRef<HTMLInputElement>(null);
  const blurCodeRef = useRef<HTMLParagraphElement>(null);
  const [focusWarning, setFocusWarning] = useState<Hidden>("hidden");
  const [endScreen, setEndScreen] = useState<Hidden>("hidden");
  const [blurred, setBlurred] = useState<Blurred>("");

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const keyHandler = createKeyHandler({
      key: event.key,
      typed,
      cursorPos,
      sSplit: sSplitCode,
      bSplit: bSplitCode,
    });

    if (keyHandler.ignoreInput()) return;
    keyHandler.handleKey();

    setCursorPos(keyHandler.newCursorPos);
    setTyped(keyHandler.newTyped);
    if (keyHandler.IsEnd()) setEndScreen("");
  };

  const handleClickToFocus = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!focusInputRef || !focusInputRef.current) return;
    focusInputRef.current.focus();
    setFocusWarning("hidden");
    setBlurred("");
  };

  const handleFocusOut = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    setTimeout(() => {
      if (focusInputRef.current !== document.activeElement) {
        setFocusWarning("");
        setBlurred("blurred");
      }
    }, 1000);
  };

  let wordIdx = 0;
  return (
    <>
      <div id="endScreen" className={endScreen}></div>
      <div
        id="focusWarning"
        data-testid="focusWarning"
        className={focusWarning}
      >
        Click to focus
      </div>
      <div
        id="codeWrapper"
        data-testid="codeWrapper"
        className={blurred}
        onClick={handleClickToFocus}
        ref={blurCodeRef}
      >
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        {sSplitCode.map((line, lineNum) => {
          return (
            <div className="flex flex-wrap WordList" key={lineNum}>
              {line.map((wd, wdNum) => {
                if (wd === TAB_CODE)
                  return (
                    <Tab key={`${lineNum}:${wdNum}`} spaceSize={curXStep} />
                  );
                const i = wordIdx;
                wordIdx++;
                return (
                  <Word
                    key={i}
                    text={wd}
                    value={currentTypedWord(typed, i)}
                    isComplete={isWordComplete(i, typed)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="grid justify-items-center py-2">
        <input
          id="codeInput"
          data-testid="codeInput"
          ref={focusInputRef}
          tabIndex={0}
          defaultValue={stringifyTyped(getCurrentTyped(typed))}
          autoComplete="off"
          onKeyPress={handleKeyPress}
          onKeyDown={(e) => e.key === BACKSPACE && handleKeyPress(e)}
          onBlur={handleFocusOut}
          autoFocus
        />
      </div>
    </>
  );
};

const currentTypedWord = (typed: Typed, idx: number): string[] => {
  return stringifyTyped(bisectTyped(idx, typed))
    .replaceAll(ENTER_CODE, "")
    .split("");
};

export const testing = {
  currentTypedWord,
};
