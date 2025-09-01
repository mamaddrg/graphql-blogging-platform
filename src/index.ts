import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import { PrismaClient } from '@prisma/client';

import { Query } from './resolvers/query.js';
import { Mutation } from './resolvers/mutation.js';
import { User } from './resolvers/user.js';
import { Post } from './resolvers/post.js';
import { Comment } from './resolvers/comment.js';
import { Like } from './resolvers/like.js';
import { Subscription } from './resolvers/subscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

const prisma = new PrismaClient();
const pubsub = new PubSub();

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Post,
  Comment,
  Like,
  UserPublic: User,
  PostPublic: Post,
  CommentPublic: Comment,
  LikePublic: Like,
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      return {
        dbClient: prisma,
        pubsub
      };
    },
  },
  wsServer
);

const apollo = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await apollo.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(apollo, {
    context: async ({ req }) => {
      return {
        dbClient: prisma,
        pubsub,
        request: req
      };
    },
  })
);

const PORT = Number(process.env.APP_PORT) || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Query/Mutation endpoint: http://localhost:${PORT}/graphql`);
  console.log(`📡 Subscription endpoint: ws://localhost:${PORT}/graphql`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});