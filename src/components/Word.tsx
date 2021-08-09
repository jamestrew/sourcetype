import { FC } from "react";
import { Letter } from "components/Letter";

interface IWord {
  text: string;
}

const Word: FC<IWord> = ({ text }) => {
  return (
    <div className="Word">
      {text.split("").map((char, i) => (
        <Letter key={i} letter={char} />
      ))}
    </div>
  );
};

export { Word };
