import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { ThemeProvider } from "components/ThemeProvider";
import Header from "./components/Header";
import { Practice } from "./components/Practice";

const client = new ApolloClient({
  uri: "https://48p1r2roz4.sse.codesandbox.io",
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql`
      query GetRates {
        rates(currency: "USD") {
          currency
        }
      }
    `,
  })
  .then((result) => console.log(result));

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Practice />
    </ThemeProvider>
  );
}

export default App;
