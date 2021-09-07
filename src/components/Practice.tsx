import { BaseSyntheticEvent, FC, useState } from "react";
import { CodeWrapper } from "./CodeWrapper";
import { TAB } from "../utils/constants";
import { useLanguagesQuery, useRandCodeByLangQuery } from "generated/graphql";

export const Practice: FC = () => {
  const [langId, setLangId] = useState(1);
  const codeQuery = useRandCodeByLangQuery({
    variables: {
      language_id: langId,
    },
  });
  const langQuery = useLanguagesQuery({
    variables: {},
  });

  const code = codeQuery.data?.randCodeByLang.snippet ?? "";
  const sSplitCode = smartSplit(code);
  const bSplitCode = code.trim().split(/[\n ]/);

  const langChange = (e: BaseSyntheticEvent) => {
    setLangId(Number(e.target.value));
  };

  return (
    <main>
      <div className="flex-auto flex space-x-3">
        <form action="post" className="py-3">
          <label htmlFor="language">Select Language: </label>
          <select
            id="language"
            name="language"
            onChange={langChange}
            className="border border-gray-300 w-52 py-1 px-1 rounded-md shadow-sm focus:outline-none dark:bg-gray-900"
          >
            {langQuery.data?.languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </form>
        <button
          className="flex items-center px-5 justify-center rounded-md dark:bg-gray-900"
          onClick={() => codeQuery.refetch()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"
            />
            <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z" />
          </svg>
        </button>
      </div>
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
