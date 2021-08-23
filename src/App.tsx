import { ThemeProvider } from "components/ThemeProvider";
import Header from "./components/Header";
import { Practice } from "./components/Practice";

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Practice />
    </ThemeProvider>
  );
}

export default App;
