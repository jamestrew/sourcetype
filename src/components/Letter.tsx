import { FC } from "react";

export const LetterState = {
  untyped: "text-gray-500 dark:text-gray-300",
  correct: "text-black dark:text-yellow-200",
  incorrect: "text-red-500 dark:text-red-500",
  overflow: "text-red-800 dark:text-red-300",
};

interface ILetter {
  letter: string;
  state?: string;
}

export const Letter: FC<ILetter> = ({ letter, state }) => {
  return <span className={state ?? LetterState.untyped}>{letter}</span>;
};
