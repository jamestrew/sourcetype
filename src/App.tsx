import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ThemeProvider } from "components/ThemeProvider";
import Header from "./components/Header";
import { Practice } from "./components/Practice";

const httpLink = createHttpLink({
  uri: "https://sourcegraph.com/.api/graphql",
  fetchOptions: {
    mode: "no-cors",
  },
});

const authLink = setContext((_, { headers }) => {
  const token = process.env.SRCGRAPH_TOKEN;
  return {
    headers: {
      ...headers,
      "Access-Control-Allow-Origin": "*",
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const srcgraphClient = new ApolloClient({
  link: authLink.concat(httpLink),
  credentials: "include",
  cache: new InMemoryCache(),
});

srcgraphClient
  .query({
    query: gql`
      query testquery($first: Int!) {
        repositories(first: $first) {
          nodes {
            name
            description
            url
          }
        }
      }
    `,
  })
  .then((result) => console.log(result));

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
