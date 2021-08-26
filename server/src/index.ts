import { ApolloServer } from "apollo-server-express";
import express = require("express");
import "reflect-metadata";
import { createConnection } from "typeorm";
// import { User } from "./entity/User";
import { buildTypeDefsAndResolvers } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  const connection = await createConnection();
  const app = express();

  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [HelloResolver],
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.get("/", (_, res) => {
    res.send("hello");
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});

/*

https://github.com/JCMais/node-libcurl

sourcegraph graphql api via curl
curl \
-H 'Authorization: token 12f7775cb0e0af9e9847ae136ed234c0a0e8a409' \
-d '{"query": "query {repositories(first: 10) { nodes { name description url } }}"}' \
https://sourcegraph.com/.api/graphql

*/
