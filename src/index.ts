import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import http from 'http';
import * as path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

import { Query } from './resolvers/query.js';
import { User } from './resolvers/user.js';
import { Post } from './resolvers/post.js';
import { Comment } from './resolvers/comment.js';
import { Like } from './resolvers/like.js';
import { Mutation } from './resolvers/mutation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<any>({
  typeDefs,
  resolvers: {
    Query,
    User,
    Post,
    Comment,
    Like,
    UserPublic: User,
    PostPublic: Post,
    CommentPublic: Comment,
    LikePublic: Like,
    Mutation
  },
});

server.start().then(() => {
  // Specify the path where we'd like to mount our server
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { 
          dbClient: new PrismaClient(),
          request: req
        }
      }
    }),
  );

  new Promise<void>((resolve) =>
    httpServer.listen({ port: +process.env.APP_PORT || 4000 }, resolve),
  ).then(() => {
    console.log(`🚀 Server ready at http://localhost:${+process.env.APP_PORT || 4000}/`);
  });
});