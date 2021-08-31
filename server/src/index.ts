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

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept"
    );
    next();
  });

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
