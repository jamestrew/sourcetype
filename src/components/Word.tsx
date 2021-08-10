import React, { useState, useEffect } from "react";
import { Letter, LetterState } from "components/Letter";

interface IWord {
  text: string;
  value?: string[];
}

interface IStateWord {
  element: {
    index: number;
    char: string;
    isHit?: boolean;
  }[];
}

const Word: React.FC<IWord> = ({ text, value }) => {
  const [chars, setChars] = useState<IStateWord["element"]>([]);

  useEffect(() => {
    const spreadWord = text.split("");
    let spreadTyped: IStateWord["element"] = [];

    if (!value) return;
    spreadTyped = [
      ...value.map((ch, i) => ({
        index: i,
        char: ch,
        isHit: ch === spreadWord[i],
      })),
      ...spreadWord.splice(value.length).map((ch, i) => ({
        index: value.length + i,
        char: ch,
      })),
    ];
    setChars(spreadTyped);
  }, [text, value]);

  return (
    <div className="Word">
      {chars.map((ch, i) => (
        <Letter
          key={i}
          letter={i < text.length ? text.split("")[i] : ch.char}
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

Word.defaultProps = {
  value: [],
};

export { Word };
