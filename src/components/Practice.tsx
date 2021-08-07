import { KeyboardEvent } from "react";
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
      <Letter letter={"h"} state={LetterState.Untyped} />
      <Letter letter={"e"} state={LetterState.Untyped} />
      <Letter letter={"l"} state={LetterState.Untyped} />
      <Letter letter={"l"} state={LetterState.Untyped} />
      <Letter letter={"o"} state={LetterState.Untyped} />
    </main>
  );
}

export default Practice;
