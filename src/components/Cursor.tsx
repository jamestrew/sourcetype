import { FC } from "react";

interface ICursor {
  xpad: number;
  ypad: number;
  hidden: boolean;
}

export const Cursor: FC<ICursor> = ({ xpad, ypad, hidden }) => {
  return (
    <div
      id="cursor"
      className={hidden ? "hidden" : ""}
      style={{
        left: `${xpad}px`,
        top: `${ypad}px`,
      }}
    ></div>
  );
};
