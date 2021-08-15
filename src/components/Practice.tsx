import { CodeWrapper } from "./CodeWrapper";

function Practice() {
  const code = `
if (true) {
  return 'foo'
}
  `;
  return (
    <main>
      <CodeWrapper codeBlock={code} />
    </main>
  );
}

export default Practice;
