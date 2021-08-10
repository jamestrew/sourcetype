import { FC } from "react";
import { Letter } from "./Letter";

interface IWord {
  word: string;
  typed: string[];
}

export const Word: FC<IWord> = ({ word, typed }) => {
  const letters = word.split("");
  console.log(letters);
  // return (
  // {letters.map((letter, index) => {
  //   <Letter key={index} letter={letter} />
  // })}
  // )
  return (
    <>
      {letters.map((letter, index) => (
        <Letter key={index} letter={letter} />
      ))}
    </>
  );
};
