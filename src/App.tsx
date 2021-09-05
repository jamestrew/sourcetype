import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ThemeProvider } from "components/ThemeProvider";
import Header from "./components/Header";
import { Practice } from "./components/Practice";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <Header />
        <Practice />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
