import { FC } from "react";

interface LetterProp {
  letter: string;
  state: "untyped" | "typed" | "mistyped";
}

export const Letter: FC<LetterProp> = (props) => {
  return <>{props.letter}</>;
};
