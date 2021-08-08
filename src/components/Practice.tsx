import { KeyboardEvent } from "react";
import { Cursor } from "./Cursor";
import { Letter, LetterState } from "./Letter";

function Practice() {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    console.log("detected keypress: ".concat(event.key));
  };

  return (
    <main>
      <p>&laquo;main content&raquo;</p>
      <input autoComplete="off" autoFocus onKeyDown={handleKeyDown} />
      <div className="word-wrapper">
        {/* TODO: create a words class? */}
        <Cursor hidden={false} xpad={12} ypad={25} />
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
