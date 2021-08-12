import React, { useRef } from "react";
import { Word } from "components/Word";

interface IWordList {
  next?: string[];
  children?: string;
}

interface IStateWordList {
  wordElements: {
    wordId: number;
    letter: string;
  }[];
}

const WordList: React.FC<IWordList> = ({ next, children }) => {
  const prog = useRef<IStateWordList["wordElements"]>([]);
  const tokenizedChild = children ? children.split(" ") : [];

  const tokenizeValue = () => {
    if (!next) return;
    const currLength = prog.current.length;

    if (next.length === currLength) {
      return;
    } else if (next.length < currLength) {
      for (let i = next.length; i < currLength; ++i) {
        prog.current.pop();
      }
    } else {
      const key = next[next.length - 1];
      let nextId = currLength > 0 ? prog.current[currLength - 1].wordId : 0;

      if (key === " ") {
        nextId += 1;
      }
      prog.current.push({
        wordId: nextId,
        letter: key,
      });
    }
  };

  const fetchWord = (id: number) => {
    tokenizeValue();
    return prog.current.filter((p) => p.wordId === id && p.letter !== " ");
  };

  const checkComplete = (id: number) => {
    return prog.current.filter((p) => p.wordId === id + 1).length > 0;
  };

  return (
    <div className="WordList">
      {tokenizedChild.map((wd, i) => (
        <Word
          key={i}
          text={wd}
          value={fetchWord(i).map((i) => i.letter)}
          isComplete={checkComplete(i)}
        />
      ))}
    </div>
  );
};

export { WordList };
