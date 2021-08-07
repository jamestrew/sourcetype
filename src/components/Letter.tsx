import { FC } from "react";

export enum LetterState {
  Untyped,
  Typed,
  Mistyped,
}

interface LetterProp {
  letter: string;
  state: LetterState;
}

export const Letter: FC<LetterProp> = (props) => {
  return <>{props.letter}</>;
};
