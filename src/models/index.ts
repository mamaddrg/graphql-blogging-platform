import type { PrismaClient } from "@prisma/client";
import type { IncomingMessage } from "http";
import type { PubSub } from 'graphql-subscriptions';

export type AppContextModel = {
  dbClient: PrismaClient,
  request: IncomingMessage,
  pubsub: PubSub
}

export type UserModel = {
  id?: number,
  name?: string,
  email?: string,
  password?: string,
  bio?: string,
  createdAt?: string | Date,
  updatedAt?: string | Date
}

export type PostModel = {
  id: number,
  title: String,
  content: String,
  published: Boolean,
  authorId: number,
  createdAt: string | Date,
  updatedAt: string | Date
}

export type CommentModel = {
  id: number,
  content: String,
  authorId: number,
  postId: number,
  createdAt: string | Date,
  updatedAt: string | Date
}

export type LikeModel = {
  id: number,
  userId: number,
  createdAt: string | Date
}

export type UserPublicModel = {
  id?: number,
  name?: string,
  bio?: string,
  createdAt?: string | Date
}

export type PostPublicModel = {
  id: number,
  title: String,
  content: String,
  authorId: number,
  createdAt: string | Date
}

export type CommentPublicModel = {
  id: number,
  content: String,
  authorId: number,
  postId: number,
  createdAt: string | Date
}

export type LikePublicModel = {
  id: number,
  userId: number,
  createdAt: string | Date
}

export type AuthModel = {
  token: string,
  user: UserModel
}

export type AuthDataModel = {
  userId: number,
  iat: number,
  exp: number
}