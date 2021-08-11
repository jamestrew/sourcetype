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

    if (next.length === currLength || next.length === 0) return;
    const key = next[next.length - 1];
    if (key === " ") {
      prog.current.push({
        wordId: prog.current[currLength - 1].wordId + 1,
        letter: key,
      });
    } else {
      prog.current.push({
        wordId: currLength > 0 ? prog.current[currLength - 1].wordId : 0,
        letter: key,
      });
    }
  };

  const fetchWord = (id: number) => {
    tokenizeValue();
    return prog.current.filter((p) => p.wordId === id && p.letter !== " ");
  };

  return (
    <div className="WordList">
      {tokenizedChild.map((wd, i) => (
        <Word key={i} text={wd} value={fetchWord(i).map((i) => i.letter)} />
      ))}
    </div>
  );
};

export { WordList };
