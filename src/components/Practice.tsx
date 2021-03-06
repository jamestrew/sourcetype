import { BaseSyntheticEvent, FC, useState } from "react";
import { CodeWrapper } from "./CodeWrapper/CodeWrapper";
import { TAB_CODE } from "../utils/constants";
import { useLanguagesQuery, useRandCodeByLangQuery } from "generated/graphql";
import { BiShuffle } from "react-icons/bi";

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
  const bSplitCode = basicSplit(code);

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
        <div className="flex items-center">
          <button
            className="items-center px-2 py-2 rounded-md dark:bg-gray-900"
            onClick={() => codeQuery.refetch()}
          >
            <BiShuffle />
          </button>
        </div>
      </div>
      <CodeWrapper sSplitCode={sSplitCode} bSplitCode={bSplitCode} />
    </main>
  );
};

const smartSplit = (str: string | null): string[][] => {
  let words: string[][] = [];
  if (!str) return words;

  str = str.trim();

  let word = "";
  let line = [];
  for (let i = 0; i <= str.length; i++) {
    if (str[i] === " " || i === str.length) {
      if (str[i + 1] === " ") {
        if (word) line.push(word);
        word = TAB_CODE;
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

const basicSplit = (str: string | null): string[] => {
  let result: string[] = [];
  if (!str) return result;

  const lines = str.trim().split("\n");
  lines.forEach((line) => {
    const words = line.split(" ");
    words.forEach((word) => {
      if (word) result.push(word);
    });
  });
  return result;
};

export const testing = {
  smartSplit,
  basicSplit,
};
