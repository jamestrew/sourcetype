import { KeyboardEvent, FC, useState, useRef, useEffect } from "react";
import { Cursor } from "../Cursor";
import { Word } from "../Word";
import { Tab } from "../Tab";
import { TAB_CODE, BACKSPACE, ENTER_CODE } from "../../utils/constants";
import createKeyHandler from "./keyHandler";
import { isWordComplete, stringifyTyped, bisectTyped } from "./utils";

import { WrapClass, CursorPos, Hidden, ICodeWrapper, Typed } from "./types";

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
  const [focus, setFocus] = useState(true);
  const [end, setEnd] = useState(false);
  const [wrapClass, setWrapClass] = useState<WrapClass>("");

  useEffect(() => {
    setCursorPos({ x: curXStart, y: curYStart });
    setTyped({ currentWordId: 0, current: [] });
  }, [sSplitCode, bSplitCode, end]);

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
    if (keyHandler.isEnd()) {
      setEnd(true);
      setWrapClass("endscreen");
    }
  };

  const handleClickToFocus = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!focusInputRef || !focusInputRef.current || end) return;
    focusInputRef.current.focus();
    setFocus(true);
    setWrapClass("");
  };

  const handleFocusOut = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (end) return;
    setTimeout(() => {
      if (focusInputRef.current !== document.activeElement) {
        setFocus(false);
        setWrapClass("blurred");
      }
    }, 1000);
  };

  let wordIdx = 0;
  return (
    <div id="codeWrapper">
      {/* TODO: probably should make this into it's own component */}
      <div id="endScreen" className={end ? "" : "hidden"}>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
        <h1 className="text-red-500">ROUND OVER</h1>
      </div>
      <div
        id="focusWarning"
        data-testid="focusWarning"
        className={focus ? "hidden" : ""}
      >
        Click to focus
      </div>
      <div
        data-testid="codeWrapper"
        className={wrapClass}
        onClick={handleClickToFocus}
        ref={blurCodeRef}
      >
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        {sSplitCode.map((line, lineNum) => {
          return (
            <div className="flex WordList" key={lineNum}>
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
                    value={stringifyTyped(bisectTyped(i, typed)).split("")}
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
          autoComplete="off"
          onKeyPress={handleKeyPress}
          onKeyDown={(e) => e.key === BACKSPACE && handleKeyPress(e)}
          onBlur={handleFocusOut}
          autoFocus
        />
      </div>
    </div>
  );
};

// FIX: deprecated
const currentTypedWord = (typed: Typed, idx: number): string[] => {
  return stringifyTyped(bisectTyped(idx, typed))
    .replaceAll(ENTER_CODE, "")
    .split("");
};

export const testing = {
  currentTypedWord,
};
