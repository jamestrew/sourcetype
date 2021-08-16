// ThemeProvider.js

import { FC, useState } from "react";

export const ThemeProvider: FC = ({ children }) => {
  const [theme, setTheme] = useState(`dark`);

  return (
    <div
      id="theme-wrapper"
      className={`bg-primary text-primary ${theme} h-screen`}
    >
      {children}

      <div className="grid justify-items-center">
        <button
          onClick={() => {
            theme === `light` ? setTheme(`dark`) : setTheme(`light`);
          }}
        >
          Theme: {theme}
        </button>
      </div>
    </div>
  );
};
