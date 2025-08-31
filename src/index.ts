import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
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

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query,
    User,
    Post,
    Comment,
    Like,
    Mutation
  },
});

startStandaloneServer(server, {
  listen: { 
    port: +process.env.APP_PORT || 4000 
  },
  context: async ({ req, res }) => {
    const prismaClient = new PrismaClient();
    return {
      dbClient: prismaClient,
      request: req
    }
  }
}).then((data) => {
  const { url } = data;
  console.log(`🚀  Server ready at: ${url}`);
}).catch((err) => {
  console.log('error while running server:', err);
});