import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

import type { AppContextModel } from './models';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

const resolvers = {
  Query: {
    users: async (parent, args, ctx: AppContextModel, info) => {
      const users = await ctx.dbClient.user.findMany();
      return users;
    },
    posts: async (parent, args, ctx: AppContextModel, info) => {
      const posts = await ctx.dbClient.post.findMany();
      return posts;
    },
    comments: async (parent, args, ctx: AppContextModel, info) => {
      const comments = await ctx.dbClient.comment.findMany();
      return comments;
    },
    likes: async (parent, args, ctx: AppContextModel, info) => {
      const likes = await ctx.dbClient.like.findMany();
      return likes;
    },
  },
  User: {
    posts: async (parent, args, ctx: AppContextModel, info) => {
      const userId = parent.id;
      const posts = await ctx.dbClient.post.findMany({
        where: { authorId: userId }
      });
      return posts;
    },
    comments: async (parent, args, ctx: AppContextModel, info) => {
      const userId = parent.id;
      const comments = await ctx.dbClient.comment.findMany({
        where: { authorId: userId }
      });
      return comments;
    },
    likes: async (parent, args, ctx: AppContextModel, info) => {
      const userId = parent.id;
      const likes = await ctx.dbClient.like.findMany({
        where: { userId: userId }
      });
      return likes;
    },
  },
  Post: {
    author: async (parent, args, ctx: AppContextModel, info) => {
      const authorId = parent.authorId;
      const posts = await ctx.dbClient.post.findMany({
        where: { authorId: authorId }
      });
      return posts;
    },
    comments: async (parent, args, ctx: AppContextModel, info) => {
      const postId = parent.id;
      const comments = await ctx.dbClient.comment.findMany({
        where: { postId: postId }
      });
      return comments;
    },
    likes: async (parent, args, ctx: AppContextModel, info) => {
      const postId = parent.id
      const likes = await ctx.dbClient.like.findMany({
        where: { postId: postId }
      });
      return likes;
    },
  },
  Comment: {
    post: async (parent, args, ctx: AppContextModel, info) => {
      const postId = parent.postId;
      const post = await ctx.dbClient.post.findFirst({
        where: { id: postId }
      });
      return post;
    },
    author: async (parent, args, ctx: AppContextModel, info) => {
      const authorId = parent.authorId;
      const author = await ctx.dbClient.user.findFirst({
        where: { id: authorId }
      });
      return author;
    },
    likes: async (parent, args, ctx: AppContextModel, info) => {
      const postId = parent.id;
      const likes = await ctx.dbClient.like.findMany({
        where: { postId: postId }
      });
      return likes;
    },
  },
  Like: {
    post: async (parent, args, ctx: AppContextModel, info) => {
      const postId = parent.postId;
      const post = await ctx.dbClient.post.findFirst({
        where: { id: postId }
      });
      return post;
    },
    user: async (parent, args, ctx: AppContextModel, info) => {
      const authorId = parent.authorId;
      const user = await ctx.dbClient.user.findFirst({
        where: { id: authorId }
      });
      return user;
    },
  },
  Mutation: {
    createUser: async (parent, args, ctx: AppContextModel, info) => {
      if (args.password.length < 8) {
        throw new Error('Password should be at least 8 characters');
      }
      const isEmailTaken = await ctx.dbClient.user.findFirst({ 
        where: { email: args.email }
      });
      if (isEmailTaken) {
        throw new Error("Email is already in use");
      }

      const salt = await bcrypt.genSalt();
      const hashedPass = bcrypt.hashSync(args.password, salt);
      const userData = {
        name: args.name,
        email: args.email,
        password: hashedPass,
        bio: args.bio ?? null
      }

      const result = await ctx.dbClient.user.create({ data: userData });
      return result;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});


startStandaloneServer(server, {
  listen: { 
    port: +process.env.APP_PORT || 4000 
  },
  context: async ({ req, res }) => {
    const prismaClient = new PrismaClient();
    return {
      dbClient: prismaClient
    }
  }
}).then((data) => {
  const { url } = data;
  console.log(`🚀  Server ready at: ${url}`);
}).catch((err) => {
  console.log('error while running server:', err);
});