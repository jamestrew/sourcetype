import { FC } from "react";

interface ITab {
  spaceSize: number;
}

export const Tab: FC<ITab> = ({ spaceSize }) => {
  return (
    <span
      style={{ display: "inline-block", marginLeft: `${spaceSize * 2}em` }}
    ></span>
  );
};
