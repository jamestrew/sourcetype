import {
  bisectTyped,
  stringifyTyped,
} from "../../components/CodeWrapper/utils";

describe("bisectTyped", () => {
  it("initial state", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    const word = bisectTyped(0, next);
    expect(word).toEqual([]);
  });

  it("fetch out-of-range wordId", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    expect(bisectTyped(-1, next)).toEqual([]);
    expect(bisectTyped(1, next)).toEqual([]);
    expect(bisectTyped(0.5, next)).toEqual([]);
  });

  it("middle fetch", () => {
    const next = {
      currentWordId: 2,
      current: [
        { wordId: 0, letter: "a" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "b" },
        { wordId: 1, letter: "a" },
        { wordId: 1, letter: "r" },
        { wordId: 2, letter: " " },
        { wordId: 2, letter: "c" },
      ],
    };
    const word = bisectTyped(1, next);
    expect(word).toEqual([
      { wordId: 1, letter: "b" },
      { wordId: 1, letter: "a" },
      { wordId: 1, letter: "r" },
    ]);
  });
});

describe("stringifyTyped", () => {
  it("initial state", () => {
    const next = {
      currentWordId: 0,
      current: [],
    };
    expect(stringifyTyped(next.current)).toEqual("");
  });

  it("reduction of entire state", () => {
    const next = {
      currentWordId: 1,
      current: [
        { wordId: 0, letter: "f" },
        { wordId: 0, letter: "o" },
        { wordId: 0, letter: "o" },
        { wordId: 1, letter: " " },
        { wordId: 1, letter: "b" },
        { wordId: 1, letter: "a" },
        { wordId: 1, letter: "r" },
      ],
    };
    expect(stringifyTyped(next.current)).toEqual("foo bar");
  });
});
