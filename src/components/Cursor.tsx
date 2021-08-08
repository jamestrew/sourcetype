import { FC } from "react";

interface ICursor {
  xpad: number;
  ypad: number;
  hidden: boolean;
}

export const Cursor: FC<ICursor> = (props) => {
  return (
    <div
      id="cursor"
      className={props.hidden ? "hidden" : ""}
      style={{
        left: `${props.xpad}px`,
        top: `${props.ypad}px`,
      }}
    ></div>
  );
};
