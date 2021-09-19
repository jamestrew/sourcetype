import { testing } from "../components/Practice";
import { ENTER_CODE, TAB_CODE } from "../utils/constants";
const { smartSplit, basicSplit } = testing;

/**
 * smartSplit
 */
describe("smart splitting", () => {
  it("blank codeBlock", () => {
    expect(smartSplit("")).toEqual([]);
  });

  it("one line basic sentence", () => {
    const str = "this app is sick";
    const result = [["this", "app", "is", "sick"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("poorly spaced one line basic sentence", () => {
    const str = " this app is sick ";
    const result = [["this", "app", "is", "sick"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("one line sentence with TABs", () => {
    const str = "these  are  TAB  spaced";
    const result = [
      ["these", TAB_CODE, "are", TAB_CODE, "TAB", TAB_CODE, "spaced"],
    ];
    expect(smartSplit(str)).toEqual(result);
  });

  it("simply multiline", () => {
    const str = `these
are
lines`;
    const result = [["these"], ["are"], ["lines"]];
    expect(smartSplit(str)).toEqual(result);
  });

  it("codeblock: basic if", () => {
    const str = `if (true) {
  const foo = 'bar'
}`;
    const result = [
      ["if", "(true)", "{"],
      [TAB_CODE, "const", "foo", "=", "'bar'"],
      ["}"],
    ];
    expect(smartSplit(str)).toEqual(result);
  });

  it("codeblock: python func", () => {
    const str = `def func:
  if foo:
    return True

  `;
    const result = [
      ["def", "func:"],
      [TAB_CODE, "if", "foo:"],
      [TAB_CODE, TAB_CODE, "return", "True"],
    ];
    expect(smartSplit(str)).toEqual(result);
  });

  it("consecutive newlines", () => {
    const str = `
def func:
  if foo:
    return True


func()
`;
    const result = [
      ["def", "func:"],
      [TAB_CODE, "if", "foo:"],
      [TAB_CODE, TAB_CODE, "return", "True"],
      [""],
      [""],
      ["func()"],
    ];
    expect(smartSplit(str)).toEqual(result);
  });
});

describe("basic split", () => {
  it("empty string", () => {
    expect(basicSplit("")).toEqual([]);
  });

  it("code 2 space tabs", () => {
    const code = `
if (true) {
  if (bar) {
    return 'foo'
  }
}
    `;

    expect(basicSplit(code)).toEqual([
      "if",
      "(true)",
      "{",
      "if",
      "(bar)",
      "{",
      "return",
      "'foo'",
      "}",
      "}",
    ]);
  });
});
