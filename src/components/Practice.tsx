import { CodeWrapper } from "./CodeWrapper";

function Practice() {
  const code = `
if (true) {
  if (bar) {
    return 'foo'
  }
}
  `;
  return (
    <main>
      <CodeWrapper codeBlock={code} />
    </main>
  );
}

export default Practice;
