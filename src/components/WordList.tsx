import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [prog, setProg] = useState<IStateWordList["wordElements"]>([]);
  const prevLength = useRef(next ? next.length : 0);
  const tokenizedChild = children ? children.split(" ") : [];

  const handleInput = useCallback(
    (key: string) => {
      if (key === "Backspace") {
        prog.pop();
      } else if (key === " ") {
        prog.push({
          wordId: prog[prog.length - 1].wordId + 1,
          letter: key,
        });
      } else {
        prog.push({
          wordId: prog.length > 0 ? prog[prog.length - 1].wordId : 0,
          letter: key,
        });
      }
      setProg([...prog]);
    },
    [prog]
  );

  const fetchWord = useCallback(
    (id: number) => {
      return prog.filter((p) => p.wordId === id && p.letter !== " ");
    },
    [prog]
  );

  useEffect(() => {
    if (!next || next.length === 0) return;
    if (prevLength.current !== next.length) {
      handleInput(next[next.length - 1]);
      prevLength.current = next.length;
    }
  }, [next, handleInput]);

  return (
    <div className="WordList">
      {tokenizedChild.map((wd, i) => (
        <Word key={i} text={wd} value={fetchWord(i).map((i) => i.letter)} />
      ))}
    </div>
  );
};

export { WordList };
