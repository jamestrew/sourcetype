import { CodeWrapper } from "./CodeWrapper";

function Practice() {
<<<<<<< HEAD
  return (
    <CodeWrapper codeBlock="The quick brown fox jumped over the lazy dog" />
=======
  const [cursorPos, setCursorPos] = useState({ x: 1, y: 25 });

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    console.log("detected keypress: ".concat(event.key));

    setCursorPos((cursorPos) => {
      return { x: cursorPos.x + 7, y: cursorPos.y };
    });
  };

  return (
    <main>
      <p>&laquo;main content&raquo;</p>
      <input autoComplete="off" autoFocus onKeyPress={handleKeyDown} />
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
>>>>>>> c4d3c79aa73d45013d4eec02a8c9bdb10d9df5a4
  );
}

export default Practice;
