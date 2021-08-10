import { FC } from "react";
import { Letter } from "./Letter";

interface IWord {
  word: string;
  typed: string[];
}

export const Word: FC<IWord> = ({ word, typed }) => {
  const letters = word.split("");

  // maybe wrap in span to add styling when word is active/wrong
  return (
    <>
      {letters.map((letter, index) => (
        <Letter key={index} letter={letter} />
      ))}
    </>
  );
};
