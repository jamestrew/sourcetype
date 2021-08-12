import React from "react";
import { Letter, LetterState } from "components/Letter";

interface IWord {
  text: string;
  value?: string[];
  isComplete?: boolean;
}

interface IStateWord {
  element: {
    index: number;
    char: string;
    isHit?: boolean;
  }[];
}

const Word: React.FC<IWord> = ({ text, value, isComplete }) => {
  const originWord = text.split("");

  const createWord = () => {
    let spreadTyped: IStateWord["element"] = [];

    if (value) {
      spreadTyped = [
        ...value.map((ch, i) => ({
          index: i,
          char: i >= originWord.length ? ch : originWord[i],
          isHit: ch === originWord[i],
        })),
        ...originWord.splice(value.length).map((ch, i) => ({
          index: value.length + i,
          char: ch,
          isHit: isComplete ? !isComplete : undefined
        })),
      ];
    }
    return spreadTyped;
  };

  return (
    <div className="Word">
      {createWord().map((ch, i) => (
        <Letter
          key={i}
          letter={ch.char}
          state={
            ch.isHit == null
              ? LetterState.untyped
              : ch.isHit
              ? LetterState.correct
              : LetterState.incorrect
          }
        />
      ))}
    </div>
  );
};

export { Word };
