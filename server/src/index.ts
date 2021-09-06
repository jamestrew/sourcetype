import { ApolloServer } from "apollo-server-express";
import express = require("express");
import "reflect-metadata";
import { createConnection } from "typeorm";
import { buildTypeDefsAndResolvers } from "type-graphql";
import { CodeResolver } from "./resolvers/code";
import { LanguageResolver } from "./resolvers/language";
import cors = require("cors");

const main = async () => {
  const connection = await createConnection();
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  await connection.runMigrations();

  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [CodeResolver, LanguageResolver],
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });

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
