import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient();

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    bio: String
    createdAt: String!
    posts: [Post!]!
    comments: [Comment!]!
    likes: [Like!]!
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    authorId: Int!
    author: User!
    comments: [Comment!]!
    likes: [Like!]!
  }
  type Comment {
    id: ID!
    content: String!
    authorId: Int!
    postId: Int!
    author: User!
    post: Post!
    likes: [Like!]!
  }
  type Like {
    id: ID!
    userId: Int!
    postId: Int!
    user: User!
    post: Post!
  }
  type Query {
    users: [User]
    posts: [Post]
    comments: [Comment]
    likes: [Like]
  }
  type Mutation {
    createUser(name: String!, email: String!, password: String!, bio: String): User!
  }
`;

const resolvers = {
  Query: {
    users: async (parent, args, ctx, info) => {
      const users = await prismaClient.user.findMany();
      return users;
    },
    posts: async (parent, args, ctx, info) => {
      const posts = await prismaClient.post.findMany();
      return posts;
    },
    comments: async (parent, args, ctx, info) => {
      const comments = await prismaClient.comment.findMany();
      return comments;
    },
    likes: async (parent, args, ctx, info) => {
      const likes = await prismaClient.like.findMany();
      return likes;
    },
  },
  User: {
    posts: async (parent, args, contextValue, info) => {
      const userId = parent.id;
      const posts = await prismaClient.post.findMany({
        where: { authorId: userId }
      });
      return posts;
    },
    comments: async (parent, args, contextValue, info) => {
      const userId = parent.id;
      const comments = await prismaClient.comment.findMany({
        where: { authorId: userId }
      });
      return comments;
    },
    likes: async (parent, args, contextValue, info) => {
      const userId = parent.id;
      const likes = await prismaClient.like.findMany({
        where: { userId: userId }
      });
      return likes;
    },
  },
  Post: {
    author: async (parent, args, ctx, info) => {
      const authorId = parent.authorId;
      const posts = await prismaClient.post.findMany({
        where: { authorId: authorId }
      });
      return posts;
    },
    comments: async (parent, args, ctx, info) => {
      const postId = parent.id;
      const comments = await prismaClient.comment.findMany({
        where: { postId: postId }
      });
      return comments;
    },
    likes: async (parent, args, ctx, info) => {
      const postId = parent.id
      const likes = await prismaClient.like.findMany({
        where: { postId: postId }
      });
      return likes;
    },
  },
  Comment: {
    post: async (parent, args, ctx, info) => {
      const postId = parent.postId;
      const post = await prismaClient.post.findFirst({
        where: { id: postId }
      });
      return post;
    },
    author: async (parent, args, ctx, info) => {
      const authorId = parent.authorId;
      const author = await prismaClient.user.findFirst({
        where: { id: authorId }
      });
      return author;
    },
    likes: async (parent, args, ctx, info) => {
      const postId = parent.id;
      const likes = await prismaClient.like.findMany({
        where: { postId: postId }
      });
      return likes;
    },
  },
  Like: {
    post: async (parent, args, ctx, info) => {
      const postId = parent.postId;
      const post = await prismaClient.post.findFirst({
        where: { id: postId }
      });
      return post;
    },
    user: async (parent, args, ctx, info) => {
      const authorId = parent.authorId;
      const user = await prismaClient.user.findFirst({
        where: { id: authorId }
      });
      return user;
    },
  },
  Mutation: {
    createUser: async (parent, args, ctx, info) => {
      if (args.password.length < 8) {
        throw new Error('Password should be at least 8 characters');
      }
      const isEmailTaken = await prismaClient.user.findFirst({ 
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

      const result = await prismaClient.user.create({ data: userData });
      return result;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
// const { url } = await startStandaloneServer(server, {
//   listen: { 
//     port: +process.env.APP_PORT || 4000 
//   },
// });
// console.log(`🚀  Server ready at: ${url}`);

startStandaloneServer(server, {
  listen: { 
    port: +process.env.APP_PORT || 4000 
  },
}).then((data) => {
  const { url } = data;
  console.log(`🚀  Server ready at: ${url}`);
}).catch((err) => {
  console.log('error while running server:', err);
});