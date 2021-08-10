import { KeyboardEvent, useState } from "react";
import { Cursor } from "./Cursor";
import { Letter, LetterState } from "./Letter";

function Practice() {
  const [cursorPos, setCursorPos] = useState({ x: 1, y: 25 });

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    // TODO: need to filter out more keys and probably want a better way
    if (event.key === "Shift" || event.key === "Control") {
      return;
    }
    console.log("detected keypress: ".concat(event.key));

    setCursorPos((cursorPos) => {
      return { x: cursorPos.x + 7, y: cursorPos.y };
    });
  };

  return (
    <main>
      <p>&laquo;main content&raquo;</p>
      <input autoComplete="off" autoFocus onKeyDown={handleKeyDown} />
      <div className="word-wrapper">
        {/* TODO: create a words class? */}
        <Cursor hidden={false} xpad={cursorPos.x} ypad={cursorPos.y} />
        <div className="words">
          <Letter letter="h" state={LetterState.correct} />
          <Letter letter="e" state={LetterState.correct} />
          <Letter letter="l" state={LetterState.incorrect} />
          <Letter letter="l" state={LetterState.correct} />
          <Letter letter="o" />
        </div>
      </div>
    </main>
  );
}

export default Practice;
