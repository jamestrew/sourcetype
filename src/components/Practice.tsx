import { FC } from "react";
import { CodeWrapper } from "./CodeWrapper";
import { TAB } from "../utils/constants";

export const Practice: FC = () => {
  const code = `
if (true) {
  if (bar) {
    return 'foo'
  }
}
  `;

  const sSplitCode = smartSplit(code);
  const bSplitCode = code.trim().split(/[\n ]/);

  return (
    <main>
      <CodeWrapper sSplitCode={sSplitCode} bSplitCode={bSplitCode} />
    </main>
  );
};

/**
 * Tokenizes a formatted multi-line code block
 * @param {(string | null)} str - a code block
 * @returns {string[][]} array of words and format strings per line
 */
const smartSplit = (str: string | null): string[][] => {
  let words: string[][] = [];
  if (str == null || str === "") return words;

  str = str.trim();

  let word = "";
  let line = [];
  for (let i = 0; i <= str.length; i++) {
    if (str[i] === " " || i === str.length) {
      if (str[i + 1] === " ") {
        if (word) line.push(word);
        word = TAB;
        i++;
      }
      line.push(word);
      word = "";
    } else if (str[i] === "\n") {
      line.push(word);
      words.push(line);
      line = [];
      word = "";
    } else {
      word += str[i];
    }
  }
  words.push(line);
  return words;
};

export const testing = {
  smartSplit,
};
