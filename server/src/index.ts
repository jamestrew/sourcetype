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

  await connection.runMigrations();

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
