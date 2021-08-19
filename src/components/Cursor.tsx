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
      data-testid="cursor"
      className={"bg-gray-700 dark:bg-gray-400 " + (hidden ? "hidden" : "")}
      style={{
        left: `${xpad}em`,
        top: `${ypad}em`,
      }}
    ></div>
  );
};
