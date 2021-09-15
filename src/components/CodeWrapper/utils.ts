import { Typed } from "./types";

export const stringifyTyped = (input: Typed["current"]): string => {
  return input.map((i) => i.letter).reduce((r, i) => r + i, "");
};

export const bisectTyped = (wordId: number, typed: Typed): Typed["current"] => {
  let result: Typed["current"] = [];
  let [lo, hi] = [wordId, typed.current.length];

  if (wordId < 0 || wordId > typed.current.length)
    throw new Error("wordId out of expected range for bisectTyped");

  while (lo < hi) {
    let mid = Math.floor((lo + hi) / 2);
    if (typed.current[mid].wordId < wordId) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  for (let i = lo; i < typed.current.length; ++i) {
    if (typed.current[i].wordId === wordId) {
      result.push(typed.current[i]);
    } else break;
  }
  return result.filter((i) => i.letter !== " " && i.letter !== "\n");
};

export const getCurrentTyped = (typed: Typed): Typed["current"] => {
  return bisectTyped(typed.currentWordId, typed);
};

export const isWordComplete = (wordId: number, typed: Typed): boolean => {
  return wordId < typed.currentWordId;
};
