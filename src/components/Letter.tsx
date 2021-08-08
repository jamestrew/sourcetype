import { FC } from "react";

export const LetterState = {
  untyped: "text-gray-500",
  correct: "text-black",
  incorrect: "text-red-500",
};

interface ILetter {
  letter: string;
  state?: string;
}

export const Letter: FC<ILetter> = (props) => {
  return (
    <span className={props.state ?? LetterState.untyped}>{props.letter}</span>
  );
};
