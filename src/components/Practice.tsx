import { KeyboardEvent } from "react";


function Practice() {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    console.log("detected keypress: ".concat(event.key))
  }

  return (
    <main>
      <p>&laquo;main content&raquo;</p>
      <input autoComplete="off" autoFocus onKeyDown={handleKeyDown} />
    </main>
  );
}

export default Practice;
