import { testing } from "../components/Practice";
import { TAB } from "../utils/constants";
const { smartSplit } = testing;

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
    const result = [["these", TAB, "are", TAB, "TAB", TAB, "spaced"]];
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
      [TAB, "const", "foo", "=", "'bar'"],
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
      [TAB, "if", "foo:"],
      [TAB, TAB, "return", "True"],
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
      [TAB, "if", "foo:"],
      [TAB, TAB, "return", "True"],
      [""],
      [""],
      ["func()"],
    ];
    expect(smartSplit(str)).toEqual(result);
  });
});
