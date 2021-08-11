import { FC } from "react";
import { Letter, LetterState } from "./Letter";

interface IWord {
  word: string;
  typed: string;
}

export const Word: FC<IWord> = ({ word, typed }) => {
  const letters = word.split("");

  // maybe wrap in span to add styling when word is active/wrong
  // https://tailwindcss.com/docs/text-decoration --> underline
  return (
    <span>
      {letters.map((letter, index) => {
        let printLetter = letter;
        let letterState = LetterState.untyped;
        if (typed != null && typed[index] != null) {
          printLetter = letter === typed[index] ? letter : typed[index];
          letterState =
            letter === typed[index]
              ? LetterState.correct
              : LetterState.incorrect;
        }
        return <Letter key={index} letter={printLetter} state={letterState} />;
      })}
    </span>
  );
};
